import { Vector2D } from "game/core/utils/vector";
import { RectangleGeometry } from "game/core/geometry/rectangle/rectangle";
import { CanReceiveDamage } from "game/core/animations/damage/damage";
import { Object2D, Object2DProps } from "../../core/object";
import { EventBus } from "../../core/eventBus";
import Physics, { Collidable } from "../../core/physics/physics";
import { MoveAnimation } from "../../core/animations/move/moveAnimation";
import { AnimationSprites, SpriteAnimation } from "../../core/animations/sprite/spriteAnimation";
import { AttackAnimation, CanAttack } from "../../core/animations/attack/attack";
import { Weapon } from "./weapon";
import { Wall } from "./wall";
import { Enemy } from "./enemy";
import { EventTypes } from "../world.config";
import WorldManager from "../world.manager";

type PlayerProps = Object2DProps & {
    geometry: RectangleGeometry,
    eventBus: EventBus;
    maxHealth: number;
    image?: HTMLImageElement;
};

export class Player extends Object2D implements Collidable, CanAttack, CanReceiveDamage {
    //
    geometry: RectangleGeometry;
    // Скорость передвижения пиксель/сек
    speed: number = 150;
    // Global event bus
    eventBus: EventBus;
    // Анимация передвижения
    moveAnimation: MoveAnimation;
    prevPosition: Vector2D;
    //
    canCollide: boolean = true;
    // Анимация изменения Sprite
    spriteAnimation: SpriteAnimation;
    playerSprites: AnimationSprites;
    // Оружие и анимация аттаки
    weapon: Weapon;
    attackAnimation: AttackAnimation;
    // Здоровье
    maxHealth: number;
    private _health: number;

    // TODO: Додумать реализацию
    get health(): number {
        return this._health;
    }
    set health(value: number) {
        this._health = value;
        WorldManager.playerUI.updateHealth(this._health);
        if (this._health <= 0) {
            this.onDeath();
        }
    }

    constructor(props: PlayerProps) {
        super(props);

        this.eventBus = props.eventBus;
        this.maxHealth = props.maxHealth;
        // По дефолту полное здоровье
        this._health = this.maxHealth;

        this._createPlayerSprites(props.image);
        this._updateWeaponState();
        this.init();
    }

    init() {
        // Создаем логику анимации движения
        this.moveAnimation = new MoveAnimation({
            speed: this.speed,
        });
        this.moveStateUpdateCondition();
        // Создаем логику анимации смены sprite
        this.spriteAnimation = new SpriteAnimation({
            sprites: this.playerSprites,
        });
        // Создаем логику анимации атаки
        this.attackAnimation = new AttackAnimation();
    }

    updateState() {
        // Обновляем sprite
        this.spriteConfig = this.spriteAnimation.update(this.spriteConfig, this.moveAnimation);
        if (this.weapon.spriteConfig) {
            this.weapon.spriteConfig.shouldFlip = this.spriteConfig?.shouldFlip;
        }
        // Обновляем position
        this.prevPosition = this.position.copy();
        this.position = this.moveAnimation.update(this.position);
        // Обновляем оружие
        this.weapon = this.attackAnimation.update(this.weapon, this);
    }

    // NOTE: Если скорость объекта значительно больше размера препятствия, то
    // может случиться "проскок" объекта
    onCollide(obstacle: Object2D & Collidable) {
        if (obstacle instanceof Wall || obstacle instanceof Enemy) {
            this.position = Physics.getNewPositionAfterWallCollision(
                this,
                obstacle,
                this.moveAnimation,
                this.prevPosition,
            );
        }
    }

    onDeath() {
        WorldManager.gameOverCallback();
    }

    moveStateUpdateCondition() {
        const { moveState } = this.moveAnimation;
        //
        this.eventBus.on(
            EventTypes.ArrowLeftDown,
            () => (moveState.isMovingLeft = true),
        );
        this.eventBus.on(
            EventTypes.ArrowBottomDown,
            () => (moveState.isMovingDown = true),
        );
        this.eventBus.on(
            EventTypes.ArrowTopDown,
            () => (moveState.isMovingTop = true),
        );
        this.eventBus.on(
            EventTypes.ArrowRightDown,
            () => (moveState.isMovingRight = true),
        );
        this.eventBus.on(
            EventTypes.ArrowLeftUp,
            () => (moveState.isMovingLeft = false),
        );
        this.eventBus.on(
            EventTypes.ArrowTopUp,
            () => (moveState.isMovingTop = false),
        );
        this.eventBus.on(
            EventTypes.ArrowBottomUp,
            () => (moveState.isMovingDown = false),
        );
        this.eventBus.on(
            EventTypes.ArrowRightUp,
            () => (moveState.isMovingRight = false),
        );
    }

    private _updateWeaponState() {
        this.eventBus.on(
            EventTypes.SpaceDown,
            () => {
                this.weapon.active = true;
                this.weapon.visible = true;
            },
        );
    }

    private _createPlayerSprites(image?: HTMLImageElement) {
        this.playerSprites = {
            idle_0: {
                sx: 128,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            idle_1: {
                sx: 128 + 16,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            idle_2: {
                sx: 128 + 16 * 2,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            idle_3: {
                sx: 128 + 16 * 3,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            run_0: {
                sx: 192,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            run_1: {
                sx: 192 + 16,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            run_2: {
                sx: 192 + 16 * 2,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
            run_3: {
                sx: 192 + 16 * 3,
                sy: 107,
                sWidth: 16,
                sHeight: 21,
            },
        };
        // Устанавливаем дефолтный спрайт
        this.spriteConfig = {
            image,
            sprite: this.playerSprites.idle_0,
            shouldFlip: false,
        };
    }
}
