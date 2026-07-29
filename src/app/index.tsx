import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { session, carregando, entrar, cadastrar, sair } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setEnviando(true);
    const resultado = modoCadastro
      ? await cadastrar(email, senha)
      : await entrar(email, senha);
    setEnviando(false);
    if (resultado.erro) setErro(resultado.erro);
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }
  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Logado como {session.user.email}</Text>
        <Text> A tela de cadastro do pet vem no próximo passo.</Text>
        <Pressable
          onPress={sair}
          accessibilityRole="button"
          accessibilityLabel="Sair da Conta"
          style={styles.botaoSecundario}
        >
          <Text style={styles.textoBotaoSecundario}>Sair</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modoCadastro ? "Criar conta" : "Entrar"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Campo de Email"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        accessibilityLabel="Campo de Senha"
      />
      {erro && (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}{" "}
        </Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={modoCadastro ? "Criar Conta" : "Entrar"}
        style={styles.botao}
      >
        <Text style={styles.textoBotao}>
          {enviando ? "Enviando..." : modoCadastro ? "Criar Conta" : "Entrar"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setModoCadastro(!modoCadastro)}
        accessibilityRole="button"
      >
        <Text style={styles.link}>
          {modoCadastro ? "Já tenho conta" : "Criar uma conta"}
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#534AB7",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotao: { color: "#fff", fontSize: 16, fontWeight: "600" },
  botaoSecundario: { padding: 12, marginTop: 16 },
  textoBotaoSecundario: { color: "#993C1D", textAlign: "center" },
  link: { color: "#534AB7", textAlign: "center", marginTop: 12 },
  erro: { color: "#B91C1C", textAlign: "center" },
});
