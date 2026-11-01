/* Configuracoes e progresso do jogador, salvos no navegador (localStorage) */
GDC.Settings = {
  data: { master: 0.8, music: true, sfx: true, hints: true, unlocked: 1, stars: {} },

  load() {
    try {
      const raw = window.localStorage.getItem('gdc_settings');
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* sem localStorage: segue com os padroes */ }
  },

  save() {
    try { window.localStorage.setItem('gdc_settings', JSON.stringify(this.data)); } catch (e) { /* ignora */ }
  },

  unlock(levelNumber) {
    if (levelNumber > this.data.unlocked) { this.data.unlocked = levelNumber; this.save(); }
  },
};
