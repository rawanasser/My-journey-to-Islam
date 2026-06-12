import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useEffect, useState } from 'react';
import i18n from './locales/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';
import LessonDetailScreen from './components/Lessons/LessonDetailScreen';
import LessonsListScreen from './components/Lessons/LessonsListScreen';
import AdhkarDetails from './components/homepages/AdhkarDetails';
import AdhkarScreen from './components/homepages/AdhkarScreen';
import QiblaDirection from './components/homepages/QiblaDirection';
import Quran from './components/homepages/Quran';
import SurahDetails from './components/homepages/SurahDetails';
import SurahPages from './components/homepages/SurahPages';
import Shahada from './components/info/Shahada';
import { UserProgressProvider } from './contexts/UserProgressContext';

import LibraryWebView from './components/homepages/LibraryWebView';
import LanguageSelectionScreen from './components/info/LanguageSelectionScreen';
import Welcome from './components/info/Welcome';
import Whatsislam from './components/info/Whatsislam';
import Fasting from './components/info/fasting';
import Hajj from './components/info/hajj';
import Home from './components/info/home';
import Islam from './components/info/islam';
import Pray from './components/info/pray';
import Start from './components/info/start';
import Zakat from './components/info/zakat';

const Stack = createNativeStackNavigator();

const LANGUAGE_KEY = 'user-language';
const HAS_CHOSEN_LANGUAGE_KEY = 'hasChosenLanguage';
const INIT_TIMEOUT_MS = 5000; // 5 second safety timeout

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const initializeApp = async () => {
      try {
        const hasChosenLanguage = await AsyncStorage.getItem(HAS_CHOSEN_LANGUAGE_KEY);

        if (!isMounted) return;

        if (hasChosenLanguage === 'true') {
          const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

          if (savedLanguage && isMounted) {
            await i18n.changeLanguage(savedLanguage);
          }

          if (!isMounted) return;

          const hasLaunched = await AsyncStorage.getItem('hasLaunched');

          if (hasLaunched === null) {
            await AsyncStorage.setItem('hasLaunched', 'true');
            if (isMounted) setInitialRoute('Welcome');
          } else {
            if (isMounted) setInitialRoute('Home');
          }
        } else {
          if (isMounted) setInitialRoute('LanguageSelection');
        }
      } catch {
        if (isMounted) setInitialRoute('LanguageSelection');
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, INIT_TIMEOUT_MS);

    initializeApp();

    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoading || !initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50CC42" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <UserProgressProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={initialRoute}
          >
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Whatsislam" component={Whatsislam} />
            <Stack.Screen name="Islam" component={Islam} />
            <Stack.Screen name="Shahada" component={Shahada} />
            <Stack.Screen name="Pray" component={Pray} />
            <Stack.Screen name="Zakat" component={Zakat} />
            <Stack.Screen name="Fasting" component={Fasting} />
            <Stack.Screen name="Hajj" component={Hajj} />
            <Stack.Screen name="Quran" component={Quran} />
            <Stack.Screen name="Start" component={Start} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="QiblaDirection" component={QiblaDirection} />

            <Stack.Screen name="LessonsListScreen" component={LessonsListScreen} />
            <Stack.Screen name="LessonDetailScreen" component={LessonDetailScreen} />
            <Stack.Screen name="SurahPages" component={SurahPages} />
            <Stack.Screen name="SurahDetails" component={SurahDetails} />
            <Stack.Screen name="AdhkarScreen" component={AdhkarScreen} />
            <Stack.Screen name="AdhkarDetails" component={AdhkarDetails} />
            <Stack.Screen name='LibraryWebView' component={LibraryWebView} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProgressProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
