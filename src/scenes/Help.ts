import { Scene } from 'phaser';
import { Global } from '../Global';

export class Help extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    indexPage = 0;
    helpPage1: Phaser.GameObjects.Image;
    helpPage2: Phaser.GameObjects.Image;
    helpPage3: Phaser.GameObjects.Image;

    constructor() {
        super('Help');
    }

    create() {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background').setScale(1.7);
        this.background.setAlpha(0.5);

        const buttonPreviousX = Global.SCREEN_CENTER_X - 200;
        const buttonNextX = Global.SCREEN_CENTER_X + 200;
        const buttonY = Global.SCREEN_CENTER_Y * 2 - 200;

        const buttonBackX = Global.SCREEN_CENTER_X - 200;
        const buttonBackY = Global.SCREEN_CENTER_Y * 2 - 60;

        const imageHelpX = Global.SCREEN_CENTER_X;
        const imageHelpY = Global.SCREEN_CENTER_Y - 120;

        this.helpPage1 = this.add.image(imageHelpX, imageHelpY, 'help1');
        this.helpPage2 = this.add.image(imageHelpX, imageHelpY, 'help2');
        this.helpPage3 = this.add.image(imageHelpX, imageHelpY, 'help3');
        this.changePage(0);

        this.add.nineslice(buttonPreviousX, buttonY, 'button', 0, 200, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => this.changePage(-1));
        this.add.text(buttonPreviousX, buttonY, 'Previous', Global.MENU_STYLE).setOrigin(0.5);

        this.add.nineslice(buttonNextX, buttonY, 'button', 0, 200, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => this.changePage(1));
        this.add.text(buttonNextX, buttonY, 'Next', Global.MENU_STYLE).setOrigin(0.5);

        this.add.nineslice(buttonBackX, buttonBackY, 'button', 0, 200, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => this.scene.start('MainMenu'));
        this.add.text(buttonBackX, buttonBackY, 'Back', Global.MENU_STYLE).setOrigin(0.5);
    }

    changePage(inc: number) {
        this.indexPage = Math.min(Math.max(this.indexPage + inc, 0), 2);
        this.helpPage1.setVisible(this.indexPage == 0);
        this.helpPage2.setVisible(this.indexPage == 1);
        this.helpPage3.setVisible(this.indexPage == 2);
    }
}
