const GDC_QUESTIONS = [
  {
    type: 'CARDINALIDADE',
    prompt: 'A = {2, 4, 6, 8}. Qual e |A|?',
    hint: 'Dica: cardinalidade e a quantidade de elementos do conjunto.',
    options: ['3 elementos', '4 elementos', '5 elementos', '8 elementos'],
    answer: '4 elementos',
  },
  {
    type: 'INCLUSAO-EXCLUSAO',
    prompt: '|A| = 12, |B| = 9 e |A intersecao B| = 4. Quanto e |A uniao B|?',
    hint: '|A uniao B| = |A| + |B| - |A intersecao B|',
    options: ['13', '17', '21', '25'],
    answer: '17',
  },
  {
    type: 'TRES CONJUNTOS',
    prompt: '|A|=15, |B|=12, |C|=10; intersecoes duas a duas: 5, 4 e 3; intersecao tripla: 2. Quanto e |A uniao B uniao C|?',
    hint: 'Some os tres conjuntos, subtraia as intersecoes duas a duas e some a tripla.',
    options: ['25', '27', '29', '34'],
    answer: '27',
  },
  {
    type: 'DIAGRAMA DE VENN',
    prompt: 'A regiao azul esta dentro de A e fora de B. Qual expressao a representa?',
    region: 'a-only',
    hint: 'Leia o diagrama: azul pertence a A, mas nao pertence a B.',
    options: ['A intersecao B', 'A intersecao B complementar', 'A complementar intersecao B', '(A uniao B) complementar'],
    answer: 'A intersecao B complementar',
  },
  {
    type: 'PROBLEMA CONTEXTUALIZADO',
    prompt: 'Em uma turma, 30 gostam de matematica, 20 de fisica e 10 de ambas. Quantos gostam de pelo menos uma?',
    hint: '“Pelo menos uma” significa a uniao dos conjuntos.',
    options: ['30 alunos', '40 alunos', '50 alunos', '60 alunos'],
    answer: '40 alunos',
  },
  {
    type: 'CARDINALIDADE',
    prompt: 'C = {1, 3, 5, 7, 9, 11}. Qual e |C|?',
    options: ['5 elementos', '6 elementos', '7 elementos', '11 elementos'],
    answer: '6 elementos',
  },
  {
    type: 'INCLUSAO-EXCLUSAO',
    prompt: '|A| = 18, |B| = 14 e |A intersecao B| = 6. Quanto e |A uniao B|?',
    hint: 'Lembre-se de subtrair a intersecao, contada duas vezes.',
    options: ['20', '26', '32', '38'],
    answer: '26',
  },
  {
    type: 'TRES CONJUNTOS',
    prompt: '|A|=20, |B|=16, |C|=12; intersecoes duas a duas: 8, 6 e 4; intersecao tripla: 3. Quanto e |A uniao B uniao C|?',
    hint: 'Use o principio da inclusao e exclusao para tres conjuntos.',
    options: ['27', '30', '33', '45'],
    answer: '33',
  },
  {
    type: 'DIAGRAMA DE VENN',
    prompt: 'A regiao azul esta fora dos dois circulos. Qual expressao a representa?',
    region: 'outside',
    hint: 'Fora de A e de B equivale ao complementar da uniao.',
    options: ['A intersecao B', 'A uniao B', 'A intersecao B complementar', '(A uniao B) complementar'],
    answer: '(A uniao B) complementar',
  },
  {
    type: 'PROBLEMA CONTEXTUALIZADO',
    prompt: '28 alunos gostam de futebol, 22 de musica e 9 gostam dos dois. Quantos gostam de pelo menos uma dessas atividades?',
    hint: 'Some os grupos e desconte quem foi contado nas duas atividades.',
    options: ['41 alunos', '50 alunos', '59 alunos', '31 alunos'],
    answer: '41 alunos',
  },
];

