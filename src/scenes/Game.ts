import { Scene } from 'phaser';
import { Global } from '../Global';
import { GridSprites } from '../GridSprites';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    gridWidth: number;
    gridHeight: number;
    gridSprites: GridSprites;
    grid: number[][] = [];


    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background').setScale(1.7);
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(Global.SCREEN_CENTER_X, 20,
            'Watch disciple before they hide.\nMove lines and columns.\nSummon a group of disciples\nand overwhelm evil.',
            {
                fontFamily: Global.FONT_FAMILY,
                fontSize: Global.FONT_SIZE, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5, 0);

        // Set Grid size
        this.gridWidth = 6;
        this.gridHeight = 6;

        // Set the seed
        Phaser.Math.RND.init("1");
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.grid[x][y] = Phaser.Math.Between(0, 6);
            }
        }
        this.logGrid();

        this.gridSprites = new GridSprites(this.gridWidth, this.gridHeight);
        this.gridSprites.create(this, this.grid, this.OnGridChanged.bind(this));

        if (this.input.keyboard) {
            this.input.keyboard.addKey('ESC').on('down', () => {
                this.scene.start('GameOver');
            });
        }
    }

    OnGridChanged(changeHorizontal: boolean, i: number, value: number) {
        console.log(`OnGridChanged(${changeHorizontal}, ${i}, ${value})`);
        if (value != 0) {
            //console.log(`OnGridChanged() value=${value}`);
            let line: number[] = [];
            if (changeHorizontal) {
                for (let x = 0; x < this.gridWidth; x++) {
                    line.push(this.grid[x][i]);
                }
                for (let x = 0; x < this.gridWidth; x++) {
                    this.grid[x][i] = line[(10 * this.gridWidth + x - value) % this.gridWidth];
                }
            }
            else {
                for (let y = 0; y < this.gridHeight; y++) {
                    line.push(this.grid[i][y]);
                }
                for (let y = 0; y < this.gridHeight; y++) {
                    this.grid[i][y] = line[(10 * this.gridHeight + y - value) % this.gridHeight];
                }
            }

            this.logGrid();
        }
    }

    logGrid() {
        let test = "";
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                test += this.grid[x][y] + " ";
            }
            test += "\n";
        }
        console.log(test);
    }
}