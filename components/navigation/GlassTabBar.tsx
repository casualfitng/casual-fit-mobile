import { brand } from "@/lib/brand";
import { useAppTheme } from "@/lib/appTheme";
import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Space to reserve at the bottom of scrollable tab screens. */
export const FLOATING_TAB_BAR_HEIGHT = 76;

export function tabBarScrollPadding(bottomInset: number) {
  return FLOATING_TAB_BAR_HEIGHT + Math.max(bottomInset, 10) + 8;
}

const tabs = [
  { name: "index", label: "Home", ios: "house.fill", android: "home", web: "home" },
  {
    name: "workout",
    label: "Workout",
    ios: "dumbbell.fill",
    android: "fitness_center",
    web: "fitness_center",
  },
  { name: "nutrition", label: "Food", ios: "fork.knife", android: "restaurant", web: "restaurant" },
  {
    name: "progress",
    label: "Progress",
    ios: "chart.line.uptrend.xyaxis",
    android: "insights",
    web: "insights",
  },
  { name: "profile", label: "Profile", ios: "person.fill", android: "person", web: "person" },
] as const;

type GlassTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <GlassView
        style={[
          styles.pill,
          {
            borderColor: t.isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.65)",
            borderWidth: StyleSheet.hairlineWidth,
          },
        ]}
        glassEffectStyle="clear"
        colorScheme="auto"
        isInteractive
      >
        {state.routes.map((route, index) => {
          const meta = tabs.find((item) => item.name === route.name);
          if (!meta) return null;

          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const iconColor = focused ? brand.lime : t.colors.textMuted;
          const labelColor = focused ? t.colors.text : t.colors.textMuted;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={onPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.itemInner,
                  focused
                    ? {
                        backgroundColor: t.isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(0, 0, 0, 0.08)",
                      }
                    : null,
                ]}
              >
                <SymbolView
                  name={{ ios: meta.ios, android: meta.android, web: meta.web }}
                  tintColor={iconColor}
                  size={22}
                />
                <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
                  {meta.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 14,
    position: "absolute",
    right: 0,
  },
  pill: {
    borderRadius: 28,
    flexDirection: "row",
    minHeight: FLOATING_TAB_BAR_HEIGHT,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  item: {
    flex: 1,
    minWidth: 0,
  },
  itemInner: {
    alignItems: "center",
    borderRadius: 22,
    gap: 2,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});
