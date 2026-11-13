-- Schéma et jeu de données initial de l'application « students ».
-- Script idempotent : il peut être rejoué sans créer de doublons.
CREATE TABLE IF NOT EXISTS students (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO students (name) VALUES
  ('Alice'),
  ('Bob'),
  ('Carol'),
  ('David')
ON CONFLICT (name) DO NOTHING;
