/**
 * Created by tarasg on 7/26/2017.
 */

import {ReelSet} from './reels';
import {WinLinesArray} from './Lines';
import {PayTable} from './PayTable';

declare let GDKWrapper: any;



interface ISpinData {
    stops: Array<number>;
    symbolMatrix: number[][];
    winlines: any;
    isAnticipation: Array<boolean>;
    isBonus: boolean;
    bonusData: number[][];
}


export class SpinData implements ISpinData {
    public stops: Array<number>;
    public isBonus: boolean;
    public symbolMatrix: number[][];
    public isAnticipation: Array<boolean>;
    public winlines: any;
    public bonusData: number[][];

    constructor() {
        this.isBonus = false;
        this.isAnticipation = Array(5).fill(false);
    }
}

export class RNG {
    private stack: Array<number>;

    constructor() {
        this.stack = [];
        this.updateStack(50);
    }

    public updateStack(amount:number):void {
        GDKWrapper.GetRandomNumber(amount, function(arg:any) {
            if (arg.result != GDKWrapper.RESULT.ERROR) {
                for (let i = 0; i < arg.value.length; i++) {
                    this.stack.push(arg.value[i]);
                }
            }
        }.bind(this));
    }

    public getRandom(): number {
        let numberLeft = this.stack.length;
        if (numberLeft > 10)
            return this.stack.pop();
        else
            this.updateStack(50);
        return this.stack.pop();
    }

    public getRandomArray(size: number): Array<number> {
        let result = [];
        if (size < this.stack.length) {
            for (let i=0; i<size; i++) {
                result.push(this.getRandom());
            }
        }
        return result;
    }

}

export class BlazingFruits {

    // private symbols: Array<string> = ['WILD', 'LOGO', 'SEVEN', 'WM', 'PLUM', 'ORANGE', 'LEMON', 'CHERRY', 'BONUS'];
    private wild: number = 0;
    // private logo: number = 1;
    // private seven: number = 2;
    // private wm: number = 3;
    // private plum: number = 4;
    // private orange: number = 5;
    // private lemon: number = 6;
    // private cherry: number = 7;
    private bonus: number = 8;

    public totalBet: number = 0;
    private totalWin: number = 0;
    private RNG: any;

    private spinData: ISpinData;

    constructor(defaultBet: number, rng: any) {
        this.totalBet = defaultBet;
        this.RNG = rng;
    }


    public changeTotalBet(newBet:number): void {
        this.totalBet = newBet;
    }


    public playGame(): ISpinData {
        this.totalWin = 0;
        this.playSpin();

        if (this.spinData.isBonus) {
            this.playBonus();
        }

        return this.spinData;
    }


    private playSpin(): any {
        this.spinData = new SpinData();

        this.spinData.stops = this.getSpinStops(ReelSet, this.RNG.getRandomArray(5));
        this.spinData.symbolMatrix = this.getSymbolMatrix(ReelSet, this.spinData.stops);
        this.updateAnticipationInfo(this.spinData.symbolMatrix);
        this.spinData.winlines = this.getWinLinesInfo(this.spinData.symbolMatrix);
        this.spinData.isBonus = this.checkForBonus(this.countBonusSymbols(this.spinData.symbolMatrix));

    }


    private getSpinStops(reelset: number[][], randomNumbersArray: number[]): number[] {
        let result = [],
            i = 0;
        for (i; i<reelset.length; i++) {
            result.push(randomNumbersArray[i] % reelset[i].length);
        }
        return result;
    }


    private getSymbolMatrix(reelset: number[][], spinStops: number[]): number[][] {
        let result = [];
        for (let i=0; i<reelset.length; i++){
            let reelSymbols = [];
            for (let j=0; j<3; j++) {
                let x: number = spinStops[i] + j;
                if ( x >= reelset[i].length) {
                    x -= reelset[i].length
                }
                reelSymbols.push(reelset[i][x]);
            }
            result.push(reelSymbols)
        }
        return result;
    }


    private countBonusSymbols(symbolMatrix: number[][]): number {
        let quantity = 0;
        for (let i=0; i<symbolMatrix.length; i++) {
            for (let j=0; j<symbolMatrix[i].length; j++){
                if (symbolMatrix[i][j] == this.bonus)
                    quantity++;
            }
        }
        return quantity
    }


    private checkForBonus(symbolsQuantity: number): boolean {
        return (symbolsQuantity >= 3);
    }


    private playBonus(): void {
        this.spinData.bonusData.push([10*this.totalBet, 15*this.totalBet]);
        this.spinData.bonusData.push([15*this.totalBet, 40*this.totalBet, 0]);
        this.spinData.bonusData.push([20*this.totalBet, 50*this.totalBet, 80*this.totalBet, 0]);
        this.spinData.bonusData.push([40*this.totalBet, 80*this.totalBet, 120*this.totalBet, 0, 0]);
        this.spinData.bonusData.push([80*this.totalBet, 125*this.totalBet, 150*this.totalBet, 0, 0, 0]);
    }


    private getWinLinesInfo(symbolMatrix: number[][]): any {
        let result: any = {};
        for (let i=0; i<WinLinesArray.length; i++ ) {
            let line = this.getLineSymbols(symbolMatrix, WinLinesArray[i]),
                win = this.getWinLineResult(line);
            if (win>0){
                result[i] = win;
                this.totalWin += win;
            }
        }
        return result;
    }


    private getLineSymbols(symbolMatrix: number[][], winline: Array<number>): Array<number> {
        let result: Array<number> = [];
        for (let i=0; i<symbolMatrix.length; i++) {
            result.push(symbolMatrix[i][winline[i]]);
        }
        return result;
    }


    private getWinLineResult(line: Array<number>) : number {
        let firstSymbol = this.getFirstLineSymbol(line),
            winLineResult = 0,
            wildStreakWin = 0,
            winSymbolCount = 1;
        for ( let i=1; i<line.length; i++){
            if (line[i] == firstSymbol || line[i] == this.wild) {
                winSymbolCount++;
            } else {
                break;
            }
        }
        winLineResult = this.totalBet * PayTable[firstSymbol][winSymbolCount-1];

        if (line[0] == this.wild) {
            let wildStreakCount = 1;
            for ( let i=1; i<line.length; i++){
                if (line[i] == this.wild) {
                    wildStreakCount++;
                } else {
                    break;
                }
            }
            wildStreakWin = this.totalBet * PayTable[this.wild][wildStreakCount-1];
        }

        return Math.max(wildStreakWin, winLineResult);
    }


    private getFirstLineSymbol(line: number[]): number {
        for (let i=0; i<line.length; i++) {
            if (line[i] != this.wild) {
                return line[i]
            }
        }
    }


    private updateAnticipationInfo(symbolMatrix: number[][]): void {
        if (symbolMatrix[0].indexOf(this.bonus) != -1)
            this.spinData.isAnticipation[2] = true;
        if ((symbolMatrix[0].indexOf(this.bonus) != -1) && (symbolMatrix[2].indexOf(this.bonus) != -1))
            this.spinData.isAnticipation[4] = true;
    }
}

