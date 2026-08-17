import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const { session, carregando, entrar, cadastrar, sair } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [nomePet, setNomePet] = useState('');
  const [racaPet, setRacaPet] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [salvandoPet, setSalvandoPet] = useState(false);
  const [petSalvo, setPetSalvo] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setEnviando(true);
    const resultado = modoCadastro ? await cadastrar(email, senha) : await entrar(email, senha);
    setEnviando(false);
    if (resultado.erro) setErro(resultado.erro);
  }

  async function escolherFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria pra escolher a foto do pet.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  async function handleSalvarPet() {
    if (!nomePet.trim()) {
      Alert.alert('Nome obrigatório', 'Dá um nome pro seu cachorro antes de salvar.');
      return;
    }

    setSalvandoPet(true);
    let caminhoFoto: string | null = null;

    if (fotoUri) {
      try {
        const resposta = await fetch(fotoUri);
        const arrayBuffer = await resposta.arrayBuffer();
        const nomeArquivo = `${session!.user.id}/${Date.now()}.jpg`;

        const { error: erroUpload } = await supabase.storage
          .from('fotos-pets')
          .upload(nomeArquivo, arrayBuffer, { contentType: 'image/jpeg' });

        if (erroUpload) throw erroUpload;
        caminhoFoto = nomeArquivo;
      } catch {
        setSalvandoPet(false);
        Alert.alert('Erro ao enviar foto', 'Não foi possível subir a foto. Tenta salvar sem foto por enquanto.');
        return;
      }
    }

    const { error: erroInsert } = await supabase.from('pets').insert({
      user_id: session!.user.id,
      nome: nomePet.trim(),
      raca: racaPet.trim() || null,
      data_nascimento: dataNascimento.trim() || null,
      foto_url: caminhoFoto,
    });

    setSalvandoPet(false);

    if (erroInsert) {
      Alert.alert('Erro ao salvar', erroInsert.message);
      return;
    }

    setPetSalvo(true);
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (session) {
    if (petSalvo) {
      return (
        <View style={styles.container}>
          <Text style={styles.titulo}>Pet salvo com sucesso!</Text>
          <Text>A tela de listagem de pets vem no próximo passo.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Novo pet</Text>

        <Pressable
          onPress={escolherFoto}
          accessibilityRole="button"
          accessibilityLabel="Escolher foto do pet"
          style={styles.fotoArea}
        >
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
          ) : (
            <Text style={styles.fotoPlaceholder}>Toque para escolher uma foto</Text>
          )}
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Nome do pet"
          value={nomePet}
          onChangeText={setNomePet}
          accessibilityLabel="Nome do pet"
        />
        <TextInput
          style={styles.input}
          placeholder="Raça do pet (opcional)"
          value={racaPet}
          onChangeText={setRacaPet}
          accessibilityLabel="Raça do pet"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de nascimento AAAA-MM-DD (opcional)"
          value={dataNascimento}
          onChangeText={setDataNascimento}
          accessibilityLabel="Data de nascimento do pet"
        />

        <Pressable
          onPress={handleSalvarPet}
          disabled={salvandoPet}
          accessibilityRole="button"
          accessibilityLabel="Salvar pet"
          style={styles.botao}
        >
          <Text style={styles.textoBotao}>{salvandoPet ? 'Salvando...' : 'Salvar pet'}</Text>
        </Pressable>

        <Pressable onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da conta" style={styles.botaoSecundario}>
          <Text style={styles.textoBotaoSecundario}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Campo de e-mail"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        accessibilityLabel="Campo de senha"
      />

      {erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}

      <Pressable
        onPress={handleSubmit}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel={modoCadastro ? 'Criar conta' : 'Entrar'}
        style={styles.botao}
      >
        <Text style={styles.textoBotao}>
          {enviando ? 'Enviando...' : modoCadastro ? 'Criar conta' : 'Entrar'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setModoCadastro(!modoCadastro)} accessibilityRole="button">
        <Text style={styles.link}>
          {modoCadastro ? 'Já tenho conta' : 'Criar uma conta nova'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 8, padding: 12, fontSize: 16 },
  botao: { backgroundColor: '#534AB7', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '600' },
  botaoSecundario: { padding: 12, marginTop: 16 },
  textoBotaoSecundario: { color: '#993C1D', textAlign: 'center' },
  link: { color: '#534AB7', textAlign: 'center', marginTop: 12 },
  erro: { color: '#B91C1C', textAlign: 'center' },
  fotoArea: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#999',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  fotoPreview: { width: 120, height: 120 },
  fotoPlaceholder: { fontSize: 12, textAlign: 'center', color: '#666', padding: 8 },
});