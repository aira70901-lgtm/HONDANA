import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    Book,
    loadBooks,
} from '../../utils/storage';

export default function BooksScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState('');

  const fetchBooks = useCallback(async () => {
    const savedBooks = await loadBooks();

    const orderedBooks = [...savedBooks].sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0)
    );

    setBooks(orderedBooks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  const normalizedSearchText =
    searchText.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    if (!normalizedSearchText) {
      return true;
    }

    const title =
      book.title?.toLowerCase() ?? '';

    const author =
      book.author?.toLowerCase() ?? '';

    return (
      title.includes(normalizedSearchText) ||
      author.includes(normalizedSearchText)
    );
  });

  const getPurchaseLabel = (
    status?: Book['purchaseStatus']
  ) => {
    return status === 'unpurchased'
      ? '未購入'
      : '購入済み';
  };

  const getReadingLabel = (
    status?: Book['readingStatus']
  ) => {
    if (status === 'reading') {
      return '読書中';
    }

    if (status === 'finished') {
      return '読了';
    }

    return '未読';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        本の一覧
      </Text>

      <Text style={styles.subtitle}>
        登録した本をまとめて確認できます
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="タイトル・著者で検索"
        placeholderTextColor="#A59489"
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredBooks.length}冊
        </Text>
      </View>

      {filteredBooks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>
            本がありません
          </Text>

          <Text style={styles.emptyText}>
            本棚画面から本を追加してみよう
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredBooks.map((book) => (
            <Pressable
              key={book.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/book/[id]',
                  params: {
                    id: book.id,
                  },
                })
              }
            >
              <View style={styles.cardTopRow}>
                <View style={styles.titleArea}>
                  <Text
                    style={styles.bookTitle}
                    numberOfLines={2}
                  >
                    {book.title}
                  </Text>

                  {book.favorite && (
                    <Text style={styles.favorite}>
                      ★
                    </Text>
                  )}
                </View>
              </View>

              <Text
                style={styles.author}
                numberOfLines={1}
              >
                {book.author || '著者未登録'}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getPurchaseLabel(
                      book.purchaseStatus
                    )}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getReadingLabel(
                      book.readingStatus
                    )}
                  </Text>
                </View>

                {book.pages ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {book.pages}ページ
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A3428',
  },

  subtitle: {
    fontSize: 13,
    color: '#806D63',
    marginTop: 6,
  },

  searchInput: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: '#4A3428',
  },

  countRow: {
    marginTop: 14,
    marginBottom: 10,
    alignItems: 'flex-end',
  },

  countText: {
    color: '#806D63',
    fontSize: 13,
    fontWeight: 'bold',
  },

  list: {
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE4DB',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bookTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4A3428',
    lineHeight: 23,
  },

  favorite: {
    marginLeft: 8,
    color: '#D7A922',
    fontSize: 18,
  },

  author: {
    marginTop: 7,
    fontSize: 13,
    color: '#806D63',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
  },

  badge: {
    backgroundColor: '#F2E8DF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: '#4A3428',
    fontSize: 11,
    fontWeight: 'bold',
  },

  emptyBox: {
    marginTop: 50,
    backgroundColor: '#F2E8DF',
    borderRadius: 15,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#4A3428',
    fontSize: 17,
    fontWeight: 'bold',
  },

  emptyText: {
    color: '#806D63',
    fontSize: 13,
    marginTop: 8,
  },
});