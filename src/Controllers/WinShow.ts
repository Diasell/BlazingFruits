import {BaseGameController} from "./BaseGame";
/**
 * Created by tarasg on 10/17/2017.
 */



export class WinShowController {
    private scene: any;
    private payouts: any;
    private currentWinLineIndex: number;
    private skipWinShow: boolean;
    private currentWinLine: any;
    private playingWinShow: boolean;


    private onReelAnimEnd: any;
    private onSkipWinShow: any;

    constructor(scene: any) {
        this.scene = scene;
        this.currentWinLineIndex = 0;
        this.skipWinShow = false;
        this.onReelAnimEnd = function (e) {
            if (!this.skipWinShow)
                this.onWinShowEnd(e);
        }.bind(this);

        this.onSkipWinShow = function () {
            this.onSkipWinShowFunc();
        }.bind(this);

        document.addEventListener('ReelWinShowAnimEnd', this.onReelAnimEnd);
        document.addEventListener('skipWinShow', this.onSkipWinShow);
    }

    public updatePayouts(response): void {
        this.payouts = response.data.gameData.playStack[0].lastPlayInModeData.slotsData.actions[1].payouts;
    }

    public playWinShow() {
        this.skipWinShow = false;
        this.playingWinShow = true;
        let payoutObj = this.payouts[this.currentWinLineIndex];

        if (payoutObj.context.symbolPayoutType == "WinLine" && !this.skipWinShow) {
            let winOnLine = payoutObj.payoutData.payoutWinAmount,
                winline = this.scene.winShowLineArray[payoutObj.context.winLineIndex-1],
                winSymbols = this.parseWinSymbols(payoutObj),
                positionOnReel = this.parsePositionIndex(payoutObj);
            this.currentWinLine = winline;
            let symbol = payoutObj.context.symbol;
            winline.winShow(winSymbols, positionOnReel,  winOnLine, symbol);
        }

    }

    private onSkipWinShowFunc():void {
        if (this.currentWinLine && this.playingWinShow) {
            this.skipWinShow = true;
            this.playingWinShow = false;
            this.currentWinLineIndex = 0;
            this.currentWinLine.stopWinShow();
        }

    }

    private onWinShowEnd(event) {
        if (event.detail.reelIndex == (this.currentWinLine.currentWinSymbolsAmount-1)) {
            this.currentWinLine.stopWinShow();
            this.updateWinlineIndex();
            this.playWinShow();
        }

    }

    private parseWinSymbols(payoutObj:any): number[] {
        let winSymbols = [];
        for (let i=0; i<payoutObj.context.winningSymbols.length; i++) {
            winSymbols.push(payoutObj.context.winningSymbols[i].symbol)
        }
        return winSymbols;
    }
    private parsePositionIndex(payoutObj:any): number[] {
        let positions = [];
        for (let i=0; i<payoutObj.context.winningSymbols.length; i++) {
            positions.push(payoutObj.context.winningSymbols[i].positionOnReel)
        }
        return positions;
    }


    private updateWinlineIndex(): void {
        this.currentWinLineIndex++;
        if (this.currentWinLineIndex >= this.payouts.length)
            this.currentWinLineIndex = 0;
    }

}