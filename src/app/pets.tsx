import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Pet = {
  id: string;
  nome: string;
  raca: string | null;
};

export default function Pets() {
  const { sair } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPets();
  }, []);

  async function buscarPets() {
    setCarregando(true);
    const { data, error } = await supabase
      .from('pets')
      .select('id, nome, raca')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setPets(data);
    }
    setCarregando(false);
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando seus pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus pets</Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum pet cadastrado ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.cardPet}>
            <Text style={styles.nomePet}>{item.nome}</Text>
            {item.raca && <Text style={styles.racaPet}>{item.raca}</Text>}
          </View>
        )}
      />

      <Pressable onPress={() => router.push('/novo-pet')} accessibilityRole="button" accessibilityLabel="Adicionar novo pet" style={styles.botao}>
        <Text style={styles.textoBotao}>+ Adicionar pet</Text>
      </Pressable>

      <Pressable onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da conta" style={styles.botaoSecundario}>
        <Text style={styles.textoBotaoSecundario}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  vazio: { color: '#666', textAlign: 'center', marginTop: 32 },
  cardPet: { backgroundColor: '#f2f2f2', borderRadius: 8, padding: 16, marginBottom: 12 },
  nomePet: { fontSize: 18, fontWeight: '600' },
  racaPet: { color: '#666', marginTop: 4 },
  botao: { backgroundColor: '#534AB7', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '600' },
  botaoSecundario: { padding: 12, marginTop: 12 },
  textoBotaoSecundario: { color: '#993C1D', textAlign: 'center' },
});