import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { InfoRow } from '../../components/InfoRow';
import { getIniciais } from '../../constants/appData';
import {
  getAlunos,
  aplicarAdvertencia,
  alternarStatus,
  excluirAluno,
} from '../../services/alunos.service';
import type { Aluno } from '../../types/Index';

type Filtro = 'todos' | 'suspensos' | 'concluindo';

export const AlunosScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [alunos, setAlunos]     = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro]     = useState<Filtro>('todos');
  const [busca, setBusca]       = useState('');
  const [modal, setModal]       = useState<Aluno | null>(null);
  const [salvando, setSalvando] = useState(false);

  const anoAtual = new Date().getFullYear();

  const carregarAlunos = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await getAlunos();
      setAlunos(dados);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os alunos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarAlunos(); }, [carregarAlunos]);

  const lista = useMemo(() => {
    let l = alunos;
    if (filtro === 'suspensos')  l = l.filter((a) => a.status === 'suspenso');
    if (filtro === 'concluindo') l = l.filter((a) => a.anoConclusao === anoAtual);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      l = l.filter((a) => a.nome.toLowerCase().includes(q) || a.cpf.includes(q));
    }
    return l;
  }, [alunos, filtro, busca]);

  const atualizarLocal = useCallback((atualizado: Aluno) => {
    setAlunos((prev) => prev.map((a) => (a.id === atualizado.id ? atualizado : a)));
    setModal((prev) => (prev?.id === atualizado.id ? atualizado : prev));
  }, []);

  const handleAdvertir = async (aluno: Aluno) => {
    setSalvando(true);
    try {
      const atualizado = await aplicarAdvertencia(aluno);
      atualizarLocal(atualizado);
    } catch {
      Alert.alert('Erro', 'Não foi possível aplicar a advertência.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSuspender = async (aluno: Aluno) => {
    setSalvando(true);
    try {
      const atualizado = await alternarStatus(aluno);
      atualizarLocal(atualizado);
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = (aluno: Aluno) => {
    Alert.alert(
      'Excluir cadastro',
      `Deseja excluir permanentemente ${aluno.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setSalvando(true);
            try {
              await excluirAluno(aluno.id);
              setAlunos((prev) => prev.filter((a) => a.id !== aluno.id));
              setModal(null);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o aluno.');
            } finally {
              setSalvando(false);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Aluno }) => (
    <TouchableOpacity
      onPress={() => setModal(item)}
      activeOpacity={0.8}
      style={[
        styles.itemCard,
        Shadow.card,
        item.status === 'suspenso' && styles.itemCardSuspenso,
      ]}
    >
      <Avatar
        iniciais={getIniciais(item.nome)}
        uri={item.foto}
        size={42}
        backgroundColor={item.status === 'suspenso' ? Colors.danger : Colors.primary}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemSub}>{item.faculdade} · {item.curso} · {item.semestreAtual}º sem.</Text>
      </View>
      <View style={styles.itemBadges}>
        <Badge
          label={item.status === 'suspenso' ? 'Suspenso' : 'Ativo'}
          color={item.status === 'suspenso' ? Colors.danger : Colors.success}
        />
        {item.advertencias > 0 && (
          <Badge label={`${item.advertencias} adv.`} color={Colors.warning} />
        )}
        {item.anoConclusao === anoAtual && (
          <Badge label="Concluindo" color={Colors.primary} />
        )}
      </View>
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

      {/* Filtros */}
      <View style={styles.filtrosRow}>
        {([
          ['todos', 'Todos'],
          ['suspensos', 'Suspensos'],
          ['concluindo', `Concluindo ${anoAtual}`],
        ] as [Filtro, string][]).map(([id, label]) => (
          <TouchableOpacity
            key={id}
            onPress={() => setFiltro(id)}
            activeOpacity={0.8}
            style={[styles.filtroBtn, filtro === id && styles.filtroBtnActive]}
          >
            <Text style={[styles.filtroTxt, filtro === id && styles.filtroTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lista}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTxt}>Nenhum aluno encontrado.</Text>
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
                      uri={modal.foto}
                      size={54}
                      backgroundColor={modal.status === 'suspenso' ? Colors.danger : Colors.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetNome}>{modal.nome}</Text>
                      <Text style={styles.sheetCpf}>{modal.cpf}</Text>
                      <View style={styles.sheetBadgesRow}>
                        <Badge
                          label={modal.status === 'suspenso' ? 'Suspenso' : 'Ativo'}
                          color={modal.status === 'suspenso' ? Colors.danger : Colors.success}
                        />
                        <Badge label={modal.faculdade} color={Colors.primary} />
                        {modal.anoConclusao === anoAtual && (
                          <Badge label="Concluindo" color={Colors.warning} />
                        )}
                      </View>
                    </View>
                  </View>

                  <Divider />

                  <InfoRow label="🏫 Faculdade"         value={modal.faculdade} />
                  <InfoRow label="📚 Curso"             value={modal.curso} />
                  <InfoRow label="🎓 Modalidade"        value={modal.modalidade} />
                  <InfoRow label="📅 Semestre"          value={`${modal.semestreAtual}º`} />
                  <InfoRow label="🏁 Conclusão"         value={String(modal.anoConclusao)} />
                  <InfoRow label="📍 Ponto embarque"    value={modal.pontoEmbarque} />
                  <InfoRow label="📱 Telefone"          value={modal.telefone} />
                  <InfoRow label="🏠 Endereço"          value={modal.endereco} />
                  <InfoRow label="⚠️ Advertências"     value={String(modal.advertencias)} />

                  <Divider vertical={Spacing.lg} />

                  {/* Ações */}
                  <View style={styles.acoesRow}>
                    <Button
                      label="⚠️  Advertir"
                      onPress={() => handleAdvertir(modal)}
                      variant="outline"
                      small
                      style={{ flex: 1 }}
                      disabled={salvando}
                    />
                    <View style={{ width: 8 }} />
                    <Button
                      label={modal.status === 'suspenso' ? '✅  Reativar' : '🚫  Suspender'}
                      onPress={() => handleSuspender(modal)}
                      variant={modal.status === 'suspenso' ? 'success' : 'danger'}
                      small
                      style={{ flex: 1 }}
                      loading={salvando}
                    />
                  </View>
                  <View style={[styles.acoesRow, { marginTop: 8 }]}>
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
                      disabled={salvando}
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

  filtrosRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md, flexWrap: 'wrap',
  },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  filtroBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroTxt:       { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filtroTxtActive: { color: Colors.white },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 8 },

  itemCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  itemCardSuspenso: { borderColor: Colors.danger + '44', opacity: 0.8 },
  itemInfo:  { flex: 1 },
  itemNome:  { fontSize: 14, fontWeight: '700', color: Colors.text },
  itemSub:   { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  itemBadges:{ alignItems: 'flex-end', gap: 4 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt:  { fontSize: 15, color: Colors.textSecondary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 22,
    borderTopRightRadius: 22, padding: Spacing.xl, ...Shadow.modal,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: Spacing.md },
  sheetNome: { ...Typography.h3 },
  sheetCpf:  { ...Typography.small, marginTop: 2 },
  sheetBadgesRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },

  acoesRow: { flexDirection: 'row' },
});
