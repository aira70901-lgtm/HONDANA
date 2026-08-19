import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#4A3428',
        tabBarInactiveTintColor: '#A59489',

        tabBarStyle: {
          backgroundColor: '#FFF9F1',
          borderTopColor: '#E8DDD5',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      {/* =========================
          本棚
      ========================= */}
      <Tabs.Screen
        name="index"
        options={{
          title: '本棚',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'library'
                  : 'library-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          本の一覧
      ========================= */}
      <Tabs.Screen
        name="books"
        options={{
          title: '本の一覧',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'list'
                  : 'list-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* =========================
          設定
      ========================= */}
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? 'settings'
                  : 'settings-outline'
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}