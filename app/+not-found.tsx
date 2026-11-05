import { theme } from "@/lib/theme";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space.lg,
    backgroundColor: theme.color.background,
    gap: theme.space.md,
  },
  title: {
    color: theme.color.text,
    fontSize: 20,
    fontWeight: "700",
  },
  link: {
    paddingVertical: theme.space.sm,
  },
  linkText: {
    color: theme.color.accent,
    fontSize: theme.type.body,
    fontWeight: "600",
  },
});
