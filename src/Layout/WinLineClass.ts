import {PointsMatrix, WinLinesArray} from "../Math/Lines";
import {symbolHeight, symbolWidth, WinBoxHeight, WinBoxWidth} from "../ReelSpinner/reelsConfig";
import {NumericField} from "./NumericField";
import {FontStyles} from "../Utils/fontStyles";
import {formatStakeAmount} from "../Utils/helperFuncs";
/**
 * Created by tarasg on 10/17/2017.
 */
export class WinLine {
    public scene;
    private resources: any;
    public lineNumberSprite: PIXI.Sprite;
    public lineNumber: number;
    public linePoints: Array<PIXI.Point>;
    private LineRope: PIXI.mesh.Rope;
    private WinLineTexture : PIXI.Texture;
    private WinBoxTexture: PIXI.Texture;
    private currentWinSymbolsAmount: number;

    private winBoxes: Array<PIXI.Sprite>;
    private WinRopes: Array<PIXI.mesh.Rope>;
    private line: Array<number>;

    private winAmountField: NumericField;
    private winAmountF_x: number;
    private winAmountF_y: number;
    private WinAmountFieldTexture: PIXI.Texture;

    private winLineSounds: any[];
    private mainSymbol : number;


    constructor(scene, LineNumber: number, WinLineTexture: PIXI.Texture, WinBoxTexture:PIXI.Texture, WinAmountFieldTexture: PIXI.Texture, resources: any) {
        this.scene = scene;
        this.resources = resources;
        this.lineNumber = LineNumber;
        this.linePoints = [];
        this.currentWinSymbolsAmount = 0;
        this.lineNumberSprite = new PIXI.Sprite();
        this.WinLineTexture = WinLineTexture;
        this.WinBoxTexture = WinBoxTexture;
        this.WinAmountFieldTexture = WinAmountFieldTexture;

        this.winAmountF_y = PointsMatrix[2][1].y + this.WinBoxTexture.height/2;
        this.winAmountF_x = PointsMatrix[2][1].x - WinAmountFieldTexture.width/2;
        // this.winAmountField = new NumericField(scene, FontStyles.stakeFont, this.winAmountF_x, this.winAmountF_y, WinAmountFieldTexture, {});
        this.winAmountField.hide();

        this.winLineSounds = [
            new Audio(this.resources.bf_symbol.url),
            new Audio(this.resources.bf_symbol.url),
            new Audio(this.resources['7_symbol'].url),
            new Audio(this.resources.wm_symbol.url),
            new Audio(this.resources.plum_symbol.url),
            new Audio(this.resources.orange_symbol.url),
            new Audio(this.resources.lemon_symbol.url),
            new Audio(this.resources.cherry_symbol.url)
        ];


        this.winBoxes = [
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture),
            new PIXI.Sprite(WinBoxTexture)
        ];

