import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants"; // 👈 Added to safely check for Expo Go
import { toHijri } from 'hijri-converter';
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import strings from "../../locales/i18nStrings";

// Detect if we are inside the Expo Go sandboxed app environment
const isExpoGo = Constants.appOwnership === 'expo';

// Only set the handler if we aren't in Expo Go to prevent runtime configuration crashes
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function Home({ navigation }) {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [nextPrayer, setNextPrayer] = useState({
    name: strings.COMMON_LOADING,
    timeRemaining: "--:--",
    rawName: "Loading"
  });
  const [currentLocation, setCurrentLocation] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [hijriDate, setHijriDate] = useState('');
  const midnightTimerRef = useRef(null);
  const lastScheduledDateRef = useRef(null);
  const prayerTimesRef = useRef([]);

  // Derive quote index based on date
  const quoteIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    return dayOfYear % 7;
  }, []);

  const quotes = [
    strings.QUOTE_0,
    strings.QUOTE_1,
    strings.QUOTE_2,
    strings.QUOTE_3,
    strings.QUOTE_4,
    strings.QUOTE_5,
    strings.QUOTE_6
  ];

  const quote = quotes[quoteIndex];

  // Get Hijri date
  useEffect(() => {
    try {
      const today = new Date();
      const hDate = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());

      const hijriMonths = [
        strings.HIJRI_MONTH_1, strings.HIJRI_MONTH_2, strings.HIJRI_MONTH_3, strings.HIJRI_MONTH_4,
        strings.HIJRI_MONTH_5, strings.HIJRI_MONTH_6, strings.HIJRI_MONTH_7, strings.HIJRI_MONTH_8,
        strings.HIJRI_MONTH_9, strings.HIJRI_MONTH_10, strings.HIJRI_MONTH_11, strings.HIJRI_MONTH_12
      ];

      const hijriMonthIndex = hDate.hm - 1;
      const hijriMonth = hijriMonths[hijriMonthIndex];
      const hijriDay = hDate.hd;
      const hijriYear = hDate.hy;

      setHijriDate(`${hijriDay} ${hijriMonth} ${hijriYear} ${strings.HIJRI_AH}`);
    } catch {
      getHijriDateFromAPI();
    }
  }, []);

  const getHijriDateFromAPI = async () => {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const response = await axios.get('https://api.aladhan.com/v1/gToH', {
        params: { date: `${day}-${month}-${year}` },
        timeout: 5000
      });

      if (response.data && response.data.data) {
        const hijri = response.data.data.hijri;
        const hijriDay = hijri.day;
        const hijriMonthEn = hijri.month.en;
        setHijriDate(`${hijriDay} ${hijriMonthEn} ${hijri.year} ${strings.HIJRI_AH}`);
      }
    } catch {
      setHijriDate(`1 Muharram 1446 ${strings.HIJRI_AH}`);
    }
  };

  useEffect(() => {
    (async () => {
      // 👈 Added check: Skip channel configuration if running inside Expo Go
      if (isExpoGo) return;

      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: strings.HOME_NOTIFICATION_CHANNEL,
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#50CC42",
          });
        }
      } catch { }
    })();
  }, []);

  const parseTimeToTodayDate = (timeStr) => {
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const [, hh, mm] = match;
    const d = new Date();
    d.setSeconds(0, 0);
    d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    return d;
  };

  const isScheduling = useRef(false);

  const schedulePrayerNotificationsForMultipleDays = async (times, forceReschedule = false) => {
    // 👈 Added check: Block notification generation routines entirely if running inside Expo Go
    if (isExpoGo) return;

    try {
      const perm = await Notifications.getPermissionsAsync();
      const granted =
        perm.granted ||
        perm.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (!granted) {
        return;
      }

      const now = new Date();
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      if (!forceReschedule && lastScheduledDateRef.current === todayKey) {
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
        for (const p of times) {
          if (!mainPrayers.includes(p.name)) continue;

          const notificationTime = new Date(parseTimeToTodayDate(p.time));
          notificationTime.setDate(notificationTime.getDate() + dayOffset);

          if (notificationTime > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: strings.HOME_NOTIFICATION_TITLE.replace('%{name}', p.name),
                body: strings.HOME_NOTIFICATION_BODY,
                sound: "default",
              },
              trigger: { type: 'date', date: notificationTime },
            });
          }
        }
      }

      lastScheduledDateRef.current = todayKey;
    } catch { }
  };

  const updateNextPrayer = (times) => {
    const now = new Date();
    const upcoming = times
      .map((prayer) => ({ ...prayer, date: parseTimeToTodayDate(prayer.time) }))
      .filter((p) => p.date && p.date > now)
      .sort((a, b) => a.date - b.date)[0];

    if (upcoming) {
      const diffMin = Math.max(0, Math.floor((upcoming.date - now) / 60000));
      const hh = Math.floor(diffMin / 60);
      const mm = String(diffMin % 60).padStart(2, "0");
      setNextPrayer({
        name: upcoming.name,
        rawName: upcoming.name,
        timeRemaining: `${hh}:${mm}`
      });
    } else {
      setNextPrayer({
        name: strings.HOME_PRAYER_NO_UPCOMING,
        rawName: null,
        timeRemaining: "--:--"
      });
    }
  };

  const useDefaultLocation = async () => {
    setCurrentLocation(strings.HOME_DEFAULT_LOCATION);

    const defaultLatitude = 21.4225;
    const defaultLongitude = 39.8262;

    try {
      const response = await axios.get("https://api.aladhan.com/v1/timings", {
        params: {
          latitude: defaultLatitude,
          longitude: defaultLongitude,
          method: 4
        },
      });

      if (response.data?.data?.timings) {
        const t_data = response.data.data.timings;
        const formattedTimes = [
          { name: strings.PRAYER_NAME_IMSAK, time: t_data.Imsak },
          { name: strings.PRAYER_NAME_FAJR, time: t_data.Fajr },
          { name: strings.PRAYER_NAME_DHUHA, time: t_data.Sunrise },
          { name: strings.PRAYER_NAME_DHUHR, time: t_data.Dhuhr },
          { name: strings.PRAYER_NAME_ASR, time: t_data.Asr },
          { name: strings.PRAYER_NAME_MAGHRIB, time: t_data.Maghrib },
          { name: strings.PRAYER_NAME_ISHA, time: t_data.Isha },
        ];

        prayerTimesRef.current = formattedTimes;
        setPrayerTimes(formattedTimes);
        updateNextPrayer(formattedTimes);
        await schedulePrayerNotificationsForMultipleDays(formattedTimes);
      }
    } catch {
      prayerTimesRef.current = [];
      setPrayerTimes([]);
      setNextPrayer({ name: strings.COMMON_ERROR, rawName: null, timeRemaining: "--:--" });
    }
  };

  const loadTimingsAndSchedule = async () => {
    if (isScheduling.current) return;
    isScheduling.current = true;
    setLoadingData(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocation(strings.HOME_PERMISSION_DENIED);
        await useDefaultLocation();
        return;
      }

      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });
      } catch (locationError) {
        await useDefaultLocation();
        return;
      }

      const { latitude, longitude } = location.coords;
      setCurrentLocation(`${strings.HOME_YOUR_LOCATION}${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);

      const response = await axios.get("https://api.aladhan.com/v1/timings", {
        params: {
          latitude,
          longitude,
          method: 4,
          timestamp: Math.floor(Date.now() / 1000)
        },
        timeout: 10000
      });

      if (response.data?.data?.timings) {
        const t_data = response.data.data.timings;
        const formattedTimes = [
          { name: strings.PRAYER_NAME_IMSAK, time: t_data.Imsak },
          { name: strings.PRAYER_NAME_FAJR, time: t_data.Fajr },
          { name: strings.PRAYER_NAME_DHUHA, time: t_data.Sunrise },
          { name: strings.PRAYER_NAME_DHUHR, time: t_data.Dhuhr },
          { name: strings.PRAYER_NAME_ASR, time: t_data.Asr },
          { name: strings.PRAYER_NAME_MAGHRIB, time: t_data.Maghrib },
          { name: strings.PRAYER_NAME_ISHA, time: t_data.Isha },
        ];

        prayerTimesRef.current = formattedTimes;
        setPrayerTimes(formattedTimes);
        updateNextPrayer(formattedTimes);
        await schedulePrayerNotificationsForMultipleDays(formattedTimes);
      } else {
        await useDefaultLocation();
      }

    } catch (e) {
      await useDefaultLocation();
    } finally {
      setLoadingData(false);
      isScheduling.current = false;
    }
  };

  useEffect(() => {
    loadTimingsAndSchedule();

    const setMidnightTimer = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      const ms = midnight - now;
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      midnightTimerRef.current = setTimeout(() => {
        loadTimingsAndSchedule();
        setMidnightTimer();
      }, ms);
    };
    setMidnightTimer();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && prayerTimesRef.current.length > 0) {
        updateNextPrayer(prayerTimesRef.current);
      }
    });

    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      sub.remove();
    };
  }, []);

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/madinah.jpg")}
              style={styles.headerOverlay}
            />
            <Text style={styles.time}>
              {new Date().toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })}
            </Text>
            <Text style={styles.nextPrayer}>
              {`${nextPrayer.name} ${strings.HOME_NEXT_PRAYER_IN} ${nextPrayer.timeRemaining}`}
            </Text>
            <Text style={styles.quoteText}>{quote}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{new Date().toLocaleDateString('en-US')}</Text>
              <Text style={styles.hijriDate}>{hijriDate}</Text>
            </View>
            <Text style={styles.currentLocation}>{currentLocation}</Text>
          </View>

          {loadingData ? (
            <View style={styles.loadingDataContainer}>
              <ActivityIndicator size="large" color="#50CC42" />
              <Text style={styles.loadingDataText}>{strings.HOME_LOADING_PRAYERS}</Text>
            </View>
          ) : prayerTimes.length > 0 ? (
            <ScrollView style={styles.prayerTimesContainer}>
              {prayerTimes.map((prayer) => (
                <View key={prayer.name} style={styles.prayerRow}>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                  <Text style={styles.prayerTime}>{prayer.time}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{strings.HOME_NO_PRAYERS}</Text>
              <Text style={styles.noDataSubText}>{strings.HOME_CHECK_CONNECTION}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("LibraryWebView")}
            >
              <Image
                source={require("../../assets/icon/Book.png")}
                style={styles.footerIcon}
              />
              <Text style={styles.footerText}>{strings.FOOTER_LIBRARY}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("LessonsListScreen")}
            >
              <Image
                source={require("../../assets/icon/reading-book.png")}
                style={styles.footerIcon}
              />
              <Text style={styles.footerText}>{strings.FOOTER_LEARN}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("Quran")}
            >
              <Image
                source={require("../../assets/icon/Quran.png")}
                style={styles.footerIcon}
              />
              <Text style={styles.footerText}>{strings.FOOTER_QURAN}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("AdhkarScreen")}
            >
              <Image
                source={require("../../assets/icon/Praying.png")}
                style={styles.footerIcon}
              />
              <Text style={styles.footerText}>{strings.FOOTER_ADHAKAR}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.navigate("QiblaDirection")}
            >
              <Image
                source={require("../../assets/icon/Qibla.png")}
                style={styles.footerIcon}
              />
              <Text style={styles.footerText}>{strings.FOOTER_QIBLA}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

Home.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  baseContainer: { flex: 1, backgroundColor: "#50CC42" },
  overlayImage: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    backgroundColor: "#50CC42",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: "hidden",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: -15,
    bottom: 10,
    width: 480,
    height: 450,
    opacity: 0.3,
    resizeMode: "cover",
    zIndex: 0,
  },
  time: { fontSize: 32, color: "#FFFFFF", fontWeight: "bold", marginBottom: 10 },
  nextPrayer: { fontSize: 18, color: "#FFFFFF", marginBottom: 15 },
  dateContainer: { alignItems: "center", marginBottom: 15 },
  date: { fontSize: 18, color: "#FFFFFF", fontWeight: "bold", marginBottom: 5 },
  hijriDate: { fontSize: 16, color: "#FFFFFF" },
  quoteText: { fontSize: 18, fontStyle: "italic", color: "#FFFFFF", textAlign: "center", marginTop: 10 },
  currentLocation: { fontSize: 14, color: "#FFFFFF", marginTop: 10 },
  prayerTimesContainer: { flex: 1, paddingHorizontal: 20, backgroundColor: 'rgba(234, 248, 230, 0.8)', margin: 10, borderRadius: 15 },
  prayerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  prayerName: { fontSize: 16, color: "#333333", fontWeight: "bold", textAlign: 'left' },
  prayerTime: { fontSize: 16, color: "#333333", textAlign: 'right' },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#50CC42',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  arButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 15, backgroundColor: "#FFFFFF", borderTopWidth: 2, borderTopColor: "#E0E0E0", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  footerButton: { alignItems: "center" },
  footerText: { fontSize: 16, color: "#333333", fontWeight: "bold" },
  footerIcon: { width: 24, height: 24, marginBottom: 5 },
  loadingDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 248, 230, 0.8)',
    margin: 10,
    borderRadius: 15,
  },
  loadingDataText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 248, 230, 0.8)',
    margin: 10,
    borderRadius: 15,
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#FF0000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default Home;