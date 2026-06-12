import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
    Platform,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../locales/i18n';

const LANGUAGE_KEY = 'user-language';
const HAS_CHOSEN_LANGUAGE_KEY = 'hasChosenLanguage';

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
    { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
    { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
    { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
];

const LanguageSelectionScreen = ({ navigation }) => {
    const handleLanguageSelect = useCallback(async (languageCode) => {
        try {
            // 1. Change i18n language
            await i18n.changeLanguage(languageCode);

            // 2. Persist language selection
            await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);

            // 3. Persist the flag that user has chosen a language
            await AsyncStorage.setItem(HAS_CHOSEN_LANGUAGE_KEY, 'true');

            // 4. Navigate to Welcome to continue normal onboarding flow (replace to prevent back navigation)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
            });
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    }, [navigation]);

    const renderLanguageItem = ({ item }) => (
        <TouchableOpacity
            style={styles.languageItem}
            onPress={() => handleLanguageSelect(item.code)}
            activeOpacity={0.7}
        >
            <Text style={styles.languageName}>{item.nativeName}</Text>
            <Text style={styles.languageSubtitle}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../assets/images/Backgroud.png')}
            style={styles.background}
            imageStyle={{ opacity: 0.15 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="#50CC42" />
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>🌍</Text>
                    <Text style={styles.headerTitle}>{i18n.t('SELECT_LANGUAGE')}</Text>
                    <Text style={styles.headerSubtitle}>{i18n.t('SELECT_LANGUAGE_SUBTITLE')}</Text>
                </View>

                {/* Language List */}
                <FlatList
                    data={SUPPORTED_LANGUAGES}
                    renderItem={renderLanguageItem}
                    keyExtractor={(item) => item.code}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#50CC42',
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 22,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    languageItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 2,
    },
    languageSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
});

export default LanguageSelectionScreen;
