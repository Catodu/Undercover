// Undercover — logique du jeu (passe-le-téléphone, 3 à 6 joueurs)

const $ = (sel) => document.querySelector(sel);
const screen = $("#screen");
const hostBubble = $("#host-bubble");
const hostText = $("#host-text");

const state = {
  players: [],       // {name, role: 'civil'|'undercover'|'mrwhite', word, alive}
  themes: [],        // ids des thèmes sélectionnés
  useMrWhite: false,
  undercoverCount: 1,
  pair: null,        // [motCivil, motUndercover]
  civilWord: "",
  round: 0,
  revealIndex: 0,
  usedPairs: new Set(JSON.parse(localStorage.getItem("uc_used") || "[]")),
};

// Bouton pour quitter la partie à tout moment
const quitBtn = $("#btn-quit");
quitBtn.onclick = () => {
  if (confirm("Quitter la partie en cours et revenir à l'accueil ?")) showHome();
};

function hostSay(key, vars) {
  hostText.textContent = HOST.say(key, vars);
  hostBubble.classList.remove("pop");
  void hostBubble.offsetWidth; // relance l'animation
  hostBubble.classList.add("pop");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Scores (persistants entre les parties) ----------

const POINTS = { civil: 2, undercover: 5, mrwhite: 4 };

function loadScores() {
  return JSON.parse(localStorage.getItem("uc_scores") || "{}");
}

function saveScores(scores) {
  localStorage.setItem("uc_scores", JSON.stringify(scores));
}

function awardPoints(winner) {
  const scores = loadScores();
  const gains = {};
  for (const p of state.players) {
    let pts = 0;
    if (winner === "civils" && p.role === "civil") pts = POINTS.civil;
    else if (winner === "undercover" && p.role === "undercover") pts = POINTS.undercover;
    else if (winner === "mrwhite" && p.role === "mrwhite") pts = POINTS.mrwhite;
    gains[p.name] = pts;
    scores[p.name] = (scores[p.name] || 0) + pts;
  }
  saveScores(scores);
  return gains;
}

function scoreboardHTML(highlight = []) {
  const scores = loadScores();
  const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) return `<p class="hint">Aucun score pour l'instant. Jouez une partie !</p>`;
  const medals = ["🥇", "🥈", "🥉"];
  return `<div class="recap">
    ${rows.map(([name, pts], i) => `
      <div class="recap-row ${highlight.includes(name) ? "glow" : ""}">
        <span>${medals[i] || "🏅"} ${name}</span>
        <span class="recap-word">${pts} pt${pts > 1 ? "s" : ""}</span>
      </div>`).join("")}
  </div>`;
}

