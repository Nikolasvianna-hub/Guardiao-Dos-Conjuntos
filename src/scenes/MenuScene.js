class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { W, H } = GDC;

    // fundo cobrindo a tela
    const bg = this.add.image(W / 2, H / 2, 'menu_scene');
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    const s = bg.scaleX;

    // mago em cima do penhasco, à esquerda da torre
    const wiz = this.add.image(
      W / 2 + (135 - bg.width / 2) * s,
      H / 2 + (536 - bg.height / 2) * s,
      'wizard_idle'
    ).setOrigin(0.5, 1);
    wiz.setScale((130 / wiz.height) * s);

    GDC.UI.title(this, W / 2, 62, 'GUARDIÃO\nDOS CONJUNTOS', 26);

    const items = [
      ['JOGAR', 'icon_play'], ['OPÇÕES', 'icon_gear'],
      ['ESTUDOS', 'icon_book'], ['SAIR', 'icon_door'],
    ];
    items.forEach(([label, icon], i) => {
      GDC.UI.button(this, W / 2, 600 + i * 96, label, {
        icon: icon,
        onClick: () => {
          if (i === 0) GDC.UI.goTo(this, 'GameScene');
          if (i === 1) this.showOptions();
          if (i === 2) this.showStudies();
          if (i === 3) this.showExit();
        },
      });
    });
  }

  showOptions() {
    this.showPanel('OPÇÕES', 'Som e música podem ser ligados ou desligados. As escolhas ficam salvas neste aparelho.', [
      {
        label: `EFEITOS: ${GDC.Settings.data.sfx ? 'LIGADOS' : 'DESLIGADOS'}`,
        onClick: (button) => {
          GDC.Settings.data.sfx = !GDC.Settings.data.sfx;
          GDC.Settings.save();
          button.setLabel(`EFEITOS: ${GDC.Settings.data.sfx ? 'LIGADOS' : 'DESLIGADOS'}`);
        },
      },
      {
        label: `MÚSICA: ${GDC.Settings.data.music ? 'LIGADA' : 'DESLIGADA'}`,
        onClick: (button) => {
          GDC.Settings.data.music = !GDC.Settings.data.music;
          GDC.Settings.save();
          GDC.Audio.apply();
          button.setLabel(`MÚSICA: ${GDC.Settings.data.music ? 'LIGADA' : 'DESLIGADA'}`);
        },
      },
    ]);
  }

  showStudies() {
    this.showPanel('GUIA DE ESTUDOS', [
      'CARDINALIDADE: conte os elementos do conjunto.',
      'DOIS CONJUNTOS: |A uniao B| = |A| + |B| - |A intersecao B|.',
      'TRES CONJUNTOS: some os tamanhos, subtraia as intersecoes duas a duas e some a intersecao tripla.',
      'VENN: A intersecao B e a parte comum; A intersecao B complementar fica em A, fora de B.',
    ].join('\n\n'), []);
  }

  showExit() {
    this.showPanel('SAIR DO JOGO', 'O jogo fica aberto nesta aba. Feche a página do navegador quando quiser sair.', []);
  }

  showPanel(title, body, actions) {
    const { W, H } = GDC;
    if (this.panel) this.panel.destroy(true);
    this.panel = this.add.container(0, 0).setDepth(10);
    const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x050713, 0.88).setInteractive();
    const card = this.add.rectangle(W / 2, H / 2, 492, 630, 0x151a3c, 1).setStrokeStyle(4, GDC.C.gold);
    const heading = GDC.UI.title(this, W / 2, 205, title, 18);
    const content = this.add.text(W / 2, 385, body, {
      fontFamily: GDC.FONT_BODY,
      fontSize: '19px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 7,
      wordWrap: { width: 410 },
    }).setOrigin(0.5);
    this.panel.add([shade, card, heading, content]);

    const positions = actions.length > 1 ? [490, 585] : [575];
    actions.forEach((action, index) => {
      const button = GDC.UI.button(this, W / 2, positions[index], action.label, {
        width: 390,
        height: 74,
        fontSize: 13,
        onClick: () => action.onClick(button),
      });
      this.panel.add(button);
    });

    const close = GDC.UI.button(this, W / 2, 720, 'VOLTAR', {
      width: 300,
      height: 68,
      fontSize: 13,
      icon: 'icon_close',
      onClick: () => {
        this.panel.destroy(true);
        this.panel = null;
      },
    });
    this.panel.add(close);
  }
}