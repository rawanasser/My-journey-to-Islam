import { View, StyleSheet, Image, Pressable, ImageBackground, Text } from "react-native";
import { useFonts } from "expo-font";
import PropTypes from "prop-types";
import strings from "../../locales/i18nStrings";

function Shahada({ navigation }) {
  const [fontsLoaded] = useFonts({
    Hedvig: require("../../assets/font/HedvigLettersSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <View style={styles.container}><Text>{strings.COMMON_LOADING}</Text></View>;
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
            <Image
              source={require("../../assets/icon/Group.png")}
              style={styles.logo}
            />
          </Pressable>

          <Image
            style={styles.image1}
            source={require("../../assets/images/shadah.png")}
          />

          <Image
            source={require("../../assets/icon/Hand.png")}
            style={styles.hand}
          />
          <Image
            source={require("../../assets/icon/Hand.png")}
            style={styles.hand2}
          />
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{strings.SHAHADA_TEXT}</Text>
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
      onPress={() => navigation.navigate("Pray")}
    >
      <Text style={styles.continueText}>{strings.COMMON_CONTINUE}</Text>
    </Pressable>
  );
};

Shahada.propTypes = {
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
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 19,
  },
  logoContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
  },
  logo: {
    width: 31,
    aspectRatio: 1.55,
    marginBottom: 30,
  },
  messageBox: {
    width: 360,
    top: 500,
    borderRadius: 10,
    backgroundColor: "#FCFFD8",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  messageText: {
    color: "#1B9F29",
    textAlign: "center",
    textTransform: "capitalize",
    fontFamily: "Hedvig",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 30,
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
  hand: {
    position: "absolute",
    top: 440,
    left: "98%",
    transform: [{ translateX: -40 }],
    width: 52,
    height: 52,
  },
  hand2: {
    position: "absolute",
    top: 690,
    left: "20%",
    transform: [{ translateX: -40 }],
    width: 52,
    height: 52,
  },
  image1: {
    width: 530,
    height: 900,
    position: "absolute",
    top: 1,
  },
});

export default Shahada;