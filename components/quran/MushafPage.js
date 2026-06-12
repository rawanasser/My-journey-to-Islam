import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import strings from '../../locales/i18nStrings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Arabic numerals for ayah numbers
const toArabicNumber = (num) => {
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNums[parseInt(d)]).join('');
};

const MushafPage = memo(({
    ayahs = [],
    surahName = '',
    surahNumber = 1,
    pageNumber = null,
    juzNumber = null,
    showBismillah = false,
    selectedAyahId = null,
    onAyahPress = () => { },
}) => {
    const bismillahStr = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

    return (
        <View style={styles.pageContainer}>
            {/* Header Info */}
            <View style={styles.topInfo}>
                <Text style={styles.topInfoText}>
                    {juzNumber ? `${strings.SURAH_JUZ} ${toArabicNumber(juzNumber)}` : ''}
                </Text>
                <Text style={styles.topInfoText}>{surahName}</Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Render centered separate Bismillah line ONLY IF showBismillah flag is true */}
                {showBismillah && (
                    <View style={styles.bismillahContainer}>
                        <Text style={styles.bismillahText}>{bismillahStr}</Text>
                    </View>
                )}

                {/* Inline Ayahs Content - Traditional Mushaf Flow */}
                <View style={styles.ayahsWrapper}>
                    <Text style={styles.paragraphText}>
                        {ayahs.map((ayah) => {
                            const isSelected = selectedAyahId === ayah.number;
                            return (
                                <Text
                                    key={ayah.number}
                                    onPress={() => onAyahPress(ayah)}
                                    style={[
                                        styles.ayahBase,
                                        isSelected && styles.ayahSelected,
                                    ]}
                                >
                                    {ayah.text}
                                    <Text style={styles.ayahNumberInline}>
                                        {` (${toArabicNumber(ayah.numberInSurah)}) `}
                                    </Text>
                                </Text>
                            );
                        })}
                    </Text>
                </View>
            </View>

            {/* Page Number Indicator */}
            {pageNumber && (
                <View style={styles.bottomInfo}>
                    <Text style={styles.pageNumberText}>{toArabicNumber(pageNumber)}</Text>
                </View>
            )}
        </View>
    );
});

MushafPage.propTypes = {
    ayahs: PropTypes.array,
    surahName: PropTypes.string,
    surahNumber: PropTypes.number,
    pageNumber: PropTypes.number,
    juzNumber: PropTypes.number,
    showBismillah: PropTypes.bool,
    selectedAyahId: PropTypes.number,
    onAyahPress: PropTypes.func,
};

const styles = StyleSheet.create({
    pageContainer: {
        width: SCREEN_WIDTH,
        height: '100%',
        backgroundColor: '#F4FFD4',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
        flexDirection: 'column',
        overflow: 'hidden',
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(81, 175, 91, 0.4)',
        paddingBottom: 4,
    },
    topInfoText: {
        fontSize: 14,
        color: '#51AF5B',
        fontFamily: undefined,
    },
    contentContainer: {
        flex: 1,
    },
    bismillahContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    bismillahText: {
        fontSize: 24,
        color: '#51AF5B',
        textAlign: 'center',
        fontFamily: undefined,
    },
    ayahsWrapper: {
        flex: 1,
        marginTop: 5, // Tight spacing after Bismillah or Header
    },
    paragraphText: {
        textAlign: 'center',
        writingDirection: 'rtl',
        lineHeight: 40, // Tight, authentic spacing
    },
    ayahBase: {
        fontSize: 22,
        color: '#111111',
        fontFamily: undefined,
        backgroundColor: 'transparent',
    },
    ayahSelected: {
        backgroundColor: '#E8F0FE',
        color: '#000000',
    },
    ayahNumberInline: {
        fontSize: 18,
        color: '#51AF5B',
        fontFamily: undefined,
    },
    bottomInfo: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pageNumberText: {
        fontSize: 16,
        color: '#51AF5B',
        fontWeight: '600',
    },
});

export default MushafPage;
