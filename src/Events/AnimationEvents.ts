/**
 * Created by tarasg on 10/3/2017.
 */
/**
 * Created by tarasg on 9/25/2017.
 */

let GambleCardFlipEnd = document.createEvent("HTMLEvents");
GambleCardFlipEnd.initEvent("GambleCardFlipEnd", true, true);

let pumpSymbolEnd = new CustomEvent("pumpSymbolEnd");


export let AnimationEndEvent = {
    'GambleCardFlipEnd': GambleCardFlipEnd,
    'pumpSymbolEnd' : pumpSymbolEnd,


};