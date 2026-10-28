/* Música e efeitos. Se o arquivo de áudio não existir, simplesmente não toca. */
GDC.Audio = {
  music: null,
  musicKey: null,
  musicEvent: null,
  musicOwner: null,
  musicStep: 0,

  playMusic(scene, key) {
    if (!scene.cache.audio.exists(key)) {
      if (this.musicKey === key && this.musicEvent && this.musicOwner === scene) return;
      if (this.music) {
        this.music.stop();
        this.music.destroy();
        this.music = null;
      }
      if (this.musicEvent) this.musicEvent.remove();
      this.musicKey = key;
      this.musicOwner = scene;
      this.musicStep = 0;
      const menus = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46,
        523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33];
      const game = [392, 493.88, 587.33, 493.88, 349.23, 440, 523.25, 440,
        392, 493.88, 587.33, 698.46, 659.25, 587.33, 493.88, 440];
      const melody = key === 'musicGame' ? game : menus;
      const bass = key === 'musicGame' ? [98, 130.81, 87.31, 110] : [130.81, 174.61, 110, 146.83];
      this.musicEvent = scene.time.addEvent({
        delay: 210,
        loop: true,
        callback: () => {
          if (!GDC.Settings.data.music) return;
          const step = this.musicStep % melody.length;
          this.playTone(scene, melody[step], 0.045, key === 'musicGame' ? 'triangle' : 'square', 0.035 * GDC.Settings.data.master);
          if (step % 4 === 0) this.playTone(scene, bass[Math.floor(step / 4) % bass.length], 0.055, 'triangle', 0.045 * GDC.Settings.data.master);
          this.musicStep += 1;
        },
      });
      return;
    }
    if (this.musicEvent) {
      this.musicEvent.remove();
      this.musicEvent = null;
    }
    this.musicOwner = scene;
    if (this.music && this.musicKey === key) { this.apply(); return; }
    const previous = this.music;
    this.music = scene.sound.add(key, { loop: true, volume: 0 });
    this.musicKey = key;
    this.music.play();
    scene.tweens.add({
      targets: this.music,
      volume: GDC.Settings.data.music ? GDC.Settings.data.master * 0.35 : 0,
      duration: 450,
    });
    if (previous) {
      scene.tweens.add({
        targets: previous,
        volume: 0,
        duration: 300,
        onComplete: () => { previous.stop(); previous.destroy(); },
      });
    }
  },

  apply() {
    const s = GDC.Settings.data;
    const m = this.music;
    if (!m) return;
    m.setVolume(s.music ? s.master * 0.35 : 0);
    if (s.music) {
      if (m.isPaused) m.resume();
      else if (!m.isPlaying) m.play();
    } else if (m.isPlaying) {
      m.pause();
    }
  },

  sfx(scene, key) {
    const s = GDC.Settings.data;
    if (!s.sfx) return;
    if (scene.cache.audio.exists(key)) {
      scene.sound.play(key, { volume: s.master });
      return;
    }

    const notes = key === 'sfxVictory'
      ? [523.25, 659.25, 783.99]
      : key === 'sfxBack' ? [440, 329.63] : [659.25];
    notes.forEach((frequency, index) => {
      scene.time.delayedCall(index * 90, () => this.playTone(
        scene,
        frequency,
        0.09,
        'square',
        0.12 * s.master,
      ));
    });
  },

  playTone(scene, frequency, duration, type, volume = 0.035) {
    const context = scene.sound.context;
    if (!context || context.state === 'suspended') return;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  },
};
