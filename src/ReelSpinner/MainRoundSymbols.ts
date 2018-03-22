/**
 * Created by tarasg on 10/11/2017.
 */

import * as Animations from "../Utils/animation_objects";
import * as utils from "../Utils/helperFuncs"
import * as config from "./reelsConfig"


export let SymbolsTexture:    PIXI.BaseTexture = PIXI.BaseTexture.fromImage('../Media/symbols.png'),
    BlazingTexture:    PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,0, config.symbolWidth, config.symbolHeight)),
    SevenTexture:      PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,237, config.symbolWidth, config.symbolHeight)),
    WatermelonTexture: PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,474, config.symbolWidth, config.symbolHeight)),
    PlumTexture:       PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,711, config.symbolWidth, config.symbolHeight)),
    OrangeTexture:     PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,948, config.symbolWidth, config.symbolHeight)),
    LemonTexture:      PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,1185, config.symbolWidth, config.symbolHeight)),
    CherryTexture:     PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,1422, config.symbolWidth, config.symbolHeight)),
    BonusTexture:      PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,1659, config.symbolWidth, config.symbolHeight)),
    WildTexture:       PIXI.Texture     = new PIXI.Texture(SymbolsTexture, new PIXI.Rectangle(0,1896, config.symbolWidth, config.symbolHeight)),
    BlazingSpite       = () => new PIXI.Sprite(BlazingTexture),
    SevenSpite         = () => new PIXI.Sprite(SevenTexture),
    WatermelonSprite   = () => new PIXI.Sprite(WatermelonTexture),
    PlumSprite         = () => new PIXI.Sprite(PlumTexture),
    OrangeSprite       = () => new PIXI.Sprite(OrangeTexture),
    LemonSprite        = () => new PIXI.Sprite(LemonTexture),
    CherrySprite       = () => new PIXI.Sprite(CherryTexture),
    BonusSprite        = () => new PIXI.Sprite(BonusTexture),
    WildSprite         = () => new PIXI.Sprite(WildTexture),
    BlazingWinShow     = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/bf/winshowBF.png'), Animations.bf_winshow_anim),
    SevenWinShow       = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/seven/winshowSeven.png'), Animations.seven_winshow_anim),
    WatermelonWinShow  = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/wm/winshowWM.png'), Animations.wm_winshow_anim),
    PlumWinShow        = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/plum/winshowPlum.png'), Animations.plum_winshow_anim),
    OrangeWinShow      = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/orange/winshowOrange.png'), Animations.orange_winshow_anim),
    LemonWinShow       = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/lemon/winshowLemon.png'), Animations.lemon_winshow_anim),
    CherryWinShow      = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/cherry/winshowCherry.png'), Animations.cherry_winshow_anim),
    BonusWinShow       = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/bonus/winshowBonus.png'), Animations.bonus_winshow_anim),
    WildWinShow        = () => utils.CreateAnimation(PIXI.BaseTexture.fromImage('../Media/animations/winshow/wild/winshowWild.png'), Animations.wild_winshow_anim);


export interface ISymbol {
    name: string,
    reelValue: number,
    texture: PIXI.Texture,
    sprite: () => PIXI.Sprite,
    winShowAnimation: () => PIXI.extras.AnimatedSprite
}


export const WildSymbol: ISymbol = {
    name: 'WILD',
    reelValue: 0,
    texture: WildTexture,
    sprite: WildSprite,
    winShowAnimation: WildWinShow
};

export const BlazingSymbol: ISymbol = {
    name: 'LOGO',
    reelValue: 1,
    texture: BlazingTexture,
    sprite: BlazingSpite,
    winShowAnimation: BlazingWinShow
};

export const SevenSymbol: ISymbol = {
    name: 'SEVEN',
    reelValue: 2,
    texture: SevenTexture,
    sprite: SevenSpite,
    winShowAnimation: SevenWinShow
};

export const WatermelonSymbol: ISymbol = {
    name: 'WM',
    reelValue: 3,
    texture: WatermelonTexture,
    sprite: WatermelonSprite,
    winShowAnimation: WatermelonWinShow
};

export const PlumSymbol: ISymbol = {
    name: 'PLUM',
    reelValue: 4,
    texture: PlumTexture,
    sprite: PlumSprite,
    winShowAnimation: PlumWinShow
};

export const OrangeSymbol: ISymbol = {
    name: 'ORANGE',
    reelValue: 5,
    texture: OrangeTexture,
    sprite: OrangeSprite,
    winShowAnimation: OrangeWinShow
};

export const LemonSymbol: ISymbol = {
    name: 'LEMON',
    reelValue: 6,
    texture: LemonTexture,
    sprite: LemonSprite,
    winShowAnimation: LemonWinShow
};

export const CherrySymbol: ISymbol = {
    name: 'CHERRY',
    reelValue: 7,
    texture: CherryTexture,
    sprite: CherrySprite,
    winShowAnimation: CherryWinShow
};

export const BonusSymbol: ISymbol = {
    name: 'BONUS',
    reelValue: 8,
    texture: BonusTexture,
    sprite: BonusSprite,
    winShowAnimation: BonusWinShow
};



export const SYMBOLS = [WildSymbol, BlazingSymbol, SevenSymbol, WatermelonSymbol, PlumSymbol, OrangeSymbol, LemonSymbol, CherrySymbol, BonusSymbol];
export const showSymbols = [BlazingSymbol, SevenSymbol, WatermelonSymbol, PlumSymbol, OrangeSymbol, LemonSymbol, CherrySymbol];