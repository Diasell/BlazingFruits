/**
 * Created by tarasg on 10/10/2017.
 */

import * as config from "../ReelSpinner/reelsConfig"
import {ISymbol, SYMBOLS} from "./MainRoundSymbols";
import {app} from "../main";
import {ReelSet} from "./ReelSets";



export class Reel {

    public x: number;
    public y: number;
    public index: number;
    public reelContainer: PIXI.Container;
    public visibleSymbolsArray: Array<ISymbol>;
    public nextSprite: PIXI.Sprite;
    public nextSymbol: ISymbol;
    public visibleSprites: Array<PIXI.Sprite | any>;

    private reelValuesMath: Array<number>;
    private symbolsAmount: number;
    private reelsContainer: PIXI.Container;
    private reelMask: PIXI.Graphics;
    private WinShowAnimation: PIXI.extras.AnimatedSprite;
    private SpinningTime: number;
    private SpinningSpeed: number;
    private fakeStopIndex: number;
    private spinningIndex: number;
    private tempReel: any;
    private stopIndex: number;
    private y_delta: number;




    constructor(x: number, y: number, index:number, symbolsAmount: number, reelsContainer: PIXI.Container, resources:any){
        this.x = x;
        this.y = y;
        this.index = index;
        this.symbolsAmount = symbolsAmount;
        this.SpinningTime = config.ReelsConfig.reels[index].SpinningTime;
        this.SpinningSpeed = config.ReelsConfig.spinningSpeed;
        this.reelsContainer = reelsContainer;
        this.reelMask = new PIXI.Graphics();
        this.visibleSymbolsArray = [];
        this.reelValuesMath = ReelSet[index];
        this.spinningIndex = 0;
        this.fakeStopIndex = this.getFakeStopIndex();
        this.tempReel = [];
        this.visibleSprites = [];

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

        let next_symbol = this.getRandomSymbol();
        this.nextSymbol = next_symbol;
        this.nextSprite = next_symbol.sprite();
        this.nextSprite.y = -config.symbolHeight;
        this.reelContainer.addChild(this.nextSprite);

        for(let i=0; i<this.symbolsAmount; i++){
            let symbol = this.getRandomSymbol();
            let sprite = symbol.sprite();
            this.visibleSprites.push(sprite);
            sprite.y = config.symbolHeight * i;
            this.visibleSymbolsArray.push(symbol);
            this.reelContainer.addChildAt(sprite,i);
        }
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


    public playSymbolWinShow(index: number): void {

        //destroy sprite with image:
        this.reelContainer.getChildAt(index).destroy();

        // create animation, save it, and play
        let symbol = this.visibleSymbolsArray[index];
        this.WinShowAnimation = symbol.winShowAnimation();
        this.reelContainer.addChildAt(this.WinShowAnimation, index);
        this.WinShowAnimation.y = config.symbolHeight * index;
        this.WinShowAnimation.play();
    }

    public stopSymbolWinShow(index: number): void {

        // destroy WinShow animation
        this.reelContainer.getChildAt(index).destroy();

        // create and add symbol image
        let symbol = this.visibleSymbolsArray[index];
        let sprite = symbol.sprite();
        this.reelContainer.addChildAt(sprite, index);
        sprite.y = config.symbolHeight * index;
    }


    public startSpinAnimation(stopIndex: number): void {

        this.stopIndex = stopIndex;
        app.ticker.add(animateStarSpin, this);

        let position = this.reelContainer.y;

        function animateStarSpin(timedelta: number): void {
            if (this.reelContainer.y > position-config.StartAnimDelta) {
                this.reelContainer.y -= config.StartAnimSpeed * timedelta;
            }
            else{
                app.ticker.remove(animateStarSpin, this);
                this.spinAnimation(stopIndex);
            }
        }
    }


    private createReelForSpinAnimation(): Array<number> {
        return this.reelValuesMath.slice().reverse();

    }


    private getStopSymbols(stopIndex: number, reel: Array<number>): Array<number> {
        let extendedReel = reel.concat(reel.slice(0, this.symbolsAmount)),
            result = [];

        for (let i=0; i<=this.symbolsAmount; i++){
            result.push(extendedReel[stopIndex+i])
        }
        return result
    }


    private pasteStopElements(tempreel: ReadonlyArray<number>, stopIndex: number): ReadonlyArray<number> {
        let result = tempreel.slice(),
            stopElements = this.getStopSymbols(stopIndex, this.reelValuesMath);

        for (let i=0; i<this.symbolsAmount; i++){
            result[this.fakeStopIndex-(i+1)] = stopElements[i];
            // console.log("PASTE symbol "+i+" :"+ SYMBOLS[stopElements[i]].name);
        }
        return result
    }


    private getFakeStopIndex(): number {
        let distancePX = config.ReelsConfig.spinningSpeed * 60 * (this.SpinningTime/1000);
        return Math.floor(distancePX/config.symbolHeight)
    }


    private pasteCurrentElements(tempReel: ReadonlyArray<number>, currentSymbols: Array<ISymbol>, nextSymbol:ISymbol) :ReadonlyArray<number> {

        let result = tempReel.slice(this.symbolsAmount + 1);

        return ([nextSymbol].concat(currentSymbols)).map(s => s.reelValue).reverse().concat(result);

        // result[this.symbolsAmount] = nextSymbol.reelValue;
        // console.log("first Next symbol: " + nextSymbol.name);
        // for (let i=0; i<this.symbolsAmount; i++) {
        //     result[this.symbolsAmount-(i+1)] = currentSymbols[i].reelValue;
        //     console.log("symbol "+i+": " + currentSymbols[i].name);
        // }
        // return result;
    }


    public slamOut(): void {
        if (this.y_delta <= config.ReelsConfig.spinningSpeed) {
            this.fakeStopIndex = this.spinningIndex + this.symbolsAmount
        }
        else{
            this.fakeStopIndex = this.spinningIndex + this.symbolsAmount + 1;

        }
        this.SpinningSpeed = this.SpinningSpeed*config.ReelsConfig.slamOutAcceleration;
        this.tempReel = this.pasteStopElements(this.tempReel, this.stopIndex);
    }


    public spinAnimation(stopIndex: number) : void {
        this.y_delta = this.reelContainer.y;
        this.SpinningSpeed = config.ReelsConfig.spinningSpeed;
        this.spinningIndex = this.symbolsAmount;
        this.fakeStopIndex = this.getFakeStopIndex();
        this.tempReel = this.createReelForSpinAnimation();
        this.tempReel = this.pasteStopElements(this.tempReel, stopIndex);
        this.tempReel = this.pasteCurrentElements(this.tempReel, this.visibleSymbolsArray, this.nextSymbol);


        app.ticker.add(animateSpin, this);


        function drawReel(timedelta: number, context: any): void {

            // increment delta
            context.y_delta = Math.min((context.y_delta+context.SpinningSpeed)*timedelta, config.symbolHeight);

            if (context.spinningIndex>= context.fakeStopIndex){
                context.reelContainer.y = 0;
                context.spinningIndex += 1;
                return;
            }

            if (context.y_delta == config.symbolHeight){
                context.y_delta = 0;
                context.spinningIndex += 1;
                updateSymbols(context);

            }
            context.reelContainer.y = Math.floor(context.y_delta);
        }

        function updateSymbols(context: any): void {

            // if delta >= symbolHeight -> means that 1 symbol from top dropped down
            // we need to reset symbols in container(basically add new symbol to nextSprite, nextsprite move to 1st visible
            //  1st to 2nd and 2nd to 3rd, reset container position to 0 so we can repeat it again;

            let next_symbol = SYMBOLS[context.tempReel[context.spinningIndex]];
            context.nextSprite.texture = next_symbol.texture;
            context.nextSymbol =  next_symbol;
            // console.log("next symbol: " + next_symbol.name);

            // let visibleSymbols = context.tempReel
            //     .slice(context.spinningIndex - 1, context.spinningIndex - 1 + context.symbolsAmount)
            //     .reverse()
            //     .map((idx:number) => SYMBOLS[idx]);
            //[visibleSymbols, context.reelContainer.children.].map((s : ISymbol, sprite : PIXI.DisplayObject) => {});

            for (let i=0; i<context.symbolsAmount; i++) {
                let sprite = context.reelContainer.children[i],
                    symbol = SYMBOLS[context.tempReel[context.spinningIndex - (i+1)]];

                sprite.texture = symbol.texture;
                context.visibleSymbolsArray[i] = symbol;
                // console.log("symbol "+ i+": " +  symbol.name);
            }
        }

        function animateSpin(timedelta: number): void {
            let context = this;
            if (this.spinningIndex <= this.fakeStopIndex) {
                drawReel(timedelta, context);
            }

            else {
                context.reelContainer.y = 0;
                app.ticker.remove(animateSpin, this);
                if (this.index == 4) {
                    let event = new CustomEvent('LastReelStopped');
                    document.dispatchEvent(event);
                }

            }
        }
    }


}
