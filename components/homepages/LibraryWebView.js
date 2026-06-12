import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Pressable
} from "react-native";
import { WebView } from "react-native-webview";
import PropTypes from "prop-types";
import { Ionicons } from '@expo/vector-icons';
import strings from '../../locales/i18nStrings';

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#50CC42" />
  </View>
);

function LibraryWebView({ navigation }) {
  const libraryUrl = "https://islamhouse.com/";

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.logoContainer,
            pressed && styles.pressedButton
          ]}
          onPress={handleGoBack}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>{strings.LIBRARY_WEBVIEW_TITLE}</Text>

        <View style={styles.placeholder} />
      </View>

      <WebView
        source={{ uri: libraryUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={LoadingIndicator}
        allowsBackForwardNavigationGestures={true}
      />
    </SafeAreaView>
  );
}

LibraryWebView.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#50CC42",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3AA32A",
    height: 60,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pressedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 0.95 }]
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default LibraryWebView;