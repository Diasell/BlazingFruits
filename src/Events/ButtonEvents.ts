/**
 * Created by tarasg on 9/25/2017.
 */


let GambleRedPressed = new CustomEvent("GambleRedPressed"),
    GambleBlackPressed = new CustomEvent("GambleBlackPressed"),
    GambleCollectPressed = new CustomEvent("GambleCollectPressed"),
    ClickedOnBaseGameScene = new CustomEvent("ClickedOnBaseGameScene"),
    BetButtonPressed = new CustomEvent('BetButtonPressed'),
    GambleButtonPressed = new CustomEvent('GambleButtonPressed'),
    AutoStartButtonPressed = new CustomEvent('AutoStartButtonPressed'),
    MaxBetButtonPressed = new CustomEvent('MaxBetButtonPressed'),
    ExitHelpButtonPressed = new CustomEvent('ExitHelpButtonPressed'),
    PrevHelpPageButtonPressed = new CustomEvent('PrevHelpPageButtonPressed'),
    NextHelpPageButtonPressed = new CustomEvent('NextHelpPageButtonPressed'),
    HelpButtonPressed = new CustomEvent('HelpButtonPressed'),
    MenuButtonPressed = new CustomEvent('MenuButtonPressed'),
    StopButtonPressed = new CustomEvent('StopButtonPressed'),
    StartBonusButtonPressed = new CustomEvent('StartBonusButtonPressed'),
    CollectButtonPressed = new CustomEvent('CollectButtonPressed'),
    StartButtonPressed = new CustomEvent('StartButtonPressed'),
    CancelAutoStartButtonPressed = new CustomEvent('CancelAutoStartButtonPressed');


export let ButtonEvents = {
    'ClickedOnBaseGameScene': ClickedOnBaseGameScene,

    'StartButtonPressed': StartButtonPressed,
    'StopButtonPressed' : StopButtonPressed,
    'CollectButtonPressed': CollectButtonPressed,
    'StartBonusButtonPressed': StartBonusButtonPressed,

    'MenuButtonPressed' : MenuButtonPressed,
    'HelpButtonPressed' : HelpButtonPressed,
    'GambleButtonPressed': GambleButtonPressed,
    'BetButtonPressed': BetButtonPressed,
    'MaxBetButtonPressed': MaxBetButtonPressed,

    'AutoStartButtonPressed': AutoStartButtonPressed,
    'CancelAutoStartButtonPressed': CancelAutoStartButtonPressed,

    'NextHelpPageButtonPressed': NextHelpPageButtonPressed,
    'PrevHelpPageButtonPressed': PrevHelpPageButtonPressed,
    'ExitHelpButtonPressed' : ExitHelpButtonPressed,

    'GambleCollectPressed': GambleCollectPressed,
    'GambleRedPressed': GambleRedPressed,
    'GambleBlackPressed': GambleBlackPressed,
};