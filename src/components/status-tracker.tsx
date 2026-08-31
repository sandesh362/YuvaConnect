import { StyleSheet, Text, View } from 'react-native';
import { GigStatus } from '@/types/api';
import { colors } from '@/components/ui';

const stages: { label: string; statuses: GigStatus[] }[] = [
  { label: 'Open', statuses: ['OPEN'] }, { label: 'Assigned', statuses: ['ASSIGNED'] }, { label: 'In progress', statuses: ['IN_PROGRESS'] }, { label: 'Submitted', statuses: ['SUBMITTED', 'REVISION_REQUESTED'] }, { label: 'Approved', statuses: ['APPROVED', 'PAID', 'CLOSED'] },
];
export function StatusTracker({ status }: { status: GigStatus }) { const current = stages.findIndex((stage) => stage.statuses.includes(status)); return <View><View style={styles.row}>{stages.map((stage, index) => <View key={stage.label} style={styles.step}><View style={[styles.dot, index <= current && styles.done]} />{index < stages.length - 1 && <View style={[styles.line, index < current && styles.done]} />}</View>)}</View><View style={styles.labels}>{stages.map((stage) => <Text key={stage.label} style={styles.label}>{stage.label}</Text>)}</View>{status === 'REVISION_REQUESTED' && <Text style={styles.revision}>Revision requested</Text>}</View>; }
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' }, step: { flex: 1, flexDirection: 'row', alignItems: 'center' }, dot: { width: 13, height: 13, borderRadius: 8, backgroundColor: colors.border }, line: { height: 3, flex: 1, backgroundColor: colors.border }, done: { backgroundColor: colors.blue }, labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, label: { color: colors.muted, fontSize: 10, width: '20%', textAlign: 'center' }, revision: { color: colors.danger, fontWeight: '700', marginTop: 8 } });
