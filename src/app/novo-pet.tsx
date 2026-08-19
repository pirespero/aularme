import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function NovoPet() {
  const { session } = useAuth();
  const [nomePet, setNomePet] = useState('');
  const [racaPet, setRacaPet] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [salvandoPet, setSalvandoPet] = useState(false);

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

    router.replace('/pets');
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

      <TextInput style={styles.input} placeholder="Nome do pet" value={nomePet} onChangeText={setNomePet} accessibilityLabel="Nome do pet" />
      <TextInput style={styles.input} placeholder="Raça (opcional)" value={racaPet} onChangeText={setRacaPet} accessibilityLabel="Raça do pet" />
      <TextInput style={styles.input} placeholder="Data de nascimento AAAA-MM-DD (opcional)" value={dataNascimento} onChangeText={setDataNascimento} accessibilityLabel="Data de nascimento do pet" />

      <Pressable onPress={handleSalvarPet} disabled={salvandoPet} accessibilityRole="button" accessibilityLabel="Salvar pet" style={styles.botao}>
        <Text style={styles.textoBotao}>{salvandoPet ? 'Salvando...' : 'Salvar pet'}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancelar" style={styles.botaoSecundario}>
        <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
      </Pressable>
    </ScrollView>
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
  fotoArea: { alignSelf: 'center', width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#999', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  fotoPreview: { width: 120, height: 120 },
  fotoPlaceholder: { fontSize: 12, textAlign: 'center', color: '#666', padding: 8 },
});