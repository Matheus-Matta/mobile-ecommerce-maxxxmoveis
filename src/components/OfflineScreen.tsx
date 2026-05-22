import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OfflineScreenProps = {
  onRetry: () => void;
};

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sem conexão com a internet</Text>
      <Text style={styles.text}>Verifique sua conexão e tente novamente.</Text>
      <TouchableOpacity
        accessibilityLabel="Tentar reconectar"
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    marginBottom: 8,
    color: "#1a1a1a",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  text: {
    marginBottom: 24,
    color: "#555555",
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#0058BB",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
