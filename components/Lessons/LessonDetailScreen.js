import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Dimensions, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import strings from '../../locales/i18nStrings';
import YoutubePlayer from 'react-native-youtube-iframe';

const LessonDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lesson } = route.params;

  const [fontsLoaded] = useFonts({
    'HedvigLettersSans-Regular': require('../../assets/font/HedvigLettersSans-Regular.ttf'),
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
            <Text style={[styles.backButtonText, { fontFamily: 'HedvigLettersSans-Regular' }]}>← {strings.COMMON_BACK}</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { fontFamily: 'HedvigLettersSans-Regular' }]}>
            {strings.LESSONS_PREFIX} {lesson?.id}
          </Text>

          {lesson?.videoId && (
            <YoutubePlayer
              height={230}
              width={Dimensions.get('window').width - 40}
              videoId={lesson.videoId}
              play={false}
            />
          )}

          <Text style={[styles.text, { fontFamily: 'HedvigLettersSans-Regular', marginTop: 20 }]}>
            {strings.LESSONS_DEFAULT_TEXT}
          </Text>
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
    justifyContent: 'flex-start',
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
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'justify',
    lineHeight: 24,
  },
});

export default LessonDetailScreen;
