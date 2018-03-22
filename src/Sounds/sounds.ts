/**
 * Created by tarasg on 10/23/2017.
 */


export class SoundsManagerClass {
    private resources: any;
    public allSounds: any = {};

    constructor (resources: any) {
        this.resources = resources;

        this.allSounds['buttonPress'] = new Howl({
            src : [this.resources.test.url],
            loop: false,
            volume: 0.5
        });
    }
}