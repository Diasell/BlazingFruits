/**
 * Created by tarasg on 10/3/2017.
 */
import {app} from "../main";
import * as utils from "../Utils/helperFuncs";
import {AnimationEndEvent} from "../Events/AnimationEvents";

export class GambleCard {
    public cardBack : PIXI.Sprite;
    public cardBackT : PIXI.Texture;
    public scene: PIXI.Container;
    public x: number;
    public y: number;
    public allCardsBT: PIXI.BaseTexture;


    constructor(scene: PIXI.Container, x: number, y: number, cardBack_img:any, all_cards_img:any) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        if (typeof cardBack_img === "string" && typeof all_cards_img === "string"){
            this.cardBackT  = PIXI.Texture.fromImage(cardBack_img);
            this.allCardsBT = PIXI.BaseTexture.fromImage(all_cards_img);
        } else {
            this.cardBackT = cardBack_img;
            this.allCardsBT = PIXI.BaseTexture.from(all_cards_img);
        }

        this.cardBack = new PIXI.Sprite(this.cardBackT);
        this.cardBack.anchor.set(0.5, 0.5);
        this.cardBack.x = this.x;
        this.cardBack.y = this.y;
        this.scene.addChild(this.cardBack);


    }

    public getCardFaceTexture(suit:number, value:number): PIXI.Texture {
        let cardWidth = 170,
            cardHeight = 235,
            spaceX = 10,
            spaceY = 10,
            x = 5 + (value*(cardWidth+spaceX)),
            y = 5 + (suit*(cardHeight+spaceY));
        return new PIXI.Texture(this.allCardsBT, new PIXI.Rectangle(x,y,cardWidth, cardHeight));

    }

    public flip(texture, callback) {

        app.ticker.add(flipCardAnimation, this);
        let anim = true;
        function flipCardAnimation(timedelta: number) {

            if (anim) {
                this.cardBack.scale.x = Math.max(this.cardBack.scale.x-(0.05*timedelta), 0);
                if (this.cardBack.scale.x == 0){
                    this.cardBack.texture = texture;
                    anim = false;
                }
            } else {
                this.cardBack.scale.x = Math.min(this.cardBack.scale.x+(0.05*timedelta), 1);
                if (this.cardBack.scale.x == 1) {
                    app.ticker.remove(flipCardAnimation, this);
                    // document.dispatchEvent(AnimationEndEvent.GambleCardFlipEnd);
                    callback();
                }
            }
        }
    }
}

export class GambleHistory {

    public historyContainer: PIXI.Container;
    public scene: PIXI.Container;
    public cardsToShow: number;
    public scaleSize: number;
    public cardBackT: PIXI.Texture;
    public allCardsBase: PIXI.BaseTexture;
    public cards: PIXI.Sprite[] = [];
    public history: number[][];
    public x: number;
    public y: number;
    public containerMask: PIXI.Graphics;

    constructor(scene: PIXI.Container, x:number, y:number, scaleSize: number, cardsToShow:number, cardBack_img:string, all_cards_img:string) {
        this.scene = scene;
        this.scaleSize = scaleSize;
        this.cardsToShow = cardsToShow;
        this.x = x;
        this.y = y;

        this.historyContainer = new PIXI.Container();
        this.historyContainer.x = x;
        this.historyContainer.y = y;

        this.cardBackT  = PIXI.Texture.fromImage(cardBack_img);
        this.allCardsBase = PIXI.BaseTexture.fromImage(all_cards_img);

        this.getCardsHistory();
        this.initializeHistory();
        this.containerMask = new PIXI.Graphics();
        this.initializeMask();

    }

    private getCardsHistory() {
        // just hardcoded values
        this.history = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8]];
    }

    public getCardFaceTexture(suit:number, value:number): PIXI.Texture {
        let cardWidth = 170,
            cardHeight = 235,
            spaceX = 10,
            spaceY = 10,
            x = 5 + (value*(cardWidth+spaceX)),
            y = 5 + (suit*(cardHeight+spaceY));
        return new PIXI.Texture(this.allCardsBase, new PIXI.Rectangle(x,y,cardWidth, cardHeight));

    }

    private initializeHistory() {
        for (let i=-1; i<=this.cardsToShow; i++) {
            let sprite: PIXI.Sprite;

            if (i <= 0){
                sprite = new PIXI.Sprite(this.cardBackT);
                sprite.x = (i * (this.cardBackT.width) * this.scaleSize);
                sprite.y = this.y * this.scaleSize;
                sprite.scale.set(this.scaleSize, this.scaleSize);
            }
            else {
                sprite = new PIXI.Sprite(this.getCardFaceTexture(this.history[i-1][0], this.history[i-1][1]));
                sprite.x = (i * sprite.width * (this.scaleSize*(this.cardBackT.width/sprite.width)));
                sprite.y = this.y * this.scaleSize;
                sprite.scale.set((this.scaleSize*(this.cardBackT.width/sprite.width)), (this.scaleSize*(this.cardBackT.height/sprite.height)));
            }
            sprite.anchor.set(0.5, 0.5);
            this.historyContainer.addChild(sprite);
            this.cards.push(sprite);
        }
        this.scene.addChild(this.historyContainer);
    }

    private initializeMask() {
        this.scene.addChild(this.containerMask);
        this.historyContainer.mask = this.containerMask;
        this.containerMask.lineStyle(0);
        this.containerMask.x = this.historyContainer.x;
        this.containerMask.y = this.historyContainer.y;



        this.containerMask.beginFill(0x8bc5ff);
        let mask_x = - (this.cards[1].width/2),
            mask_y = 0;
        this.containerMask.drawRect(mask_x, mask_y,this.cards[1].width*(this.cardsToShow+1), this.cardBackT.height);

        this.containerMask.endFill();
    }

    public showHiddenCard(texture: PIXI.Texture) {
            this.cards[1].texture = texture;
            this.cards[1].scale.set((this.scaleSize*(this.cardBackT.width/this.cards[1].texture.width)), (this.scaleSize*(this.cardBackT.height/this.cards[1].texture.height)));

    }

    public updateHistoryWithNewResult(result: number[]) {

        //this.history.unshift(result);
        let temp = this.history;
        let newHistory = [];
        newHistory.push(result);
        for (let i=0; i<temp.length; i++){
            newHistory.push(temp[i]);
        }
        this.history = newHistory;
    }

    public moveLastCards(callback){

        let stopBorderX = this.historyContainer.x + (this.cardBackT.width*this.scaleSize);
        app.ticker.add(moveLastCardsAnimation, this);

        function moveLastCardsAnimation(timedelta: number) {
            if(this.historyContainer.x < stopBorderX) {
                this.historyContainer.x = Math.min(this.historyContainer.x+(2*timedelta), stopBorderX);
            } else {
                app.ticker.remove(moveLastCardsAnimation, this);
                callback()
            }
        }
    }

    public resetLastCards() {
        this.historyContainer.x -= (this.cardBackT.width*this.scaleSize);
        for (let i =1; i<=this.cardsToShow+1; i++) {
            if (i == 1){
                this.cards[i].texture = this.cardBackT;
                this.cards[i].scale.set(this.scaleSize, this.scaleSize);
            }
            else
                this.cards[i].texture = this.getCardFaceTexture(this.history[i-2][0], this.history[i-2][1]);
        }
    }



}