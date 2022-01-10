import { Camera } from "./camera";
import { GeometryTypes } from "./geometry/geometry";
import { RectangleGeometry } from "./geometry/rectangle/rectangle";
import { Object2D } from "./object";
import Physics, { isImplementingCollision } from "./physics/physics";
import { Scene } from "./scene";

type RendererProps = {
    canvas: HTMLCanvasElement | null
    width: number
    height: number
};

export class Renderer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    lastTime: number | null = null;

    constructor(props: RendererProps) {
        if (!props.canvas) {
            throw new Error("Ошибка инициализации");
        }
        const context = props.canvas.getContext("2d");
        if (!context) {
            throw new Error("Ошибка получения контекста канвас");
        }

        this.canvas = props.canvas;
        this.context = context;

        this.init(props.width, props.height);
    }

    init(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    // Нарисовать все объекты сцены на канвасе. Обрезать камерой лишнее
    render(scene: Scene, camera: Camera) {
        const c = this.context;
        const { canvas } = this;
        const { background } = scene;
        // TODO: Обрезать объекты в сцене камерой

        // Сначала очищаем канвас и рисуем контур
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = "rgb(255, 255, 255)";
        c.lineWidth = 1;
        c.strokeRect(0, 0, canvas.width, canvas.height);
        // Затем рисуем бэкграунд
        c.fillStyle = `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`;
        c.fillRect(0, 0, canvas.width, canvas.height);
        // Отрисовка в цикле всех объектов в сцене
        for (const obj of scene.objects) {
            switch (obj.geometry.type) {
                case GeometryTypes.Rectangle:
                    this._drawRectangle(obj);
                    break;
                default:
                    break;
            }
        }
    }

    // Запустить физику и пересчитать анимацию
    prerender(scene: Scene, dt: number, now: number) {
        // Сначала пересчитываем анимацию
        for (const obj of scene.objects) {
            obj.updateState(dt);
        }
        // TODO: Реализовать Quadtree collison detection
        /* eslint-disable */
        // https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
        // https://stackoverflow.com/questions/4981866/quadtree-for-2d-collision-detection
        /* eslint-enable */

        // Затем проверяем столкновение объектов в сцене
        for (let i = 0; i < scene.objects.length; i += 1) {
            for (let j = i + 1; j < scene.objects.length; j += 1) {
                const obj1 = scene.objects[i];
                const obj2 = scene.objects[j];

                if (
                    isImplementingCollision(obj1)
                    && isImplementingCollision(obj2)
                ) {
                    const collided = Physics.hasBox2DCollided(obj1, obj2);
                    // TODO: Определить очередность вызова callback
                    // Например, если в движущегося игрока попадает пуля, то игрок не должен
                    // от этого переместиться, а пуля должна уничтожиться
                    if (collided) {
                        obj1.onCollide(obj2);
                        obj2.onCollide(obj1);
                    }
                }
            }
        }
        //
        this.lastTime = now;
    }

    // Отрисовка rectangle на канвасе
    private _drawRectangle(object: Object2D) {
        const c = this.context;
        const { color } = object;
        const geom = object.geometry as RectangleGeometry;

        if (object.sprite) {
            c.drawImage(object.sprite, object.positon.x, object.positon.y, geom.width, geom.height);
        } else {
            c.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            c.fillRect(object.positon.x, object.positon.y, geom.width, geom.height);
        }
    }
}