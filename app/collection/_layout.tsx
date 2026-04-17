import { Stack } from "expo-router";

export default function CollectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1A1A2E" },
        headerTintColor: "#fff",
        headerBackTitle: "Voltar",
      }}
    />
  );
}
