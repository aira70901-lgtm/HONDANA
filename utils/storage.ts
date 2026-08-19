import AsyncStorage from '@react-native-async-storage/async-storage';

export type Book = {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  purchaseStatus: 'purchased' | 'unpurchased';
  readingStatus: 'unread' | 'reading' | 'finished';
  favorite: boolean;
  memo: string;
  order: number;
  pages: number;
};

const STORAGE_KEY = 'hondana-books';

export async function loadBooks(): Promise<Book[]> {
  try {
    const savedBooks = await AsyncStorage.getItem(STORAGE_KEY);

    if (!savedBooks) {
      return [];
    }

    const books = JSON.parse(savedBooks);

    return books.map((book: Book, index: number) => ({
      ...book,
      purchaseStatus: book.purchaseStatus ?? 'purchased',
      readingStatus: book.readingStatus ?? 'unread',
      favorite: book.favorite ?? false,
      memo: book.memo ?? '',
      order: book.order ?? index,

      // 昔追加した本にはページ数がないので、
      // 仮に300ページとして扱う
      pages: book.pages ?? 300,
    }));
  } catch (error) {
    console.error('本の読み込みに失敗しました:', error);
    return [];
  }
}

export async function saveBooks(books: Book[]) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(books)
    );
  } catch (error) {
    console.error('本の保存に失敗しました:', error);
  }
}

export async function addBook(book: Book) {
  const books = await loadBooks();

  const newBooks = [...books, book];

  await saveBooks(newBooks);
}