import { Scene } from 'phaser';
import { Global } from '../Global';
import { GridSprites } from '../GridSprites';

enum GamePhase {
    PreGame = 1,
    ShowAll,
    MoveAndSummon,
    Retry,
    NextLevel
}


export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gridWidth: number;
    gridHeight: number;
    gridSprites: GridSprites;
    grid: number[][] = [];

    rnd = new Phaser.Math.RandomDataGenerator();
    level: number = 1;
    levelPhase = GamePhase.PreGame;

    titleLevel: Phaser.GameObjects.Text;
    menuPreGame: Phaser.GameObjects.Container;
    menuShowAll: Phaser.GameObjects.Container;
    menuMoveAndSummon: Phaser.GameObjects.Container;
    menuRetry: Phaser.GameObjects.Container;
    menuNextLevel: Phaser.GameObjects.Container;

    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background').setScale(1.7);
        this.background.setAlpha(0.5);

        // Set Grid size
        this.gridWidth = 6;
        this.gridHeight = 6;

        this.gridSprites = new GridSprites(this.gridWidth, this.gridHeight);
        this.gridSprites.create(this, null, this.onGridChanged.bind(this));

        this.createMenus();

        if (this.input.keyboard) {
            this.input.keyboard.addKey('ESC').on('down', () => {
                this.scene.start('GameOver');
            });
            this.input.keyboard.addKey('T').on('down', () => {
                this.levelPhase = 1 + this.levelPhase % 5;
                this.applyPhase();
            });
        }

        this.applyPhase();
    }

    update(_time: number, _delta: number): void {
    }

    createMenus() {
        const menuStyle = {
            fontFamily: Global.FONT_FAMILY,
            fontSize: Global.FONT_SIZE, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }
        const menuY = 100 - Global.SCREEN_CENTER_Y;
        const buttonY = 420;

        this.titleLevel = this.add.text(Global.SCREEN_CENTER_X, 20, `Level ${this.level}`, menuStyle)
            .setOrigin(0.5, 0);

        this.menuPreGame = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuPreGame.add(
            this.add.text(0, menuY, 'Prepare to show all.', menuStyle)
                .setOrigin(0.5, 0)
        );
        this.menuPreGame.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onButtonPreGame())
        );
        this.menuPreGame.add(
            this.add.text(0, buttonY,
                'Show all (limited time)',
                menuStyle
            ).setOrigin(0.5)
        );

        this.menuShowAll = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuShowAll.add(
            this.add.text(0, menuY, 'Look at disciples positions\nbefore they hide.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuShowAll.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onButtonShowAll()));
        this.menuShowAll.add(
            this.add.text(0, buttonY,
                'Start game.',
                menuStyle
            ).setOrigin(0.5)
        );

        this.menuMoveAndSummon = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuMoveAndSummon.add(
            this.add.text(0, menuY, 'Move rows and columns\nto overwhelm evil.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuMoveAndSummon.add(
            this.add.text(0, 300, 'Summon a group of disciples', menuStyle)
                .setOrigin(0.5, 0));
        for (let i = 1; i <= 6; i++) {
            this.menuMoveAndSummon.add(
                this.add.sprite(-82 * 4 + i * 82, 420, 'characters', i)
                    .setOrigin(0)
                    .setInteractive()
                    .on('pointerup', () => this.onButtonSummon(i)));
        }

        this.menuRetry = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuRetry.add(
            this.add.text(0, menuY, 'You lost.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuRetry.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onButtonRetry()));
        this.menuRetry.add(
            this.add.text(0, buttonY, 'Retry this level.', menuStyle)
                .setOrigin(0.5)
        );

        this.menuNextLevel = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuNextLevel.add(
            this.add.text(0, menuY, 'You have won.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuNextLevel.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => this.onButtonNextLevel()));
        this.menuNextLevel.add(
            this.add.text(0, buttonY, 'Go to next level.', menuStyle)
                .setOrigin(0.5)
        );
    }

    applyPhase() {
        console.log(`ApplyPhase() level=${this.level} levelPhase=${GamePhase[this.levelPhase]}`);
        switch (this.levelPhase) {
            case GamePhase.PreGame:
                this.initLevel();
                this.displayOnlyDemons();
                break;
            case GamePhase.ShowAll:
                this.gridSprites.update(this.grid);         // Display all
                break;
            case GamePhase.MoveAndSummon:
                this.displayOnlyDemons();
                this.gridSprites.setDragActive(true);
                break;
            case GamePhase.Retry:
                this.gridSprites.update(this.grid);         // Display all
                break;
            case GamePhase.NextLevel:
                this.gridSprites.update(this.grid);         // Display all
                break;
        }

        this.menuPreGame.setVisible(this.levelPhase == GamePhase.PreGame);
        this.menuShowAll.setVisible(this.levelPhase == GamePhase.ShowAll);
        this.menuMoveAndSummon.setVisible(this.levelPhase == GamePhase.MoveAndSummon);
        this.menuRetry.setVisible(this.levelPhase == GamePhase.Retry);
        this.menuNextLevel.setVisible(this.levelPhase == GamePhase.NextLevel);
    }

    displayOnlyDemons() {
        const grid2: number[][] = [];
        for (let x = 0; x < this.gridWidth; x++) {
            grid2[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                grid2[x][y] = (this.grid[x][y] == 0) ? 0 : 7;
            }
        }
        this.gridSprites.update(grid2);
    }

    initLevel() {
        console.log(`initLevel() level=${this.level}`);
        // Initialize the random seed with the level number
        this.rnd.init([`${this.level}`]);
        let nbDemons = Math.min(this.level, 6);

        const totalSize = this.gridWidth * this.gridHeight;
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                let isDemon = false;
                if (nbDemons > 0) {
                    const currentSize = this.gridWidth * y + x;
                    const remainingSize = totalSize - currentSize;
                    if (this.rnd.between(0, remainingSize) < (nbDemons * totalSize / remainingSize)) {
                        isDemon = true;
                        nbDemons--;
                    }
                }
                this.grid[x][y] = isDemon ? 0 : this.rnd.between(1, 6);
            }
        }
        this.logGrid();
    }

    onButtonPreGame() {
        this.titleLevel.setText(`Level ${this.level}`);
        this.levelPhase = GamePhase.ShowAll;
        this.applyPhase();
    }

    onButtonShowAll() {
        this.levelPhase = GamePhase.MoveAndSummon;
        this.applyPhase();
    }

    onButtonSummon(iDisciple: number) {
        this.gridSprites.setDragActive(false);

        console.log(`summonDisciples(${iDisciple})`);
        // check horizontal
        for (let x = 0; x < this.gridWidth - 2; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] == iDisciple && this.grid[x + 1][y] == 0 && this.grid[x + 2][y] == iDisciple) {
                    console.log(`summonDisciples() found horizontal match at x=${x} y=${y}`);
                    this.grid[x + 1][y] = iDisciple;
                    this.gridSprites.update(this.grid);
                }
            }
        }
        // check vertical
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight - 2; y++) {
                if (this.grid[x][y] == iDisciple && this.grid[x][y + 1] == 0 && this.grid[x][y + 2] == iDisciple) {
                    console.log(`summonDisciples() found vertical match at x=${x} y=${y}`);
                    this.grid[x][y + 1] = iDisciple;
                    this.gridSprites.update(this.grid);
                }
            }
        }
        // Check victory condition
        let victory = true;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] == 0) {
                    victory = false;
                }
            }
        }
        this.levelPhase = victory ? GamePhase.NextLevel : GamePhase.Retry;
        this.applyPhase();
    }

    onButtonRetry() {
        this.levelPhase = GamePhase.PreGame;
        this.applyPhase();
    }

    onButtonNextLevel() {
        this.level++;
        this.levelPhase = GamePhase.PreGame;
        this.applyPhase();
    }

    onGridChanged(changeHorizontal: boolean, i: number, value: number) {
        // console.log(`OnGridChanged(${changeHorizontal}, ${i}, ${value})`);
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
        // console.log(test);
    }
}