function normalize(s) {
  return s.trim().toLowerCase().replaceAll("&", "et")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// ---------- Écrans ----------

function showHome() {
  quitBtn.hidden = true;
  hostSay("welcome");
  screen.innerHTML = `
    <h1 class="title">UNDERCOVER</h1>
    <p class="subtitle">Le jeu de l'imposteur — animé par Sunny ${HOST.emoji}</p>
    <button class="btn btn-primary" id="btn-start">Nouvelle partie</button>
    <button class="btn btn-ghost" id="btn-scores">🏆 Scores</button>
    <details class="rules">
      <summary>📖 Règles rapides</summary>
      <ul>
        <li>Les <b>Civils</b> ont tous le même mot. L'<b>Undercover</b> a un mot proche mais différent. <b>Mr White</b> n'a aucun mot.</li>
        <li>À tour de rôle, chacun décrit son mot sans le dire.</li>
        <li>Après discussion, on vote pour éliminer un joueur.</li>
        <li>Les Civils gagnent en éliminant tous les imposteurs. L'Undercover gagne s'il survit. Mr White gagne s'il devine le mot des Civils.</li>
      </ul>
    </details>`;
  $("#btn-start").onclick = showSetup;
  $("#btn-scores").onclick = showScores;
}

function showScores() {
  hostSay("scores");
  screen.innerHTML = `
    <h2>🏆 Classement général</h2>
    ${scoreboardHTML()}
    <button class="btn btn-primary" id="btn-back">Retour</button>
    <button class="btn btn-ghost" id="btn-reset">Remettre les scores à zéro</button>`;
  $("#btn-back").onclick = showHome;
  $("#btn-reset").onclick = () => {
    if (confirm("Effacer tous les scores ?")) {
      localStorage.removeItem("uc_scores");
      showScores();
    }
  };
}

function showSetup() {
  hostSay("setup");
  const themeBoxes = THEMES.map(
    (t) => `<label class="chip"><input type="checkbox" value="${t.id}" checked>
      <span>${t.emoji} ${t.name}</span></label>`
  ).join("");
  screen.innerHTML = `
    <h2>Configuration</h2>
    <div class="field">
      <label>Nombre de joueurs</label>
      <div class="counter">
        <button class="btn-round" id="minus">−</button>
        <span id="count">4</span>
        <button class="btn-round" id="plus">+</button>
      </div>
    </div>
    <div class="field">
      <label>Nombre d'Undercover</label>
      <div class="counter">
        <button class="btn-round" id="uc-minus">−</button>
        <span id="uc-count">1</span>
        <button class="btn-round" id="uc-plus">+</button>
      </div>
      <p class="hint" id="uc-hint"></p>
    </div>
    <div class="field" id="mrwhite-field">
      <label class="chip chip-wide"><input type="checkbox" id="mrwhite"> <span>👻 Ajouter Mr White (5-6 joueurs)</span></label>
    </div>
    <div class="field">
      <div class="themes-header">
        <label>Thèmes</label>
        <div class="theme-actions">
          <button class="btn-mini" id="btn-all">Tout cocher</button>
          <button class="btn-mini" id="btn-none">Tout décocher</button>
        </div>
      </div>
      <div class="chips">${themeBoxes}</div>
    </div>
    <button class="btn btn-primary" id="btn-next">Suivant</button>
    <button class="btn btn-ghost" id="btn-back">Retour</button>`;

  let count = 4;
  let ucCount = 1;
  const mrwhiteInput = $("#mrwhite");
  // les civils (porteurs du même mot) doivent rester plus nombreux que les Undercover ;
  // Mr White joue son propre jeu et ne compte pas dans la force des Undercover
  const maxUC = () => Math.max(1, Math.ceil((count - (mrwhiteInput.checked ? 1 : 0)) / 2) - 1);
  const refresh = () => {
    $("#count").textContent = count;
    const allowMW = count >= 5;
    mrwhiteInput.disabled = !allowMW;
    if (!allowMW) mrwhiteInput.checked = false;
    $("#mrwhite-field").style.opacity = allowMW ? 1 : 0.4;
    ucCount = Math.min(ucCount, maxUC());
    $("#uc-count").textContent = ucCount;
    $("#uc-hint").textContent = maxUC() === 1
      ? "1 seul Undercover possible avec cette configuration."
      : `De 1 à ${maxUC()} Undercover (les civils restent majoritaires).`;
  };
  $("#minus").onclick = () => { count = Math.max(3, count - 1); refresh(); };
  $("#plus").onclick = () => { count = Math.min(6, count + 1); refresh(); };
  $("#uc-minus").onclick = () => { ucCount = Math.max(1, ucCount - 1); refresh(); };
  $("#uc-plus").onclick = () => { ucCount = Math.min(maxUC(), ucCount + 1); refresh(); };
  mrwhiteInput.onchange = refresh;
  refresh();

  const setAllThemes = (checked) =>
    document.querySelectorAll(".chips input").forEach((c) => (c.checked = checked));
  $("#btn-all").onclick = () => setAllThemes(true);
  $("#btn-none").onclick = () => setAllThemes(false);

  $("#btn-back").onclick = showHome;
  $("#btn-next").onclick = () => {
    const themes = [...document.querySelectorAll(".chips input:checked")].map((c) => c.value);
    if (themes.length === 0) { alert("Choisis au moins un thème !"); return; }
    state.themes = themes;
    state.useMrWhite = mrwhiteInput.checked;
    state.undercoverCount = ucCount;
    showNames(count);
  };
}

function showNames(count) {
  const inputs = Array.from({ length: count }, (_, i) =>
    `<input class="input" placeholder="Joueur ${i + 1}" maxlength="14" data-idx="${i}">`
  ).join("");
  screen.innerHTML = `
    <h2>Qui joue ?</h2>
    <div class="names">${inputs}</div>
    <button class="btn btn-primary" id="btn-go">C'est parti !</button>
    <button class="btn btn-ghost" id="btn-back">Retour</button>`;
  $("#btn-back").onclick = showSetup;
  $("#btn-go").onclick = () => {
    const names = [...document.querySelectorAll(".names input")].map(
      (inp, i) => inp.value.trim() || `Joueur ${i + 1}`
    );
    // noms uniques (sinon votes et scores se mélangent)
    const seen = new Set();
    const unique = names.map((n) => {
      let name = n, k = 2;
      while (seen.has(name)) name = `${n} ${k++}`;
      seen.add(name);
      return name;
    });
    startGame(unique);
  };
}

function pickPair() {
  const pool = [];
  for (const t of THEMES) {
    if (!state.themes.includes(t.id)) continue;
    for (const p of t.pairs) {
      const key = t.id + ":" + p.join("|");
      if (!state.usedPairs.has(key)) pool.push({ key, pair: p });
    }
  }
  if (pool.length === 0) {
    // toutes les paires vues : on réinitialise
    for (const t of THEMES) if (state.themes.includes(t.id))
      for (const p of t.pairs) state.usedPairs.delete(t.id + ":" + p.join("|"));
    return pickPair();
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  state.usedPairs.add(chosen.key);
  localStorage.setItem("uc_used", JSON.stringify([...state.usedPairs]));
  return chosen.pair;
}

function startGame(names) {
  const pair = shuffle(pickPair()); // côté civil / undercover aléatoire
  state.pair = pair;
  state.civilWord = pair[0];
  state.round = 0;
  state.revealIndex = 0;

  const roles = Array(state.undercoverCount).fill("undercover");
  if (state.useMrWhite) roles.push("mrwhite");
  while (roles.length < names.length) roles.push("civil");
  const shuffledRoles = shuffle(roles);

  state.players = names.map((name, i) => {
    const role = shuffledRoles[i];
    return {
      name,
      role,
      word: role === "civil" ? pair[0] : role === "undercover" ? pair[1] : null,
      alive: true,
    };
  });
  quitBtn.hidden = false;
  showReveal();
}

function showReveal() {
  const p = state.players[state.revealIndex];
  hostSay("passPhone", { name: p.name });
  screen.innerHTML = `
    <h2>📱 Passe le téléphone</h2>
    <p class="big-name">${p.name}</p>
    <button class="btn btn-primary" id="btn-me">C'est moi !</button>`;
  $("#btn-me").onclick = () => {
    if (p.role === "mrwhite") hostSay("mrWhiteReveal");
    else hostSay("beforeReveal");
    const content = p.role === "mrwhite"
      ? `<p class="word mrwhite">👻 Tu es <b>Mr White</b></p><p class="hint">Tu n'as pas de mot. Écoute, bluffe, survis !</p>`
      : `<p class="word">${p.word}</p><p class="hint">Retiens-le et ne le dis jamais à voix haute.</p>`;
    screen.innerHTML = `
      <h2>${p.name}</h2>
      <div class="card hidden-card" id="card">
        <p class="hint tap-hint">👆 Appuie pour révéler</p>
        <div class="card-content" style="display:none">${content}</div>
      </div>
      <button class="btn btn-primary" id="btn-done" disabled>J'ai retenu ✔</button>`;
    const card = $("#card");
    card.onclick = () => {
      const c = card.querySelector(".card-content");
      const hint = card.querySelector(".tap-hint");
      const shown = c.style.display !== "none";
      c.style.display = shown ? "none" : "block";
      hint.style.display = shown ? "block" : "none";
      $("#btn-done").disabled = false;
    };
    $("#btn-done").onclick = () => {
      state.revealIndex++;
      if (state.revealIndex < state.players.length) showReveal();
      else showDiscussion();
    };
  };
}

function speakingOrder() {
  let order = shuffle(state.players.filter((p) => p.alive));
  // Mr White ne parle jamais en premier
  if (order[0].role === "mrwhite" && order.length > 1) {
    order.push(order.shift());
  }
  return order;
}

function showDiscussion() {
  state.round++;
  hostSay("discussion");
  const order = speakingOrder();
  screen.innerHTML = `
    <h2>Ronde ${state.round} — Descriptions</h2>
    <p class="hint">Dans cet ordre, chacun décrit son mot :</p>
    <ol class="order">${order.map((p) => `<li>${p.name}</li>`).join("")}</ol>
    <button class="btn btn-primary" id="btn-vote">Passer au vote 🗳️</button>`;
  $("#btn-vote").onclick = showVote;
}

function showVote() {
  hostSay("vote");
  const alive = state.players.filter((p) => p.alive);
  screen.innerHTML = `
    <h2>🗳️ Qui éliminez-vous ?</h2>
    <div class="vote-grid">
      ${alive.map((p) => `<button class="btn btn-vote" data-name="${p.name}">${p.name}</button>`).join("")}
    </div>
    <button class="btn btn-ghost" id="btn-skip">Égalité — personne n'est éliminé</button>`;
  document.querySelectorAll(".btn-vote").forEach((b) => {
    b.onclick = () => eliminate(b.dataset.name);
  });
  $("#btn-skip").onclick = showDiscussion;
}

function eliminate(name) {
  const p = state.players.find((x) => x.name === name);
  p.alive = false;
  screen.innerHTML = `
    <h2>Élimination</h2>
    <p class="big-name">${p.name}</p>
    <div class="card hidden-card" id="card">
      <p class="hint tap-hint">👆 Appuie pour révéler son rôle</p>
      <div class="card-content" style="display:none"></div>
    </div>
    <button class="btn btn-primary" id="btn-next" style="display:none">Continuer</button>`;
  const card = $("#card");
  card.onclick = () => {
    card.onclick = null;
    card.querySelector(".tap-hint").style.display = "none";
    const c = card.querySelector(".card-content");
    c.style.display = "block";
    if (p.role === "civil") {
      c.innerHTML = `<p class="word">😇 Civil</p>`;
      hostSay("elimCivil", { name: p.name });
    } else if (p.role === "undercover") {
      c.innerHTML = `<p class="word bad">🕵️ Undercover</p>`;
      hostSay("elimUndercover", { name: p.name });
    } else {
      c.innerHTML = `<p class="word mrwhite">👻 Mr White</p>`;
      hostSay("elimMrWhite", { name: p.name });
    }
    const btn = $("#btn-next");
    btn.style.display = "block";
    btn.onclick = () => {
      if (p.role === "mrwhite") showMrWhiteGuess(p, /*fromElimination*/ true);
      else checkEnd();
    };
  };
}

function showMrWhiteGuess(p, fromElimination) {
  hostSay("mrWhiteGuess");
  screen.innerHTML = `
    <h2>👻 Mr White — ${p.name}</h2>
    <p class="hint">Quel était le mot des Civils ?</p>
    <input class="input" id="guess" placeholder="Ta réponse…" autocomplete="off">
    <button class="btn btn-primary" id="btn-guess">Valider</button>`;
  $("#btn-guess").onclick = () => {
    const guess = $("#guess").value;
    if (normalize(guess) === normalize(state.civilWord)) {
      hostSay("mrWhiteWin");
      showEnd("mrwhite");
    } else {
      hostSay("mrWhiteFail");
      screen.innerHTML = `
        <h2>Raté !</h2>
        <p class="hint">« ${guess || "…"} » — ce n'était pas ça.</p>
        <button class="btn btn-primary" id="btn-next">Continuer</button>`;
      $("#btn-next").onclick = () => (fromElimination ? checkEnd() : showEnd("civils"));
    }
  };
}

function checkEnd() {
  const alive = state.players.filter((p) => p.alive);
  const ucAlive = alive.filter((p) => p.role === "undercover");
  const mwAlive = alive.filter((p) => p.role === "mrwhite");
  const civilsAlive = alive.filter((p) => p.role === "civil");

  if (ucAlive.length === 0 && mwAlive.length === 0) { showEnd("civils"); return; }
  // Les Undercover gagnent quand ils égalent tous les autres survivants
  // (Mr White joue son propre jeu mais compte comme un survivant face à eux)
  if (ucAlive.length > 0 && civilsAlive.length + mwAlive.length <= ucAlive.length) { showEnd("undercover"); return; }
  // Seul Mr White face aux civils à égalité : dernière chance de deviner
  if (ucAlive.length === 0 && civilsAlive.length <= mwAlive.length) {
    showMrWhiteGuess(mwAlive[0], false);
    return;
  }
  showDiscussion();
}

function showEnd(winner) {
  if (winner === "civils") hostSay("winCivils");
  else if (winner === "undercover") hostSay("winUndercovers");
  // (mrwhite : la réplique de victoire est déjà affichée)

  const banners = {
    civils: "😇 Les Civils gagnent !",
    undercover: state.undercoverCount > 1 ? "🕵️ Les Undercover gagnent !" : "🕵️ L'Undercover gagne !",
    mrwhite: "👻 Mr White gagne !",
  };
  const roleLabel = { civil: "😇 Civil", undercover: "🕵️ Undercover", mrwhite: "👻 Mr White" };
  const gains = awardPoints(winner);
  const winners = state.players.filter((p) => gains[p.name] > 0).map((p) => p.name);
  screen.innerHTML = `
    <h1 class="title small">${banners[winner]}</h1>
    <div class="recap">
      ${state.players.map((p) => `
        <div class="recap-row ${p.alive ? "" : "dead"}">
          <span>${p.name}</span>
          <span>${roleLabel[p.role]}</span>
          <span class="recap-word">${p.word ?? "—"}</span>
          <span class="gain">${gains[p.name] > 0 ? `+${gains[p.name]} pts` : ""}</span>
        </div>`).join("")}
    </div>
    <h2>🏆 Classement</h2>
    ${scoreboardHTML(winners)}
    <button class="btn btn-primary" id="btn-replay">Rejouer (mêmes joueurs)</button>
    <button class="btn btn-ghost" id="btn-home">Accueil</button>`;
  $("#btn-replay").onclick = () => {
    hostSay("playAgain");
    startGame(state.players.map((p) => p.name));
  };
  $("#btn-home").onclick = showHome;
}

showHome();
