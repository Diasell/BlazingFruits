/**
 * Created by tarasg on 10/11/2017.
 */
import {BaseGameScene} from "../Scenes/GameScenes";
// import {Reel} from "./Reel";
import {ReelsConfig} from "./reelsConfig";
import {ReelN} from "./NewReel";


export class ReelSpinner {
    private resources: any;
    public scene: BaseGameScene;
    public reelsArray: ReelN[];

    public reelsContainer: PIXI.Container;
    private reelsDelay: number;

    private reelSpinSound: any;
    private reelStopSound: any;

    constructor(scene: BaseGameScene, resources: any) {
        this.scene = scene;
        this.resources = resources;
        this.reelsArray = [];
        // this.reelSpinSound = new Audio(resources.reelspin.url);
        // this.reelStopSound = new Audio(resources.reelstop.url);
        this.initializeReels();

    }


    private initializeReels(): void {
        this.reelsContainer = new PIXI.Container();
        this.reelsContainer.x = ReelsConfig.x;
        this.reelsContainer.y = ReelsConfig.y;

        this.reelsDelay = ReelsConfig.reelsDelay;

        for (let i=0; i<ReelsConfig.reels.length; i++) {
            let x: number = ReelsConfig.reels[i].x,
                y: number = ReelsConfig.reels[i].y;
            let reel = new ReelN(x, y, i, this.reelsContainer, this.resources);
            this.reelsArray.push(reel);
        }

        this.scene.addChild(this.reelsContainer);
    }

    public spin(results: number[][]): void {

        let reelsDelay: number = this.reelsDelay;
        // this.reelSpinSound.currentTime = 0;
        // this.reelSpinSound.play();
        for (let i = 0; i<this.reelsArray.length; i++){
            let animation = this.reelsArray[i].startSpinAnimation.bind(this.reelsArray[i]);
            (function (i) {
                setTimeout(animation, reelsDelay*i, results[i]);
            })(i);
        }
    }

    public slamout(): void {
        let reelsDelay: number = this.reelsDelay;
        // this.reelSpinSound.pause();
        for (let i=0; i<this.reelsArray.length; i++) {
            this.reelsArray[i].slamOut();
        }

    }
}