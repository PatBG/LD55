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
    buttonSound: Phaser.Sound.BaseSound;
    countdownSound: Phaser.Sound.BaseSound;
    gameLostSound: Phaser.Sound.BaseSound;
    gamewonSound: Phaser.Sound.BaseSound;
    killEvilSound: Phaser.Sound.BaseSound;
    showAllSound: Phaser.Sound.BaseSound;
    startGameSound: Phaser.Sound.BaseSound;
    summonRunesSound: Phaser.Sound.BaseSound;

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gridWidth: number;
    gridHeight: number;
    gridSprites: GridSprites;
    grid: number[][] = [];

    rnd = new Phaser.Math.RandomDataGenerator();
    level = 1;
    levelPhase = GamePhase.PreGame;

    titleLevel: Phaser.GameObjects.Text;
    menuPreGame: Phaser.GameObjects.Container;
    menuShowAll: Phaser.GameObjects.Container;
    menuMoveAndSummon: Phaser.GameObjects.Container;
    menuRetry: Phaser.GameObjects.Container;
    menuNextLevel: Phaser.GameObjects.Container;

    timerStart: Phaser.Time.TimerEvent;
    textStart: Phaser.GameObjects.Text;
    countdownStart: number;

    constructor() {
        super('Game');
    }

    create() {
        this.buttonSound = this.sound.add('button');
        this.countdownSound = this.sound.add('countdown');
        this.gameLostSound = this.sound.add('game_lost');
        this.gamewonSound = this.sound.add('game_won');
        this.killEvilSound = this.sound.add('kill_evil');
        this.showAllSound = this.sound.add('show_all');
        this.startGameSound = this.sound.add('start_game');
        this.summonRunesSound = this.sound.add('summon_runes');

        this.camera = this.cameras.main;

        this.background = this.add.image(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 'background')
            .setScale(Global.SCREEN_WIDTH / 8, 1.7)
            .setAlpha(0.5);

        // Set Grid size
        this.gridWidth = 6;
        this.gridHeight = 6;

        this.gridSprites = new GridSprites(this.gridWidth, this.gridHeight);
        this.gridSprites.create(this, null, this.onGridChanged.bind(this));

        this.createMenus();

        if (this.input.keyboard) {
            this.input.keyboard.addKey('T').on('down', () => {
                if (this.timerStart) {
                    this.timerStart.destroy();
                }
                this.level++;
                this.levelPhase = GamePhase.PreGame;
                this.applyPhase();
            });
        }

        this.applyPhase();
    }

    back() {
        if (this.timerStart) this.timerStart.destroy();
        this.level = 1;
        this.levelPhase = GamePhase.PreGame;
        this.scene.start('MainMenu');
    }

    update(_time: number, _delta: number): void {
    }

    createMenus() {
        const menuStyle = Global.MENU_STYLE;
        const menuY = 100 - Global.SCREEN_CENTER_Y;
        const buttonY = 420;
        const buttonBackX = Global.SCREEN_CENTER_X - 200;
        const buttonBackY = Global.SCREEN_CENTER_Y * 2 - 60;

        this.titleLevel = this.add.text(Global.SCREEN_CENTER_X, 20, `Level ${this.level}`, menuStyle)
            .setOrigin(0.5, 0);

        this.add.nineslice(buttonBackX, buttonBackY, 'button', 0, 200, 100, 30, 30, 30, 30)
            .setInteractive()
            .on('pointerup', () => { this.buttonSound.play(); this.back() });
        this.add.text(buttonBackX, buttonBackY, 'Back', menuStyle).setOrigin(0.5);

        this.menuPreGame = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuPreGame.add(
            this.add.text(0, menuY, 'Prepare to show all runes.', menuStyle)
                .setOrigin(0.5, 0)
        );
        this.menuPreGame.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => { this.showAllSound.play(); this.onButtonPreGame() })
        );
        this.menuPreGame.add(
            this.add.text(0, buttonY,
                'Show all runes (limited time)',
                menuStyle
            ).setOrigin(0.5)
        );

        this.menuShowAll = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuShowAll.add(
            this.add.text(0, menuY, 'Look at runes positions\nbefore they hide.', menuStyle)
                .setOrigin(0.5, 0)
        );
        this.menuShowAll.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => { this.startGameSound.play(); this.onButtonShowAll() })
        );
        this.textStart = this.add.text(0, buttonY, 'Start game.', menuStyle).setOrigin(0.5);
        this.menuShowAll.add(this.textStart);

        this.menuMoveAndSummon = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuMoveAndSummon.add(
            this.add.text(0, menuY, 'Move rows and columns\nto overwhelm evils.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuMoveAndSummon.add(
            this.add.text(0, 300, 'Summon a type of rune', menuStyle)
                .setOrigin(0.5, 0));
        for (let i = 1; i <= 6; i++) {
            this.menuMoveAndSummon.add(
                this.add.sprite(-82 * 4 + i * 82, 420, 'characters', i)
                    .setOrigin(0)
                    .setInteractive()
                    .on('pointerup', () => { this.summonRunesSound.play(); this.onButtonSummon(i) }));
        }

        this.menuRetry = this.add.container(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y);
        this.menuRetry.add(
            this.add.text(0, menuY, 'You lost.', menuStyle)
                .setOrigin(0.5, 0));
        this.menuRetry.add(
            this.add.nineslice(0, buttonY, 'button', 0, 600, 100, 30, 30, 30, 30)
                .setInteractive()
                .on('pointerup', () => { this.buttonSound.play(); this.onButtonRetry() }));
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
                .on('pointerup', () => { this.buttonSound.play(); this.onButtonNextLevel() }));
        this.menuNextLevel.add(
            this.add.text(0, buttonY, 'Go to next level.', menuStyle)
                .setOrigin(0.5)
        );
    }

    applyPhase() {
        // console.log(`ApplyPhase() level=${this.level} levelPhase=${GamePhase[this.levelPhase]}`);
        this.titleLevel.setText(`Level ${this.level}`);
        switch (this.levelPhase) {
            case GamePhase.PreGame:
                this.initLevel();
                this.displayGridFiltered([0]);              // Display only demons
                break;
            case GamePhase.ShowAll:
                this.gridSprites.update(this.grid);         // Display all
                break;
            case GamePhase.MoveAndSummon:
                this.displayGridFiltered([0]);              // Display only demons
                this.gridSprites.setDragActive(true);
                break;
            case GamePhase.Retry:
                this.gameLostSound.play();
                break;
            case GamePhase.NextLevel:
                this.gamewonSound.play();
                break;
        }

        this.menuPreGame.setVisible(this.levelPhase == GamePhase.PreGame);
        this.menuShowAll.setVisible(this.levelPhase == GamePhase.ShowAll);
        this.menuMoveAndSummon.setVisible(this.levelPhase == GamePhase.MoveAndSummon);
        this.menuRetry.setVisible(this.levelPhase == GamePhase.Retry);
        this.menuNextLevel.setVisible(this.levelPhase == GamePhase.NextLevel);
    }

    displayGridFiltered(filter: number[]) {
        const grid2: number[][] = [];
        for (let x = 0; x < this.gridWidth; x++) {
            grid2[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                grid2[x][y] = (filter.includes(this.grid[x][y])) ? this.grid[x][y] : 7;
            }
        }
        this.gridSprites.update(grid2);
    }

    initLevel() {
        // Initialize the random seed with the level number
        this.rnd.init([`ABC ${this.level}`]);
        let nbDemons = Math.min(Math.floor((this.level + 4) / 5), 4);
        // console.log(`initLevel() level=${this.level} nbDemons=${nbDemons}`);

        const totalSize = this.gridWidth * this.gridHeight;
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                let isDemon = false;
                if (nbDemons > 0) {
                    const currentSize = x * this.gridHeight + y;
                    const remainingSize = totalSize - currentSize;
                    // if (this.rnd.between(0, remainingSize) < (nbDemons * totalSize / remainingSize)) {
                    if (this.rnd.between(0, remainingSize) <= nbDemons) {
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
        this.levelPhase = GamePhase.ShowAll;
        this.applyPhase();

        this.countdownStart = this.coutdownByLevel(this.level);
        this.timerStart = this.time.addEvent({
            delay: 1000,
            loop: true,
            repeat: this.countdownStart,
            callback: () => { this.onTimerStart(); },
        });
        this.onTimerStart();
    }

    coutdownByLevel(level: number) {
        return Math.max(20, Math.floor(62 - level * 2));
    }

    onButtonShowAll() {
        if (this.timerStart) {
            this.timerStart.destroy();
        }
        this.levelPhase = GamePhase.MoveAndSummon;
        this.applyPhase();
    }

    onTimerStart() {
        if (this.countdownStart <= 5) {
            this.countdownSound.play({ volume: 0.2 });
        }
        this.textStart.setText(`Start game in ${this.countdownStart}`);
        this.countdownStart--;
        if (this.countdownStart < 0) {
            this.onButtonShowAll();
        }
    }

    async Pause(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async onButtonSummon(iDisciple: number) {
        this.gridSprites.setDragActive(false);

        // console.log(`summonDisciples(${iDisciple})`);

        this.displayGridFiltered([0, iDisciple]);
        await this.Pause(this.summonRunesSound.totalDuration * 1000 + 200);

        // check horizontal
        for (let x = 0; x < this.gridWidth - 2; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.grid[x][y] == iDisciple && this.grid[x + 1][y] == 0 && this.grid[x + 2][y] == iDisciple) {
                    // console.log(`summonDisciples() found horizontal match at x=${x} y=${y}`);
                    this.killEvilSound.play();
                    this.grid[x + 1][y] = iDisciple;
                    this.displayGridFiltered([0, iDisciple]);
                    await this.Pause(this.killEvilSound.totalDuration * 1000 + 200);
                }
            }
        }
        // check vertical
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight - 2; y++) {
                if (this.grid[x][y] == iDisciple && this.grid[x][y + 1] == 0 && this.grid[x][y + 2] == iDisciple) {
                    // console.log(`summonDisciples() found vertical match at x=${x} y=${y}`);
                    this.killEvilSound.play();
                    this.grid[x][y + 1] = iDisciple;
                    this.displayGridFiltered([0, iDisciple]);
                    await this.Pause(this.killEvilSound.totalDuration * 1000 + 200);
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