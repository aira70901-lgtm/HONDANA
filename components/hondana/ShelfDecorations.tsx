import {
    StyleSheet,
    View,
} from 'react-native';

import {
    AppSettings,
} from '../../utils/settings';

type Props = {
  settings: AppSettings;
};

export function ShelfDecorations({
  settings,
}: Props) {
  if (!settings.showDecorations) {
    return null;
  }

  if (
    settings.shelfTheme === 'classic'
  ) {
    return (
      <View style={styles.decorationArea}>
        <View style={styles.candle}>
          <View
            style={styles.candleFlame}
          />
          <View
            style={styles.candleBody}
          />
        </View>

        <View style={styles.smallVase} />
      </View>
    );
  }

  if (
    settings.shelfTheme === 'retro'
  ) {
    return (
      <View style={styles.decorationArea}>
        <View style={styles.radio}>
          <View
            style={styles.radioSpeaker}
          />
          <View
            style={styles.radioKnob}
          />
        </View>
      </View>
    );
  }

  if (
    settings.shelfTheme === 'pop'
  ) {
    return (
      <View
        style={
          styles.decorationAreaBetween
        }
      >
        <Plant />

        <View style={styles.lamp}>
          <View style={styles.lampShade} />
          <View style={styles.lampStem} />
          <View style={styles.lampBase} />
        </View>
      </View>
    );
  }

  if (
    settings.shelfTheme ===
    'monochrome'
  ) {
    return (
      <View style={styles.decorationArea}>
        <View
          style={
            styles.blackDecorationBlock
          }
        />
        <View
          style={
            styles.blackDecorationSmall
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.decorationArea}>
      <Plant />
    </View>
  );
}

function Plant() {
  return (
    <View style={styles.plant}>
      <View
        style={styles.plantLeafLeft}
      />
      <View
        style={styles.plantLeafRight}
      />
      <View style={styles.plantPot} />
    </View>
  );
}

const styles = StyleSheet.create({
  decorationArea: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 8,
    flexShrink: 0,
  },

  decorationAreaBetween: {
    height: 82,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 8,
    flexShrink: 0,
  },

  plant: {
    width: 54,
    height: 72,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  plantPot: {
    width: 36,
    height: 24,
    backgroundColor: '#A76C4E',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },

  plantLeafLeft: {
    position: 'absolute',
    top: 4,
    left: 7,
    width: 20,
    height: 36,
    backgroundColor: '#668A61',
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    transform: [
      {
        rotate: '-25deg',
      },
    ],
  },

  plantLeafRight: {
    position: 'absolute',
    top: 1,
    right: 6,
    width: 20,
    height: 40,
    backgroundColor: '#799A70',
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    transform: [
      {
        rotate: '25deg',
      },
    ],
  },

  candle: {
    width: 32,
    height: 58,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  candleBody: {
    width: 17,
    height: 38,
    backgroundColor: '#E8D6B0',
    borderRadius: 2,
  },

  candleFlame: {
    width: 10,
    height: 15,
    backgroundColor: '#D89C42',
    borderRadius: 8,
    marginBottom: 1,
    transform: [
      {
        rotate: '10deg',
      },
    ],
  },

  smallVase: {
    width: 32,
    height: 42,
    backgroundColor: '#806754',
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },

  radio: {
    width: 72,
    height: 46,
    backgroundColor: '#89583A',
    borderWidth: 2,
    borderColor: '#67402D',
    borderRadius: 4,
    position: 'relative',
  },

  radioSpeaker: {
    position: 'absolute',
    left: 9,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4C3A31',
  },

  radioKnob: {
    position: 'absolute',
    right: 9,
    top: 14,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#D2B080',
  },

  lamp: {
    width: 48,
    height: 70,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  lampShade: {
    width: 44,
    height: 26,
    backgroundColor: '#E8A84A',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  lampStem: {
    width: 5,
    height: 27,
    backgroundColor: '#725343',
  },

  lampBase: {
    width: 30,
    height: 7,
    backgroundColor: '#725343',
    borderRadius: 4,
  },

  blackDecorationBlock: {
    width: 30,
    height: 46,
    backgroundColor: '#272323',
  },

  blackDecorationSmall: {
    width: 18,
    height: 30,
    backgroundColor: '#403B3B',
  },
});