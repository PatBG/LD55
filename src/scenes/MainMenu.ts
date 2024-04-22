import { Scene, GameObjects } from 'phaser';
import { Global } from '../Global';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    buttonSound: Phaser.Sound.BaseSound;
    textPlay: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.buttonSound = this.sound.add('button');

        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background')
            .setScale(Global.SCREEN_WIDTH / 8, 1.7)
            .setAlpha(0.5);

        this.add.text(Global.SCREEN_CENTER_X, 20,
            "RUNES SUMMONER\n\n"
            + "LudumDare#55\nApril 14, 2024\nTheme: Summoning\n\n"
            + "(post-jam version)\nby PatBG", Global.MENU_STYLE)
            .setOrigin(0.5, 0);

        this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'logo2')
            .setScale(0.6);

        const buttonX = Global.SCREEN_CENTER_X;
        const button2X = 280;
        const button1Y = Global.SCREEN_CENTER_Y + 250;
        const button2Y = button1Y + 150;

        this.add.nineslice(buttonX, button1Y, 'button', 0, 400, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => { this.buttonSound.play(); this.scene.start('Game') });
        this.textPlay = this.add.text(buttonX, button1Y, '', Global.MENU_STYLE).setOrigin(0.5);
        this.refreshPlayButton();

        if (Global.maxLevel > 1) {
            // Next level button
            this.add.nineslice(buttonX - button2X, button1Y, 'button', 0, 100, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onPreviousLevel());
            this.add.text(buttonX - button2X, button1Y, '<', Global.MENU_STYLE).setOrigin(0.5);
            // Previous level button
            this.add.nineslice(buttonX + button2X, button1Y, 'button', 0, 100, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onNextLevel());
            this.add.text(buttonX + button2X, button1Y, '>', Global.MENU_STYLE).setOrigin(0.5);
        }

        this.add.nineslice(buttonX, button2Y, 'button', 0, 400, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => { this.buttonSound.play(); this.scene.start('Help') });
        this.add.text(buttonX, button2Y, 'Help', Global.MENU_STYLE).setOrigin(0.5);

        this.add.image(Global.SCREEN_WIDTH - 20, Global.SCREEN_HEIGHT - 20, 'logo')
            .setOrigin(1)
            .setScale(0.4)
            .setInteractive()
            .on('pointerup', () => { window.open('https://phaser.io/') });
    }

    onPreviousLevel() {
        if (Global.level > 1) {
            this.buttonSound.play();
            Global.level--;
            this.refreshPlayButton();
        }
    }

    onNextLevel() {
        if (Global.level < Global.maxLevel) {
            this.buttonSound.play();
            Global.level++;
            this.refreshPlayButton();
        }
    }

    refreshPlayButton() {
        let text = "Play";
        if (Global.maxLevel > 1) {
            text = `Play Level ${Global.level} / ${Global.maxLevel}`;
        }
        this.textPlay.setText(text);
    }
}
