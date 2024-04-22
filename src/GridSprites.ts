import { Global } from "./Global";

export class GridSprites {
    scene: Phaser.Scene;

    dragEndSound: Phaser.Sound.BaseSound;
    dragStartSound: Phaser.Sound.BaseSound;

    dragCellX: number;
    dragCellY: number;
    prevDragX: number;
    prevDragY: number;
    dragDirection: boolean;
    dragHorizontal: boolean;

    readonly gridWidth: number;
    readonly gridHeight: number;
    readonly gridZoneCellSize = 82;
    readonly gridZoneX: number;
    readonly gridZoneY: number;
    sprites: Phaser.GameObjects.Sprite[][] = [];
    extraSprite: Phaser.GameObjects.Sprite | null = null;      // extra sprite for current scrolling row or column
    extraIndex: number = -1;                                   // index of the extra sprite

    gridZone: Phaser.GameObjects.Zone;

    mask: Phaser.Display.Masks.GeometryMask;

    readonly dragThreshold = 5;
    isDragActive = false;
    setDragActive(value: boolean) {
        this.isDragActive = value;
    }

    constructor(gridWidth: number, gridHeight: number) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gridZoneX = Global.SCREEN_CENTER_X - (this.gridWidth / 2) * this.gridZoneCellSize;
        this.gridZoneY = Global.SCREEN_CENTER_Y - (this.gridHeight / 2) * this.gridZoneCellSize;
    }

    create(scene: Phaser.Scene, grid: number[][] | null, onGridChanged: (changeHorizontal: boolean, i: number, value: number) => void) {
        this.scene = scene;

        this.dragEndSound = scene.sound.add('drag_end');
        this.dragStartSound = scene.sound.add('drag_start');

        this.gridZone = scene.add.zone(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 6 * this.gridZoneCellSize, 6 * this.gridZoneCellSize)
            .setInteractive({ draggable: true });

        const graphics = this.scene.make.graphics();
        graphics.fillRect(this.gridZoneX, this.gridZoneY, this.gridZone.width - 2, this.gridZone.height - 2);
        this.mask = new Phaser.Display.Masks.GeometryMask(this.scene, graphics);

        this.update(grid);

        this.gridZone.on('dragstart', (pointer: Phaser.Input.Pointer, gameobject: any) => this.onDragstart(pointer, gameobject));
        this.gridZone.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.onDrag(pointer, dragX, dragY));
        this.gridZone.on('dragend', (pointer: Phaser.Input.Pointer, gameobject: any) => this.onDragend(pointer, gameobject, onGridChanged));
    }

    update(grid: number[][] | null) {
        for (let x = 0; x < this.gridWidth; x++) {
            if (!this.sprites[x]) {
                this.sprites[x] = [];
            }
            for (let y = 0; y < this.gridHeight; y++) {
                const frame = (!grid) ? 7 : grid[x][y];
                if (!this.sprites[x][y] || this.sprites[x][y].frame.name != frame.toString()) {
                    // console.log(`update() x=${x} y=${y} grid[x][y]=${frame}`);
                    if (this.sprites[x][y]) {
                        this.sprites[x][y].destroy();
                    }
                    this.sprites[x][y] = this.scene.add.sprite(
                        this.gridZoneX + x * this.gridZoneCellSize, this.gridZoneY + y * this.gridZoneCellSize,
                        'characters', frame)
                        .setOrigin(0)
                        .setMask(this.mask);
                }
            }
        }
    }

    onDragstart(pointer: Phaser.Input.Pointer, _gameobject: any) {
        if (!this.isDragActive) return;

        this.dragStartSound.play();
        // console.log(`gridZone.on(dragstart) pointer x=${Math.round(pointer.x)} y=${Math.round(pointer.y)}`);
        this.prevDragX = this.gridZone.x;
        this.prevDragY = this.gridZone.y;
        //console.log(`gridZone.on(dragstart) prevDragX=${this.prevDragX} prevDragY=${this.prevDragY}`);
        this.dragCellX = Math.floor((pointer.x - (this.gridZone.x - this.gridZone.width / 2)) / this.gridZoneCellSize);
        this.dragCellY = Math.floor((pointer.y - (this.gridZone.y - this.gridZone.height / 2)) / this.gridZoneCellSize);
        //console.log(`gridZone.on(dragstart) dragCellX=${this.dragCellX} dragCellY=${this.dragCellY}`);
        this.dragDirection = false;
    }

    onDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        if (!this.isDragActive) return;

        // console.log(`gridZone.on(drag) dragX=${Math.round(dragX)} dragY=${Math.round(dragY)}`);
        const deltaX = dragX - this.prevDragX;
        const deltaY = dragY - this.prevDragY;
        if (!this.dragDirection) {                      // Determine drag direction
            if (Math.abs(deltaX) > this.dragThreshold || Math.abs(deltaY) > this.dragThreshold) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.dragDirection = true;
                    this.dragHorizontal = true;
                } else {
                    this.dragDirection = true;
                    this.dragHorizontal = false;
                }
                //console.log(`gridZone.on(drag) dragDirection=${this.dragDirection} dragHorizontal=${this.dragHorizontal} deltaX=${deltaX} deltaY=${deltaY}`);
            }
        }
        if (this.dragDirection) {
            let minI = -1;
            let minVal = Number.MAX_VALUE;
            let sprite: Phaser.GameObjects.Sprite | null = null;
            let xx = 0;
            let yy = 0;
            if (this.dragHorizontal) {
                for (let x = 0; x < this.gridWidth; x++) {
                    this.sprites[x][this.dragCellY].x = this.clipX(this.sprites[x][this.dragCellY].x + deltaX, this.gridZoneCellSize);
                    if (minVal > this.sprites[x][this.dragCellY].x) {
                        minVal = this.sprites[x][this.dragCellY].x;
                        minI = x;
                    }
                }
                if (this.extraIndex != minI) {              // Set or change the extra sprite
                    sprite = this.sprites[minI][this.dragCellY];
                    xx = this.gridZone.width;
                }
                else if (this.extraSprite) {                 // Move the extra sprite
                    this.extraSprite.x += deltaX;
                }
                this.prevDragX = dragX;
            }
            else {
                for (let y = 0; y < this.gridHeight; y++) {
                    this.sprites[this.dragCellX][y].y = this.clipY(this.sprites[this.dragCellX][y].y + deltaY, this.gridZoneCellSize);
                    if (minVal > this.sprites[this.dragCellX][y].y) {
                        minVal = this.sprites[this.dragCellX][y].y;
                        minI = y;
                    }
                }
                if (this.extraIndex != minI) {              // Set or change the extra sprite
                    sprite = this.sprites[this.dragCellX][minI];
                    yy = this.gridZone.height;
                }
                else if (this.extraSprite) {                 // Move the extra sprite
                    this.extraSprite.y += deltaY;
                }
                this.prevDragY = dragY;
            }
            if (this.extraIndex != minI && sprite) {          // Apply change to extra sprite
                this.extraIndex = minI;
                if (this.extraSprite) {
                    this.extraSprite.destroy();
                }
                this.extraSprite = this.scene.add.sprite(sprite.x + xx, sprite.y + yy, sprite.texture.key, sprite.frame.name)
                    .setOrigin(0)
                    .setMask(this.mask);
            }
            //console.log(`gridZone.on(drag) deltaX=${deltaX} deltaY=${deltaY}`);
            //console.log(`gridZone.on(drag) dragX=${dragX} dragY=${dragY}`);
        }
    }

    onDragend(_pointer: Phaser.Input.Pointer, _gameobject: any, onGridChanged: (changeHorizontal: boolean, i: number, value: number) => void) {
        if (!this.isDragActive) return;

        this.dragEndSound.play();
        const deltaCellX = Math.round((this.prevDragX - this.gridZone.x) / this.gridZoneCellSize);
        const deltaCellY = Math.round((this.prevDragY - this.gridZone.y) / this.gridZoneCellSize);
        // console.log(`gridZone.on(dragend) deltaCellX=${deltaCellX} deltaCellY=${deltaCellY}`);
        const roundedDragX = this.gridZone.x + deltaCellX * this.gridZoneCellSize;
        const roundedDragY = this.gridZone.y + deltaCellY * this.gridZoneCellSize;
        // console.log(`gridZone.on(dragend) roundedDragX=${roundedDragX} roundedDragX=${roundedDragY}`);
        if (this.dragDirection) {
            if (this.dragHorizontal) {
                let lineSprites: Phaser.GameObjects.Sprite[] = [];
                for (let x = 0; x < this.gridWidth; x++) {
                    lineSprites.push(this.sprites[x][this.dragCellY]);
                    lineSprites[lineSprites.length - 1].x = this.clipX(lineSprites[lineSprites.length - 1].x + roundedDragX - this.prevDragX, this.gridZoneCellSize / 2);
                }
                lineSprites = lineSprites.sort((a, b) => a.x - b.x);
                for (let x = 0; x < this.gridWidth; x++) {
                    this.sprites[x][this.dragCellY] = lineSprites[x];
                }
            }
            else {
                for (let y = 0; y < this.gridHeight; y++) {
                    this.sprites[this.dragCellX][y].y = this.clipY(this.sprites[this.dragCellX][y].y + roundedDragY - this.prevDragY, this.gridZoneCellSize / 2);
                }
                this.sprites[this.dragCellX] = this.sprites[this.dragCellX].sort((a, b) => a.y - b.y);
            }
            onGridChanged(this.dragHorizontal, this.dragHorizontal ? this.dragCellY : this.dragCellX, this.dragHorizontal ? deltaCellX : deltaCellY);
        }

        if (this.extraSprite) {
            this.extraSprite.destroy();
            this.extraSprite = null;
        }
    }

    clipX(x: number, dec: number): number {
        if (x <= this.gridZoneX - dec) {
            x += this.gridZone.width;
        }
        else if (x > this.gridZoneX + this.gridZone.width - dec) {
            x -= this.gridZone.width;
        }
        return x;
    }

    clipY(y: number, dec: number): number {
        if (y <= this.gridZoneY - dec) {
            y += this.gridZone.height;
        }
        else if (y > this.gridZoneY + this.gridZone.height - dec) {
            y -= this.gridZone.height;
        }
        return y;
    }
}