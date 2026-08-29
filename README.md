# OGEN — Plateforme client

Portail client OGEN (suivi de projet, fichiers, contrat, factures), en
React + Vite, adossé à un vrai backend **Supabase** (authentification,
base de données Postgres, stockage de fichiers). Le design du prototype
d'origine est conservé à l'identique — seule la couche de données a
changé : `window.storage` (mock local) a été remplacé par de vraies
requêtes Supabase.

## Ce qui a changé par rapport au prototype

| Avant (prototype) | Maintenant |
|---|---|
| `window.storage` (clé/valeur locale, mots de passe en clair) | Postgres (Supabase) + Supabase Auth |
| Fichiers encodés en base64 dans le storage | Fichiers réels dans Supabase Storage (bucket privé) |
| Aucune séparation des droits (tout accessible côté client) | Row Level Security : un client ne voit que ses données, l'admin voit tout |
| Création de compte client = simple entrée dans un tableau | Création d'un vrai compte Supabase Auth (Edge Function admin) |

## Architecture

- **Frontend** : React + Vite (`src/`), design inchangé (mêmes styles, mêmes composants, même logo/roue).
- **Auth** : Supabase Auth (email + mot de passe). Le rôle (`admin` / `client`) est stocké dans `app_metadata` du JWT — impossible à falsifier côté client.
- **Base de données** : tables `clients`, `contracts`, `files`, `invoices` avec Row Level Security (`supabase/migrations/0001_init.sql`).
- **Stockage** : bucket privé `client-files`, avec des URLs signées à la demande pour le téléchargement.
- **Edge Functions** (`supabase/functions/`) : les opérations qui nécessitent la clé `service_role` (créer/supprimer un compte client, créer le tout premier admin) passent par des fonctions serveur qui vérifient elles-mêmes que l'appelant est bien admin.

## Mise en place Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com).

2. **Appliquer le schéma** : dans l'éditeur SQL du dashboard Supabase, exécute le contenu de `supabase/migrations/0001_init.sql`.
   (Ou avec la CLI : `supabase link --project-ref <ref>` puis `supabase db push`.)

3. **Déployer les Edge Functions** (nécessite la [CLI Supabase](https://supabase.com/docs/guides/cli)) :

   ```bash
   supabase functions deploy bootstrap-admin
   supabase functions deploy admin-create-client
   supabase functions deploy admin-delete-client
   ```

4. **Définir le secret de bootstrap** (pour créer le tout premier compte admin) :

   ```bash
   supabase secrets set BOOTSTRAP_ADMIN_SECRET=un-secret-long-et-aleatoire
   ```

5. **Créer le premier compte admin**, en appelant la fonction (remplace les valeurs) :

   ```bash
   curl -X POST "https://<project-ref>.supabase.co/functions/v1/bootstrap-admin" \
     -H "Content-Type: application/json" \
     -H "apikey: <anon-key>" \
     -d '{"email":"admin@ogen.fr","password":"un-mot-de-passe-fort","secret":"un-secret-long-et-aleatoire"}'
   ```

   Cette fonction refuse de créer un second admin si un admin existe déjà — elle peut rester déployée sans risque.

## Configuration du frontend

```bash
cp .env.example .env
```

Renseigne dans `.env` les valeurs de **Project Settings → API** de ton projet Supabase :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Lancer le projet

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

## Créer des clients

Une fois connecté avec le compte admin, "Nouveau client" dans le
tableau de bord admin crée un vrai compte Supabase Auth (via la fonction
`admin-create-client`) et le dossier client associé — le client peut se
connecter immédiatement avec l'email/mot de passe choisis.

## Notes de sécurité

- Aucune donnée sensible (mot de passe, rôle) n'est stockée en clair
  côté application : les mots de passe sont gérés par Supabase Auth, et
  le rôle admin/client vit uniquement dans le JWT signé par Supabase.
- Le bucket de stockage est **privé** : chaque téléchargement passe par
  une URL signée à durée de vie limitée (1h).
- Les policies RLS garantissent qu'un client authentifié ne peut lire
  ou écrire que ses propres fichiers/factures/contrat, même en
  contournant l'interface (ex. appel direct à l'API Supabase).

## Limite connue de cette session

Cette session de développement n'a pas de projet Supabase réel à
disposition pour tester le flux de bout en bout (connexion, upload,
Edge Functions en conditions réelles). Le code a été relu attentivement
et le build de production (`npm run build`) passe sans erreur, mais un
test manuel après connexion à ton propre projet Supabase reste
recommandé avant mise en production.
