import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';
import de from './de.json';
import pl from './pl.json';
import da from './da.json';
import ro from './ro.json';
import ru from './ru.json';
import ja from './ja.json';
import zh from './zh.json';
import zh_TW from './zh-TW.json';
import ko from './ko.json';
import hi from './hi.json';
import no from './no.json';
import sv from './sv.json';
import el from './el.json';
import pt_BR from './pt-BR.json';
import is from './is.json';
import fil from './fil.json';
import es_MX from './es-MX.json';
import be from './be.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    it: { translation: it },
    de: { translation: de },
    pl: { translation: pl },
    da: { translation: da },
    ro: { translation: ro },
    ru: { translation: ru },
    ja: { translation: ja },
    zh: { translation: zh },
    'zh-TW': { translation: zh_TW },
    ko: { translation: ko },
    hi: { translation: hi },
    no: { translation: no },
    sv: { translation: sv },
    el: { translation: el },
    'pt-BR': { translation: pt_BR },
    is: { translation: is },
    fil: { translation: fil },
    'es-MX': { translation: es_MX },
    be: { translation: be },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (savedLanguage) {
                return callback(savedLanguage);
            }
            callback('en');
        } catch {
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (lng) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lng);
        } catch { }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
