/**
 * Created by tarasg on 10/4/2017.
 */
import {Button} from "../Layout/Buttons";
import {GambleScene} from "../Scenes/GameScenes";
import {formatStakeAmount} from "../Utils/helperFuncs";
import {ButtonEvents} from "../Events/ButtonEvents";
import {FontStyles} from "../Utils/fontStyles";
import {SCENE_MANAGER} from "../main"


let GambleButtonStates = {
    'idle' : ['enable', 'enable', 'enable'],
    'round': ['disable', 'disable', 'disable']
};

let GambleMessages = {
    'idle': 'Red or Black to gamble',
    'round': 'Good Luck',
    'win' : 'WIN',
    'lose': 'LOSE'
};

export class GambleController {
    private gambleLimit: number;
    private state: string;
    private doubleTo: number;
    private amountOfTries: number;
    private bank: number;
    private scene: GambleScene;
    private GambleButtons: Button[];
    private playGambleRed : EventListener;
    private playGambleBlack : EventListener;
    private exitGambleF: any;

    private gamble_amb: any;
    private winSounds: any[];
    private loseSound: any;


    constructor(scene: GambleScene) {
        this.scene = scene;
        this.gambleLimit = 50000;
        this.bank = 0;
        this.doubleTo = 0;

        this.GambleButtons = [scene.redButton, scene.blackButton, scene.collectButton];
        this.playGambleRed =  this.playGamble.bind(this, 'red');
        this.playGambleBlack =  this.playGamble.bind(this, 'black');

        this.exitGambleF  = this.exitGamble.bind(this);

        this.gamble_amb = new Audio(this.scene.resources.gamble_amb.url);
        this.gamble_amb.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);

        this.winSounds = [
            new Audio(this.scene.resources.gamble_win1.url),
            new Audio(this.scene.resources.gamble_win2.url),
            new Audio(this.scene.resources.gamble_win3.url),
            new Audio(this.scene.resources.gamble_win4.url),
            new Audio(this.scene.resources.gamble_win5.url),
        ];

        this.loseSound = new Audio(this.scene.resources.gamble_lose.url);

        this.setState('idle');
    }

    public setState(state:string) {
        this.state = state;
        this.scene.textField.text.text = GambleMessages[state];
        // set button states:
        for (let i=0; i<GambleButtonStates[state].length; i++) {
            if (GambleButtonStates[state][i] == 'enable'){
                this.GambleButtons[i].enable();
            } else if (GambleButtonStates[state][i] == 'disable'){
                this.GambleButtons[i].disable();
            } else if (GambleButtonStates[state][i] == 'hide'){
                this.GambleButtons[i].hide();
            }
        }
    }

    public setBank(amount) {
        this.bank = amount;
        this.scene.bankField.countTill(amount);
        this.scene.doubleToField.countTill(((amount*2)));
    }

    public startGamble(amount: number) {
        this.amountOfTries = 0;
        this.gamble_amb.play();
        this.setState('idle');
        this.setBank(amount);
        this.signToButtonEvents();


    }

    private getSuitColor(suitValue: number): string {
        if (suitValue == 0 || suitValue == 3)
            return "black";
        else
            return "red";
    }

    private playGamble(playerChoice: string) {
        this.amountOfTries++;
        this.setState('round');
        this.unSignFromButtonEvents();
        let randomSuit = Math.floor((Math.random() * 4)),
            randomCard = Math.floor((Math.random() * 14)),
            cardTexture = this.scene.gambleCard.getCardFaceTexture(randomSuit, randomCard);

        this.scene.gambleCard.flip(cardTexture, function () {
            this.scene.gambleHistory.showHiddenCard(cardTexture);
            this.scene.gambleHistory.updateHistoryWithNewResult([randomSuit, randomCard]);
            this.scene.gambleHistory.moveLastCards(function () {
                this.scene.gambleHistory.resetLastCards();
                if (playerChoice == this.getSuitColor(randomSuit)) {
                    this.scene.textField.text.text = GambleMessages['win'];

                    if (this.amountOfTries<4) {
                        this.winSounds[this.amountOfTries%5].play();
                    } else{
                        this.winSounds[4].play();
                    }

                    let win = this.bank*2;
                    this.bank = win;
                    if (win > this.gambleLimit/2) {
                        this.scene.bankField.countTill(win);
                        this.scene.doubleToField.text.text = '';
                        document.dispatchEvent(ButtonEvents.GambleCollectPressed);
                    } else {
                        this.scene.gambleCard.flip(this.scene.gambleCard.cardBackT, function () {
                            this.setBank(win);

                            this.signToButtonEvents();
                            this.setState('idle');
                        }.bind(this))
                    }
                } else {
                    this.scene.textField.text.text = GambleMessages['lose'];
                    this.loseSound.play();
                    this.scene.gambleCard.flip(this.scene.gambleCard.cardBackT, function () {
                        this.setBank(0);
                        setTimeout(this.exitGambleF, 2000);
                    }.bind(this))


                }
            }.bind(this));
        }.bind(this));

    }

    private exitGamble() {
        let exitGambleEvent = new CustomEvent('exitGambleEvent');

        this.gamble_amb.pause();
        this.gamble_amb.currentTime = 0;

        document.dispatchEvent(exitGambleEvent);
        SCENE_MANAGER.goToGameScene('baseGame');
    }

    private signToButtonEvents() {

        document.addEventListener('GambleRedPressed', this.playGambleRed);
        document.addEventListener('GambleBlackPressed', this.playGambleBlack);
        document.addEventListener('GambleCollectPressed', this.exitGambleF)


    }

    private unSignFromButtonEvents() {
        document.removeEventListener('GambleRedPressed', this.playGambleRed);
        document.removeEventListener('GambleBlackPressed', this.playGambleBlack);
        document.removeEventListener('GambleCollectPressed', this.exitGambleF);
    }

}