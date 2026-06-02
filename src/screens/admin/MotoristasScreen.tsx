import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { InfoRow } from '../../components/InfoRow';
import { getIniciais } from '../../constants/appData';
import { getMotoristas, excluirMotorista } from '../../services/motoristas.service';
import type { Motorista } from '../../types/Index';

export const MotoristasScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [motoristas, setMotoristas]     = useState<Motorista[]>([]);
  const [carregando, setCarregando]     = useState(true);
  const [busca, setBusca]               = useState('');
  const [modal, setModal]               = useState<Motorista | null>(null);
  const [excluindo, setExcluindo]       = useState(false);

  const carregarMotoristas = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await getMotoristas();
      setMotoristas(dados);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os motoristas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarMotoristas(); }, [carregarMotoristas]);

  const lista = useMemo(() => {
    if (!busca.trim()) return motoristas;
    const q = busca.toLowerCase();
    return motoristas.filter(
      (m) => m.nome.toLowerCase().includes(q) || m.cpf.includes(q),
    );
  }, [motoristas, busca]);

  const handleExcluir = (motorista: Motorista) => {
    Alert.alert(
      'Excluir motorista',
      `Deseja excluir permanentemente ${motorista.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setExcluindo(true);
            try {
              await excluirMotorista(motorista.id);
              setMotoristas((prev) => prev.filter((m) => m.id !== motorista.id));
              setModal(null);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o motorista.');
            } finally {
              setExcluindo(false);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Motorista }) => (
    <TouchableOpacity
      onPress={() => setModal(item)}
      activeOpacity={0.8}
      style={[styles.itemCard, Shadow.card]}
    >
      <Avatar iniciais={getIniciais(item.nome)} size={42} backgroundColor={Colors.primary} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemSub}>{item.cpf}</Text>
      </View>
      <Text style={styles.itemChevron}>›</Text>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Busca */}
      <View style={styles.buscaWrap}>
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="🔍 Buscar por nome ou CPF..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.buscaInput}
        />
      </View>

      {/* Contador */}
      <Text style={styles.contador}>
        {lista.length} motorista{lista.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={lista}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚌</Text>
            <Text style={styles.emptyTxt}>Nenhum motorista encontrado.</Text>
          </View>
        }
      />

      {/* Modal detalhes */}
      <Modal
        visible={!!modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal(null)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.sheetHandle} />
              {modal && (
                <>
                  {/* Cabeçalho */}
                  <View style={styles.sheetHead}>
                    <Avatar
                      iniciais={getIniciais(modal.nome)}
                      size={54}
                      backgroundColor={Colors.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetNome}>{modal.nome}</Text>
                      <Text style={styles.sheetCpf}>{modal.cpf}</Text>
                    </View>
                  </View>

                  <Divider />

                  <InfoRow label="📱 Telefone" value={modal.telefone || '—'} />

                  <Divider vertical={Spacing.lg} />

                  <View style={styles.acoesRow}>
                    <Button
                      label="Fechar"
                      onPress={() => setModal(null)}
                      variant="ghost"
                      small
                      style={{ flex: 1 }}
                    />
                    <View style={{ width: 8 }} />
                    <Button
                      label="🗑  Excluir"
                      onPress={() => handleExcluir(modal)}
                      variant="danger"
                      small
                      style={{ flex: 1 }}
                      loading={excluindo}
                      disabled={excluindo}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  buscaWrap: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  buscaInput: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: 14, color: Colors.text,
  },

  contador: {
    ...Typography.small,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 8 },

  itemCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  itemInfo:    { flex: 1 },
  itemNome:    { fontSize: 14, fontWeight: '700', color: Colors.text },
  itemSub:     { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  itemChevron: { fontSize: 22, color: Colors.textSecondary, marginRight: 4 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt:  { fontSize: 15, color: Colors.textSecondary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 22,
    borderTopRightRadius: 22, padding: Spacing.xl, ...Shadow.modal,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: Spacing.md },
  sheetNome: { ...Typography.h3 },
  sheetCpf:  { ...Typography.small, marginTop: 2 },

  acoesRow: { flexDirection: 'row' },
});
