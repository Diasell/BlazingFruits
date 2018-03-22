import {FruitObject} from "./FruitObject";
/**
 * Created by tarasg on 10/8/2017.
 */


export class LineObject {

    public elements: FruitObject[];

    constructor() {
        this.elements = [];
    }

    public addElement(el: FruitObject): void {
        this.elements.push(el);
    }

    public addElements(...args: FruitObject[]): void {
        for (let i=0; i<arguments.length; i++ ){
            this.elements.push(arguments[i])
        }
    }

    public enableLine(): void {
        for (let i=0; i<this.elements.length; i++) {
            this.elements[i].enable();
        }
    }

    public disableLine(): void {
        for (let i=0; i<this.elements.length; i++) {
            this.elements[i].disable();
        }
    }

    public overLine(): void {
        for (let i=0; i<this.elements.length; i++) {
            this.elements[i].over();
        }
    }

    public showPossibleWin() {
        for (let i=0; i<this.elements.length; i++) {
            if (!this.elements[i].selected) {
                this.elements[i].showPossibleWin();
            }
        }
    }
    public setPossibleWinsDisabled(): void {
        for (let i=0; i<this.elements.length; i++) {
            if (!this.elements[i].selected) {
                this.elements[i].setPossibleWinsDisabled();
            }
        }
    }


    public resetLine() {
        for (let i=0; i<this.elements.length; i++) {
            this.elements[i].reset();
        }
    }


}