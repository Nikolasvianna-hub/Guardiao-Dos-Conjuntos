/* Configurações do jogador, salvas no navegador (localStorage) */
GDC.Settings = {
  data: { master: 0.8, music: true, sfx: true },

  load() {
    try {
      const raw = window.localStorage.getItem('gdc_settings');
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* sem localStorage: segue com os padrões */ }
  },

  save() {
    try {
      window.localStorage.setItem('gdc_settings', JSON.stringify(this.data));
    } catch (e) { /* ignora */ }
  },
};
