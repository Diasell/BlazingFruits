/**
 * Created by tarasg on 9/22/2017.
 */
/**
 * Created by tarasg on 5/10/2017.
 */
import {app} from "../main";
import * as utils from "../Utils/helperFuncs";
import {buttonResources} from "./buttonNames";

export class Button {

    public textureEnabled : PIXI.Texture;
    public textureDisabled: PIXI.Texture;
    public texturePressed : PIXI.Texture;

    public sprite: PIXI.Sprite | any;

    public x: number;
    public y: number;
    public scene: PIXI.Container;
    public sound: any;

    public onButtonClick : Function;
    private isDown: boolean;
    private state: string;


    constructor(scene: PIXI.Container, x: number, y: number, buttonName: string, resources:any, action: Function) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.textureEnabled  =  resources[buttonResources[buttonName].enabled];
        this.textureDisabled = resources[buttonResources[buttonName].disabled];
        this.texturePressed  = resources[buttonResources[buttonName].pressed];
        this.onButtonClick = action;

        this.sprite = new PIXI.Sprite(this.textureEnabled);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.isDown = false;
        this.state = 'enabled';

        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.on('pointerdown', function(e){
            this.isDown = true;
            this.sprite.texture = this.texturePressed;
        }.bind(this));

        this.sprite.on('pointerup', function(e) {
            this.sprite.texture = this.textureEnabled;
            if (this.isDown)
                this.onButtonClick();
            this.isDown = false;
        }.bind(this));

        this.sprite.on('pointerout', function () {
            this.sprite.texture = this.textureEnabled;
            this.isDown = false;
        }.bind(this));

        this.scene.addChild(this.sprite);

        this.sprite.model = this;


    }

    public hide() {
        this.sprite.visible = false;
    }

    public show() {
        this.sprite.visible = true;
    }

    public disable() {
        this.state = 'disabled';
        this.sprite.texture = this.textureDisabled;
        this.sprite.interactive = false;
    }

    public enable() {
        this.state = 'enabled';
        this.sprite.visible = true;
        this.sprite.texture = this.textureEnabled;
        this.sprite.interactive = true;
    }

    public click() {
        this.state = 'pressed';
        this.sprite.texture = this.texturePressed;
        this.sprite.interactive = false;
    }

}


export class DenominationPanelButton extends Button {

    public selectedStake: PIXI.Text;
    public stakesYpos: number[] = [];
    public currentStakeAmount: number;
    public stakeFontStyle: any;
    public fontStyle: any;
    public stakes: number[];
    public denomPanelContainer: PIXI.Container;
    public denomSpriteBottom: PIXI.Sprite;
    public denomSpriteTop: PIXI.Sprite;
    public denomSpriteMiddle: PIXI.Sprite;
    public denomSpriteSelected: PIXI.Sprite;
    public denomBottom: PIXI.Texture;
    public denomTop: PIXI.Texture;
    public denomMiddle: PIXI.Texture;
    public denomSelected: PIXI.Texture;
    private denomPartContainers: PIXI.Container[];
    public isShown: boolean;

    constructor(scene: PIXI.Container, x: number, y: number, fontStyle: any,stakeFontStyle: any, denomBottom:any, denomTop:any, denomMid:any, denomSelect: any, enabled_img: any, dis_img:  any, pressed_img: any, sound: any, action: Function){
        super(scene, x, y, enabled_img, enabled_img, action);
        this.isShown = false;
        this.selectedStake = new PIXI.Text('', fontStyle);
        this.fontStyle = fontStyle;
        this.stakeFontStyle = stakeFontStyle;
        this.denomPartContainers = [];
        if (typeof  denomBottom === "string" && typeof denomTop === "string" && typeof denomMid === "string" && typeof denomSelect === "string" ){
            this.denomBottom = PIXI.Texture.fromImage(denomBottom);
            this.denomTop    = PIXI.Texture.fromImage(denomTop);
            this.denomMiddle = PIXI.Texture.fromImage(denomMid);
            this.denomSelected = PIXI.Texture.fromImage(denomSelect);
        } else {
            this.denomBottom   = denomBottom;
            this.denomTop      = denomTop;
            this.denomMiddle   = denomMid;
            this.denomSelected = denomSelect;
        }
        this.enableEventPropagination();
        this.getStakes();
        this.initializeDenominationPanel();
        this.intitializeCurrentStake();

    }

    private initializeDenominationPanel(): void {
        this.denomSpriteBottom = new PIXI.Sprite(this.denomBottom);
        this.denomSpriteMiddle = new PIXI.Sprite(this.denomMiddle);
        this.denomSpriteTop    = new PIXI.Sprite(this.denomTop);
        this.denomSpriteSelected = new PIXI.Sprite(this.denomSelected);

        this.denomPanelContainer = new PIXI.Container();
        this.denomPanelContainer.visible = false;
        this.denomPanelContainer.alpha = 0;
        this.denomPanelContainer.x = this.sprite.x - this.sprite.width/2;
        this.denomPanelContainer.y = (this.sprite.y - this.sprite.height/2) - this.denomSpriteTop.height - (this.denomSpriteMiddle.height*(this.stakes.length-2)) - this.denomSpriteBottom.height;

        for (let i=0; i<this.stakes.length; i++){
            this.addDenomPanelPart(i);
        }
        this.scene.addChild(this.denomPanelContainer);
    }

