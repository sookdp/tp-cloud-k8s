'use strict';

const os = require('os');
const express = require('express');
const { Pool } = require('pg');

// Toute la configuration vient de l'environnement (facteur III des 12 facteurs) :
// la même image tourne sans modification avec docker run, Compose ou Kubernetes.
const port = Number(process.env.PORT) || 8000;
const version = process.env.APP_VERSION || 'dev';
const hostname = os.hostname(); // dans un conteneur : son identifiant ; dans Kubernetes : le nom du pod

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS, // volontairement sans valeur par défaut : un secret ne se code pas en dur
  connectionTimeoutMillis: 3000,
});
pool.on('error', (err) => console.error(`[db] connexion inactive en erreur : ${err.message}`));

const app = express();
app.disable('x-powered-by');
app.use(express.json());

// Journal d'accès sur la sortie standard (facteur XI) : docker logs / kubectl logs le récupèrent.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (req.path === '/health' || req.path === '/ready') return; // les sondes ne polluent pas le journal
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
});

app.use(express.static('public'));

// Sonde de vie (liveness) : le processus répond-il ? Elle ne dépend d'AUCUN service externe.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Sonde de disponibilité (readiness) : l'application peut-elle servir du trafic ? Elle vérifie la base.
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', reason: err.code || err.message });
  }
});

app.get('/info', (req, res) => res.json({ hostname, version }));

app.get('/students', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM students ORDER BY id ASC');
    res.json({ hostname, version, students: rows });
  } catch (err) {
    console.error(`[db] ${err.code || ''} ${err.message}`);
    res.status(500).json({ hostname, version, error: 'Erreur lors de la connexion à la base de données' });
  }
});

app.post('/students', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) {
    return res.status(400).json({ error: 'Le champ "name" est obligatoire (100 caractères maximum)' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO students (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name',
      [name],
    );
    if (rows.length === 0) return res.status(409).json({ error: `"${name}" existe déjà` });
    res.status(201).json({ hostname, student: rows[0] });
  } catch (err) {
    console.error(`[db] ${err.code || ''} ${err.message}`);
    res.status(500).json({ hostname, version, error: 'Erreur lors de la connexion à la base de données' });
  }
});

// Consomme du CPU pendant ?ms= millisecondes (2 s au plus) : sert uniquement au test de l'autoscaling (TP3).
app.get('/load', (req, res) => {
  const ms = Math.min(Math.max(Number(req.query.ms) || 200, 1), 2000);
  const end = Date.now() + ms;
  let x = 0;
  while (Date.now() < end) x += Math.sqrt(Math.random());
  res.json({ hostname, burnedMs: ms });
});

const server = app.listen(port, () => {
  console.log(`students-web ${version} en écoute sur le port ${port} (hôte ${hostname})`);
});

// Arrêt propre (facteur IX) : sur SIGTERM (docker stop, suppression d'un pod), on termine les requêtes
// en cours puis on ferme les connexions à la base, au lieu d'être tué brutalement après le délai de grâce.
function shutdown(signal) {
  console.log(`${signal} reçu : arrêt propre en cours`);
  server.close(async () => {
    await pool.end().catch(() => {});
    console.log('Arrêt terminé');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
