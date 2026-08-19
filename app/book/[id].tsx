import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Book, loadBooks, saveBooks } from '../../utils/storage';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      const books = await loadBooks();
      const foundBook = books.find((item) => item.id === id);

      if (foundBook) {
        setBook({
          ...foundBook,
          purchaseStatus: foundBook.purchaseStatus ?? 'purchased',
          readingStatus: foundBook.readingStatus ?? 'unread',
          favorite: foundBook.favorite ?? false,
          memo: foundBook.memo ?? '',
        });
      }
    };

    fetchBook();
  }, [id]);

  const handleSave = async () => {
    if (!book) {
      return;
    }

    if (!book.title.trim()) {
      Alert.alert('入力エラー', 'タイトルを入力してください。');
      return;
    }

    const books = await loadBooks();

    const updatedBooks = books.map((item) =>
      item.id === book.id ? book : item
    );

    await saveBooks(updatedBooks);

    Alert.alert('保存しました', '本の情報を更新しました。', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleDelete = async () => {
    if (!book) {
      return;
    }

    Alert.alert(
      '本を削除',
      'この本を本棚から削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const books = await loadBooks();

            const newBooks = books.filter(
              (item) => item.id !== book.id
            );

            await saveBooks(newBooks);

            router.replace('/');
          },
        },
      ]
    );
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          本の情報を読み込んでいます...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>本の詳細</Text>

      <Text style={styles.label}>タイトル</Text>

      <TextInput
        style={styles.input}
        value={book.title}
        onChangeText={(text) =>
          setBook({
            ...book,
            title: text,
          })
        }
      />

      <Text style={styles.label}>著者</Text>

      <TextInput
        style={styles.input}
        value={book.author}
        placeholder="著者未登録"
        placeholderTextColor="#A59489"
        onChangeText={(text) =>
          setBook({
            ...book,
            author: text,
          })
        }
      />

      {book.isbn ? (
        <>
          <Text style={styles.label}>ISBN</Text>

          <View style={styles.isbnBox}>
            <Text style={styles.isbnText}>{book.isbn}</Text>
          </View>
        </>
      ) : null}

      <Text style={styles.label}>購入状態</Text>

      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            book.purchaseStatus === 'purchased' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setBook({
              ...book,
              purchaseStatus: 'purchased',
            })
          }
        >
          <Text
            style={[
              styles.optionText,
              book.purchaseStatus === 'purchased' &&
                styles.optionTextSelected,
            ]}
          >
            購入済み
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            book.purchaseStatus === 'unpurchased' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setBook({
              ...book,
              purchaseStatus: 'unpurchased',
            })
          }
        >
          <Text
            style={[
              styles.optionText,
              book.purchaseStatus === 'unpurchased' &&
                styles.optionTextSelected,
            ]}
          >
            未購入
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>読書状態</Text>

      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            book.readingStatus === 'unread' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setBook({
              ...book,
              readingStatus: 'unread',
            })
          }
        >
          <Text
            style={[
              styles.optionText,
              book.readingStatus === 'unread' &&
                styles.optionTextSelected,
            ]}
          >
            未読
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            book.readingStatus === 'reading' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setBook({
              ...book,
              readingStatus: 'reading',
            })
          }
        >
          <Text
            style={[
              styles.optionText,
              book.readingStatus === 'reading' &&
                styles.optionTextSelected,
            ]}
          >
            読書中
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            book.readingStatus === 'finished' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setBook({
              ...book,
              readingStatus: 'finished',
            })
          }
        >
          <Text
            style={[
              styles.optionText,
              book.readingStatus === 'finished' &&
                styles.optionTextSelected,
            ]}
          >
            読了
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>お気に入り</Text>

      <Pressable
        style={[
          styles.favoriteButton,
          book.favorite && styles.favoriteButtonSelected,
        ]}
        onPress={() =>
          setBook({
            ...book,
            favorite: !book.favorite,
          })
        }
      >
        <Text style={styles.favoriteText}>
          {book.favorite ? '★ お気に入り' : '☆ お気に入りに追加'}
        </Text>
      </Pressable>

      <Text style={styles.label}>メモ</Text>

      <TextInput
        style={styles.memoInput}
        value={book.memo}
        placeholder="この本についてメモを書く"
        placeholderTextColor="#A59489"
        multiline
        textAlignVertical="top"
        onChangeText={(text) =>
          setBook({
            ...book,
            memo: text,
          })
        }
      />

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          変更を保存
        </Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>
          本棚から削除
        </Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          ← 本棚に戻る
        </Text>
      </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A3428',
    marginBottom: 28,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A3428',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A3428',
    marginBottom: 18,
  },

  isbnBox: {
    backgroundColor: '#F2E8DF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 18,
  },

  isbnText: {
    color: '#4A3428',
    fontSize: 15,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  optionButtonSelected: {
    backgroundColor: '#4A3428',
    borderColor: '#4A3428',
  },

  optionText: {
    color: '#4A3428',
    fontSize: 14,
    fontWeight: 'bold',
  },

  optionTextSelected: {
    color: '#FFFFFF',
  },

  favoriteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },

  favoriteButtonSelected: {
    backgroundColor: '#F4E6B8',
    borderColor: '#D8B957',
  },

  favoriteText: {
    color: '#4A3428',
    fontSize: 15,
    fontWeight: 'bold',
  },

  memoInput: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: '#4A3428',
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: '#4A3428',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#F3DEDB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },

  deleteButtonText: {
    color: '#A1433C',
    fontSize: 15,
    fontWeight: 'bold',
  },

  backButton: {
    alignItems: 'center',
    marginTop: 18,
  },

  backButtonText: {
    color: '#806D63',
    fontSize: 15,
  },

  loadingText: {
    color: '#806D63',
    fontSize: 16,
    marginTop: 100,
    textAlign: 'center',
  },
}); 