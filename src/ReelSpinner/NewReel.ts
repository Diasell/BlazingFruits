/**
 * Created by tarasg on 10/13/2017.
 */


import * as config from "../ReelSpinner/reelsConfig"
import {ISymbol, SYMBOLS} from "./MainRoundSymbols";
import {app} from "../main";
import {ReelSet} from "./ReelSets";



export class ReelN {

    public x: number;
    public y: number;
    public index: number;
    public reelContainer: PIXI.Container;
    public visibleSymbolsArray: Array<ISymbol>;
    public nextSprite: PIXI.Sprite;
    public nextSymbol: ISymbol;
    public visibleSprites: Array<PIXI.Sprite | any>;
    private resources: Array<PIXI.Texture | any>

    private reelValuesMath: Array<number>;
    private symbolsAmount: number;
    private reelsContainer: PIXI.Container;
    private reelMask: PIXI.Graphics;
    private WinShowAnimation: PIXI.extras.AnimatedSprite;
    private winShowTime: number;
    private SpinningTime: number;
    private SpinningSpeed: number;
    private spinningIndex: number;
    private y_delta: number;

    // -----------------
    private reelSymbolsAmount: number;
    private stopSymbols: number[];
    private tempReel: PIXI.Sprite[];
    private reelContStopY: number;

    private reelStopSound: any;
    private isSlamout: boolean;


    constructor(x: number, y: number, index:number, reelsContainer: PIXI.Container, resources:any){
        this.x = x;
        this.y = y;
        this.index = index;
        this.resources = resources;
        this.symbolsAmount = config.ReelsConfig.reels[index].symbolsAmount;
        this.SpinningTime = config.ReelsConfig.reels[index].SpinningTime;
        this.SpinningSpeed = config.ReelsConfig.spinningSpeed;
        this.reelsContainer = reelsContainer;
        this.reelMask = new PIXI.Graphics();
        this.visibleSymbolsArray = [];
        this.reelValuesMath = ReelSet[index];
        this.spinningIndex = 0;
        this.tempReel = [];
        this.visibleSprites = [];
        this.winShowTime = 2000;

        // this.reelStopSound = new Audio(resources.reelstop.url);
        this.isSlamout = false;

        this.InitializeReel();
        this.initializeMask();

    }

