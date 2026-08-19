import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ScannerScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  const [message, setMessage] =
    useState(
      '本のISBNバーコードを枠の中に入れてください'
    );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          カメラの状態を確認しています...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          バーコードを読み取るためにカメラの許可が必要です。
        </Text>

        <Pressable
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            カメラを許可する
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← 戻る
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) {
      return;
    }

    /*
     * 全角数字などが混ざっても
     * 半角数字へ直す
     */
    const normalizedCode = data
      .replace(/[０-９]/g, (char) =>
        String.fromCharCode(
          char.charCodeAt(0) - 0xfee0
        )
      )
      .replace(/[^0-9]/g, '');

    console.log(
      '読み取ったバーコード:',
      data
    );

    console.log(
      '正規化したバーコード:',
      normalizedCode
    );

    /*
     * ISBN-13は通常978または979で始まる
     */
    const isIsbn =
      normalizedCode.length === 13 &&
      (
        normalizedCode.startsWith('978') ||
        normalizedCode.startsWith('979')
      );

    /*
     * ISBNではないバーコードなら
     * add画面へ移動しない
     */
    if (!isIsbn) {
      setMessage(
        `ISBNではないバーコードを読み取りました。\n${normalizedCode}\n978 または 979 から始まる方を読み取ってください。`
      );

      return;
    }

    setScanned(true);

    console.log(
      'ISBNとしてadd画面へ渡します:',
      normalizedCode
    );

    router.replace({
      pathname: '/add',
      params: {
        isbn: normalizedCode,
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13'],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarcodeScanned
        }
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>
          本のバーコードを読み取る
        </Text>

        <View style={styles.scanArea} />

        <Text style={styles.description}>
          {message}
        </Text>

        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text
            style={
              styles.cancelButtonText
            }
          >
            キャンセル
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  camera: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    position: 'absolute',
    top: 80,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  scanArea: {
    width: 300,
    height: 170,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },

  description: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 21,
  },

  cancelButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 14,
  },

  cancelButtonText: {
    color: '#4A3428',
    fontSize: 16,
    fontWeight: 'bold',
  },

  message: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 30,
    marginTop: 150,
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#4A3428',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 30,
  },
});