import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center p-6">
      <Text className="text-4xl font-bold text-white mb-2">Agendei.</Text>
      <Text className="text-zinc-400 text-center mb-10">Agendamentos simplificados para você.</Text>
      
      <TouchableOpacity 
        className="w-full bg-primary py-4 rounded-xl items-center mb-4"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-white font-bold text-lg">Entrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full border border-zinc-800 py-4 rounded-xl items-center"
        onPress={() => router.push("/(auth)/register")}
      >
        <Text className="text-white font-bold text-lg">Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}
