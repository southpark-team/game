import { Object2D, Object2DProps } from "../../../game/core/object";
import { Collidable } from "../../core/physics/physics"
import { Player } from "./player"

type EnemyProps = Object2DProps & {
}

export class Enemy extends Object2D implements Collidable {

    canCollide: boolean = true

    constructor(props: EnemyProps) {
        super(props)
        
        this.init()
    }

    init() {
       
    }

    updateState(dt: number) {

    }


    // 
    onCollide(obstacle: Object2D & Collidable) {
        if(obstacle instanceof Player) {
            console.log("Game over !")
        }
    }

}