// /**
//  * Created by tarasg on 10/11/2017.
//  */
//
// import * as Animations from "../Utils/animation_objects";
// import * as utils from "../Utils/helperFuncs";
// import * as config from "../ReelSpinner/reelsConfig";
//
// export class SymbolsFabric {
//     public BlazingT: PIXI.Texture;
//     public SevenT: PIXI.Texture;
//     public WmT: PIXI.Texture;
//     public PlumT: PIXI.Texture;
//     public OrangeT: PIXI.Texture;
//     public LemonT: PIXI.Texture;
//     public CherryT: PIXI.Texture;
//     public BonusT: PIXI.Texture;
//     public WildT: PIXI.Texture;
//     public resources: any;
//
//     constructor(resources: any) {
//         this.resources = resources;
//
//         let symbolsBase = PIXI.BaseTexture.fromImage(resources.base_game_symbols.url);
//
//         this.BlazingT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,0, config.symbolWidth, config.symbolHeight));
//         this.BonusT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,1659, config.symbolWidth, config.symbolHeight));
//         this.SevenT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,237, config.symbolWidth, config.symbolHeight));
//         this.WmT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,474, config.symbolWidth, config.symbolHeight));
//         this.PlumT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,711, config.symbolWidth, config.symbolHeight));
//         this.OrangeT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,948, config.symbolWidth, config.symbolHeight));
//         this.LemonT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,1185, config.symbolWidth, config.symbolHeight));
//         this.CherryT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,1422, config.symbolWidth, config.symbolHeight));
//         this.WildT = new PIXI.Texture(symbolsBase, new PIXI.Rectangle(0,1896, config.symbolWidth, config.symbolHeight));
//
//     }
//
//
//     public getBlazingSprite(): PIXI.Sprite {
//         return new PIXI.Sprite(this.BlazingT);
//     }
//
//     public getSevenSprite():PIXI.Sprite {
//         return new PIXI.Sprite(this.SevenT);
//     }
//
//     public getWmSprite(): PIXI.Sprite {
//         return new PIXI.Sprite(this.WmT);
//     }
//
//     public getPlumSprite():PIXI.Sprite {
//         return new PIXI.Sprite(this.PlumT);
//     }
//     public getOrangeSprite(): PIXI.Sprite {
//         return new PIXI.Sprite(this.OrangeT);
//     }
//
//     public getLemonSprite():PIXI.Sprite {
//         return new PIXI.Sprite(this.LemonT);
//     }
//     public getCherrySprite(): PIXI.Sprite {
//         return new PIXI.Sprite(this.CherryT);
//     }
//
//     public getBonusSprite():PIXI.Sprite {
//         return new PIXI.Sprite(this.BonusT);
//     }
//
//     public getWildSprite(): PIXI.Sprite {
//         return new PIXI.Sprite(this.WildT);
//     }
//
//
// }