    private getRandomSymbol(): ISymbol {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    private InitializeReel():void {
        this.reelContainer = new PIXI.Container();
        this.reelContainer.x = this.x;
        this.reelContainer.y = this.y;
        this.y_delta = 0;

        this.reelSymbolsAmount = this.symbolsAmount + this.calculateSymbolsAmount();
        this.reelContStopY = (this.reelSymbolsAmount-this.symbolsAmount)*config.symbolHeight;

        for (let i=0; i<this.reelSymbolsAmount; i++) {
            let symbol = this.getRandomSymbol(),
                sprite = new PIXI.Sprite(this.resources[symbol.name]);
            sprite.y = config.symbolHeight * (this.symbolsAmount - i - 1);
            this.tempReel.push(sprite);
            this.reelContainer.addChildAt(sprite, i);
        }
        this.reelContainer.y += this.reelContStopY;
        this.reelsContainer.addChild(this.reelContainer);
    }


    private initializeMask(): void {
        // creates mask around the reelContainer
        this.reelsContainer.addChild(this.reelMask);
        this.reelMask.lineStyle(0);
        this.reelContainer.mask = this.reelMask;

        this.reelMask.beginFill(0x8bc5ff, 0.1);
        this.reelMask.moveTo(this.x, this.y);
        this.reelMask.lineTo(this.x + config.symbolWidth, this.y);
        this.reelMask.lineTo(this.x + config.symbolWidth, (this.y+config.symbolHeight)*this.symbolsAmount);
        this.reelMask.lineTo(this.x, (this.y+config.symbolHeight)*this.symbolsAmount);
        this.reelMask.lineTo(this.x, this.y);
    }


    public startSpinAnimation(stopSymbols: number[]): void {

        this.stopSymbols = stopSymbols;
        app.ticker.add(animateStarSpin, this);

        let position = this.reelContainer.y;

        function animateStarSpin(timedelta: number): void {
            if (this.reelContainer.y > position-config.StartAnimDelta) {
                this.reelContainer.y -= Math.floor(config.StartAnimSpeed * timedelta);
            }
            else{
                app.ticker.remove(animateStarSpin, this);
                this.spinAnimation(stopSymbols);
            }
        }
    }


    private calculateSymbolsAmount(): number {
        let distancePX = config.ReelsConfig.spinningSpeed * 60 * (this.SpinningTime/1000);
        return Math.floor(distancePX/config.symbolHeight)
    }


    public slamOut(): void {
        this.isSlamout = true;
        this.reelContainer.y = this.reelContStopY;

    }


    private swapCurrentVisibleTextures(): void {
        for (let i=0; i<this.symbolsAmount; i++) {
            let texture = this.tempReel[this.tempReel.length-1-i].texture;
            this.tempReel[this.symbolsAmount-1-i].texture = texture;
        }
    }

    private setStopSymbols(stopSymbols: number[]): void {
        for (let i=0; i<stopSymbols.length; i++){
            let texture = this.resources[SYMBOLS[stopSymbols[i]].name];
            this.tempReel[this.reelSymbolsAmount-i-1].texture = texture;
        }
    }


    public spinAnimation(stopSymbols: number[]) : void {

        let self = this;
        this.isSlamout = false;

        // swap visible elements
        this.swapCurrentVisibleTextures();
        this.reelContainer.y -= this.reelContStopY;
        this.setStopSymbols(stopSymbols);

        app.ticker.add(animateSpin, this);


        function smoothStop(): void {
            let down = true,
                startY = self.reelContainer.y,
                stopY = self.reelContainer.y + config.ReelsConfig.reelStopDelta;

            app.ticker.add(stopAnimation, self);

            function stopAnimation(timedelta: number) {
                if (self.reelContainer.y < stopY && down) {
                    self.reelContainer.y += config.ReelsConfig.reelStopSpeed * timedelta;
                } else if (self.reelContainer.y >= stopY && down) {
                    down = false;
                } else {
                    self.reelContainer.y = Math.max(self.reelContainer.y - Math.floor(config.ReelsConfig.reelStopDelta*timedelta*0.1), startY);
                    if (self.reelContainer.y == startY) {
                        app.ticker.remove(stopAnimation, self);
                        if (self.index == config.ReelsConfig.reels.length-1) {
                            let event = new CustomEvent('LastReelStopped');
                            document.dispatchEvent(event);
                        }
                    }
                }
            }`  `
        }

        function animateSpin(timedelta: number): void {
            if (this.reelContainer.y < this.reelContStopY) {
                this.reelContainer.y = Math.min(this.reelContainer.y + Math.floor(timedelta*this.SpinningSpeed), this.reelContStopY);
            }
            else {
                app.ticker.remove(animateSpin, this);
                smoothStop();
            }
        }


    }


    public playWinShow(symbol: number, index: number): void {
        // hide symbol sprite
        this.tempReel[this.reelSymbolsAmount-index-1].visible = false;
        // get symbol winshow animation
        // let iSymbol = SYMBOLS[symbol];
        // this.WinShowAnimation = iSymbol.winShowAnimation();

        // this.reelContainer.addChild(this.WinShowAnimation);
        // this.WinShowAnimation.y = this.tempReel[this.reelSymbolsAmount-index-1].y;
        // this.WinShowAnimation.loop = true;

        // this.WinShowAnimation.play();
        // setTimeout(function () {
        //     let winShowEndEvent = new CustomEvent('ReelWinShowAnimEnd', {'detail': {'reelIndex': this.index}});
        //     document.dispatchEvent(winShowEndEvent);
        // }.bind(this), this.winShowTime)
    }

    public stopWinShow(index: number): void {
        // this.WinShowAnimation.stop();
        // this.WinShowAnimation.visible = false;
        // show symbol sprite
        this.tempReel[this.reelSymbolsAmount-index-1].visible = true
    }


}
