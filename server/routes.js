const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('./db');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ─── Layers ─────────────────────────────────────────────────────────────────
router.get('/layers', (req, res) => res.json(db.all('layers')));
router.get('/layers/:id', (req, res) => {
  const layer = db.find('layers', req.params.id);
  if (!layer) return res.status(404).json({ error: 'Not found' });
  res.json(layer);
});
router.post('/layers', (req, res) => res.json(db.insert('layers', req.body)));
router.put('/layers/:id', (req, res) => {
  const updated = db.update('layers', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});
router.delete('/layers/:id', (req, res) => {
  db.remove('layers', req.params.id);
  res.json({ ok: true });
});

// ─── Steps ──────────────────────────────────────────────────────────────────
router.get('/steps', (req, res) => {
  const steps = db.all('steps');
  const layerId = req.query.layer_id;
  res.json(layerId ? steps.filter(s => s.layer_id === Number(layerId)) : steps);
});
router.post('/steps', (req, res) => res.json(db.insert('steps', req.body)));
router.put('/steps/:id', (req, res) => {
  const updated = db.update('steps', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});
router.delete('/steps/:id', (req, res) => {
  db.remove('steps', req.params.id);
  res.json({ ok: true });
});

// ─── Bookings ────────────────────────────────────────────────────────────────
router.get('/bookings', (req, res) => res.json(db.all('bookings')));
router.post('/bookings', (req, res) => res.json(db.insert('bookings', req.body)));
router.put('/bookings/:id', (req, res) => {
  const updated = db.update('bookings', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});
router.delete('/bookings/:id', (req, res) => {
  db.remove('bookings', req.params.id);
  res.json({ ok: true });
});

// ─── Team ────────────────────────────────────────────────────────────────────
router.get('/team', (req, res) => res.json(db.all('team')));
router.post('/team', (req, res) => res.json(db.insert('team', req.body)));
router.put('/team/:id', (req, res) => {
  const updated = db.update('team', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});
router.delete('/team/:id', (req, res) => {
  db.remove('team', req.params.id);
  res.json({ ok: true });
});

// ─── Tools ───────────────────────────────────────────────────────────────────
router.get('/tools', (req, res) => res.json(db.all('tools')));
router.post('/tools', (req, res) => res.json(db.insert('tools', req.body)));

// ─── Upload: Process Spreadsheet ────────────────────────────────────────────
router.post('/upload/process', upload.single('file'), (req, res) => {
  try {
    const wb = XLSX.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    // Group by layer
    const layerMap = {};
    rows.forEach(row => {
      const layerName = row['layer'] || row['Layer'];
      if (!layerName) return;
      if (!layerMap[layerName]) layerMap[layerName] = [];
      layerMap[layerName].push(row);
    });

    const importedLayers = [];
    const importedSteps = [];

    const existingLayers = db.all('layers');
    const existingSteps = db.all('steps');
    let layerNum = existingLayers.length ? Math.max(...existingLayers.map(l => l.layer_num)) + 1 : 1;
    let stepIdx = existingSteps.length ? Math.max(...existingSteps.map(s => s.id)) : 0;

    Object.entries(layerMap).forEach(([layerName, steps]) => {
      const layer = db.insert('layers', {
        name: layerName,
        layer_num: layerNum++,
        target_week: null,
        status: 'upcoming',
        assigned_to: [],
        notes: ''
      });
      importedLayers.push(layer);

      steps.forEach((row, i) => {
        const step = db.insert('steps', {
          layer_id: layer.id,
          step_num: `${layer.layer_num}.${i + 1}`,
          process: row['substep'] || row['Substep'] || '',
          tool: row['tools'] || row['Tools'] || row['tool'] || '',
          process_time_hr: Math.round((Number(row['estimated time(min)'] || 0) / 60) * 10) / 10,
          slot_time_hr: Math.round((Number(row['estimated time(min)'] || 0) / 60) * 10) / 10,
          operator_id: null,
          status: 'not_started'
        });
        importedSteps.push(step);
      });
    });

    res.json({ layers: importedLayers.length, steps: importedSteps.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard summary ───────────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  const layers = db.all('layers');
  const steps = db.all('steps');
  const bookings = db.all('bookings');
  const team = db.all('team');

  const activeLayer = layers.find(l => l.status === 'active');
  const activeSteps = activeLayer ? steps.filter(s => s.layer_id === activeLayer.id) : [];
  const pendingBookings = activeSteps.filter(s => s.status === 'needs_booking');
  const conflicts = []; // placeholder for conflict detection

  const operatorLoad = team.map(member => {
    const memberSteps = activeSteps.filter(s => s.operator_id === member.id);
    const totalHrs = memberSteps.reduce((sum, s) => sum + (s.slot_time_hr || 0), 0);
    return { ...member, hours_this_week: totalHrs, steps: memberSteps };
  });

  res.json({
    total_layers: layers.length,
    done_layers: layers.filter(l => l.status === 'done').length,
    active_layer: activeLayer,
    active_steps: activeSteps,
    pending_bookings: pendingBookings.length,
    bookings_this_week: bookings.length,
    conflicts,
    operator_load: operatorLoad,
  });
});

module.exports = router;
