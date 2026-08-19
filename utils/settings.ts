import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShelfTheme =
  | 'natural'
  | 'classic'
  | 'retro'
  | 'library'
  | 'monochrome'
  | 'pop';

export type BookColorTheme =
  | 'auto'
  | 'pastel'
  | 'vivid'
  | 'retro'
  | 'monochrome';

export type AppSettings = {
  shelfTheme: ShelfTheme;
  bookColorTheme: BookColorTheme;
  showDecorations: boolean;
};

const SETTINGS_KEY = 'hondana-settings';

const defaultSettings: AppSettings = {
  shelfTheme: 'natural',
  bookColorTheme: 'auto',
  showDecorations: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const savedSettings =
      await AsyncStorage.getItem(SETTINGS_KEY);

    if (!savedSettings) {
      return defaultSettings;
    }

    const parsedSettings = JSON.parse(savedSettings);

    return {
      shelfTheme:
        parsedSettings.shelfTheme ??
        defaultSettings.shelfTheme,

      bookColorTheme:
        parsedSettings.bookColorTheme ??
        defaultSettings.bookColorTheme,

      showDecorations:
        parsedSettings.showDecorations ??
        defaultSettings.showDecorations,
    };
  } catch (error) {
    console.error(
      '設定の読み込みに失敗しました:',
      error
    );

    return defaultSettings;
  }
}

export async function saveSettings(
  settings: AppSettings
) {
  try {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error(
      '設定の保存に失敗しました:',
      error
    );
  }
}