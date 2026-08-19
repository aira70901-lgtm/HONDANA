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

import { Bookshelf } from '../../components/hondana/Bookshelf';
import {
  getShelfTheme,
} from '../../components/hondana/bookshelfTheme';
import {
  AppSettings,
  loadSettings,
} from '../../utils/settings';
import {
  Book,
  loadBooks,
  saveBooks,
} from '../../utils/storage';

type ReadingFilter =
  | 'all'
  | 'unread'
  | 'reading'
  | 'finished';

type SortType =
  | 'manual'
  | 'added'
  | 'title'
  | 'author';

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);
  const [searchText, setSearchText] = useState('');
  const [readingFilter, setReadingFilter] =
    useState<ReadingFilter>('all');
  const [showFilterMenu, setShowFilterMenu] =
    useState(false);
  const [sortType, setSortType] =
    useState<SortType>('manual');
  const [reorderMode, setReorderMode] =
    useState(false);

  const [settings, setSettings] =
    useState<AppSettings>({
      shelfTheme: 'natural',
      bookColorTheme: 'auto',
      showDecorations: true,
    });

  const fetchData = useCallback(async () => {
    const savedBooks = await loadBooks();

    const orderedBooks = [...savedBooks].sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0)
    );

    setBooks(orderedBooks);

    const savedSettings =
      await loadSettings();

    setSettings(savedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const theme = getShelfTheme(
    settings.shelfTheme
  );

  const moveBook = async (
    bookId: string,
    direction: 'left' | 'right'
  ) => {
    const orderedBooks = [...books].sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0)
    );

    const currentIndex =
      orderedBooks.findIndex(
        (book) => book.id === bookId
      );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === 'left'
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= orderedBooks.length
    ) {
      return;
    }

    const newBooks = [...orderedBooks];

    [
      newBooks[currentIndex],
      newBooks[targetIndex],
    ] = [
      newBooks[targetIndex],
      newBooks[currentIndex],
    ];

    const updatedBooks =
      newBooks.map(
        (book, index) => ({
          ...book,
          order: index,
        })
      );

    setBooks(updatedBooks);
    await saveBooks(updatedBooks);

    setSortType('manual');
  };

  const normalizedSearchText =
    searchText.trim().toLowerCase();

  const filteredBooks =
    books.filter((book) => {
      const matchesFavorite =
        !showFavoritesOnly ||
        book.favorite;

      const matchesSearch =
        normalizedSearchText === '' ||
        book.title
          .toLowerCase()
          .includes(normalizedSearchText) ||
        (book.author ?? '')
          .toLowerCase()
          .includes(normalizedSearchText);

      const matchesReading =
        readingFilter === 'all' ||
        book.readingStatus ===
          readingFilter;

      return (
        matchesFavorite &&
        matchesSearch &&
        matchesReading
      );
    });

  const sortedBooks =
    [...filteredBooks].sort(
      (a, b) => {
        if (sortType === 'manual') {
          return (
            (a.order ?? 0) -
            (b.order ?? 0)
          );
        }

        if (sortType === 'title') {
          return a.title.localeCompare(
            b.title,
            'ja'
          );
        }

        if (sortType === 'author') {
          return (
            a.author ?? ''
          ).localeCompare(
            b.author ?? '',
            'ja'
          );
        }

        return (
          Number(b.id) -
          Number(a.id)
        );
      }
    );

  const purchasedBooks =
    sortedBooks.filter(
      (book) =>
        book.purchaseStatus !==
        'unpurchased'
    );

  const unpurchasedBooks =
    sortedBooks.filter(
      (book) =>
        book.purchaseStatus ===
        'unpurchased'
    );

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        HONDANA
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color:
              theme.secondaryText,
          },
        ]}
      >
        スマートフォンの中に、自分だけの本棚を。
      </Text>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor:
              theme.card,
            color: theme.text,
          },
        ]}
        placeholder="タイトル・著者で検索"
        placeholderTextColor={
          theme.secondaryText
        }
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            !showFavoritesOnly &&
              styles.filterButtonSelected,
          ]}
          onPress={() =>
            setShowFavoritesOnly(false)
          }
        >
          <Text
            style={[
              styles.filterText,
              !showFavoritesOnly &&
                styles.filterTextSelected,
            ]}
          >
            すべて
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            showFavoritesOnly &&
              styles.filterButtonSelected,
          ]}
          onPress={() =>
            setShowFavoritesOnly(true)
          }
        >
          <Text
            style={[
              styles.filterText,
              showFavoritesOnly &&
                styles.filterTextSelected,
            ]}
          >
            ★ お気に入り
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterMenuArea}>
        <Pressable
          style={styles.openFilterButton}
          onPress={() =>
            setShowFilterMenu(
              !showFilterMenu
            )
          }
        >
          <Text
            style={
              styles.openFilterButtonText
            }
          >
            絞り込む
          </Text>

          <Text style={styles.filterArrow}>
            {showFilterMenu ? '▲' : '▼'}
          </Text>
        </Pressable>

        {readingFilter !== 'all' && (
          <View
            style={
              styles.activeFilterBox
            }
          >
            <Text
              style={
                styles.activeFilterText
              }
            >
              読書状態：
              {readingFilter === 'unread'
                ? '未読'
                : readingFilter ===
                    'reading'
                  ? '読書中'
                  : '読了'}
            </Text>

            <Pressable
              onPress={() =>
                setReadingFilter('all')
              }
            >
              <Text
                style={
                  styles.clearFilterText
                }
              >
                ×
              </Text>
            </Pressable>
          </View>
        )}

        {showFilterMenu && (
          <View
            style={[
              styles.filterDropdown,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <Text
              style={[
                styles.filterDropdownTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              読書状態
            </Text>

            {[
              ['all', 'すべて'],
              ['unread', '未読'],
              ['reading', '読書中'],
              ['finished', '読了'],
            ].map(([value, label]) => {
              const selected =
                readingFilter === value;

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.filterDropdownItem,
                    selected &&
                      styles.filterDropdownItemSelected,
                  ]}
                  onPress={() => {
                    setReadingFilter(
                      value as ReadingFilter
                    );
                    setShowFilterMenu(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.filterDropdownItemText,
                      selected &&
                        styles.filterDropdownItemTextSelected,
                    ]}
                  >
                    {label}
                  </Text>

                  {selected && (
                    <Text
                      style={
                        styles.filterCheck
                      }
                    >
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.sortRow}>
        {[
          ['manual', '手動順'],
          ['added', '追加順'],
          ['title', 'タイトル順'],
          ['author', '著者順'],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            style={[
              styles.sortButton,
              sortType === value &&
                styles.sortButtonSelected,
            ]}
            onPress={() =>
              setSortType(
                value as SortType
              )
            }
          >
            <Text
              style={[
                styles.sortText,
                sortType === value &&
                  styles.sortTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[
          styles.reorderButton,
          reorderMode &&
            styles.reorderButtonActive,
        ]}
        onPress={() => {
          setReorderMode(!reorderMode);
          setSortType('manual');
        }}
      >
        <Text
          style={[
            styles.reorderButtonText,
            reorderMode &&
              styles.reorderButtonTextActive,
          ]}
        >
          {reorderMode
            ? '✓ 並び替えを終了'
            : '↔ 本の配置を変更'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          router.push('/add')
        }
      >
        <Text style={styles.addButtonText}>
          ＋ 本を追加
        </Text>
      </Pressable>

      <Bookshelf
        allBooks={sortedBooks}
        purchasedBooks={purchasedBooks}
        unpurchasedBooks={unpurchasedBooks}
        settings={settings}
        theme={theme}
        reorderMode={reorderMode}
        onMoveBook={moveBook}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 70,
    paddingHorizontal: 18,
    paddingBottom: 70,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    textAlign: 'center',
  },

  searchInput: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    alignItems: 'center',
  },

  filterButtonSelected: {
    backgroundColor: '#4A3428',
    borderColor: '#4A3428',
  },

  filterText: {
    color: '#4A3428',
    fontSize: 13,
    fontWeight: 'bold',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  filterMenuArea: {
    marginTop: 18,
  },

  openFilterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  openFilterButtonText: {
    color: '#4A3428',
    fontSize: 14,
    fontWeight: 'bold',
  },

  filterArrow: {
    color: '#806D63',
    fontSize: 12,
  },

  activeFilterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8DDD5',
    borderRadius: 18,
    paddingLeft: 11,
    paddingRight: 7,
    paddingVertical: 6,
    marginTop: 9,
  },

  activeFilterText: {
    color: '#4A3428',
    fontSize: 12,
    fontWeight: 'bold',
  },

  clearFilterText: {
    color: '#806D63',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  filterDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 12,
    padding: 10,
  },

  filterDropdownTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  filterDropdownItem: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterDropdownItemSelected: {
    backgroundColor: '#806D63',
  },

  filterDropdownItemText: {
    color: '#4A3428',
    fontSize: 13,
  },

  filterDropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  filterCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  sortRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 18,
  },

  sortButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFC5',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },

  sortButtonSelected: {
    backgroundColor: '#806D63',
    borderColor: '#806D63',
  },

  sortText: {
    color: '#4A3428',
    fontSize: 10,
    fontWeight: 'bold',
  },

  sortTextSelected: {
    color: '#FFFFFF',
  },

  reorderButton: {
    marginTop: 16,
    backgroundColor: '#F2E8DF',
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center',
  },

  reorderButtonActive: {
    backgroundColor: '#4A3428',
  },

  reorderButtonText: {
    color: '#4A3428',
    fontSize: 13,
    fontWeight: 'bold',
  },

  reorderButtonTextActive: {
    color: '#FFFFFF',
  },

  addButton: {
    marginTop: 18,
    marginBottom: -18,
    backgroundColor: '#4A3428',
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});