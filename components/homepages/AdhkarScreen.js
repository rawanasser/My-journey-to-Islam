import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import strings from "../../locales/i18nStrings";

const AdhkarScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const arabicData = require("../../data/hisn_almuslim.json");
        // key must be exactly 'hisnAlMuslim' as in en.json
        const translatedData = t('hisnAlMuslim', { returnObjects: true });

        const arabicEntries = Object.entries(arabicData);
        // translatedData might be undefined if not loaded or key wrong
        const translatedEntries = translatedData && typeof translatedData === 'object' ? Object.entries(translatedData) : [];

        const merged = arabicEntries.map(([sectionTitle, sectionData], index) => {
          const [translatedTitle, translatedSectionData] =
            translatedEntries[index] || [null, {}]; // Fallback to empty if missing

          return {
            id: `section-${index}`,
            ar: {
              title: sectionTitle,
              content: sectionData.text || [],
              footnote: sectionData.footnote || [],
            },
            [currentLanguage]: {
              title: translatedTitle || strings.ADHAKAR_TITLE_NOT_FOUND,
              content: translatedSectionData?.text || [],
              footnote: translatedSectionData?.footnote || [],
            },
            // Fallback for 'en' if current is not 'en' (optional, but code uses currentLanguage)
            // The render function uses `item[currentLanguage]`, so we must ensure `currentLanguage` key exists.
          };
        });

        // Ensure the item object has the key expected by renderSection (which is `currentLanguage`)
        // The above constructs `[currentLanguage]: ...`. Correct.

        setCombinedData(merged);
      } catch (e) {
        console.error("Adhkar load error", e);
        setCombinedData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentLanguage, t]);


  const textAlignStyle = currentLanguage === "ar" ? "right" : "left";

  const renderSection = ({ item }) => {
    const currentData = item[currentLanguage];

    if (!currentData || !currentData.title) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign: textAlignStyle }]}>
          {currentData.title}
        </Text>
        {currentData.content.map((line, idx) => (
          <Text
            key={`line-${idx}`}
            style={[styles.textLine, { textAlign: textAlignStyle }]}
          >
            {line}
          </Text>
        ))}
        {currentData.footnote && currentData.footnote.length > 0 && (
          <View style={styles.footnoteSection}>
            {currentData.footnote.map((note, idx) => (
              <Text
                key={`note-${idx}`}
                style={[styles.footnoteText, { textAlign: textAlignStyle }]}
              >
                * {note}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18 }}>{strings.COMMON_LOADING}</Text>
      </View>
    );
  }

  if (combinedData.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{strings.ADHAKAR_LOAD_FAILED}</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/Backgroud.png")}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
    >
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#F4FFD4" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={combinedData}
          renderItem={renderSection}
          keyExtractor={(item) => item.id}
          extraData={currentLanguage}
          key={currentLanguage}
          contentContainerStyle={styles.listContentContainer}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

AdhkarScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: "#50CC42" },
  mainContainer: { flex: 1, backgroundColor: "transparent" },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingBottom: 15,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  listContentContainer: { paddingHorizontal: 20, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: {
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#50CC42",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  textLine: { fontSize: 18, color: "#333", marginBottom: 10, lineHeight: 30 },
  footnoteSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  footnoteText: { fontSize: 14, fontStyle: "italic", color: "#666", lineHeight: 22 },
  errorText: { fontSize: 18, color: "red", textAlign: "center" },
});

export default AdhkarScreen;