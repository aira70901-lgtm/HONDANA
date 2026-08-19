import { AppSettings } from '../../utils/settings';

export const BOOK_GAP = 4;
export const SHELF_SIDE_PADDING = 10;

export type ShelfTheme = {
  background: string;
  text: string;
  secondaryText: string;
  shelf: string;
  shelfEdge: string;
  shelfBack: string;
  shelfBorderWidth: number;
  shelfRadius: number;
  bookBorderColor: string;
  card: string;
  empty: string;
  labelBackground: string;
};

const bookColorSets = {
  natural: [
    '#9B7653',
    '#C98B7A',
    '#718C75',
    '#B48A5A',
    '#8C6A4B',
    '#A87963',
  ],
  classic: [
    '#593329',
    '#7A2F2A',
    '#755329',
    '#3D2B24',
    '#887139',
    '#614237',
  ],
  retro: [
    '#C84E2F',
    '#D6A32A',
    '#4B7A8C',
    '#B85A3A',
    '#677955',
    '#D0783D',
  ],
  library: [
    '#36586A',
    '#647E87',
    '#8B706C',
    '#536B77',
    '#7D929A',
    '#405566',
  ],
  monochrome: [
    '#171515',
    '#302D2D',
    '#4A4646',
    '#211F1F',
    '#5D5858',
    '#393636',
  ],
  pop: [
    '#E86D3E',
    '#218BA3',
    '#E5A92D',
    '#5AA66B',
    '#D85578',
    '#6C86C4',
  ],
};

export const getShelfTheme = (
  shelfTheme: AppSettings['shelfTheme']
): ShelfTheme => {
  switch (shelfTheme) {
    case 'classic':
      return {
        background: '#291B16',
        text: '#F0DFC2',
        secondaryText: '#C5AD8B',
        shelf: '#5D351D',
        shelfEdge: '#AA7444',
        shelfBack: '#39251C',
        shelfBorderWidth: 8,
        shelfRadius: 2,
        bookBorderColor:
          'rgba(218,184,120,0.55)',
        card: '#3B2922',
        empty: '#36251D',
        labelBackground: '#5D351D',
      };

    case 'retro':
      return {
        background: '#E6C99E',
        text: '#503728',
        secondaryText: '#80634E',
        shelf: '#955B3B',
        shelfEdge: '#D29762',
        shelfBack: '#D8B686',
        shelfBorderWidth: 5,
        shelfRadius: 1,
        bookBorderColor:
          'rgba(255,244,215,0.65)',
        card: '#F2DFC1',
        empty: '#D6B483',
        labelBackground: '#955B3B',
      };

    case 'library':
      return {
        background: '#D7DDDC',
        text: '#29414C',
        secondaryText: '#60747B',
        shelf: '#2F5366',
        shelfEdge: '#A46D5C',
        shelfBack: '#BFCACD',
        shelfBorderWidth: 5,
        shelfRadius: 0,
        bookBorderColor:
          'rgba(235,240,240,0.5)',
        card: '#EDF1F1',
        empty: '#C7D0D2',
        labelBackground: '#2F5366',
      };

    case 'monochrome':
      return {
        background: '#F1EDE8',
        text: '#211F1F',
        secondaryText: '#676060',
        shelf: '#272323',
        shelfEdge: '#171515',
        shelfBack: '#ECE6E0',
        shelfBorderWidth: 4,
        shelfRadius: 0,
        bookBorderColor:
          'rgba(255,255,255,0.25)',
        card: '#FFFFFF',
        empty: '#DDD7D1',
        labelBackground: '#272323',
      };

    case 'pop':
      return {
        background: '#FFF4E8',
        text: '#374A4E',
        secondaryText: '#6E797A',
        shelf: '#EA7540',
        shelfEdge: '#F2A060',
        shelfBack: '#FFE1C9',
        shelfBorderWidth: 7,
        shelfRadius: 10,
        bookBorderColor:
          'rgba(255,255,255,0.55)',
        card: '#FFFFFF',
        empty: '#FFE1CB',
        labelBackground: '#EA7540',
      };

    default:
      return {
        background: '#FFF9F1',
        text: '#4A3428',
        secondaryText: '#806D63',
        shelf: '#7B5136',
        shelfEdge: '#A97853',
        shelfBack: '#F0DFCD',
        shelfBorderWidth: 6,
        shelfRadius: 5,
        bookBorderColor:
          'rgba(255,255,255,0.3)',
        card: '#FFFFFF',
        empty: '#F2E8DF',
        labelBackground: '#7B5136',
      };
  }
};

export const getBookWidth = (
  pages?: number
) => {
  const safePages =
    pages && pages > 0 ? pages : 300;

  const calculatedWidth =
    25 + safePages * 0.045;

  return Math.min(
    Math.max(calculatedWidth, 30),
    62
  );
};

export const getBookColor = (
  settings: AppSettings,
  index: number
) => {
  if (
    settings.bookColorTheme ===
    'monochrome'
  ) {
    return bookColorSets.monochrome[
      index %
        bookColorSets.monochrome.length
    ];
  }

  if (
    settings.bookColorTheme === 'retro'
  ) {
    return bookColorSets.retro[
      index % bookColorSets.retro.length
    ];
  }

  if (
    settings.bookColorTheme === 'vivid'
  ) {
    const vivid = [
      '#D7382A',
      '#167F9A',
      '#DC941D',
      '#37905A',
      '#C93B72',
      '#654EB8',
    ];

    return vivid[
      index % vivid.length
    ];
  }

  if (
    settings.bookColorTheme === 'pastel'
  ) {
    const pastel = [
      '#E8ADA5',
      '#A8C8D1',
      '#B5D2AE',
      '#E4CC98',
      '#C7B6D8',
      '#E5B8CA',
    ];

    return pastel[
      index % pastel.length
    ];
  }

  const colors =
    bookColorSets[settings.shelfTheme];

  return colors[
    index % colors.length
  ];
};