const GDC_DRAW_CHALLENGES = [
  { type: 'SIMBOLO DE UNIAO', prompt: 'Desenhe um U para representar a uniao.', symbol: 'U', gesture: 'u' },
  { type: 'SIMBOLO DE INTERSECAO', prompt: 'Desenhe ∩ para representar a intersecao.', symbol: '∩', gesture: 'cap' },
  { type: 'SIMBOLO DE UNIAO', prompt: 'Desenhe um U para representar A uniao B.', symbol: 'U', gesture: 'u' },
  { type: 'SIMBOLO DE INTERSECAO', prompt: 'Desenhe ∩ para representar A intersecao B.', symbol: '∩', gesture: 'cap' },
  { type: 'SIMBOLO DE UNIAO', prompt: 'Desenhe um U para representar a uniao dos conjuntos.', symbol: 'U', gesture: 'u' },
  { type: 'SIMBOLO DE INTERSECAO', prompt: 'Desenhe ∩ para representar a parte comum.', symbol: '∩', gesture: 'cap' },
];

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create(data = {}) {
    const { W, H } = GDC;
    this.mode = data.mode || 'timed';
    this.isDrawingMode = this.mode === 'draw';
    this.isTimedMode = this.mode !== 'relaxed';
    this.questions = this.isDrawingMode ? GDC_DRAW_CHALLENGES : GDC_QUESTIONS;
    GDC.Audio.playMusic(this, 'musicGame');
    const background = this.add.image(W / 2, H / 2, 'menu_scene');
    background.setScale(Math.max(W / background.width, H / background.height));
    background.setAlpha(0.42);
    this.add.rectangle(W / 2, H / 2, W, H, 0x080b1c, 0.74);

    this.roundIndex = 0;
    this.lives = 3;
    this.score = 0;
    this.active = false;
    this.answerLocked = false;
    this.enemyProgress = 0;
    this.roundDuration = 18;
    this.timeLeft = this.roundDuration;
    this.answerButtons = [];

    this.createHud();
    this.createEnemy();
    this.createControls();
    this.showIntro();
  }

  createHud() {
    const { W } = GDC;
    const heading = this.mode === 'draw'
      ? 'CONJURACAO DE SIMBOLOS'
      : this.mode === 'relaxed' ? 'QUIZ TRANQUILO' : 'DEFESA DO CASTELO';
    GDC.UI.title(this, W / 2, 34, heading, 15);
    this.statusText = this.add.text(28, 76, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '19px',
      color: '#ffffff',
    });
    this.waveText = this.add.text(W - 28, 76, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '19px',
      color: GDC.CSS.gold,
    }).setOrigin(1, 0);

    this.add.rectangle(W / 2, 128, 480, 14, 0x191d3a).setStrokeStyle(2, GDC.C.cyan);
    this.timerBar = this.add.rectangle(32, 128, 476, 8, GDC.C.cyan).setOrigin(0, 0.5);
    this.timerLabel = this.add.text(W / 2, 128, 'SEM TEMPO', {
      fontFamily: GDC.FONT,
      fontSize: '12px',
      color: GDC.CSS.cyan,
    }).setOrigin(0.5);
    this.timerBar.setVisible(this.isTimedMode);
    this.timerLabel.setVisible(!this.isTimedMode);

    this.add.rectangle(W / 2, 270, 500, 198, 0x10142f, 0.97)
      .setStrokeStyle(4, GDC.C.gold);
    this.typeText = this.add.text(W / 2, 194, '', {
      fontFamily: GDC.FONT,
      fontSize: '12px',
      color: GDC.CSS.cyan,
      align: 'center',
    }).setOrigin(0.5);
    this.promptText = this.add.text(W / 2, 250, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '21px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: 450 },
    }).setOrigin(0.5);
    this.hintText = this.add.text(W / 2, 333, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '16px',
      color: GDC.CSS.gold,
      align: 'center',
      wordWrap: { width: 440 },
    }).setOrigin(0.5);

    this.castleLine = this.add.line(0, 0, 38, 588, W - 38, 588, GDC.C.gold, 0.9).setLineWidth(4);
    this.castleLabel = this.add.text(W / 2, 570, 'CASTELO', {
      fontFamily: GDC.FONT,
      fontSize: '12px',
      color: GDC.CSS.gold,
      backgroundColor: '#10142f',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(W / 2, this.isDrawingMode ? 650 : 620, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 480 },
    }).setOrigin(0.5);
    this.updateHud();
  }

  createEnemy() {
    const enemy = this.add.container(GDC.W / 2, 460);
    enemy.add([
      this.add.circle(-28, 2, 43, GDC.C.violet, 0.95),
      this.add.circle(25, 0, 44, GDC.C.violet, 0.95),
      this.add.circle(0, -25, 42, 0x443083, 1),
      this.add.circle(0, 0, 25, GDC.C.red, 1).setStrokeStyle(4, 0x120e2c),
      this.add.ellipse(0, 0, 9, 31, 0x140d26, 1),
      this.add.circle(-7, -9, 5, 0xffffff, 0.95),
    ]);
    this.enemy = enemy;
    this.tweens.add({
      targets: enemy,
      scale: { from: 0.97, to: 1.04 },
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createControls() {
    const { W } = GDC;
    if (this.isDrawingMode) {
      this.createDrawingControls();
    } else {
      this.addAnswerButton(145, 700, 0);
      this.addAnswerButton(W - 145, 700, 1);
      this.addAnswerButton(145, 800, 2);
      this.addAnswerButton(W - 145, 800, 3);
    }
    this.createActionButton(W / 2, 919, 210, 54, 'MENU', () => this.goToMenu(), GDC.C.slate);
  }

  createDrawingControls() {
    const { W } = GDC;
    this.castleLine.setVisible(false);
    this.castleLabel.setVisible(false);
    this.drawZone = new Phaser.Geom.Rectangle(50, 386, W - 100, 174);
    this.drawPad = this.add.rectangle(W / 2, 473, W - 88, 184, 0x10142f, 0.92)
      .setStrokeStyle(3, GDC.C.cyan)
      .setInteractive({ useHandCursor: false });
    this.guideSymbolText = this.add.text(W / 2, 474, '', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '112px',
      color: GDC.CSS.cyan,
    }).setOrigin(0.5).setAlpha(0.2);
    this.drawGraphics = this.add.graphics().setDepth(5);
    this.drawingHint = this.add.text(W / 2, 586, 'Desenhe com um traco e toque em CONJURAR.', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.createActionButton(145, 710, 230, 82, 'CONJURAR', () => this.submitDrawing(), GDC.C.slate);
    this.createActionButton(W - 145, 710, 230, 82, 'LIMPAR', () => this.clearDrawing(), GDC.C.slate);
    this.drawPad.on('pointerdown', (pointer) => this.startDrawing(pointer));
    this.input.on('pointermove', (pointer) => this.continueDrawing(pointer));
    this.input.on('pointerup', () => this.finishDrawing());
    this.input.on('pointerupoutside', () => this.finishDrawing());
  }

  addAnswerButton(x, y, optionIndex) {
    const button = this.createActionButton(x, y, 238, 82, '', () => this.answer(optionIndex), 0x252b5a);
    button.text.setFontSize('18px');
    button.text.setWordWrapWidth(208);
    this.answerButtons.push(button);
  }

  createActionButton(x, y, width, height, label, onClick, color) {
    const container = this.add.container(x, y);
    const shape = this.add.rectangle(0, 0, width, height, color, 0.98)
      .setStrokeStyle(3, GDC.C.gold);
    const text = this.add.text(0, 0, label, {
      fontFamily: GDC.FONT_BODY,
      fontSize: '19px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 28 },
      lineSpacing: 2,
    }).setOrigin(0.5);
    container.add([shape, text]);
    shape.setInteractive({ useHandCursor: true });
    shape.on('pointerover', () => shape.setFillStyle(0x39427a));
    shape.on('pointerout', () => shape.setFillStyle(color));
    shape.on('pointerdown', () => shape.setFillStyle(0x4b5592));
    shape.on('pointerup', () => {
      shape.setFillStyle(color);
      GDC.Audio.sfx(this, 'sfxClick');
      onClick();
    });
    container.setButtonEnabled = (enabled) => {
      if (enabled) shape.setInteractive({ useHandCursor: true });
      else shape.disableInteractive();
      container.setAlpha(enabled ? 1 : 0.55);
    };
    container.text = text;
    return container;
  }

  startDrawing(pointer) {
    if (!this.isDrawingMode || !this.active || this.answerLocked) return;
    if (!this.drawZone.contains(pointer.worldX, pointer.worldY)) return;
    this.isDrawingStroke = true;
    this.gesturePoints = [{ x: pointer.worldX, y: pointer.worldY }];
    this.drawingHint.setText('TRACO INICIADO');
    this.drawGraphics.clear();
    this.drawGraphics.lineStyle(12, GDC.C.gold, 1);
    this.drawGraphics.beginPath();
    this.drawGraphics.moveTo(pointer.worldX, pointer.worldY);
  }

  continueDrawing(pointer) {
    if (!this.isDrawingStroke) return;
    if (!pointer.isDown) return;
    const previous = this.gesturePoints[this.gesturePoints.length - 1];
    const point = { x: pointer.worldX, y: pointer.worldY };
    if (Phaser.Math.Distance.Between(previous.x, previous.y, point.x, point.y) < 3) return;
    this.gesturePoints.push(point);
    this.drawingHint.setText(`TRACO: ${this.gesturePoints.length} PONTOS`);
    this.drawGraphics.lineTo(point.x, point.y);
    this.drawGraphics.strokePath();
    this.drawGraphics.beginPath();
    this.drawGraphics.moveTo(point.x, point.y);
  }

  finishDrawing() {
    if (!this.isDrawingStroke) return;
    this.isDrawingStroke = false;
    this.drawGraphics.strokePath();
  }

  clearDrawing() {
    this.gesturePoints = [];
    this.drawGraphics.clear();
    this.drawingHint.setText('Desenhe com um traco e toque em CONJURAR.');
    this.feedbackText.setText('');
  }

  submitDrawing() {
    if (!this.active || this.answerLocked) return;
    if (!this.gesturePoints || this.gesturePoints.length < 8) {
      this.feedbackText.setColor(GDC.CSS.gold).setText('Desenhe o simbolo na area antes de conjurar.');
      return;
    }
    if (this.recognizeGesture(this.gesturePoints, this.currentQuestion.gesture)) {
      this.resolveCorrectAnswer();
      return;
    }
    this.clearDrawing();
    this.missAnswer('O traco nao correspondeu ao simbolo. O Paradoxo avancou!');
  }

  recognizeGesture(points, expected) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 45 || height < 55 || width / height < 0.35) return false;

    const normalized = points.map((point) => ({
      x: (point.x - minX) / width,
      y: (point.y - minY) / height,
    }));
    const first = normalized[0];
    const last = normalized[normalized.length - 1];
    const endpointGap = Math.abs(first.x - last.x);
    if (endpointGap < 0.5) return false;

    if (expected === 'u') {
      const bottomIndex = normalized.reduce((best, point, index, list) => (
        point.y > list[best].y ? index : best
      ), 0);
      return first.y < 0.42 && last.y < 0.42 && normalized[bottomIndex].y > 0.68
        && bottomIndex > normalized.length * 0.18 && bottomIndex < normalized.length * 0.82;
    }

    const topIndex = normalized.reduce((best, point, index, list) => (
      point.y < list[best].y ? index : best
    ), 0);
    return first.y > 0.58 && last.y > 0.58 && normalized[topIndex].y < 0.34
      && topIndex > normalized.length * 0.18 && topIndex < normalized.length * 0.82;
  }

  showIntro() {
    const { W, H } = GDC;
    this.introOverlay = this.add.container(0, 0).setDepth(20);
    const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x050713, 0.88).setInteractive();
    const card = this.add.rectangle(W / 2, 478, 488, 510, 0x151a3c, 1)
      .setStrokeStyle(4, GDC.C.gold);
    const title = GDC.UI.title(this, W / 2, 280, 'O REINO PRECISA\nDE VOCE', 20);
    const story = this.add.text(W / 2, 405,
      'O Paradoxo quer apagar o Grande Diagrama de Venn. Resolva os enigmas antes que as criaturas alcancem o castelo.', {
        fontFamily: GDC.FONT_BODY,
        fontSize: '21px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 410 },
      }).setOrigin(0.5);
    const guide = this.add.text(W / 2, 570,
      'Toque na resposta correta. Cada erro custa uma vida. O primeiro desafio tem uma dica.', {
        fontFamily: GDC.FONT_BODY,
        fontSize: '18px',
        color: GDC.CSS.cyan,
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: 410 },
      }).setOrigin(0.5);
    const start = this.createActionButton(W / 2, 690, 300, 76, 'COMEÇAR', () => {
      this.introOverlay.destroy(true);
      this.introOverlay = null;
      this.startQuestion();
    }, GDC.C.slate);
    this.introOverlay.add([shade, card, title, story, guide, start]);
  }

  startQuestion() {
    const question = this.questions[this.roundIndex];
    if (!question) {
      this.showEnd(true);
      return;
    }
    this.currentQuestion = question;
    this.answerLocked = false;
    this.active = true;
    this.roundDuration = this.mode === 'draw' ? 22 : this.roundIndex < 5 ? 18 : 14;
    this.timeLeft = this.roundDuration;
    this.enemyProgress = 0;
    this.enemy.setPosition(GDC.W / 2, 460).setScale(1).setAlpha(1).setAngle(0);
    this.typeText.setText(question.type);
    this.promptText.setY(this.isDrawingMode ? 238 : question.region ? 228 : 260).setText(question.prompt);
    this.hintText.setText(this.isDrawingMode
      ? 'Desenhe com o dedo ou mouse e toque em CONJURAR.'
      : question.hint || '');
    this.hintText.setY(question.region ? 338 : 334);
    this.drawVenn(question.region);
    if (this.isDrawingMode) {
      this.guideSymbolText.setText(question.symbol);
      this.clearDrawing();
    } else {
      question.options.forEach((option, index) => {
        this.answerButtons[index].text.setText(option);
        this.answerButtons[index].setButtonEnabled(true);
      });
    }
    this.feedbackText.setText('');
    this.updateHud();
  }

  drawVenn(region) {
    if (this.venn) {
      this.venn.destroy(true);
      this.venn = null;
    }
    if (!region) return;

    const group = this.add.container(0, 0).setDepth(2);
    const outside = region === 'outside';
    const base = this.add.rectangle(270, 310, 430, 86, outside ? GDC.C.cyan : 0x0b102b, 0.95);
    const circleA = this.add.circle(238, 310, 43, outside ? GDC.C.indigo : GDC.C.cyan, 0.95);
    const circleB = this.add.circle(302, 310, 43, GDC.C.violet, 0.98);
    const labelA = this.add.text(213, 258, 'A', { fontFamily: GDC.FONT, fontSize: '13px', color: '#ffffff' });
    const labelB = this.add.text(312, 258, 'B', { fontFamily: GDC.FONT, fontSize: '13px', color: '#ffffff' });
    group.add([base, circleA, circleB, labelA, labelB]);
    this.venn = group;
  }

  answer(optionIndex) {
    if (!this.active || this.answerLocked) return;
    const selected = this.currentQuestion.options[optionIndex];
    if (selected === this.currentQuestion.answer) {
      this.resolveCorrectAnswer();
      return;
    }

    this.missAnswer('Resposta incorreta. O inimigo avancou e o castelo perdeu uma vida.');
  }

  resolveCorrectAnswer() {
    this.answerLocked = true;
    this.active = false;
    this.score += 100 + Math.floor(this.isTimedMode ? this.timeLeft * 4 : 0);
    this.feedbackText.setColor(GDC.CSS.cyan).setText('ACERTOU! O feitico protegeu o castelo.');
    this.answerButtons.forEach((button) => button.setButtonEnabled(false));
    GDC.Audio.sfx(this, 'sfxClick');
    this.spawnSpellBurst();
    this.tweens.add({ targets: this.statusText, scale: 1.08, duration: 130, yoyo: true });
    this.tweens.add({
      targets: this.enemy,
      scale: 0.15,
      alpha: 0,
      angle: 90,
      duration: 450,
      ease: 'Back.easeIn',
    });
    this.updateHud();
    this.time.delayedCall(750, () => {
      this.roundIndex += 1;
      this.startQuestion();
    });
  }

  spawnSpellBurst() {
    const centerX = this.enemy.x;
    const centerY = this.enemy.y;
    for (let index = 0; index < 8; index += 1) {
      const angle = Phaser.Math.DegToRad(index * 45);
      const sparkle = this.add.image(centerX, centerY, index % 2 ? 'sparkle_small' : 'sparkle_big')
        .setScale(0.08)
        .setAlpha(0.9)
        .setDepth(6);
      this.tweens.add({
        targets: sparkle,
        x: centerX + Math.cos(angle) * 92,
        y: centerY + Math.sin(angle) * 92,
        scale: index % 2 ? 0.2 : 0.14,
        alpha: 0,
        angle: 150,
        duration: 520,
        ease: 'Cubic.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  missAnswer(message) {
    if (!this.active || this.answerLocked) return;
    this.answerLocked = true;
    this.lives -= 1;
    this.enemyProgress = Math.min(0.72, this.enemyProgress + 0.23);
    this.timeLeft = Math.max(6, this.roundDuration * 0.65);
    this.feedbackText.setColor(GDC.CSS.red).setText(message);
    this.updateHud();
    if (this.lives <= 0) {
      this.active = false;
      this.time.delayedCall(650, () => this.showEnd(false));
      return;
    }
    this.time.delayedCall(700, () => {
      this.answerLocked = false;
      this.feedbackText.setText('Tente novamente antes que ele alcance o castelo.');
    });
  }

  update(_, delta) {
    if (!this.active) return;
    if (!this.isTimedMode) {
      this.enemy.setY(460 + this.enemyProgress * 118);
      return;
    }
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.missAnswer('O tempo acabou. O inimigo avancou e o castelo perdeu uma vida.');
    }
    const elapsed = 1 - this.timeLeft / this.roundDuration;
    const progress = Math.min(0.96, this.enemyProgress + elapsed * 0.18);
    this.enemy.setY(460 + progress * 118);
    this.timerBar.setScale(476 * Phaser.Math.Clamp(this.timeLeft / this.roundDuration, 0, 1) / 476, 1);
    this.timerBar.setFillStyle(this.timeLeft < 5 ? GDC.C.red : GDC.C.cyan);
  }

  updateHud() {
    this.statusText.setText(`VIDAS ${this.lives}     PONTOS ${String(this.score).padStart(4, '0')}`);
    this.waveText.setText(`DESAFIO ${Math.min(this.roundIndex + 1, this.questions.length)}/${this.questions.length}`);
  }

  showEnd(victory) {
    this.active = false;
    this.answerLocked = true;
    GDC.Audio.sfx(this, victory ? 'sfxVictory' : 'sfxBack');
    this.endOverlay = this.add.container(0, 0).setDepth(30);
    const shade = this.add.rectangle(GDC.W / 2, GDC.H / 2, GDC.W, GDC.H, 0x050713, 0.9).setInteractive();
    const card = this.add.rectangle(GDC.W / 2, 475, 488, 470, 0x151a3c, 1).setStrokeStyle(4, GDC.C.gold);
    const title = this.add.container(0, 0);
    title.add([
      GDC.UI.title(this, GDC.W / 2, 310, victory ? 'CASTELO' : 'O CASTELO', 22),
      GDC.UI.title(this, GDC.W / 2, 350, victory ? 'SALVO!' : 'CAIU', 22),
    ]);
    const result = this.add.text(GDC.W / 2, 490,
      victory ? 'Voce resolveu os 10 desafios e protegeu o reino.' : 'Suas vidas acabaram. Revise as formulas e tente outra vez.', {
        fontFamily: GDC.FONT_BODY,
        fontSize: '21px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 410 },
      }).setOrigin(0.5);
    const score = this.add.text(GDC.W / 2, 580, `PONTUACAO: ${this.score}`, {
      fontFamily: GDC.FONT,
      fontSize: '13px',
      color: GDC.CSS.gold,
    }).setOrigin(0.5);
    const again = this.createActionButton(GDC.W / 2, 675, 300, 72, 'JOGAR NOVAMENTE', () => this.scene.restart(), GDC.C.slate);
    const menu = this.createActionButton(GDC.W / 2, 770, 300, 72, 'VOLTAR AO MENU', () => this.goToMenu(), GDC.C.slate);
    this.endOverlay.add([shade, card, title, result, score, again, menu]);
  }

  goToMenu() {
    GDC.Audio.sfx(this, 'sfxBack');
    GDC.UI.goTo(this, 'MenuScene');
  }
}