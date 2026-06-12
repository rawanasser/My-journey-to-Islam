import { View, StyleSheet, Image, Pressable, ImageBackground, Text } from "react-native";
import { useFonts } from "expo-font";
import PropTypes from "prop-types";
import strings from "../../locales/i18nStrings";
import AntDesign from "@expo/vector-icons/AntDesign";

function Islam({ navigation }) {
  const [loaded] = useFonts({
    Hedvig: require("../../assets/font/HedvigLettersSans-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.container}>
          <Pressable
            style={styles.logoContainer}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <AntDesign name="arrowleft" size={40} color="#F4FFD4" />
          </Pressable>

          <View style={styles.content}>
            <View style={styles.topImages}>
              <Image source={require("../../assets/icon/Hand.png")} style={styles.icon} />
              <Image source={require("../../assets/icon/Praying Man.png")} style={styles.icon} />
              <Image source={require("../../assets/icon/Zakat.png")} style={styles.icon} />
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{strings.ISLAM_PILLARS_DESC}</Text>
            </View>

            <View style={styles.bottomImages}>
              <Image source={require("../../assets/icon/Fasting.png")} style={styles.icon} />

            </View>
          </View>

          <View style={styles.buttonContainer}>
            <ContinueButton navigation={navigation} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const ContinueButton = ({ navigation }) => {
  return (
    <Pressable
      style={styles.continueButton}
      accessibilityRole="button"
      onPress={() => navigation.navigate("Shahada")}
    >
      <Text style={styles.continueText}>{strings.COMMON_CONTINUE}</Text>
    </Pressable>
  );
};

Islam.propTypes = {
  navigation: PropTypes.object.isRequired,
};

ContinueButton.propTypes = {
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
    maxWidth: 480,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 19,
  },
  logoContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: 20,
  },
  topImages: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    marginBottom: 20,
  },
  bottomImages: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    marginTop: 20,
  },
  descriptionContainer: {
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FCFFD8",
    alignItems: "center",
  },
  descriptionText: {
    color: "#1B9F29",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Hedvig",
    fontWeight: "400",
    lineHeight: 30,
  },
  icon: {
    width: 52,
    height: 52,
  },
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
  continueText: {
    textTransform: "uppercase",
    fontFamily: "Hedvig",
    fontSize: 19,
    textAlign: "center",
    color: "#51AF5B",
  },
});

export default Islam;