    private addDenomPanelPart(index) {
        let partContainer = new PIXI.Container(),
            stake = new PIXI.Text(utils.formatStakeAmount(this.stakes[index]), this.fontStyle),
            partSprite;

        stake.anchor.set(0.5, 0.5);
        stake.x = this.denomSpriteMiddle.width/2;
        stake.y = this.denomSpriteMiddle.height/2;

        if (index == 0){
            partSprite = this.denomSpriteTop;
            stake.y = partSprite.height - this.denomSpriteMiddle.height/2;
            partContainer.y = 0;
        } else if (index == this.stakes.length-1) {
            partSprite = this.denomSpriteBottom;
            partContainer.y = this.denomSpriteTop.height + (this.denomSpriteMiddle.height * (this.stakes.length-2));
        } else {
            partSprite = new PIXI.Sprite(this.denomMiddle);
            partContainer.y = this.denomSpriteTop.height + (this.denomSpriteMiddle.height * (index-1));
        }
        this.stakesYpos.push(partContainer.y + stake.y);
        partContainer.addChild(partSprite);

        partContainer.interactive = true;
        partContainer.on('pointerdown', function (e) {
            e.stopPropagation();
            this.changeStake(this.stakes[index]);

        }.bind(this));

        partContainer.addChild(stake);
        this.denomPartContainers.push(partContainer);
        this.denomPanelContainer.addChild(partContainer)
    }

    private getStakes() {
        this.stakes = [20, 40, 60, 80, 100].reverse();
        this.currentStakeAmount = this.stakes[0];
    }

    private intitializeCurrentStake() {
        this.selectedStake = new PIXI.Text(utils.formatStakeAmount(this.currentStakeAmount), this.stakeFontStyle);
        this.selectedStake.anchor.set(0.5, 0.5);
        this.selectedStake.x = this.sprite.x;
        this.selectedStake.y = this.sprite.y+5; // +5 due to graphics issue
        this.scene.addChild(this.selectedStake);

        this.denomSpriteSelected.anchor.set(0.5, 0.5);
        this.denomSpriteSelected.alpha = 0.2;
        this.denomSpriteSelected.x = this.denomSpriteMiddle.width/2;
        this.denomSpriteSelected.y = this.getSelectedStakeYpos();
        this.denomPanelContainer.addChild(this.denomSpriteSelected);
    }

    private getSelectedStakeYpos(): number {
        let index = this.stakes.indexOf(this.currentStakeAmount);
        return this.stakesYpos[index];

    }

    private enableEventPropagination() {
        this.sprite.on('pointerdown', function(e){
            e.stopPropagation();
            this.isDown = true;
            this.sound.currentTime = 0;
            this.sound.play();
            this.sprite.texture = this.texturePressed;
        }.bind(this));

        this.sprite.on('pointerup', function(e) {
            e.stopPropagation();
            this.sprite.texture = this.textureEnabled;
            if (this.isDown)
                this.onClick();
            this.isDown = false;
        }.bind(this));
    }

    public showPanel() {
        if (!this.isShown)
            app.ticker.add(showPanelAnimation, this);

        function showPanelAnimation(timedelta: number) {
            this.denomPanelContainer.visible = true;
            this.denomPanelContainer.alpha = Math.min((this.denomPanelContainer.alpha+(0.08*timedelta)), 1);
            if (this.denomPanelContainer.alpha == 1) {
                this.isShown = true;
                this.scene.interactive = true;
                app.ticker.remove(showPanelAnimation, this);
            }

        }
    }

    public hidePanel() {
        if (this.isShown)
            app.ticker.add(hidePanelAnimation, this);

        function hidePanelAnimation(timedelta: number) {
            this.denomPanelContainer.alpha = Math.max((this.denomPanelContainer.alpha-(0.08*timedelta)), 0);
            if (this.denomPanelContainer.alpha == 0) {
                this.denomPanelContainer.visible = false;
                this.isShown = false;
                this.scene.interactive = false;
                app.ticker.remove(hidePanelAnimation, this);
            }
        }
    }

    public changeStake(to) {

        let toY = this.stakesYpos[this.stakes.indexOf(to)];
        this.setInteractiveForPartContainers(false);
        this.selectedStake.text =  utils.formatStakeAmount(to);

        let changeStakeEvent = new CustomEvent('changeStakeEvent', {'detail':{'newStake': to}});
        document.dispatchEvent(changeStakeEvent);

        app.ticker.add(changeStakeAnimation, this);

        function changeStakeAnimation(timedelta: number) {
            if (this.denomSpriteSelected.y < toY){
                this.denomSpriteSelected.y = Math.min(this.denomSpriteSelected.y + timedelta*30, toY);
            }
            else if (this.denomSpriteSelected.y > toY) {
                this.denomSpriteSelected.y = Math.max(this.denomSpriteSelected.y - timedelta*30, toY);
            }
            else {
                this.currentStakeAmount = to;
                this.setInteractiveForPartContainers(true);
                app.ticker.remove(changeStakeAnimation, this);
            }

        }
    }

    private setInteractiveForPartContainers(value: boolean){
        for(let i=0; i<this.denomPartContainers.length; i++){
            this.denomPartContainers[i].interactive = value;
        }
    }

}

