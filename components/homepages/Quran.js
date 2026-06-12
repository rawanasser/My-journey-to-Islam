import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import strings from '../../locales/i18nStrings';

const QuranScreen = () => {
  const navigation = useNavigation();
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pressedIndex, setPressedIndex] = useState(null);

  const fetchSurahs = () => {
    setLoading(true);
    axios
      .get('https://api.alquran.cloud/v1/surah', { timeout: 10000 })
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setSurahs(response.data.data);
          setError(null);
        } else {
          setError({ key: 'quran.loading_failed', params: {} });
        }
        setLoading(false);
      })
      .catch((err) => {
        let errorKey = 'quran.loading_failed';
        let errorParams = {};

        if (err.response) {
          errorKey = 'quran.server_error';
          errorParams = { status: err.response.status };
        } else if (err.request) {
          errorKey = 'quran.no_response';
        } else if (err.code === 'ECONNABORTED') {
          errorKey = 'quran.timeout_error';
        } else {
          errorKey = 'quran.unexpected_error';
          errorParams = { message: err.message };
        }
        setError({ key: errorKey, params: errorParams });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSurahs();
  }, []);

  const handleSurahPress = (item, index) => {
    setPressedIndex(index);
    navigation.navigate('SurahDetails', {
      surahNumber: item.number,
      surahNameArabic: item.name,
    });
    setTimeout(() => setPressedIndex(null), 200);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#51AF5B" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{strings.QURAN_LOAD_FAILED}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchSurahs}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={styles.retryText}>{strings.COMMON_RETRY}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/Backgroud.png')}
        style={styles.overlayImage}
        imageStyle={{ opacity: 0.1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#F4FFD4" />
          </TouchableOpacity>
          <Text style={styles.header}>{strings.QURAN_TITLE}</Text>
        </View>
        <FlatList
          data={surahs}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.card, pressedIndex === index && styles.cardPressed]}
              onPress={() => handleSurahPress(item, index)}
            >
              <View style={styles.surahInfo}>
                <Text style={styles.surahText}>
                  <Text style={styles.surahNumber}>{item.number} </Text>
                  <Text style={styles.surahName}>{item.name}</Text>
                </Text>
                <Text style={styles.surahEnglish}>{item.englishName}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ImageBackground>
    </View>
  );
};

// ... باقي الأنماط (styles) كما هي بدون تغيير

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#50CC42',
    paddingTop: 0,
    paddingHorizontal: 10,
  },
  overlayImage: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 18,
    backgroundColor: 'rgba(80,204,66,0.98)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: '#51AF5B',
    borderRadius: 20,
    padding: 6,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 1,
    flex: 1,
    marginLeft: 40,
    marginRight: 40,
  },
  card: {
    backgroundColor: '#FCFFD8',
    borderRadius: 13,
    marginVertical: 7,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  cardPressed: {
    backgroundColor: '#F4FFB0',
  },
  surahInfo: {
    width: '100%',
    alignItems: 'flex-end',
  },
  surahText: {
    flexDirection: 'row',
    fontSize: 22,
    color: '#51AF5B',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },
  surahNumber: {
    fontSize: 22,
    color: '#51AF5B',
    fontWeight: 'bold',
  },
  surahName: {
    fontSize: 22,
    color: '#51AF5B',
    fontWeight: 'bold',
  },
  surahEnglish: {
    fontSize: 15,
    color: '#51AF5B',
    textAlign: 'right',
    opacity: 0.85,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 100,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#51AF5B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
});


export default QuranScreen;
