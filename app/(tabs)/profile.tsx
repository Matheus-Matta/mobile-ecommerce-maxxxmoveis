import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

export default function ProfileScreen() {
  const { customer, loading, login, register, logout } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }
    try {
      await login(email, password);
    } catch (e: unknown) {
      Alert.alert("Erro ao entrar", e instanceof Error ? e.message : "Tente novamente.");
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    try {
      await register(firstName, lastName, email, password);
    } catch (e: unknown) {
      Alert.alert("Erro ao criar conta", e instanceof Error ? e.message : "Tente novamente.");
    }
  };

  if (customer) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="text-white text-xl font-bold mb-6">Meu Perfil</Text>

          <View className="bg-surface rounded-2xl p-5 mb-4 items-center">
            <View className="w-20 h-20 rounded-full bg-surface-card items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="#E94560" />
            </View>
            <Text className="text-white text-xl font-bold">
              {customer.firstName} {customer.lastName}
            </Text>
            <Text className="text-neutral-400 mt-1">{customer.email}</Text>
          </View>

          <TouchableOpacity
            onPress={logout}
            className="bg-surface rounded-xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={22} color="#E94560" />
              <Text className="text-accent ml-3 font-semibold">Sair</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#525252" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Ionicons name="storefront-outline" size={60} color="#E94560" />
          <Text className="text-white text-2xl font-bold mt-3">
            Maxxx Móveis
          </Text>
          <Text className="text-neutral-400 mt-1">
            {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
          </Text>
        </View>

        <View className="gap-4">
          {mode === "register" && (
            <>
              <TextInput
                className="bg-surface text-white px-4 py-4 rounded-xl"
                placeholder="Nome"
                placeholderTextColor="#737373"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                className="bg-surface text-white px-4 py-4 rounded-xl"
                placeholder="Sobrenome"
                placeholderTextColor="#737373"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </>
          )}
          <TextInput
            className="bg-surface text-white px-4 py-4 rounded-xl"
            placeholder="E-mail"
            placeholderTextColor="#737373"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            className="bg-surface text-white px-4 py-4 rounded-xl"
            placeholder="Senha"
            placeholderTextColor="#737373"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="bg-accent rounded-xl py-4 items-center mt-2"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === "login" ? "register" : "login")}
            className="items-center py-2"
          >
            <Text className="text-neutral-400 text-sm">
              {mode === "login"
                ? "Não tem conta? "
                : "Já tem conta? "}
              <Text className="text-accent font-semibold">
                {mode === "login" ? "Criar conta" : "Entrar"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
