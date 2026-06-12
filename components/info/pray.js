import { View, StyleSheet, Image, Pressable, ScrollView, ImageBackground, Text } from "react-native";
import { useFonts } from "expo-font";
import PropTypes from "prop-types";
import strings from "../../locales/i18nStrings";

function Pray({ navigation }) {
  const [fontsLoaded] = useFonts({
    Hedvig: require("../../assets/font/HedvigLettersSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <View style={styles.container}><Text>{strings.COMMON_LOADING}</Text></View>;
  }

  const prayerTimes = [
    { name: "Fajr", desc: strings.PRAYER_FAJR_DESC },
    { name: "Dhuhr", desc: strings.PRAYER_DHUHR_DESC },
    { name: "Asr", desc: strings.PRAYER_ASR_DESC },
    { name: "Maghrib", desc: strings.PRAYER_MAGHRIB_DESC },
    { name: "Isha", desc: strings.PRAYER_ISHA_DESC },
  ];

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.container}>
          <Pressable style={styles.logoContainer} onPress={() => navigation.goBack()}>
            <Image source={require("../../assets/icon/Group.png")} style={styles.logo} />
          </Pressable>
          <Image source={require("../../assets/images/Artboard 1.png")} style={styles.image} />
          <Image source={require("../../assets/icon/Praying Man.png")} style={styles.prayerImage} />

          <ScrollView style={styles.contentContainer}>
            <Text style={styles.instructionsText}>
              <Text style={{ fontWeight: 'bold' }}>{strings.PRAYER_TITLE}</Text>
              {"\n\n"}{strings.PRAYER_INTRO}
            </Text>

            <View style={styles.prayerContainer}>
              {prayerTimes.map((prayer) => (
                <Text key={prayer.name} style={styles.prayerText}>
                  {prayer.desc}
                  {"\n\n"}
                </Text>
              ))}
            </View>
          </ScrollView>

          <View style={styles.imageContainer}></View>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.continueButton} onPress={() => navigation.navigate("Zakat")}>
              <Text style={styles.continueText}>{strings.COMMON_CONTINUE}</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

Pray.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: "#50CC42",
  },
  overlayImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    padding: 19,
  },
  logoContainer: { position: "absolute", top: 50, zIndex: 2, left: 20 },
  logo: { width: 31, aspectRatio: 1.55 },
  contentContainer: {
    width: 350,
    borderRadius: 10,
    backgroundColor: "#FCFFD8",
    padding: 20,
    marginBottom: 20,
    maxHeight: 260,
    marginTop: 485,
  },
  instructionsText: { fontFamily: "Hedvig", fontSize: 18, color: "#1B9F29", lineHeight: 30 },
  prayerText: { fontSize: 18, color: "#1B9F29" },
  prayerContainer: { marginTop: 10 },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  continueButton: {
    borderRadius: 10,
    backgroundColor: "#F4FFD4",
    padding: 10,
    marginBottom: 20,
    width: "90%",
  },
  continueText: { textTransform: "uppercase", fontFamily: "Hedvig", fontSize: 19, textAlign: "center", color: "#51AF5B" },
  prayerImage: {
    position: "absolute",
    top: 430,
    left: "100%",
    transform: [{ translateX: -40 }],
    width: 52,
    height: 52,
  },
  image: {
    width: 530,
    height: 900,
    position: "absolute",
    top: -1,
  }
});
export default Pray;