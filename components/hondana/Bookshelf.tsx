import {
    StyleSheet,
    Text,
    useWindowDimensions,
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
    getBookWidth,
    SHELF_SIDE_PADDING,
    ShelfTheme,
} from './bookshelfTheme';
import { BookSpine } from './BookSpine';
import {
    ShelfDecorations,
} from './ShelfDecorations';

type Props = {
  allBooks: Book[];
  purchasedBooks: Book[];
  unpurchasedBooks: Book[];
  settings: AppSettings;
  theme: ShelfTheme;
  reorderMode: boolean;
  onMoveBook: (
    bookId: string,
    direction: 'left' | 'right'
  ) => void;
};

export function Bookshelf({
  allBooks,
  purchasedBooks,
  unpurchasedBooks,
  settings,
  theme,
  reorderMode,
  onMoveBook,
}: Props) {
  const { width: screenWidth } =
    useWindowDimensions();

  const shelfWidth = Math.max(
    screenWidth - 90,
    220
  );

  const splitBooksIntoShelves = (
    shelfBooks: Book[]
  ) => {
    const rows: Book[][] = [];

    let currentRow: Book[] = [];
    let usedWidth = 0;

    shelfBooks.forEach((book) => {
      const bookWidth =
        getBookWidth(book.pages);

      const gapWidth =
        currentRow.length > 0
          ? BOOK_GAP
          : 0;

      const nextWidth =
        usedWidth +
        gapWidth +
        bookWidth;

      if (
        currentRow.length > 0 &&
        nextWidth > shelfWidth
      ) {
        rows.push(currentRow);
        currentRow = [book];
        usedWidth = bookWidth;
      } else {
        currentRow.push(book);
        usedWidth = nextWidth;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const renderCategoryRows = (
    categoryBooks: Book[],
    label: string,
    startIndex: number
  ) => {
    const rows =
      splitBooksIntoShelves(
        categoryBooks
      );

    let localIndex = startIndex;

    return (
      <>
        <View
          style={styles.categoryHeader}
        >
          <View
            style={[
              styles.categoryLabel,
              {
                backgroundColor:
                  theme.labelBackground,
              },
            ]}
          >
            <Text
              style={
                styles.categoryLabelText
              }
            >
              {label}
            </Text>
          </View>
        </View>

        {rows.length === 0 ? (
          <View
            style={
              styles.categoryEmptyRow
            }
          >
            <Text
              style={[
                styles.categoryEmptyText,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              本はありません
            </Text>

            <View
              style={[
                styles.shelfBase,
                {
                  backgroundColor:
                    theme.shelf,
                  borderBottomColor:
                    theme.shelfEdge,
                },
              ]}
            />
          </View>
        ) : (
          rows.map(
            (rowBooks, rowIndex) => (
              <View
                key={`${label}-${rowIndex}`}
                style={styles.shelfRow}
              >
                <View style={styles.books}>
                  {rowBooks.map((book) => {
                    const index =
                      localIndex;

                    localIndex += 1;

                    return (
                      <BookSpine
                        key={book.id}
                        book={book}
                        index={index}
                        settings={settings}
                        theme={theme}
                        reorderMode={
                          reorderMode
                        }
                        onMoveBook={
                          onMoveBook
                        }
                      />
                    );
                  })}

                  {rowIndex === 0 &&
                    startIndex === 0 && (
                      <ShelfDecorations
                        settings={
                          settings
                        }
                      />
                    )}
                </View>

                <View
                  style={[
                    styles.shelfBase,
                    {
                      backgroundColor:
                        theme.shelf,
                      borderBottomColor:
                        theme.shelfEdge,
                    },

                    settings.shelfTheme ===
                      'classic' &&
                      styles.classicShelf,

                    settings.shelfTheme ===
                      'monochrome' &&
                      styles.monochromeShelf,
                  ]}
                />
              </View>
            )
          )
        )}
      </>
    );
  };

  return (
    <View style={styles.bookshelf}>
      <Text
        style={[
          styles.shelfTitle,
          {
            color: theme.text,
          },
        ]}
      >
        マイ本棚
      </Text>

      {allBooks.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor:
                theme.empty,
            },
          ]}
        >
          <Text
            style={[
              styles.emptyText,
              {
                color:
                  theme.secondaryText,
              },
            ]}
          >
            まだ本がありません
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.shelfFrame,
            {
              backgroundColor:
                theme.shelfBack,
              borderColor:
                theme.shelfEdge,
              borderWidth:
                theme.shelfBorderWidth,
              borderRadius:
                theme.shelfRadius,
            },
          ]}
        >
          <View
            style={[
              styles.shelfTop,
              {
                backgroundColor:
                  theme.shelf,
              },
            ]}
          />

          {renderCategoryRows(
            purchasedBooks,
            '購入済み',
            0
          )}

          {renderCategoryRows(
            unpurchasedBooks,
            '未購入',
            purchasedBooks.length
          )}

          <View
            style={[
              styles.shelfBottom,
              {
                backgroundColor:
                  theme.shelf,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bookshelf: {
    marginTop: 34,
  },

  shelfTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  shelfFrame: {
    width: '100%',
    overflow: 'hidden',
  },

  shelfTop: {
    width: '100%',
    height: 15,
  },

  shelfBottom: {
    width: '100%',
    height: 15,
  },

  categoryHeader: {
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 4,
  },

  categoryLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  categoryLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  shelfRow: {
    width: '100%',
    height: 193,
  },

  books: {
    width: '100%',
    height: 175,
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
    paddingHorizontal:
      SHELF_SIDE_PADDING,
    paddingTop: 20,
    overflow: 'hidden',
  },

  shelfBase: {
    width: '100%',
    height: 18,
    borderBottomWidth: 5,
  },

  categoryEmptyRow: {
    minHeight: 90,
    justifyContent: 'flex-end',
  },

  categoryEmptyText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },

  classicShelf: {
    borderTopWidth: 3,
    borderTopColor: '#B67A43',
  },

  monochromeShelf: {
    borderBottomWidth: 0,
  },

  emptyBox: {
    borderRadius: 7,
    paddingVertical: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 30,
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});