import { View, StyleSheet, TouchableOpacity, FlatList, ImageBackground, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import strings from '../../locales/i18nStrings';

const LESSONS_DATA = [
  { id: '1', videoId: 'wFCoIplrEu4' },
  { id: '2', videoId: 'z34lGrSpUts' },
  { id: '3', videoId: '3pTs8mpgQqk' },
  { id: '4', videoId: '5g8k1b2X9eY' },
  { id: '5', videoId: '2xS70Zn-jRk' },
  { id: '6', videoId: 'v1YB184EXRo' },
  { id: '7', videoId: 'IQjzErJlpJ0' },
  { id: '8', videoId: 'KQZVk1P8X2k' },
  { id: '9', videoId: 'srRdouwZocI' },
  { id: '10', videoId: 'rmLwEI3Vl5Q' },
  { id: '11', videoId: 'tk6bbX962eM' },
  { id: '12', videoId: 'hwcAWbZ_ZTs' },
  { id: '13', videoId: 'RyRW0COnBAU' },
  { id: '14', videoId: 'oDjJLgziwhM' },
  { id: '15', videoId: 'BnLsHbJ8JJE' },
];

const LessonsListScreen = () => {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'HedvigLettersSans-Regular': require('../../assets/font/HedvigLettersSans-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lessonItem}
      onPress={() => navigation.navigate('LessonDetailScreen', { lesson: item })}
    >
      <Text style={[styles.lessonItemText, { fontFamily: 'HedvigLettersSans-Regular' }]}>
        {strings.LESSONS_PREFIX} {item.id}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.baseContainer}>
      <ImageBackground
        source={require('../../assets/images/Backgroud.png')}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { fontFamily: 'HedvigLettersSans-Regular' }]}>← {strings.COMMON_BACK}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { fontFamily: 'HedvigLettersSans-Regular' }]}>{strings.LESSONS_TITLE}</Text>
        </View>

        <FlatList
          data={LESSONS_DATA}
          renderItem={renderLessonItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
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
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    padding: 5,
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
    textAlign: 'center',
    marginBottom: 20,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lessonItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  lessonItemText: {
    fontSize: 18,
    color: 'white',
  },
});

export default LessonsListScreen;
