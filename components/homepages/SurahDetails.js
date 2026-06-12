import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import strings from '../../locales/i18nStrings';

import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import MushafPage from '../quran/MushafPage';
import FloatingToolbar from '../quran/FloatingToolbar';

const SurahDetails = ({ route, navigation }) => {
  const { surahNumber, surahNameArabic } = route.params;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Create audio player with no initial source — we'll replace on ayah tap
  const player = useAudioPlayer(null);

  const bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

  // Configure audio mode once
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
  }, []);

  const fetchSurah = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/uthmani`
      );
      const data = await res.json();

      if (data?.code === 200 && data?.data?.ayahs) {
        // MANDATORY: Remove any ayah where: ayah.text.trim() === "بسم الله الرحمن الرحيم"
        // ALSO: Basmalah must NEVER appear inline (strip prefix if it exists)
        const BISMILLAH_BASE = "بسم الله الرحمن الرحيم";
        const BISMILLAH_UTHMANI = "بِسْمِ ٱللَّهِ ٱلرَّحمَٰنِ ٱلرَّحِيمِ";
        const BISMILLAH_UTHMANI_ALT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

        let ayahs = data.data.ayahs
          .filter(ayah => {
            const trimmed = ayah.text.trim();
            return trimmed !== BISMILLAH_BASE &&
              trimmed !== BISMILLAH_UTHMANI &&
              trimmed !== BISMILLAH_UTHMANI_ALT;
          })
          .map(ayah => {
            let cleanedText = ayah.text;
            [BISMILLAH_BASE, BISMILLAH_UTHMANI, BISMILLAH_UTHMANI_ALT].forEach(b => {
              if (cleanedText.startsWith(b)) {
                cleanedText = cleanedText.replace(b, '').trim();
              }
            });
            return { ...ayah, text: cleanedText };
          });

        // Paginate ayahs using actual 'page' property from API
        const pagesMap = ayahs.reduce((acc, ayah) => {
          const p = ayah.page;
          if (!acc[p]) acc[p] = [];
          acc[p].push(ayah);
          return acc;
        }, {});

        const sortedPages = Object.keys(pagesMap)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((p, idx) => ({
            index: idx,
            actualPage: parseInt(p),
            ayahs: pagesMap[p],
            isFirstPage: idx === 0,
            showBasmalah: (idx === 0 && surahNumber !== 9)
          }));

        setPages(sortedPages);
      } else {
        setError(strings.SURAH_NO_DATA);
      }
    } catch (err) {
      setError(strings.SURAH_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    fetchSurah();
  }, [fetchSurah]);

  const playAyah = useCallback((globalAyahNumber) => {
    try {
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
      player.replace({ uri: audioUrl });
      player.play();
    } catch (error) {
      console.error('Playback Error:', error);
    }
  }, [player]);

  const handleAyahPress = useCallback((ayah) => {
    const isAlreadySelected = selectedAyah?.number === ayah.number;
    setSelectedAyah(isAlreadySelected ? null : ayah);

    // Audio MUST start ONLY when the user taps an Ayah
    if (!isAlreadySelected) {
      playAyah(ayah.number);
    } else {
      player.pause();
    }
  }, [selectedAyah, playAyah, player]);

  // Cleanup is handled automatically by useAudioPlayer hook on unmount

  const handleBookmark = async () => {
    if (!selectedAyah) return;
    try {
      const key = `bookmark_${surahNumber}_${selectedAyah.numberInSurah}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        surahNumber: surahNumber,
        surahName: surahNameArabic,
        ayah: selectedAyah.numberInSurah,
        text: selectedAyah.text,
      }));
      Alert.alert(strings.COMMON_SUCCESS, strings.SURAH_BOOKMARKED);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!selectedAyah) return;
    try {
      await Share.share({
        message: `${selectedAyah.text} (${surahNameArabic}: ${selectedAyah.numberInSurah})`
      });
    } catch (e) {
      console.error(e);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentPageIndex(viewableItems[0].index);
    }
  }).current;

  const renderPage = useCallback(({ item }) => (
    <MushafPage
      ayahs={item.ayahs}
      surahName={surahNameArabic}
      surahNumber={surahNumber}
      pageNumber={currentPageIndex + 1}
      juzNumber={item.ayahs[0]?.juz}
      showBismillah={item.showBasmalah}
      selectedAyahId={selectedAyah?.number}
      onAyahPress={handleAyahPress}
    />
  ), [surahNameArabic, surahNumber, currentPageIndex, selectedAyah, handleAyahPress]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#51AF5B" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F4FFD4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{surahNameArabic}</Text>
          <View style={styles.pageIndicator} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: '#E53935' }]}>{error}</Text>
          <TouchableOpacity
            onPress={fetchSurah}
            style={{ marginTop: 16, backgroundColor: '#51AF5B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>{strings.COMMON_RETRY}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header - Stays at top */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F4FFD4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{surahNameArabic}</Text>
          <View style={styles.pageIndicator}>
            <Text style={styles.indicatorText}>{currentPageIndex + 1}/{pages.length}</Text>
          </View>
        </View>

        {/* Horizontal Pager - Takes remaining space above player */}
        <View style={styles.listContainer}>
          <FlatList
            data={pages}
            renderItem={renderPage}
            keyExtractor={(item) => item.index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3}
            removeClippedSubviews={true}
            inverted={true} // RTL swipe
          />
        </View>

        {/* Floating Toolbar - Appears relative to selected ayah */}
        <FloatingToolbar
          visible={!!selectedAyah}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onTafsir={() => Alert.alert(strings.SURAH_TAFSIR_TITLE, strings.COMMON_FEATURE_COMING_SOON)}
          onNotes={() => Alert.alert(strings.SURAH_NOTES_TITLE, strings.COMMON_FEATURE_COMING_SOON)}
          onClose={() => setSelectedAyah(null)}
        />

      </View>
    </SafeAreaView>
  );
};

SurahDetails.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#51AF5B', // Color of header/footer
  },
  container: {
    flex: 1,
    backgroundColor: '#F4FFD4', // Authentic parchment color
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FFD4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#51AF5B',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    color: '#F4FFD4',
    textAlign: 'center',
    fontFamily: undefined,
  },
  backBtn: {
    padding: 5,
  },
  pageIndicator: {
    backgroundColor: 'rgba(244, 255, 212, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  indicatorText: {
    color: '#F4FFD4',
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
    overflow: 'hidden', // Absolute protection against text bleeding
    marginBottom: 5, // Tiny gap for visual separation
  },
  errorText: {
    color: '#F4FFD4',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SurahDetails;