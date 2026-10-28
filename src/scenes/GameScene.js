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

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const { W, H } = GDC;
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
    GDC.UI.title(this, W / 2, 34, 'DEFESA DO CASTELO', 15);
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

    this.add.line(0, 0, 38, 588, W - 38, 588, GDC.C.gold, 0.9).setLineWidth(4);
    this.add.text(W / 2, 570, 'CASTELO', {
      fontFamily: GDC.FONT,
      fontSize: '12px',
      color: GDC.CSS.gold,
      backgroundColor: '#10142f',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(W / 2, 620, '', {
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
    this.addAnswerButton(145, 700, 0);
    this.addAnswerButton(W - 145, 700, 1);
    this.addAnswerButton(145, 800, 2);
    this.addAnswerButton(W - 145, 800, 3);
    this.createActionButton(W / 2, 919, 210, 54, 'MENU', () => this.goToMenu(), GDC.C.slate);
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
    const question = GDC_QUESTIONS[this.roundIndex];
    if (!question) {
      this.showEnd(true);
      return;
    }
    this.currentQuestion = question;
    this.answerLocked = false;
    this.active = true;
    this.roundDuration = this.roundIndex < 5 ? 18 : 14;
    this.timeLeft = this.roundDuration;
    this.enemyProgress = 0;
    this.enemy.setPosition(GDC.W / 2, 460).setScale(1).setAlpha(1).setAngle(0);
    this.typeText.setText(question.type);
    this.promptText.setY(question.region ? 228 : 260).setText(question.prompt);
    this.hintText.setText(question.hint || '');
    this.hintText.setY(question.region ? 338 : 334);
    this.drawVenn(question.region);
    question.options.forEach((option, index) => {
      this.answerButtons[index].text.setText(option);
      this.answerButtons[index].setButtonEnabled(true);
    });
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
      this.answerLocked = true;
      this.active = false;
      this.score += 100 + Math.floor(this.timeLeft * 4);
      this.feedbackText.setColor(GDC.CSS.cyan).setText('ACERTOU! O feitico protegeu o castelo.');
      this.answerButtons.forEach((button) => button.setButtonEnabled(false));
      GDC.Audio.sfx(this, 'sfxClick');
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
      return;
    }

    this.missAnswer('Resposta incorreta. O inimigo avancou e o castelo perdeu uma vida.');
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
    this.waveText.setText(`DESAFIO ${Math.min(this.roundIndex + 1, GDC_QUESTIONS.length)}/${GDC_QUESTIONS.length}`);
  }

  showEnd(victory) {
    this.active = false;
    this.answerLocked = true;
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
    GDC.UI.goTo(this, 'MenuScene');
  }
}