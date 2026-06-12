import { View, StyleSheet, Image, Pressable, ImageBackground, Text } from "react-native";
import { useFonts } from "expo-font";
import PropTypes from "prop-types";
import strings from "../../locales/i18nStrings";
import React from "react";

function Welcome({ navigation }) {
  const [fontsLoaded] = useFonts({
    Hedvig: require("../../assets/font/HedvigLettersSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{strings.COMMON_LOADING}</Text>
      </View>
    );
  }

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require("../../assets/images/Backgroud.png")}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.contentContainer}>
          <Image
            style={styles.image1}
            source={require("../../assets/icon/hug.png")}
          />

          <View style={styles.contentBox}>
            <Text style={styles.continuetext}>
              {strings.WELCOME_TEXT}
            </Text>
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
      onPress={() => navigation.navigate("Whatsislam")}
    >
      <Text style={styles.continueText}>{strings.COMMON_CONTINUE}</Text>
    </Pressable>
  )
};


Welcome.propTypes = {
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  baseContainer: {
    flex: 1,
    backgroundColor: "#75B06F",
  },
  overlayImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 19,
    paddingTop: 60,
  },
  contentBox: {
    marginTop: 33,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FCFFD8",
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
  continuetext: {
    fontFamily: "Hedvig",
    fontSize: 20,
    textAlign: "center",
    color: "#51AF5B",
    lineHeight: 30,
  },
  image1: {
    height: 320,
    width: "80%",
    resizeMode: "contain",
    marginTop: 40,
  },
});

export default Welcome;
