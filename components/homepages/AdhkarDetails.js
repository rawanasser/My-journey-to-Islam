import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import strings from "../../locales/i18nStrings";

const AdhkarDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { url, title } = route.params;

  const [adhkarList, setAdhkarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdhkarDetails = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("adhkar_details.fetch_failed");
        const data = await res.json();

        if (Array.isArray(data.HUSN_ALMUSLIM)) {
          setAdhkarList(data.HUSN_ALMUSLIM);
          setError(null);
        } else {
          setAdhkarList([]);
          setError("adhkar_details.no_adhkar");
        }
      } catch {
        setError("adhkar_details.load_error");
        setAdhkarList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdhkarDetails();
  }, [url]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#50CC42" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{strings.ADHAKAR_DETAILS_ERROR}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{strings.COMMON_BACK}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{strings.COMMON_BACK}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {adhkarList.map((item) => (
            <View key={item.HUSN_ID || item.HUSN_TEXT} style={styles.adhkarBox}>
              <Text style={styles.arabicText}>{item.HUSN_TEXT}</Text>
              {item.ENGLISH_TEXT ? (
                <Text style={styles.englishText}>{item.ENGLISH_TEXT}</Text>
              ) : null}
              {item.HUSN_REPEAT && (
                <Text style={styles.repeatText}>{`${strings.ADHAKAR_REPEAT}: ${item.HUSN_REPEAT} ${strings.ADHAKAR_TIMES}`}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#50CC42" },
  background: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginTop: 80,
    marginBottom: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  adhkarBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  arabicText: {
    fontSize: 22,
    color: "#51AF5B",
    textAlign: "center",
    lineHeight: 35,
  },
  englishText: {
    fontSize: 16,
    color: "#ddd",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  repeatText: {
    marginTop: 6,
    color: "#ccc",
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default AdhkarDetails;
