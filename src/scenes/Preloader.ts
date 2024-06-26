import { Scene } from 'phaser';
import { Global } from '../Global';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background')
            .setScale(Global.SCREEN_WIDTH / 8, 1.7)
            .setAlpha(0.5);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(Global.SCREEN_CENTER_X - 230, Global.SCREEN_CENTER_Y, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('logo2', 'logo2.png');

        this.load.image('help1', 'help1.png');
        this.load.image('help2', 'help2.png');
        this.load.image('help3', 'help3.png');

        this.load.image('button', 'button.png');

        this.load.spritesheet('characters', 'characters.png', { frameWidth: 80, frameHeight: 80 });

        this.load.audio('button', 'button.wav');
        this.load.audio('countdown', 'countdown.wav');
        this.load.audio('drag_end', 'drag_end.wav');
        this.load.audio('drag_start', 'drag_start.wav');
        this.load.audio('game_lost', 'game_lost.wav');
        this.load.audio('game_won', 'game_won.wav');
        this.load.audio('kill_evil', 'kill_evil.wav');
        this.load.audio('show_all', 'show_all.wav');
        this.load.audio('start_game', 'start_game.wav');
        this.load.audio('summon_runes', 'summon_runes.wav');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
