/**
 * Created by tarasg on 9/29/2017.
 */

export function nextItem(arr, i) {
    i = i + 1;
    i = i % arr.length;
    return arr[i];
}

export function prevItem(arr, i) {
    if (i === 0) {
        i = arr.length;
    }
    i = i - 1;
    return arr[i];
}

export function formatStakeAmount(stake: number): string {
    if (stake < 100){
        return '0.'+stake+'p';
    } else if( stake >= 100){
        let x = stake/100;
        return '$'+parseFloat(x.toString()).toFixed(2);
    }
}


export function CreateAnimation(baseTexture, obj) {
    let len = obj.length,
        texture_array = [];

    for (let i=0; i<len;i++)
    {
        let frame = obj[i],
            rect = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height),
            texture = new PIXI.Texture(baseTexture, rect);
        texture_array.push({texture:texture, time:66});
    }
    return new PIXI.extras.AnimatedSprite(texture_array);
}