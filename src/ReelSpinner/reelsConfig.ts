/**
 * Created by tarasg on 10/11/2017.
 */

export const WinBoxWidth:  number = 254;
export const WinBoxHeight: number = 244;

export const symbolWidth: number = 235;
export const symbolHeight: number = 155;

export const LineNumberWidth:  number = 83;
export const LineNumberHeight: number = 73;


export const StartAnimDelta: number = 50;
export const StartAnimSpeed: number = 10;



export const ReelsConfig = {
    x: 50,
    y: 60,

    reelsDelay: 50, // ms between spin animation of the reels

    reels: [
        {'x':20, 'y':10, 'symbolsAmount':3, 'SpinningTime': 1500},
        {'x':260, 'y':10, 'symbolsAmount':3, 'SpinningTime': 1700},
        {'x':503, 'y':10, 'symbolsAmount':3, 'SpinningTime': 2200}
    ],

    spinningSpeed: 20,
    slamOutAcceleration: 2.25,
    reelStopDelta: 15,
    reelStopSpeed: 5
};


export const response = {
    "qualifier":"com.pt.casino.platform",
    "contextId":"r9tnvaajojyd3ni885mi",
    "correlationId":"9e0x7rl7nsi2z1y30udi",
    "data":{
        "_type":"com.pt.casino.platform.game.GameCommand",
        "windowId":"",
        "winAmount":0,
        "gameData":{
            "_type":"ryota:GameResponse",
            "stake":500,
            "totalWinAmount":0,
            "playIndex":1,
            "nextRound":"0",
            "winLineCount":5,
            "isWinCapped":false,
            "playStack":[
                {
                    "round":"0",
                    "remainingPlayCount":0,
                    "newPlayCount":0,
                    "multiplier":1,
                    "featureWinAmount":400,
                    "gameWinAmount":0,
                    "isLastPlayMode":true,
                    "isNextPlayMode":false,
                    "isWinCapped":false,
                    "lastPlayInModeData":{
                        "playWinAmount":400,
                        "slotsData":{
                            "previousTransforms":[

                            ],
                            "actions":[
                                {
                                    "transforms":[
                                        {
                                            "ref":"spin",
                                            "symbolUpdates":[
                                                {
                                                    "symbol":1,
                                                    "reelIndex":0,
                                                    "positionOnReel":0
                                                },
                                                {
                                                    "symbol":3,
                                                    "reelIndex":0,
                                                    "positionOnReel":1
                                                },
                                                {
                                                    "symbol":2,
                                                    "reelIndex":0,
                                                    "positionOnReel":2
                                                },
                                                {
                                                    "symbol":3,
                                                    "reelIndex":1,
                                                    "positionOnReel":0
                                                },
                                                {
                                                    "symbol":1,
                                                    "reelIndex":1,
                                                    "positionOnReel":1
                                                },
                                                {
                                                    "symbol":2,
                                                    "reelIndex":1,
                                                    "positionOnReel":2
                                                },
                                                {
                                                    "symbol":3,
                                                    "reelIndex":2,
                                                    "positionOnReel":0
                                                },
                                                {
                                                    "symbol":5,
                                                    "reelIndex":2,
                                                    "positionOnReel":1
                                                },
                                                {
                                                    "symbol":1,
                                                    "reelIndex":2,
                                                    "positionOnReel":2
                                                },
                                                {
                                                    "symbol":3,
                                                    "reelIndex":3,
                                                    "positionOnReel":0
                                                },
                                                {
                                                    "symbol":4,
                                                    "reelIndex":3,
                                                    "positionOnReel":1
                                                },
                                                {
                                                    "symbol":0,
                                                    "reelIndex":3,
                                                    "positionOnReel":2
                                                },
                                                {
                                                    "symbol":5,
                                                    "reelIndex":4,
                                                    "positionOnReel":0
                                                },
                                                {
                                                    "symbol":0,
                                                    "reelIndex":4,
                                                    "positionOnReel":1
                                                },
                                                {
                                                    "symbol":3,
                                                    "reelIndex":4,
                                                    "positionOnReel":2
                                                }
                                            ]
                                        }
                                    ],
                                    "payouts":[

                                    ]
                                },
                                {
                                    "transforms":[

                                    ],
                                    "payouts":[
                                        {
                                            "payoutData":{
                                                "payoutWinAmount":300,
                                                "payoutFreePlayResultsData":[

                                                ]
                                            },
                                            "context":{
                                                "winLineIndex":4,
                                                "winningSymbols":[
                                                    {
                                                        "symbol":1,
                                                        "reelIndex":0,
                                                        "positionOnReel":0
                                                    },
                                                    {
                                                        "symbol":1,
                                                        "reelIndex":1,
                                                        "positionOnReel":1
                                                    },
                                                    {
                                                        "symbol":1,
                                                        "reelIndex":2,
                                                        "positionOnReel":2
                                                    }

                                                ],
                                                "symbol":1,
                                                "symbolPayoutType":"WinLine",
                                                "multiplier":1
                                            }
                                        },
                                        {
                                            "payoutData":{
                                                "payoutWinAmount":1000,
                                                "payoutFreePlayResultsData":[

                                                ]
                                            },
                                            "context":{
                                                "winLineIndex":6,
                                                "winningSymbols":[
                                                    {
                                                        "symbol":6,
                                                        "reelIndex":0,
                                                        "positionOnReel":1
                                                    },
                                                    {
                                                        "symbol":6,
                                                        "reelIndex":1,
                                                        "positionOnReel":0
                                                    },
                                                    {
                                                        "symbol":6,
                                                        "reelIndex":2,
                                                        "positionOnReel":0
                                                    },
                                                    {
                                                        "symbol":6,
                                                        "reelIndex":3,
                                                        "positionOnReel":0
                                                    },
                                                    {
                                                        "symbol":0,
                                                        "reelIndex":4,
                                                        "positionOnReel":1
                                                    }

                                                ],
                                                "symbol":6,
                                                "symbolPayoutType":"WinLine",
                                                "multiplier":1
                                            }
                                        },
                                        {
                                            "payoutData":{
                                                "payoutWinAmount":1000,
                                                "payoutFreePlayResultsData":[

                                                ]
                                            },
                                            "context":{
                                                "winLineIndex":19,
                                                "winningSymbols":[
                                                    {
                                                        "symbol":2,
                                                        "reelIndex":0,
                                                        "positionOnReel":2
                                                    },
                                                    {
                                                        "symbol":2,
                                                        "reelIndex":1,
                                                        "positionOnReel":2
                                                    },
                                                    {
                                                        "symbol":2,
                                                        "reelIndex":2,
                                                        "positionOnReel":0
                                                    },
                                                    {
                                                        "symbol":0,
                                                        "reelIndex":3,
                                                        "positionOnReel":2
                                                    }

                                                ],
                                                "symbol":2,
                                                "symbolPayoutType":"WinLine",
                                                "multiplier":1
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "modeType":"SLOTS"
                }
            ]
        },
        "stakeAmount":500
    }
};