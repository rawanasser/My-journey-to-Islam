import { View, StyleSheet, Image, Pressable, ImageBackground, Text } from "react-native";
import { useFonts } from "expo-font";
import PropTypes from "prop-types";
import strings from "../../locales/i18nStrings";
import AntDesign from "@expo/vector-icons/AntDesign";

function Whatsislam({ navigation }) {
  const [fontsLoaded] = useFonts({
    Hedvig: require("../../assets/font/HedvigLettersSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.baseContainer}>
        <ImageBackground
          source={require("../../assets/images/Backgroud.png")}
          style={styles.overlayImage}
          imageStyle={{ opacity: 0.4 }}
        >
          <View style={styles.container}><Text>{strings.COMMON_LOADING}</Text></View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.baseContainer}>
      {/* <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      > */}
      <Pressable
        style={styles.logoContainer}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <AntDesign name="arrowleft" size={40} color="#F4FFD4" />
      </Pressable>

      <Image
        style={styles.image1}
        source={require("../../assets/images/image1.png")}
      />

      <View style={styles.contentBox}>
        <Text style={styles.text}>{strings.WHAT_IS_ISLAM_TEXT}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <ContinueButton navigation={navigation} />
      </View>
      {/* </ImageBackground> */}
    </View>
  );
}

const ContinueButton = ({ navigation }) => (
  <Pressable
    style={styles.continueButton}
    accessibilityRole="button"
    onPress={() => navigation.navigate("Islam")}
  >
    <Text style={styles.continueText}>{strings.COMMON_CONTINUE}</Text>
  </Pressable>
);

Whatsislam.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

ContinueButton.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: "#75B06F",
  },
  // overlayImage: {
  //   flex: 1,
  //   width: "100%",
  //   height: "100%",
  // },
  logoContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
  image1: {
    width: 530,
    height: 900,
    position: "absolute",
    top: 1,
    alignSelf: "center",
  },
  contentBox: {
    position: "absolute",
    top: 520,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FCFFD8",
    alignItems: "center",
    alignSelf: "center",
  },
  text: {
    fontFamily: "Hedvig",
    fontSize: 20,
    textAlign: "center",
    color: "#51AF5B",
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
    fontFamily: "Hedvig",
    fontSize: 20,
    textAlign: "center",
    color: "#51AF5B",
    textTransform: "uppercase",
  },
});

export default Whatsislam;
