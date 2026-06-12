import { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Animated, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Magnetometer } from 'expo-sensors';
import strings from '../../locales/i18nStrings';

const QiblaDirectionScreen = () => {
  const navigation = useNavigation();
  const angleAnim = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({
    'HedvigLettersSans-Regular': require('../../assets/font/HedvigLettersSans-Regular.ttf'),
  });

  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      let deg = Math.atan2(y, x) * (180 / Math.PI);
      if (deg < 0) deg += 360;
      angleAnim.setValue(deg);
    });

    return () => subscription.remove();
  }, [angleAnim]);

  const qiblaDirection = 135;
  const rotate = Animated.subtract(new Animated.Value(qiblaDirection), angleAnim).interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require('../../assets/images/Backgroud.png')}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { fontFamily: 'HedvigLettersSans-Regular' }]}>← </Text>
          </TouchableOpacity>

          <Text style={[styles.title, { fontFamily: 'HedvigLettersSans-Regular' }]}>{strings.QIBLA_TITLE}</Text>

          <View style={styles.compassContainer}>
            <View style={styles.yellowBackground}>
              <View style={styles.compassCircle}>
                <Animated.View
                  style={[
                    styles.arrow,
                    {
                      transform: [{ rotate }],
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.instruction, { fontFamily: 'HedvigLettersSans-Regular' }]}>
              {strings.QIBLA_INSTRUCTION}
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: '#50CC42',
  },
  overlayImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  compassContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  yellowBackground: {
    backgroundColor: '#50CC42',
    borderRadius: 120,
    padding: 20,
  },
  compassCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FCFFD8',
  },
  instruction: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QiblaDirectionScreen;
