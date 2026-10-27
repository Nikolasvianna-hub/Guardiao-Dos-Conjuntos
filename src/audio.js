/* Música e efeitos. Se o arquivo de áudio não existir, simplesmente não toca. */
GDC.Audio = {
  music: null,

  playMusic(scene, key) {
    if (!scene.cache.audio.exists(key)) return;
    if (this.music && this.music.key === key) { this.apply(); return; }
    if (this.music) { this.music.stop(); this.music.destroy(); }
    this.music = scene.sound.add(key, { loop: true });
    this.apply();
  },

  apply() {
    const s = GDC.Settings.data;
    const m = this.music;
    if (!m) return;
    m.setVolume(s.master * 0.6);
    if (s.music) {
      if (m.isPaused) m.resume();
      else if (!m.isPlaying) m.play();
    } else if (m.isPlaying) {
      m.pause();
    }
  },

  sfx(scene, key) {
    const s = GDC.Settings.data;
    if (!s.sfx || !scene.cache.audio.exists(key)) return;
    scene.sound.play(key, { volume: s.master });
  },
};
