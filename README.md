# Undercover 🕵️ — animé par Sunny 🤖

Le jeu de société **Undercover** (le jeu de l'imposteur) en version web, jouable de **3 à 6 joueurs** sur un seul téléphone (passe-le-téléphone), avec **Sunny**, une IA animatrice sympa qui commente la partie.

Inspiré des shorts façon *Sunroof* : les mots sont regroupés par **thématiques** (Duos de légende, Persos de manga, Persos de film & série, Stars & Internet, Rap FR, Anime & Manga, Foot, Bouffe, Jeux vidéo, Ciné, Classique…) — avec par exemple la paire *PNL* / *Bee & A* 🍥.

## Système de points 🏆

Les scores sont **conservés d'une partie à l'autre** (par prénom, sur l'appareil) :

- 😇 Victoire des Civils : **+2 pts** par civil
- 🕵️ Victoire de l'Undercover : **+5 pts**
- 👻 Victoire de Mr White : **+4 pts**

Le classement s'affiche en fin de partie et via le bouton **🏆 Scores** de l'accueil (avec remise à zéro possible).

## Comment jouer

1. Ouvrir `index.html` dans un navigateur (aucune installation nécessaire).
2. Choisir le nombre de joueurs (3–6), les thèmes, et l'option **Mr White** (dès 5 joueurs).
3. Chacun regarde discrètement son mot en se passant le téléphone.
4. À tour de rôle, chacun décrit son mot **sans le dire**, puis on vote pour éliminer un joueur.

## Les rôles

- 😇 **Civils** : ont tous le même mot. Ils gagnent en éliminant tous les imposteurs.
- 🕵️ **Undercover** : a un mot proche mais différent. Il gagne s'il survit jusqu'à égalité.
- 👻 **Mr White** : n'a aucun mot ! Il gagne s'il devine le mot des Civils quand il est démasqué.

## Structure

- `index.html` — la page du jeu
- `app.js` — la logique du jeu
- `host.js` — Sunny, l'IA animatrice et ses répliques
- `words.js` — les thèmes et paires de mots (facile d'en ajouter !)
- `style.css` — le style

## Ajouter des mots

Ouvrez `words.js` et ajoutez une paire dans le thème de votre choix :

```js
["Mot des civils", "Mot de l'undercover"],
```
