/* Musica e efeitos gerados no navegador (sem arquivos de audio, tudo leve).
   Trilha em suingue estilo anos 30, combinando com o visual de desenho animado. */
GDC.Audio = {
  musicEvent: null, musicKey: null, step: 0,

  playMusic(scene, key) {
    if (this.musicKey === key && this.musicEvent) return;
    if (this.musicEvent) this.musicEvent.remove();
    this.musicKey = key; this.step = 0;
    const lead = key === 'game'
      ? [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88, 440, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 392]
      : [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33];
    const bass = key === 'game' ? [110, 146.83, 98, 130.81] : [130.81, 174.61, 110, 146.83];
    this.snd = scene.sound;
    const tick = () => {
      if (this.musicKey !== key) return;
      const ctxScene = { sound: this.snd };
      const s = GDC.Settings.data;
      if (s.music) {
        const i = this.step % lead.length;
        this.tone(ctxScene, lead[i], 0.16, 'triangle', 0.05 * s.master);
        if (i % 2 === 0) this.tone(ctxScene, bass[Math.floor(i / 4) % bass.length], 0.22, 'sine', 0.07 * s.master);
        if (i % 4 === 2) this.tone(ctxScene, lead[i] / 2, 0.08, 'square', 0.012 * s.master);
      }
      this.step++;
      // suingue: tempos longo e curto alternados
      this.musicEvent = { remove: ((id) => () => clearTimeout(id))(setTimeout(tick, this.step % 2 ? 240 : 150)) };
    };
    this.musicEvent = { remove: ((id) => () => clearTimeout(id))(setTimeout(tick, 100)) };
  },
  stop() { if (this.musicEvent) this.musicEvent.remove(); this.musicEvent = null; this.musicKey = null; },
  apply() { /* a musica le GDC.Settings a cada nota */ },

  SFX: {
    click:   [[659.25, 0.07, 'triangle']],
    back:    [[440, 0.07, 'triangle'], [329.63, 0.09, 'triangle']],
    jump:    [[392, 0.07, 'sine'], [587.33, 0.09, 'sine']],
    land:    [[110, 0.06, 'sine']],
    cast:    [[880, 0.06, 'sawtooth'], [1174.66, 0.1, 'sine']],
    collect: [[783.99, 0.07, 'triangle'], [1046.5, 0.12, 'triangle']],
    right:   [[659.25, 0.08, 'triangle'], [830.61, 0.08, 'triangle'], [1046.5, 0.16, 'triangle']],
    wrong:   [[220, 0.14, 'sawtooth'], [164.81, 0.22, 'sawtooth']],
    hurt:    [[196, 0.12, 'sawtooth'], [130.81, 0.2, 'sawtooth']],
    door:    [[523.25, 0.1, 'triangle'], [659.25, 0.1, 'triangle'], [783.99, 0.1, 'triangle'], [1046.5, 0.25, 'triangle']],
    win:     [[523.25, 0.12, 'triangle'], [659.25, 0.12, 'triangle'], [783.99, 0.12, 'triangle'], [1046.5, 0.3, 'triangle']],
    crumble: [[130.81, 0.18, 'sawtooth']],
  },
  sfx(scene, key) {
    const s = GDC.Settings.data;
    if (!s.sfx) return;
    const seq = this.SFX[key] || this.SFX.click;
    let t = 0;
    seq.forEach(([f, d, type]) => {
      scene.time.delayedCall(t, () => this.tone(scene, f, d, type, 0.13 * s.master));
      t += d * 1000 * 0.8;
    });
  },

  tone(scene, frequency, duration, type, volume) {
    const context = scene.sound && scene.sound.context;
    if (!context || context.state === 'suspended') return;
    const start = context.currentTime;
    const o = context.createOscillator(), g = context.createGain();
    o.type = type; o.frequency.setValueAtTime(frequency, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    o.connect(g); g.connect(context.destination);
    o.start(start); o.stop(start + duration + 0.02);
  },
};
