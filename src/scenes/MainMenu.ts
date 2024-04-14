import { Scene, GameObjects } from 'phaser';
import { Global } from '../Global';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background').setScale(1.7);

        this.logo = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'logo');

        this.title = this.add.text(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y + 160, 'Main Menu', {
            fontFamily: Global.FONT_FAMILY, fontSize: Global.FONT_SIZE, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}
