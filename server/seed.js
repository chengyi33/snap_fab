const db = require('./db');

// Seed initial data if collections don't exist

db.seed('team', [
  { id: 1, name: 'John', role: 'Process Engineer', trained_tools: ['PECVD', 'Sputter', 'Furnace'] },
  { id: 2, name: 'Sarah', role: 'Etch Engineer', trained_tools: ['RIE Etch', 'PECVD'] },
  { id: 3, name: 'Mike', role: 'Litho Engineer', trained_tools: ['Litho Stepper', 'Spin Coater'] },
  { id: 4, name: 'Carol', role: 'Bonding Specialist', trained_tools: ['Fusion Bonder', 'Plasma Cleaner'] },
]);

db.seed('tools', [
  { id: 1, name: 'PECVD', ucsb_id: 'pecvd-01' },
  { id: 2, name: 'Litho Stepper', ucsb_id: 'litho-01' },
  { id: 3, name: 'RIE Etch', ucsb_id: 'rie-01' },
  { id: 4, name: 'Sputter', ucsb_id: 'sputter-01' },
  { id: 5, name: 'Furnace', ucsb_id: 'furnace-01' },
  { id: 6, name: 'Spin Coater', ucsb_id: 'spin-01' },
  { id: 7, name: 'Fusion Bonder', ucsb_id: 'bonder-01' },
  { id: 8, name: 'SRD', ucsb_id: 'srd-01' },
]);

db.seed('layers', [
  { id: 1, name: 'Substrate Prep', layer_num: 1, target_week: '2025-02-10', status: 'done', assigned_to: [1], notes: '' },
  { id: 2, name: 'Oxide Growth', layer_num: 2, target_week: '2025-02-17', status: 'done', assigned_to: [2], notes: '' },
  { id: 3, name: 'Nitride Dep.', layer_num: 3, target_week: '2025-02-24', status: 'done', assigned_to: [1,2], notes: '' },
  { id: 4, name: 'Metal Deposition', layer_num: 4, target_week: '2025-03-03', status: 'done', assigned_to: [1], notes: '' },
  { id: 5, name: 'Litho Patterning', layer_num: 5, target_week: '2025-03-10', status: 'done', assigned_to: [3], notes: '' },
  { id: 6, name: 'Via Etch', layer_num: 6, target_week: '2025-03-17', status: 'done', assigned_to: [2], notes: '' },
  { id: 7, name: 'MW Pillar', layer_num: 7, target_week: '2025-04-21', status: 'active', assigned_to: [1,2,3], notes: '2 tools unbooked' },
  { id: 8, name: 'MWR Bond', layer_num: 8, target_week: '2025-04-28', status: 'upcoming', assigned_to: [], notes: '' },
  { id: 9, name: 'SOI Release', layer_num: 9, target_week: '2025-05-05', status: 'upcoming', assigned_to: [], notes: '' },
  { id: 10, name: 'Target Transfer', layer_num: 10, target_week: '2025-05-12', status: 'upcoming', assigned_to: [], notes: '' },
]);

db.seed('steps', [
  { id: 1, layer_id: 7, step_num: '7.1', process: 'Oxide deposition', tool: 'PECVD', process_time_hr: 4, slot_time_hr: 4, operator_id: 1, status: 'done' },
  { id: 2, layer_id: 7, step_num: '7.2', process: 'Photoresist expose', tool: 'Litho Stepper', process_time_hr: 3, slot_time_hr: 3, operator_id: 3, status: 'in_progress' },
  { id: 3, layer_id: 7, step_num: '7.3', process: 'Pattern etch', tool: 'RIE Etch', process_time_hr: 3, slot_time_hr: 2, operator_id: 2, status: 'needs_booking' },
  { id: 4, layer_id: 7, step_num: '7.4', process: 'Nitride deposition', tool: 'PECVD', process_time_hr: 3, slot_time_hr: 3, operator_id: 2, status: 'needs_booking' },
  { id: 5, layer_id: 7, step_num: '7.5', process: 'Metal sputter', tool: 'Sputter', process_time_hr: 4, slot_time_hr: 4, operator_id: 1, status: 'not_started' },
  { id: 6, layer_id: 7, step_num: '7.6', process: 'Anneal', tool: 'Furnace', process_time_hr: 4, slot_time_hr: 4, operator_id: 1, status: 'not_started' },
]);

db.seed('bookings', [
  { id: 1, tool: 'PECVD', date: '2025-04-21', start_time: '09:00', duration_hr: 4, booked_by: 1, layer_step: 'L7.1 Oxide dep.', ucsb_confirmed: true, notes: '' },
  { id: 2, tool: 'Litho Stepper', date: '2025-04-22', start_time: '09:00', duration_hr: 3, booked_by: 3, layer_step: 'L7.2 PR expose', ucsb_confirmed: true, notes: '' },
  { id: 3, tool: 'Sputter', date: '2025-04-24', start_time: '10:00', duration_hr: 4, booked_by: 1, layer_step: 'L7.5 Metal sput.', ucsb_confirmed: true, notes: '' },
  { id: 4, tool: 'Furnace', date: '2025-04-25', start_time: '13:00', duration_hr: 4, booked_by: 1, layer_step: 'L7.6 Anneal', ucsb_confirmed: true, notes: '' },
]);

console.log('Seed complete.');
