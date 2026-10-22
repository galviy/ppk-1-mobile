import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible, title, message, confirmLabel, onCancel, onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.box}>
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}
          <View style={s.row}>
            <Pressable style={[s.btn, s.btnGhost]} onPress={onCancel}>
              <Text style={s.btnGhostText}>Batal</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnMain]} onPress={onConfirm}>
              <Text style={s.btnMainText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: '#1b1f23' },
  message: { fontSize: 14, color: '#57606a', lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#d0d7de' },
  btnGhostText: { color: '#1b1f23', fontWeight: '600' },
  btnMain: { backgroundColor: '#0f5c4d' },
  btnMainText: { color: '#fff', fontWeight: '700' },
});