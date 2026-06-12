import { useRoute } from "@react-navigation/native";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import strings from '../../locales/i18nStrings';

const SurahPages = () => {
  const route = useRoute();
  const { surahId, surahName } = route.params;

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAyahs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahId}/uthmani`, {
        headers: { Accept: 'application/json' },
        timeout: 10000
      });

      if (typeof response.data === 'object' && response.data.code === 200) {
        setAyahs(response.data.data.ayahs);
      } else {
        setError('surah_details.no_data');
      }
    } catch (err) {
      console.error('[SurahPages] Error fetching ayahs:', err);
      if (err.code === 'ECONNABORTED') {
        setError('surah_details.timeout');
      } else {
        setError('surah_details.error_loading');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAyahs();
  }, [surahId]);

  const renderAyahs = () => {
    if (!ayahs || ayahs.length === 0) {
      return null;
    }

    const basmalah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    const firstAyah = ayahs[0];

    if (surahId === 9) {
      return ayahs.map((ayah) => (
        <Text key={ayah.number} style={styles.ayahText}>
          {`${ayah.text} ﴿${ayah.numberInSurah}﴾`}
        </Text>
      ));
    }

    if (firstAyah.text.startsWith(basmalah)) {
      const remainingText = firstAyah.text.substring(basmalah.length).trim();
      return (
        <>
          <Text style={styles.basmalahText}>{basmalah}</Text>
          {remainingText && (
            <Text key={firstAyah.number} style={styles.ayahText}>
              {`${remainingText} ﴿${firstAyah.numberInSurah}﴾`}
            </Text>
          )}
          {ayahs.slice(1).map((ayah) => (
            <Text key={ayah.number} style={styles.ayahText}>
              {`${ayah.text} ﴿${ayah.numberInSurah}﴾`}
            </Text>
          ))}
        </>
      );
    }

    return ayahs.map((ayah) => (
      <Text key={ayah.number} style={styles.ayahText}>
        {`${ayah.text} ﴿${ayah.numberInSurah}﴾`}
      </Text>
    ));
  };


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00AA00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{strings.SURAH_LOAD_FAILED}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchAyahs}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>{strings.COMMON_RETRY}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.surahTitle}>{surahName}</Text>
      {renderAyahs()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  surahTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004d00',
    textAlign: 'center',
    marginBottom: 24,
  },
  basmalahText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: undefined,
  },
  ayahText: {
    fontSize: 22,
    color: '#222',
    lineHeight: 40,
    marginBottom: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#51AF5B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SurahPages;
