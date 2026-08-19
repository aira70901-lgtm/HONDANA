import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { addBook, loadBooks } from '../utils/storage';

export default function AddBookScreen() {
  const { isbn } = useLocalSearchParams<{ isbn?: string }>();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [purchaseStatus, setPurchaseStatus] = useState<
    'purchased' | 'unpurchased'
  >('purchased');

  const [readingStatus, setReadingStatus] = useState<
    'unread' | 'reading' | 'finished'
  >('unread');

  useEffect(() => {
    if (!isbn) return;

    const normalizeIsbn = (value: string) =>
      value
        .replace(/[０-９]/g, (char) =>
          String.fromCharCode(char.charCodeAt(0) - 0xfee0)
        )
        .replace(/[^0-9Xx]/g, '')
        .toUpperCase();

    const normalizeAuthorName = (name: string) => {
      return name
        .split(/[,，]/)
        .map((part) => part.trim())
        .filter(
          (part) =>
            part !== '' &&
            !/^\d{4}-$/.test(part)
        )
        .join('');
    };

    const decodeXml = (value: string) =>
      value
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

    const getTagText = (
      xml: string,
      tagName: string
    ) => {
      const escapedTag = tagName.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const match = xml.match(
        new RegExp(
          `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
          'i'
        )
      );

      if (!match?.[1]) {
        return '';
      }

      return decodeXml(match[1])
        .replace(/<[^>]+>/g, '')
        .trim();
    };

    const normalizedIsbn =
      normalizeIsbn(String(isbn));

    const fetchBook = async () => {
      try {
        setLoading(true);
        setMessage('');

        console.log('検索ISBN:', normalizedIsbn);

        if (
          normalizedIsbn.length !== 10 &&
          normalizedIsbn.length !== 13
        ) {
          setMessage(
            `ISBNの形式が正しくありません。ISBN: ${normalizedIsbn}`
          );
          return;
        }

        /*
         * ① 国立国会図書館サーチ OpenSearch
         *
         * SRUのrecordDataを解析するより、
         * RSSの最初のitemだけを読む方がシンプルで安定しやすい。
         */
        try {
          const ndlUrl =
            `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${encodeURIComponent(
              normalizedIsbn
            )}`;

          console.log('NDL OpenSearch検索開始');

          const ndlResponse = await fetch(ndlUrl);

          console.log(
            'NDL OpenSearch status:',
            ndlResponse.status
          );

          if (ndlResponse.ok) {
            const xml = await ndlResponse.text();

            const totalResultsText =
              getTagText(
                xml,
                'openSearch:totalResults'
              );

            console.log(
              'NDL OpenSearch件数:',
              totalResultsText || '不明'
            );

            const itemMatch = xml.match(
              /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/i
            );

            if (itemMatch?.[1]) {
              const itemXml =
                decodeXml(itemMatch[1]);

              const foundTitle =
                getTagText(
                  itemXml,
                  'title'
                ) ||
                getTagText(
                  itemXml,
                  'dc:title'
                );

              const foundAuthor =
                getTagText(
                  itemXml,
                  'dc:creator'
                ) ||
                getTagText(
                  itemXml,
                  'dcterms:creator'
                );

              const extent =
                getTagText(
                  itemXml,
                  'dcterms:extent'
                ) ||
                getTagText(
                  itemXml,
                  'dc:format'
                );

              const pageMatch =
                extent.match(
                  /(\d+)\s*(?:p\.?|pages?|ページ)/i
                );

              console.log(
                'NDL OpenSearch取得:',
                {
                  title: foundTitle,
                  author: foundAuthor,
                  extent,
                }
              );

              if (foundTitle) {
                setTitle(foundTitle);
              }

              if (foundAuthor) {
                setAuthor(
                  normalizeAuthorName(foundAuthor)
                );
              }

              if (pageMatch?.[1]) {
                setPages(pageMatch[1]);
              }

              if (
                foundTitle ||
                foundAuthor
              ) {
                return;
              }
            }
          }
        } catch (ndlError) {
          console.log(
            'NDL OpenSearch取得失敗:',
            ndlError
          );
        }

        /*
         * ② Open Library
         */
        try {
          const olResponse = await fetch(
            `https://openlibrary.org/search.json?isbn=${encodeURIComponent(
              normalizedIsbn
            )}`
          );

          console.log(
            'Open Library status:',
            olResponse.status
          );

          if (olResponse.ok) {
            const olData =
              await olResponse.json();

            console.log(
              'Open Library件数:',
              olData.docs?.length ?? 0
            );

            if (
              olData.docs?.length >
              0
            ) {
              const book =
                olData.docs[0];

              const foundTitle =
                book.title ?? '';

              const foundAuthor =
                Array.isArray(
                  book.author_name
                )
                  ? book.author_name.join(
                      ' / '
                    )
                  : '';

              if (foundTitle) {
                setTitle(foundTitle);
              }

              if (foundAuthor) {
                setAuthor(
                  foundAuthor
                );
              }

              if (
                book.number_of_pages_median
              ) {
                setPages(
                  String(
                    book.number_of_pages_median
                  )
                );
              }

              if (
                foundTitle ||
                foundAuthor
              ) {
                return;
              }
            }
          }
        } catch (olError) {
          console.log(
            'Open Library取得失敗:',
            olError
          );
        }

        /*
         * ③ Google Books
         *
         * 429のときはそのまま次へ進み、
         * アプリ自体は止めない。
         */
        try {
          const googleResponse =
            await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
                normalizedIsbn
              )}`
            );

          console.log(
            'Google Books status:',
            googleResponse.status
          );

          if (googleResponse.ok) {
            const googleData =
              await googleResponse.json();

            console.log(
              'Google Books件数:',
              googleData.totalItems ??
                0
            );

            if (
              googleData.items?.length >
              0
            ) {
              const info =
                googleData.items[0]
                  .volumeInfo ?? {};

              const foundTitle =
                info.title ?? '';

              const foundAuthor =
                Array.isArray(
                  info.authors
                )
                  ? info.authors.join(
                      ' / '
                    )
                  : '';

              if (foundTitle) {
                setTitle(foundTitle);
              }

              if (foundAuthor) {
                setAuthor(
                  foundAuthor
                );
              }

              if (info.pageCount) {
                setPages(
                  String(
                    info.pageCount
                  )
                );
              }

              if (
                foundTitle ||
                foundAuthor
              ) {
                return;
              }
            }
          }
        } catch (googleError) {
          console.log(
            'Google Books取得失敗:',
            googleError
          );
        }

        setMessage(
          `本の情報が見つかりませんでした。ISBN: ${normalizedIsbn}`
        );
      } catch (error) {
        console.error(
          '本の情報取得エラー:',
          error
        );

        setMessage(
          '本の情報を取得できませんでした。通信環境を確認して、もう一度試してください。'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [isbn]);

  const handleAddBook = async () => {
    if (!title.trim()) {
      Alert.alert(
        '入力エラー',
        'タイトルを入力してください。'
      );
      return;
    }

    const parsedPages = Number(pages);

    if (
      pages.trim() !== '' &&
      (
        !Number.isInteger(parsedPages) ||
        parsedPages <= 0
      )
    ) {
      Alert.alert(
        '入力エラー',
        '総ページ数は1以上の整数で入力してください。'
      );
      return;
    }

    const currentBooks = await loadBooks();

    const newBook = {
      id: Date.now().toString(),
      isbn:
        typeof isbn === 'string'
          ? isbn
              .replace(/[０-９]/g, (char) =>
                String.fromCharCode(
                  char.charCodeAt(0) - 0xfee0
                )
              )
              .replace(/[^0-9Xx]/g, '')
              .toUpperCase()
          : isbn,
      title: title.trim(),
      author: author.trim(),

      // ページ数が空欄なら300ページとして保存
      pages:
        pages.trim() === ''
          ? 300
          : parsedPages,

      purchaseStatus,
      readingStatus,
      favorite: false,
      memo: '',
      order: currentBooks.length,
    };

    await addBook(newBook);

    Alert.alert(
      '追加しました',
      '本棚に本を追加しました。',
      [
        {
          text: 'OK',
          onPress: () =>
            router.replace('/'),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        本を追加
      </Text>

      {isbn ? (
        <>
          <Text style={styles.label}>
            ISBN
          </Text>

          <View style={styles.isbnBox}>
            <Text style={styles.isbnText}>
              {isbn}
            </Text>
          </View>
        </>
      ) : null}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator />

          <Text style={styles.loadingText}>
            本の情報を取得中...
          </Text>
        </View>
      )}

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null}

      <Text style={styles.label}>
        タイトル
      </Text>

      <TextInput
        style={styles.input}
        placeholder="本のタイトルを入力"
        placeholderTextColor="#A59489"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>
        著者
      </Text>

      <TextInput
        style={styles.input}
        placeholder="著者名を入力"
        placeholderTextColor="#A59489"
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>
        総ページ数
      </Text>

      <TextInput
        style={styles.input}
        placeholder="例：320"
        placeholderTextColor="#A59489"
        value={pages}
        onChangeText={setPages}
        keyboardType="number-pad"
      />

      <Text style={styles.pageHelp}>
        ページ数によって本棚の本の厚さが変わります
      </Text>

      <Text style={styles.label}>
        購入状態
      </Text>

      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            purchaseStatus === 'purchased' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setPurchaseStatus('purchased')
          }
        >
          <Text
            style={[
              styles.optionText,
              purchaseStatus === 'purchased' &&
                styles.optionTextSelected,
            ]}
          >
            購入済み
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            purchaseStatus === 'unpurchased' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setPurchaseStatus('unpurchased')
          }
        >
          <Text
            style={[
              styles.optionText,
              purchaseStatus === 'unpurchased' &&
                styles.optionTextSelected,
            ]}
          >
            未購入
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>
        読書状態
      </Text>

      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            readingStatus === 'unread' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setReadingStatus('unread')
          }
        >
          <Text
            style={[
              styles.optionText,
              readingStatus === 'unread' &&
                styles.optionTextSelected,
            ]}
          >
            未読
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            readingStatus === 'reading' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setReadingStatus('reading')
          }
        >
          <Text
            style={[
              styles.optionText,
              readingStatus === 'reading' &&
                styles.optionTextSelected,
            ]}
          >
            読書中
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            readingStatus === 'finished' &&
              styles.optionButtonSelected,
          ]}
          onPress={() =>
            setReadingStatus('finished')
          }
        >
          <Text
            style={[
              styles.optionText,
              readingStatus === 'finished' &&
                styles.optionTextSelected,
            ]}
          >
            読了
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.scanButton}
        onPress={() =>
          router.push('/scanner')
        }
      >
        <Text style={styles.scanButtonText}>
          📷 バーコードを読み取る
        </Text>
      </Pressable>

      <Pressable
        style={styles.saveButton}
        onPress={handleAddBook}
      >
        <Text style={styles.saveButtonText}>
          本棚に追加
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
    paddingBottom: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A3428',
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A3428',
    marginBottom: 8,
  },

  isbnBox: {
    backgroundColor: '#F2E8DF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
  },

  isbnText: {
    color: '#4A3428',
    fontSize: 16,
    fontWeight: 'bold',
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

  pageHelp: {
    color: '#806D63',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 20,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCCFC5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  optionButtonSelected: {
    backgroundColor: '#4A3428',
    borderColor: '#4A3428',
  },

  optionText: {
    color: '#4A3428',
    fontWeight: 'bold',
    fontSize: 14,
  },

  optionTextSelected: {
    color: '#FFFFFF',
  },

  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  loadingText: {
    marginLeft: 10,
    color: '#806D63',
  },

  message: {
    color: '#B05A4F',
    marginBottom: 16,
  },

  scanButton: {
    backgroundColor: '#E7D5C4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  scanButtonText: {
    color: '#4A3428',
    fontSize: 16,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#4A3428',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
});