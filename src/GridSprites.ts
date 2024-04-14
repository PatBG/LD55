import { Global } from "./Global";

export class GridSprites {
    scene: Phaser.Scene;

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

    gridZone: Phaser.GameObjects.Zone;

    constructor(gridWidth: number, gridHeight: number) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gridZoneX = Global.SCREEN_CENTER_X - (this.gridWidth / 2) * this.gridZoneCellSize;
        this.gridZoneY = Global.SCREEN_CENTER_Y - (this.gridHeight / 2) * this.gridZoneCellSize;
    }

    create(scene: Phaser.Scene, grid: number[][], onGridChanged:(changeHorizontal: boolean, i: number, value: number) => void) {
        this.scene = scene;

        this.gridZone = scene.add.zone(Global.SCREEN_CENTER_X, Global.SCREEN_CENTER_Y, 6 * this.gridZoneCellSize, 6 * this.gridZoneCellSize)
            .setInteractive({ draggable: true });

        const graphics = this.scene.make.graphics();
        graphics.fillRect(this.gridZoneX, this.gridZoneY, this.gridZone.width - 2, this.gridZone.height - 2);
        const mask = new Phaser.Display.Masks.GeometryMask(this.scene, graphics);

        for (let x = 0; x < this.gridWidth; x++) {
            this.sprites[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.sprites[x][y] = this.scene.add.sprite(this.gridZoneX + x * this.gridZoneCellSize, this.gridZoneY + y * this.gridZoneCellSize,
                    'characters', grid[x][y]).setOrigin(0).setMask(mask);
            }
        }

        this.gridZone.on('dragstart', (pointer: Phaser.Input.Pointer, gameobject: any) => this.OnDragstart(pointer, gameobject));
        this.gridZone.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.OnDrag(pointer, dragX, dragY));
        this.gridZone.on('dragend', (pointer: Phaser.Input.Pointer, gameobject: any) => this.OnDragend(pointer, gameobject, onGridChanged));
    }

    OnDragstart(pointer: Phaser.Input.Pointer, _gameobject: any) {
        //console.log("--------------------");
        //console.log(`gridZone.on(dragstart) pointer x=${Math.round(pointer.x)} y=${Math.round(pointer.y)}`);
        this.prevDragX = this.gridZone.x;
        this.prevDragY = this.gridZone.y;
        //console.log(`gridZone.on(dragstart) prevDragX=${this.prevDragX} prevDragY=${this.prevDragY}`);
        this.dragCellX = Math.floor((pointer.x - (this.gridZone.x - this.gridZone.width / 2)) / this.gridZoneCellSize);
        this.dragCellY = Math.floor((pointer.y - (this.gridZone.y - this.gridZone.height / 2)) / this.gridZoneCellSize);
        //console.log(`gridZone.on(dragstart) dragCellX=${this.dragCellX} dragCellY=${this.dragCellY}`);
        this.dragDirection = false;
    }

    OnDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        //console.log(`gridZone.on(drag) dragX=${Math.round(dragX)} dragY=${Math.round(dragY)}`);
        const deltaX = dragX - this.prevDragX;
        const deltaY = dragY - this.prevDragY;
        if (!this.dragDirection) {
            if (deltaX != 0 && deltaY != 0) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.dragDirection = true;
                    this.dragHorizontal = true;
                } else {
                    this.dragDirection = true;
                    this.dragHorizontal = false;
                }
                //console.log(`gridZone.on(drag) dragDirection=${this.dragDirection} dragHorizontal=${this.dragHorizontal}`);
            }
        }
        if (this.dragDirection) {
            if (this.dragHorizontal) {
                for (let x = 0; x < this.gridWidth; x++) {
                    this.sprites[x][this.dragCellY].x = this.ClipX(this.sprites[x][this.dragCellY].x + deltaX);
                }
                this.prevDragX = dragX;
            }
            else {
                for (let y = 0; y < this.gridHeight; y++) {
                    this.sprites[this.dragCellX][y].y = this.ClipY(this.sprites[this.dragCellX][y].y + deltaY);
                }
                this.prevDragY = dragY;
            }
            //console.log(`gridZone.on(drag) deltaX=${deltaX} deltaY=${deltaY}`);
            //console.log(`gridZone.on(drag) dragX=${dragX} dragY=${dragY}`);
        }
    }

    OnDragend(_pointer: Phaser.Input.Pointer, _gameobject: any, onGridChanged:(changeHorizontal: boolean, i: number, value: number) => void) {
        const deltaCellX = Math.round((this.prevDragX - this.gridZone.x) / this.gridZoneCellSize);
        const deltaCellY = Math.round((this.prevDragY - this.gridZone.y) / this.gridZoneCellSize);
        console.log(`gridZone.on(dragend) deltaCellX=${deltaCellX} deltaCellY=${deltaCellY}`);
        const roundedDragX = this.gridZone.x + deltaCellX * this.gridZoneCellSize;
        const roundedDragY = this.gridZone.y + deltaCellY * this.gridZoneCellSize;
        console.log(`gridZone.on(dragend) roundedDragX=${roundedDragX} roundedDragX=${roundedDragY}`);
        if (this.dragDirection) {
            if (this.dragHorizontal) {
                let lineSprites: Phaser.GameObjects.Sprite[] = [];
                for (let x = 0; x < this.gridWidth; x++) {
                    lineSprites.push(this.sprites[x][this.dragCellY]);
                    lineSprites[lineSprites.length - 1].x = this.ClipX(lineSprites[lineSprites.length - 1].x + roundedDragX - this.prevDragX);
                }
                lineSprites = lineSprites.sort((a, b) => a.x - b.x);
                for (let x = 0; x < this.gridWidth; x++) {
                    this.sprites[x][this.dragCellY] = lineSprites[x];
                }
            }
            else {
                for (let y = 0; y < this.gridHeight; y++) {
                    this.sprites[this.dragCellX][y].y = this.ClipY(this.sprites[this.dragCellX][y].y + roundedDragY - this.prevDragY);
                }
                this.sprites[this.dragCellX] = this.sprites[this.dragCellX].sort((a, b) => a.y - b.y);
            }
            onGridChanged(this.dragHorizontal, this.dragHorizontal ? this.dragCellY : this.dragCellX, this.dragHorizontal ? deltaCellX : deltaCellY);
        }
    }

    ClipX(x: number): number {
        if (x <= this.gridZoneX - this.gridZoneCellSize / 2) {
            x += this.gridZone.width;
        }
        else if (x > this.gridZoneX + this.gridZone.width - this.gridZoneCellSize / 2) {
            x -= this.gridZone.width;
        }
        return x;
    }

    ClipY(y: number): number {
        if (y <= this.gridZoneY - this.gridZoneCellSize / 2) {
            y += this.gridZone.height;
        }
        else if (y > this.gridZoneY + this.gridZone.height - this.gridZoneCellSize / 2) {
            y -= this.gridZone.height;
        }
        return y;
    }
}