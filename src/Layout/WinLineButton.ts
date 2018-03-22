/**
 * Created by tarasg on 9/27/2017.
 */
import {WinLinesArray, PointsMatrix} from "../Math/Lines";

export class WinLineButton {

    public textureEnabled : PIXI.Texture;
    public textureDisabled: PIXI.Texture;
    public texturePressed : PIXI.Texture;
    public lineTexure: PIXI.Texture;
    public lineRope: PIXI.mesh.Rope;

    public sprite: PIXI.Sprite | any;
    public lineNumber: number;
    public x: number;
    public y: number;
    public scene: PIXI.Container;
    public sound: any;

    public onClick : Function;
    private isDown: boolean;
    private state: string;


    constructor(scene: PIXI.Container, lineNumber:number, x: number, y: number, line_img: any, enabled_img: any, dis_img:  any, pressed_img: any, sound: any, action: Function) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.lineNumber = lineNumber;
        this.x = x;
        this.y = y;
        this.sound = sound;
        this.scene = scene;
        if (typeof line_img === "string" && typeof enabled_img === "string" && typeof dis_img === "string" && typeof pressed_img === "string"){
            this.lineTexure = PIXI.Texture.fromImage(line_img);
            this.textureEnabled  =  PIXI.Texture.fromImage(enabled_img);
            this.textureDisabled = PIXI.Texture.fromImage(dis_img);
            this.texturePressed  = PIXI.Texture.fromImage(pressed_img);
        } else {
            this.lineTexure = line_img;
            this.textureEnabled  =  enabled_img;
            this.textureDisabled = dis_img;
            this.texturePressed  = pressed_img;
        }
        this.onClick = action;
        // Line Rope:
        let points = this.getLinePoints(WinLinesArray[this.lineNumber-1]);
        this.lineRope = new PIXI.mesh.Rope(this.lineTexure, points);
        this.lineRope.visible = false;
        this.scene.addChild(this.lineRope);

        // Line Number Button
        this.sprite = new PIXI.Sprite(this.textureEnabled);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.isDown = false;
        this.state = 'enabled';

        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.on('pointerdown', function(){
            this.isDown = true;
            this.sound.currentTime = 0;
            this.sound.play();
            this.sprite.texture = this.texturePressed;
            this.lineRope.visible = true;
        }.bind(this));

        this.sprite.on('pointerup', function() {
            this.lineRope.visible = false;
            this.sprite.texture = this.textureEnabled;
            if (this.isDown)
                this.onClick();
            this.isDown = false;
        }.bind(this));

        this.sprite.on('pointerout', function () {
            this.lineRope.visible = false;
            this.sprite.texture = this.textureEnabled;
            this.isDown = false;
        }.bind(this));

        this.scene.addChild(this.sprite);

        this.sprite.model = this;
    }

    private getLinePoints(line: number[]): Array<PIXI.Point> {
        let points = [];
        points.push(new PIXI.Point(this.x, this.y));
        if (this.x < PointsMatrix[0][0].x) {
            for(let i=0; i<line.length;i++){
                points.push(PointsMatrix[i][line[i]]);
            }
        } else{
            for(let i=line.length-1; i>=0;i--){
                points.push(PointsMatrix[i][line[i]]);
            }
        }
        return points;
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
        this.sprite.texture = this.textureEnabled;
        this.sprite.interactive = true;
    }

    public setTextureToggled() {
        this.state = 'pressed';
        this.sprite.texture = this.texturePressed;

    }
    public setTextureEnabled() {
        this.sprite.texture= this.textureEnabled;
    }
    public setTextureDisabled() {
        this.sprite.texture = this.textureDisabled;
    }

}
