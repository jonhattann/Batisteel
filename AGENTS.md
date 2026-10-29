# Serveur Batisteel : règles pour l'IA

Ce fichier s'adresse à tout assistant IA de code (Claude Code, Codex, Cursor, Copilot, Gemini…) qui travaille pour Jonathan Soulié (Batisteel) sur son serveur.

Où le placer, à la racine de chaque projet déployé sur ce serveur :
- sous le nom `AGENTS.md` : c'est le fichier standard lu par Codex, Cursor, GitHub Copilot, Gemini CLI et la plupart des autres outils ;
- et, pour Claude Code (qui lit `CLAUDE.md`), un fichier `CLAUDE.md` contenant simplement la ligne `@AGENTS.md`.

Si le projet a déjà un `AGENTS.md`, ajouter ce texte à la fin.

## Le serveur

- Coolify v4 : https://batisteel.optimusnextgen.be (proxy Traefik, certificats Let's Encrypt automatiques).
- Serveur dédié : 4 vCPU, 8 Go de RAM, 96 Go de disque, partagés par toutes les applications.
- Le système (serveur, Docker, pare-feu, réseau, Coolify lui-même) est administré par Optimus Nextgen (Benjamin). Jonathan gère ses applications.
- Il n'y a pas de sauvegarde automatique.

## Ce que tu peux faire

- Créer, modifier, déployer, redémarrer et supprimer les applications et bases de données de Jonathan dans le projet « Batisteel ».
- Gérer leurs variables d'environnement (clés d'API, URL de bases, etc.).
- Leur attribuer des domaines : une adresse `https://<nom>.batisteel.optimusnextgen.be` est donnée automatiquement ; pour un domaine de Jonathan, un enregistrement DNS A vers `169.58.125.44` suffit.
- Utiliser la source GitHub existante « app-batisteel » pour les dépôts de Jonathan.
- Lire les journaux et l'état des déploiements.

## Ce que tu ne dois jamais faire (demander d'abord à Jonathan, qui voit avec Benjamin)

- Modifier quoi que ce soit dans Servers → batisteel-srv : proxy, configuration Traefik, nettoyage Docker, Sentinel, domaine joker, réglages avancés.
- Modifier les réglages de l'instance (Settings), les membres de l'équipe, les clés privées (Keys & Tokens → Private Keys) ou les sources Git existantes.
- Ouvrir le terminal du serveur hôte depuis Coolify, ou exécuter des commandes sur l'hôte. Le terminal d'un conteneur d'application est autorisé pour du diagnostic.
- Toucher au pare-feu, à SSH, à Tailscale, aux mises à jour du système ou de Docker, ou mettre Coolify à jour.
- Publier un port directement sur le serveur (« Ports Mappings ») ou rendre une base de données publique (« Make it publicly available »). Tout passe par un domaine et le proxy.
- Créer un jeton d'API Coolify avec la permission « root ».

