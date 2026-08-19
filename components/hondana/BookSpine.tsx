import { router } from 'expo-router';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    AppSettings,
} from '../../utils/settings';
import {
    Book,
} from '../../utils/storage';
import {
    BOOK_GAP,
    ShelfTheme,
    getBookColor,
    getBookWidth,
} from './bookshelfTheme';

type Props = {
  book: Book;
  index: number;
  settings: AppSettings;
  theme: ShelfTheme;
  reorderMode: boolean;
  onMoveBook: (
    bookId: string,
    direction: 'left' | 'right'
  ) => void;
};

export function BookSpine({
  book,
  index,
  settings,
  theme,
  reorderMode,
  onMoveBook,
}: Props) {
  const verticalTitle =
    book.title
      .replace(/\s+/g, '')
      .split('')
      .join('\n');

  return (
    <View
      style={styles.bookArea}
    >
      <Pressable
        style={styles.bookWrapper}
        onPress={() => {
          if (reorderMode) {
            return;
          }

          router.push({
            pathname: '/book/[id]',
            params: {
              id: book.id,
            },
          });
        }}
      >
        {book.favorite && (
          <Text
            style={styles.favoriteStar}
          >
            ★
          </Text>
        )}

        {book.readingStatus ===
          'reading' && (
          <View style={styles.bookmark} />
        )}

        <View
          style={[
            styles.book,
            {
              width:
                getBookWidth(book.pages),
              height: 145,
              backgroundColor:
                getBookColor(
                  settings,
                  index
                ),
              borderColor:
                theme.bookBorderColor,
            },

            settings.shelfTheme ===
              'classic' &&
              styles.classicBook,

            settings.shelfTheme ===
              'retro' &&
              styles.retroBook,

            settings.shelfTheme ===
              'library' &&
              styles.libraryBook,

            settings.shelfTheme ===
              'monochrome' &&
              styles.monochromeBook,

            settings.shelfTheme ===
              'pop' &&
              styles.popBook,
          ]}
        >
          <BookDetails
            title={verticalTitle}
            shelfTheme={
              settings.shelfTheme
            }
          />
        </View>
      </Pressable>

      {reorderMode && (
        <View style={styles.moveRow}>
          <Pressable
            style={styles.moveButton}
            onPress={() =>
              onMoveBook(
                book.id,
                'left'
              )
            }
          >
            <Text style={styles.moveText}>
              ←
            </Text>
          </Pressable>

          <Pressable
            style={styles.moveButton}
            onPress={() =>
              onMoveBook(
                book.id,
                'right'
              )
            }
          >
            <Text style={styles.moveText}>
              →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function BookDetails({
  title,
  shelfTheme,
}: {
  title: string;
  shelfTheme: AppSettings['shelfTheme'];
}) {
  if (shelfTheme === 'classic') {
    return (
      <>
        <View
          style={styles.classicBookLine}
        />

        <Text
          style={
            styles.classicBookText
          }
          numberOfLines={10}
        >
          {title}
        </Text>

        <View
          style={styles.classicBookLine}
        />
      </>
    );
  }

  if (
    shelfTheme === 'monochrome'
  ) {
    return (
      <>
        <View
          style={
            styles.monochromeBookLine
          }
        />

        <Text
          style={
            styles.monochromeBookText
          }
          numberOfLines={10}
        >
          {title}
        </Text>

        <View
          style={
            styles.monochromeBookDot
          }
        />
      </>
    );
  }

  if (shelfTheme === 'retro') {
    return (
      <>
        <View
          style={styles.retroBookLabel}
        />

        <Text
          style={styles.bookText}
          numberOfLines={10}
        >
          {title}
        </Text>
      </>
    );
  }

  return (
    <>
      <View
        style={styles.bookTopLine}
      />

      <Text
        style={styles.bookText}
        numberOfLines={10}
      >
        {title}
      </Text>

      <View
        style={styles.bookBottomLine}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bookArea: {
    alignItems: 'center',
    marginRight: BOOK_GAP,
  },

  bookWrapper: {
    position: 'relative',
  },

  book: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },

  bookText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  classicBookText: {
    color: '#F1D9A5',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  monochromeBookText: {
    color: '#F5F5F5',
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },

  classicBook: {
    borderWidth: 2,
    borderColor:
      'rgba(224,190,120,0.55)',
    borderRadius: 2,
  },

  retroBook: {
    borderRadius: 0,
    borderWidth: 2,
  },

  libraryBook: {
    borderRadius: 1,
    borderWidth: 1,
  },

  monochromeBook: {
    borderRadius: 0,
    borderWidth: 0,
  },

  popBook: {
    borderRadius: 3,
    borderWidth: 1,
  },

  bookTopLine: {
    position: 'absolute',
    top: 9,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },

  bookBottomLine: {
    position: 'absolute',
    bottom: 9,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor:
      'rgba(255,255,255,0.35)',
  },

  classicBookLine: {
    width: '70%',
    height: 2,
    backgroundColor: '#D2AD66',
    marginVertical: 7,
  },

  retroBookLabel: {
    position: 'absolute',
    top: 10,
    width: '70%',
    height: 9,
    backgroundColor:
      'rgba(245,225,185,0.75)',
    borderWidth: 1,
    borderColor:
      'rgba(90,60,40,0.35)',
  },

  monochromeBookLine: {
    position: 'absolute',
    top: 13,
    left: 5,
    right: 5,
    height: 1,
    backgroundColor: '#ECECEC',
  },

  monochromeBookDot: {
    position: 'absolute',
    bottom: 12,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EFEFEF',
  },

  favoriteStar: {
    position: 'absolute',
    top: -21,
    right: 0,
    fontSize: 17,
    zIndex: 3,
    color: '#E1B431',
  },

  bookmark: {
    position: 'absolute',
    top: -12,
    left: 10,
    width: 6,
    height: 27,
    backgroundColor: '#C14138',
    zIndex: 2,
  },

  moveRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },

  moveButton: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#F2E8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moveText: {
    color: '#4A3428',
    fontWeight: 'bold',
  },
});