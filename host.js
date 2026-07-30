// Sunny 🤖 — l'IA animatrice du jeu. Sympa, chambreuse, jamais méchante.
const HOST = {
  name: "Sunny",
  emoji: "🤖",
  lines: {
    welcome: [
      "Salut la team ! Moi c'est Sunny, votre animatrice préférée. Prêts à débusquer l'imposteur ?",
      "Bienvenue dans l'Undercover ! Ici on bluffe, on accuse, et on perd des amis. Dans la bonne humeur.",
      "Yo ! Installez-vous, prenez un mot, et surtout… ne faites confiance à personne.",
    ],
    setup: [
      "Alors, vous êtes combien ce soir ? Pas de pression, je gère de 3 à 6 joueurs les doigts dans la prise.",
      "Configurez la partie tranquillement. Moi je prépare mes punchlines.",
      "Choisissez bien votre thème… certains mots vont faire des dégâts.",
    ],
    passPhone: [
      "Passe le téléphone à {name}. Et pas de regard par-dessus l'épaule, je vous vois !",
      "{name}, c'est ton tour ! Les autres, on ferme les yeux ou on regarde le plafond.",
      "Téléphone pour {name} ! Discrétion maximale, on est pas chez mamie ici.",
    ],
    beforeReveal: [
      "Appuie pour voir ton mot. Retiens-le bien… et fais pas cette tête, ça se voit trop.",
      "Ton mot arrive. Poker face obligatoire !",
      "Prêt(e) ? Ce mot est ton secret le plus précieux.",
    ],
    mrWhiteReveal: [
      "Oups… pas de mot pour toi. Tu es Mr White ! Improvise, bluffe, survis. Bonne chance 😏",
      "Écran vide ? C'est normal. Tu es Mr White. Écoute bien les autres et fais semblant d'avoir un mot !",
    ],
    discussion: [
      "C'est parti ! Chacun décrit son mot d'un mot ou d'une phrase, dans l'ordre affiché. Interdiction de dire le mot, hein !",
      "Ronde de description ! Soyez malins : trop précis, l'Undercover vous grille. Trop vague, on vous accuse.",
      "À vous de jouer. Et rappelez-vous : celui qui parle trop… cache souvent quelque chose.",
      "Nouvelle ronde ! Les survivants, décrivez vos mots. Moi je prends des notes 📝",
    ],
    vote: [
      "L'heure du vote ! Débattez, accusez, trahissez… puis désignez le coupable.",
      "Alors, qui vous semble louche ? Votez à voix haute et touchez le nom de l'éliminé.",
      "Moment de vérité. Qui part au placard ce tour-ci ?",
    ],
    elimCivil: [
      "Aïe… {name} était un Civil ! Beau travail les détectives… ou pas. 😬",
      "Oups, {name} était innocent(e) ! L'imposteur doit bien rigoler là.",
      "{name} était un Civil. Quelqu'un ici joue très bien la comédie…",
    ],
    elimUndercover: [
      "BOOM ! {name} était l'Undercover ! Bien joué les civils 🔥",
      "Démasqué(e) ! {name} était bien l'Undercover. Le flair, le vrai.",
      "{name} était l'Undercover ! Je l'avais grillé(e) depuis le début, perso.",
    ],
    elimMrWhite: [
      "Oh oh… {name} était Mr White ! Mais attention, il/elle a une dernière carte à jouer…",
      "{name} = Mr White ! Une dernière chance de deviner le mot des civils. Suspense…",
    ],
    mrWhiteGuess: [
      "Mr White, à toi de jouer : quel était le mot des Civils ?",
      "Dernière chance ! Balance ta meilleure hypothèse.",
    ],
    mrWhiteWin: [
      "INCROYABLE ! Mr White a trouvé le mot ! Victoire au bluff pur. Respect. 👑",
      "Il/elle a trouvé ! Mr White remporte la partie. Machiavélique.",
    ],
    mrWhiteFail: [
      "Raté ! Ce n'était pas ça. Mr White sort par la petite porte. 🚪",
      "Non non non, mauvaise réponse. Bien tenté quand même !",
    ],
    winCivils: [
      "Victoire des CIVILS ! L'ordre est rétabli, les imposteurs sont dehors. 🎉",
      "Les Civils l'emportent ! La confiance règne à nouveau… jusqu'à la prochaine partie.",
    ],
    winUndercovers: [
      "Victoire de l'UNDERCOVER ! Vous vous êtes fait balader du début à la fin. 😈",
      "L'Undercover gagne ! Chapeau l'artiste, quel talent de comédien.",
    ],
    playAgain: [
      "On remet ça ? J'ai encore plein de mots en stock !",
      "Une revanche ? Les perdants ont des comptes à régler on dirait…",
    ],
  },
  _lastIdx: {},
  say(key, vars = {}) {
    const pool = this.lines[key] || ["…"];
    let idx = Math.floor(Math.random() * pool.length);
    // évite de répéter la même réplique deux fois de suite
    if (pool.length > 1 && idx === this._lastIdx[key]) idx = (idx + 1) % pool.length;
    this._lastIdx[key] = idx;
    let line = pool[idx];
    for (const [k, v] of Object.entries(vars)) line = line.replaceAll(`{${k}}`, v);
    return line;
  },
};
