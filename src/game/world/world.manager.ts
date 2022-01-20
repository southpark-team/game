import { Color } from "../core/utils/color";
import { RectangleGeometry } from "../core/geometry/rectangle/rectangle";
import { Scene } from "../core/scene";
import { EventBus } from "../core/eventBus";

import { Player } from "./objects/player";
import { Enemy } from "./objects/enemy";

import {
    generateRandomLevel, getFirstGroundTileOnLevel,
    getLastGroundTileOnLevel, Level, TileTypes, TILE_TYPES,
} from "./world.helpers";
import { Object2D } from "../core/object";
import { Vector2D } from "../core/utils/vector";
import { LEVEL_SIZE, TILE_SIZE } from "./world.config";
import { Ground } from "./objects/ground";
import { Wall } from "./objects/wall";
import { Camera } from "../core/camera";

import TileSetImage from "../../../assets/tileset.png";
import { Weapon } from "./objects/weapon";

export type Sprite = {
    // Положение на изображении
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
};

export class WorldManager {
    tileSetImage: HTMLImageElement;
    level: Level;

    constructor() {
        const tileSetImage = new Image(512, 512);
        tileSetImage.src = TileSetImage;
        this.tileSetImage = tileSetImage;
    }

    composeLevel(
        gameOverCallback: () => void,
        gameWinCallback: () => void,
        eventBus: EventBus,
    ): [Scene, Camera] {
        // Camera
        const camera = new Camera(LEVEL_SIZE * 1);
        // Задаем бэкграунд и создаем сцену
        const background = new Color(0, 0, 0);
        const scene = new Scene(background);
        // Генерируем рандомный уровень
        this.level = generateRandomLevel();
        // Создаем стены и землю из матрицы уровня
        const objects = this._createWallsAndTilesFromLevel(this.level);
        // И добавляем в сцену первыми
        scene.add(...objects);
        // В отдельный список добавляем объекты, которые имеют физику
        scene.addObjectWithPhysics(...objects.filter((x) => x instanceof Wall));
        // Создаем Игрока
        const [player, sword] = this._createPlayer(eventBus, this.level, gameOverCallback);
        // Добавляем в сцену
        scene.add(sword, player);
        scene.addObjectWithPhysics(sword, player);
        // Устанавливаем объект привязки камеры
        camera.bindObject(player);
        // Создаем противника
        const enemy = this._createEnemy(scene, eventBus, this.level, gameWinCallback);
        // Добавляем в сцену
        scene.add(enemy);
        scene.addObjectWithPhysics(enemy);

        return [scene, camera];
    }

    getTilePositionFromCoordinates(coordinates: Vector2D): Vector2D {
        const x = Math.floor(coordinates.x / TILE_SIZE) * TILE_SIZE;
        const y = Math.floor(coordinates.y / TILE_SIZE) * TILE_SIZE;
        return new Vector2D(x, y);
    }

    private _createWallsAndTilesFromLevel(level: Level): Array<Object2D> {
        const objects: Array<Object2D> = [];
        for (let i = 0; i < level.length; i += 1) {
            for (let j = 0; j < level.length; j += 1) {
                const number = level[i][j];
                const position: Vector2D = new Vector2D(j * TILE_SIZE, i * TILE_SIZE);
                if (TILE_TYPES[number] === TileTypes.Ground) {
                    const groundGeom = new RectangleGeometry(TILE_SIZE, TILE_SIZE);
                    const color = new Color(225, 0, 0);
                    const ground = new Ground({ geometry: groundGeom, color });
                    ground.position = position;
                    // TODO: Перенести в класс
                    const sprite: Sprite = {
                        sx: 16,
                        sy: 64,
                        sWidth: 16,
                        sHeight: 16,
                    };
                    ground.spriteConfig = {
                        image: this.tileSetImage,
                        sprite,
                    };
                    objects.push(ground);
                }
                if (TILE_TYPES[number] === TileTypes.Wall) {
                    const wallGeom = new RectangleGeometry(TILE_SIZE, TILE_SIZE);
                    const color = new Color(0, 225, 0);
                    const wall = new Wall({ geometry: wallGeom, color });
                    wall.position = position;
                    // TODO: Перенести в класс
                    const sprite: Sprite = {
                        sx: 16,
                        sy: 16,
                        sWidth: 16,
                        sHeight: 16,
                    };
                    wall.spriteConfig = {
                        image: this.tileSetImage,
                        sprite,
                    };
                    objects.push(wall);
                }
            }
        }
        return objects;
    }

    private _createPlayer(
        eventBus: EventBus, 
        level: Level,
        gameOverCallback: () => void,
    ): [Player, Weapon] {
        const playerGeom = new RectangleGeometry(16, 21);
        const player = new Player({
            geometry: playerGeom,
            eventBus,
            worldManager: this,
            image: this.tileSetImage,
            maxHealth: 6,
            gameOverCallback: gameOverCallback
        });
        // Зададим дефолтное положение
        const playerPosition = getFirstGroundTileOnLevel(level);
        if (!playerPosition) {
            throw new Error("Уровень сгенерирован с ошибкой");
        }
        player.position = playerPosition;
        // Создадим оружие
        const swordGeometry = new RectangleGeometry(10, 21)
        const sword = new Weapon({
            geometry: swordGeometry,
            damage: 1
        })
        sword.spriteConfig = {
            image: this.tileSetImage,
            sprite: {
                sx: 323,
                sy: 26,
                sWidth: 10,
                sHeight: 21
            }
        }
        sword.visible = false;
        player.weapon = sword
        return [player, sword];
    }

    private _createEnemy(
        scene: Scene,
        eventBus: EventBus,
        level: Level,
        gameWinCallback: () => void
    ): Enemy {
        const enemyGeom = new RectangleGeometry(TILE_SIZE, TILE_SIZE);
        const enemy = new Enemy({
            scene: scene,
            geometry: enemyGeom,
            color: new Color(0, 0, 255),
            image: this.tileSetImage,
            maxHealth: 1,
            gameWinCallback
        });
        // Зададим дефолтное положение
        const enemyPosition = getLastGroundTileOnLevel(level);
        if (!enemyPosition) {
            throw new Error("Уровень сгенерирован с ошибкой");
        }
        enemy.position = enemyPosition;
        return enemy;
    }
}