        this.WinRopes = [
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, []),
            new PIXI.mesh.Rope(WinLineTexture, [])
        ];


        this.line = WinLinesArray[LineNumber];

        // this.initializeLineNumber(LineNumber);
        this.initializeLine();
        this.initializeLineRope();

    }


    // private initializeLineNumber(LineNumber: number): void {
    //     this.lineNumberSprite.texture = LineNumbers[LineNumber].IdleTexture;
    //     this.scene.addChild(this.lineNumberSprite);
    //     this.lineNumberSprite.x = LineNumbers[LineNumber].x;
    //     this.lineNumberSprite.y = LineNumbers[LineNumber].y;
    // }

    private initializeLine(): void {
        for (let i=0; i<this.line.length; i++) {
            this.linePoints.push(PointsMatrix[i][this.line[i]]);
        }

    }

    private initializeLineRope(): void {
        this.LineRope = new PIXI.mesh.Rope(this.WinLineTexture, this.linePoints);
        this.scene.addChild(this.LineRope);
        this.LineRope.visible = false;
    }

    public showWinLine(): void {
        this.LineRope.visible = true;
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].SelectedTexture;
    }

    public hideWinLine(): void {
        this.LineRope.visible = false;
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].IdleTexture;
    }

    public disableWinLine(): void {
        // this.lineNumberSprite.texture = LineNumbers[this.lineNumber].DisabledTexture;
    }

    public winShow(symbols: number[], indexes: number[], win: number,  mainSymbol: number): void {

        this.scene.winLinesArray[this.lineNumber].setTextureToggled();

        let amount = symbols.length;
        this.currentWinSymbolsAmount = amount;

        this.mainSymbol = mainSymbol;
        this.winLineSounds[mainSymbol].play();
        // Draw the end of the line
        if (amount < this.scene.REELS.reelsArray.length){
            this.drawWinLineEnd(amount);
        }

        // Draw winning symbols and lines between them
        for (let i=0; i<amount; i++){
            if ( i < amount-1){
                this.drawRope(i);
            }
            // Draw animation
            this.scene.REELS.reelsArray[i].playWinShow(symbols[i], indexes[i]);



            // Draw WinBoxes around symbols
            this.winBoxes[i].anchor.set(0.5, 0.5);
            this.winBoxes[i].x = PointsMatrix[i][indexes[i]].x;
            this.winBoxes[i].y = PointsMatrix[i][indexes[i]].y;
            this.winBoxes[i].visible = true;
            this.scene.addChild(this.winBoxes[i]);
        }
        // Draw WinLine Amount Field
        if (amount==2) {
            this.winAmountField.fieldContainer.x = PointsMatrix[1][1].x - this.WinAmountFieldTexture.width/2;
            this.winAmountField.fieldContainer.y = PointsMatrix[1][amount-1].y + this.WinBoxTexture.height/2;
        } else {
            this.winAmountField.fieldContainer.x = PointsMatrix[2][1].x - this.WinAmountFieldTexture.width/2;
            this.winAmountField.fieldContainer.y = PointsMatrix[2][indexes[2]].y + this.WinBoxTexture.height/2;
        }
        this.winAmountField.text.text = formatStakeAmount(win);

        this.winAmountField.show();


    }

    public stopWinShow(): void {

        this.winLineSounds[this.mainSymbol].pause();
        this.winLineSounds[this.mainSymbol].currentTime = 0;

        this.scene.winLinesArray[this.lineNumber].setTextureDisabled();

        for (let i=0; i<this.currentWinSymbolsAmount; i++)
        {
            this.WinRopes[i].destroy();
            this.scene.REELS.reelsArray[i].stopWinShow(this.line[i]);
            this.winBoxes[i].visible = false;
        }

        this.winAmountField.hide();
    }



    private drawWinLineEnd(amount: number): void {

        let points = this.linePoints.slice(amount-1);
        // set first point to the end of the last WinBox
        points[0] = this.getStartEndPoints(this.linePoints[amount-1], this.linePoints[amount])[0];
        this.WinRopes[amount-1] = new PIXI.mesh.Rope(this.WinLineTexture, points);
        this.scene.addChild(this.WinRopes[amount-1]);
    }

    private drawRope(index: number): void {

        let points = this.getStartEndPoints(this.linePoints[index], this.linePoints[index+1]);
        this.WinRopes[index] = new PIXI.mesh.Rope(this.WinLineTexture, points);
        this.scene.addChild(this.WinRopes[index]);
    }


    private getStartEndPoints(point1: PIXI.Point, point2: PIXI.Point): PIXI.Point[]{
        let A,B,C,k,b, result=[];

        A = point2.y - point1.y;
        B = point1.x - point2.x;
        C = point1.y * point2.x - point1.x * point2.y;

        k = (A/B) == 0 ? 0 : -(A/B);
        b = (C/B) == 0 ? 0 : -(C/B);

        // get coordinates of places where winLine can possibly intersect with WinBox where it starts
        let possibleStarts = [
            new PIXI.Point(Math.floor(point1.x + symbolWidth/2), Math.floor(k*(point1.x+symbolWidth/2) + b)),
            new PIXI.Point(Math.floor(((point1.y + symbolHeight/2) - b)/k), Math.floor(point1.y + symbolHeight/2)),
            new PIXI.Point(Math.floor(((point1.y - symbolHeight/2) - b)/k), Math.floor(point1.y - symbolHeight/2))
        ];

        // choose the one that lies on the egde of the Winbox
        for (let i=0;i<3;i++){
            let point = possibleStarts[i];
            if (point.x <= Math.floor(point1.x + symbolWidth/2) && point.x >= point1.x && point.y <= Math.floor(point1.y + symbolHeight/2) && point.y >= Math.floor(point1.y - symbolHeight/2))
            {
                point.y += Math.floor((WinBoxHeight - symbolHeight)/2);
                result.push(point)
            }
        }
        // get coordinates of places where winLine can possibly intersect with WinBox where it ends
        let possibleEnds = [
            new PIXI.Point(Math.floor(point2.x - symbolWidth/2), Math.floor(k*(point2.x - symbolWidth/2) + b)),
            new PIXI.Point(Math.floor(((point2.y + symbolHeight/2)-b)/k), Math.floor(point2.y + symbolHeight/2)),
            new PIXI.Point(Math.floor(((point2.y - symbolHeight/2)-b)/k), Math.floor(point2.y - symbolHeight/2))
        ];
        // choose the one that lies on the egde of the Winbox
        for (let i=0;i<3;i++){
            let point = possibleEnds[i];
            if (point.x >= Math.floor(point2.x - symbolWidth/2) && point.x <= point2.x && point.y <= Math.floor(point2.y + symbolHeight/2) && point.y >= Math.floor(point2.y - symbolHeight/2))
            {
                point.x += Math.floor((WinBoxWidth - symbolWidth)/2);
                point.y += Math.floor((WinBoxHeight - symbolHeight)/2);
                result.push(point)
            }
        }

        return result;
    }





}