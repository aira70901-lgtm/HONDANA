import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    AppSettings,
    BookColorTheme,
    loadSettings,
    saveSettings,
    ShelfTheme,
} from '../../utils/settings';

const shelfThemes: {
  value: ShelfTheme;
  name: string;
  description: string;
  previewColor: string;
}[] = [
  {
    value: 'natural',
    name: 'ナチュラル',
    description: '明るい木製の本棚',
    previewColor: '#C99A6B',
  },
  {
    value: 'classic',
    name: 'クラシック',
    description: '重厚な木製棚と古書風',
    previewColor: '#65412C',
  },
  {
    value: 'retro',
    name: 'レトロ',
    description: '少しかすれたポスター風',
    previewColor: '#C96C42',
  },
  {
    value: 'library',
    name: 'ライブラリー',
    description: '落ち着いた図書館風',
    previewColor: '#456778',
  },
  {
    value: 'monochrome',
    name: 'モノクロ',
    description: '黒と白のシンプルな本棚',
    previewColor: '#292625',
  },
  {
    value: 'pop',
    name: 'ポップ',
    description: 'カラフルでかわいい本棚',
    previewColor: '#E98755',
  },
];

const bookColorThemes: {
  value: BookColorTheme;
  name: string;
}[] = [
  {
    value: 'auto',
    name: 'おまかせ',
  },
  {
    value: 'pastel',
    name: 'パステル',
  },
  {
    value: 'vivid',
    name: 'ビビッド',
  },
  {
    value: 'retro',
    name: 'レトロ',
  },
  {
    value: 'monochrome',
    name: 'モノクロ',
  },
];

export default function SettingsScreen() {
  const [settings, setSettings] =
    useState<AppSettings>({
      shelfTheme: 'natural',
      bookColorTheme: 'auto',
      showDecorations: true,
    });

  const fetchSettings = useCallback(async () => {
    const savedSettings = await loadSettings();
    setSettings(savedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

  const changeShelfTheme = async (
    shelfTheme: ShelfTheme
  ) => {
    const newSettings = {
      ...settings,
      shelfTheme,
    };

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const changeBookColorTheme = async (
    bookColorTheme: BookColorTheme
  ) => {
    const newSettings = {
      ...settings,
      bookColorTheme,
    };

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const toggleDecorations = async () => {
    const newSettings = {
      ...settings,
      showDecorations:
        !settings.showDecorations,
    };

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        設定
      </Text>

      <Text style={styles.subtitle}>
        自分だけの本棚にカスタマイズ
      </Text>

      <Text style={styles.sectionTitle}>
        本棚デザイン
      </Text>

      <View style={styles.themeList}>
        {shelfThemes.map((theme) => {
          const selected =
            settings.shelfTheme === theme.value;

          return (
            <Pressable
              key={theme.value}
              style={[
                styles.themeCard,
                selected &&
                  styles.themeCardSelected,
              ]}
              onPress={() =>
                changeShelfTheme(theme.value)
              }
            >
              <View
                style={[
                  styles.themePreview,
                  {
                    backgroundColor:
                      theme.previewColor,
                  },
                ]}
              >
                <View style={styles.previewBooks}>
                  <View
                    style={[
                      styles.previewBook,
                      { height: 36 },
                    ]}
                  />

                  <View
                    style={[
                      styles.previewBook,
                      { height: 45 },
                    ]}
                  />

                  <View
                    style={[
                      styles.previewBook,
                      { height: 39 },
                    ]}
                  />

                  <View
                    style={[
                      styles.previewBook,
                      { height: 48 },
                    ]}
                  />
                </View>

                <View
                  style={styles.previewShelf}
                />
              </View>

              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>
                  {theme.name}
                </Text>

                <Text
                  style={
                    styles.themeDescription
                  }
                >
                  {theme.description}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selected &&
                    styles.radioSelected,
                ]}
              >
                {selected && (
                  <View
                    style={styles.radioInner}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>
        本のカラーテーマ
      </Text>

      <View style={styles.colorGrid}>
        {bookColorThemes.map((theme) => {
          const selected =
            settings.bookColorTheme ===
            theme.value;

          return (
            <Pressable
              key={theme.value}
              style={[
                styles.colorButton,
                selected &&
                  styles.colorButtonSelected,
              ]}
              onPress={() =>
                changeBookColorTheme(
                  theme.value
                )
              }
            >
              <Text
                style={[
                  styles.colorButtonText,
                  selected &&
                    styles.colorButtonTextSelected,
                ]}
              >
                {theme.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>
        本棚の装飾
      </Text>

      <Pressable
        style={styles.settingRow}
        onPress={toggleDecorations}
      >
        <View>
          <Text style={styles.settingName}>
            小物を表示
          </Text>

          <Text
            style={styles.settingDescription}
          >
            植物や雑貨などを本棚に表示します
          </Text>
        </View>

        <View
          style={[
            styles.switchTrack,
            settings.showDecorations &&
              styles.switchTrackActive,
          ]}
        >
          <View
            style={[
              styles.switchCircle,
              settings.showDecorations &&
                styles.switchCircleActive,
            ]}
          />
        </View>
      </Pressable>

      <View style={styles.savedBox}>
        <Text style={styles.savedText}>
          設定は自動で保存されます
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F1',
  },

  content: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A3428',
  },

  subtitle: {
    color: '#806D63',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 35,
  },

  sectionTitle: {
    color: '#4A3428',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    marginTop: 12,
  },

  themeList: {
    gap: 10,
    marginBottom: 28,
  },

  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8DDD5',
    borderRadius: 16,
    padding: 12,
  },

  themeCardSelected: {
    borderColor: '#4A3428',
  },

  themePreview: {
    width: 78,
    height: 70,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingHorizontal: 8,
  },

  previewBooks: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },

  previewBook: {
    width: 11,
    backgroundColor: '#F5E7D0',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  previewShelf: {
    height: 6,
    backgroundColor: '#3C2A20',
    marginTop: 2,
  },

  themeInfo: {
    flex: 1,
    marginLeft: 14,
  },

  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A3428',
  },

  themeDescription: {
    fontSize: 12,
    color: '#806D63',
    marginTop: 4,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BBAA9F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#4A3428',
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A3428',
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 30,
  },

  colorButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  colorButtonSelected: {
    backgroundColor: '#4A3428',
    borderColor: '#4A3428',
  },

  colorButtonText: {
    color: '#4A3428',
    fontSize: 13,
    fontWeight: 'bold',
  },

  colorButtonTextSelected: {
    color: '#FFFFFF',
  },

  settingRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  settingName: {
    color: '#4A3428',
    fontSize: 15,
    fontWeight: 'bold',
  },

  settingDescription: {
    color: '#806D63',
    fontSize: 11,
    marginTop: 5,
    maxWidth: 230,
  },

  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D8CEC8',
    padding: 3,
  },

  switchTrackActive: {
    backgroundColor: '#806D63',
  },

  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },

  switchCircleActive: {
    alignSelf: 'flex-end',
  },

  savedBox: {
    marginTop: 30,
    alignItems: 'center',
  },

  savedText: {
    color: '#A59489',
    fontSize: 12,
  },
});