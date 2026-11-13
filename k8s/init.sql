-- Jeu de données initial pour le TP Kubernetes (noms suffixés pour le distinguer du TP Docker).
-- Script idempotent : il peut être rejoué sans créer de doublons.
CREATE TABLE IF NOT EXISTS students (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO students (name) VALUES
  ('Alice (K8s)'),
  ('Bob (K8s)'),
  ('Carol (K8s)'),
  ('David (K8s)')
ON CONFLICT (name) DO NOTHING;
