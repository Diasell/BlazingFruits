/**
 * Created by tarasg on 10/5/2017.
 */
import {app} from "../main";
export class TextContainer {

    public fieldBackGround : PIXI.Texture;
    public fieldContainer: PIXI.Container;
    public sprite: PIXI.Sprite | any;
    public textStyle: any;
    public text: PIXI.Text;
    public x: number;
    public y: number;
    public scene: PIXI.Container;



    constructor(scene: PIXI.Container,textStyle: any, x: number, y: number, field_img: any) {
        // enabled_img, dis_img, pressed_img:  PIXI.Textutre or string url to the image
        this.x = x;
        this.y = y;
        this.textStyle = textStyle;
        this.scene = scene;
        if (typeof field_img === "string"){
            this.fieldBackGround  =  PIXI.Texture.fromImage(field_img);
        } else {
            this.fieldBackGround  =  field_img;
        }


        this.fieldContainer = new PIXI.Container();

        this.sprite = new PIXI.Sprite(this.fieldBackGround);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.fieldContainer.addChild(this.sprite);

        // add text
        this.text = new PIXI.Text('default', this.textStyle);
        this.fieldContainer.addChild(this.text);
        this.text.anchor.set(0.5, 0.5);
        this.text.x = this.x;
        this.text.y = this.y;

        this.scene.addChild(this.fieldContainer);

    }


    public hide() {
        this.fieldContainer.visible = false;
    }

    public show() {
        this.fieldContainer.visible = true;
    }

}