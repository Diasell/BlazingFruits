/**
 * Created by tarasg on 8/8/2017.
 */
declare function require(name:string) : any;
declare let  GDKWrapper:any;
declare let Rx:any;
// type GDKSetting = (name : string) => Rx.Observable<any>

export let GameLoadedAsync = Rx.Observable.bindCallback(GDKWrapper.GameLoaded),
    GetSystemIDAsync            = Rx.Observable.bindCallback(GDKWrapper.GetSystemID),
    GetCabinetNameAsync         = Rx.Observable.bindCallback(GDKWrapper.GetCabinetName),
    GetDataFolderAsync          = Rx.Observable.bindCallback(GDKWrapper.GetDataFolder),
    GetTempFolderAsync          = Rx.Observable.bindCallback(GDKWrapper.GetTempFolder),
    GetGameModeAsync            = Rx.Observable.bindCallback(GDKWrapper.GetGameMode),
    IsSingleGameAsync           = Rx.Observable.bindCallback(GDKWrapper.IsSingleGame),
    IsCapturesRequiredAsync     = Rx.Observable.bindCallback(GDKWrapper.IsCapturesRequired),
    IsDiscardCompensatorsAsync  = Rx.Observable.bindCallback(GDKWrapper.IsDiscardCompensators),
    GetCreditHideAsync          = Rx.Observable.bindCallback(GDKWrapper.GetCreditHide),
    GetSoundVolumeAsync         = Rx.Observable.bindCallback(GDKWrapper.GetSoundVolume),
    GetPlayerNameAsync          = Rx.Observable.bindCallback(GDKWrapper.GetPlayerName),
    GetCreditAsync              = Rx.Observable.bindCallback(GDKWrapper.GetCredit),
    GetBankAsync                = Rx.Observable.bindCallback(GDKWrapper.GetBank),
    GetCurrencyAsync            = Rx.Observable.bindCallback(GDKWrapper.GetCurrency),
    CheckPayOutAsync            = Rx.Observable.bindCallback(GDKWrapper.CheckPayOut),
    GetActionMapAsync           = Rx.Observable.bindCallback(GDKWrapper.GetActionMap),
    ShowDigitalPanelAsync       = Rx.Observable.bindCallback(GDKWrapper.ShowDigitalPanel),
    HideDigitalPanelAsync       = Rx.Observable.bindCallback(GDKWrapper.HideDigitalPanel),
    CheckValidateVoucherAsync   = Rx.Observable.bindCallback(GDKWrapper.CheckValidateVoucher),
    GetResumptionStatusAsync    = Rx.Observable.bindCallback(GDKWrapper.GetResumptionStatus),
    ResumeGameRoundAsync        = Rx.Observable.bindCallback(GDKWrapper.ResumeGameRound),
    GetMultiplayerIDAsync       = Rx.Observable.bindCallback(GDKWrapper.GetMultiplayerID),
    GetTicketAsync              = Rx.Observable.bindCallback(GDKWrapper.GetTicket),
    IsPrintingAsync             = Rx.Observable.bindCallback(GDKWrapper.IsPrinting),
    GetLanguagegAsync           = Rx.Observable.bindCallback(GDKWrapper.GetLanguage),
    GetJackPotsAsync            = Rx.Observable.bindCallback(GDKWrapper.GetVBJackpot),
    ResumeDataReadStringAsync   = Rx.Observable.bindCallback(GDKWrapper.ResumeDataReadString),
    // [param]: name
    GetEnvParamAsync            = Rx.Observable.bindCallback(GDKWrapper.GetEnvParam),
    // [param]: name
    GetEnvParamDwordAsync      = Rx.Observable.bindCallback(GDKWrapper.GetEnvParamDword),
    // [param]: name
    GetEnvParamDwordArrayAsync  = Rx.Observable.bindCallback(GDKWrapper.GetEnvParamDwordArray),
    // [param]: name
    GetEnvParamPaytableAsync    = Rx.Observable.bindCallback(GDKWrapper.GetEnvParamPaytable),
    // [param]: bet
    StartGameRoundAsync         = Rx.Observable.bindCallback(GDKWrapper.StartGameRound),
    // [param]: win
    AddBankAsync                = Rx.Observable.bindCallback(GDKWrapper.AddBank),
    // [param]: screenCapt, GameRecal, autoplay
    EndGameRoundAsync           = Rx.Observable.bindCallback(GDKWrapper.EndGameRound),
    // [param]: amount
    PayOutAsync                 = Rx.Observable.bindCallback(GDKWrapper.PayOut),
    // [param]: filename
    LoadLEDsAsync               = Rx.Observable.bindCallback(GDKWrapper.LoadLEDs),
    // [param]: channel, file, repeat
    ExecuteLEDsAsync            = Rx.Observable.bindCallback(GDKWrapper.ExecuteLEDs),
    // [param]: offset, bytesCount
    GetNVRAMAsync               = Rx.Observable.bindCallback(GDKWrapper.GetNVRAM),
    // [param]: size
    GetRandomNumberAsync        = Rx.Observable.bindCallback(GDKWrapper.GetRandomNumber),
    // [param]: errCode, msg
    ReportErrorAsync            = Rx.Observable.bindCallback(GDKWrapper.ReportError),
    // [param]: msg
    ReportInfoAsync             = Rx.Observable.bindCallback(GDKWrapper.ReportInfo),
    // [param]: value
    FormatCurrencyAsync         = Rx.Observable.bindCallback(GDKWrapper.FormatCurrency),
    // [param]: screenID, mediaList, options, slideDuration
    PlayMultimediaAsync         = Rx.Observable.bindCallback(GDKWrapper.PlayMultimedia),
    // [param]: voucher
    VoucherValidateAsync        = Rx.Observable.bindCallback(GDKWrapper.VoucherValidate),
    // [param]: offset, size
    ResumeDataReadAsync         = Rx.Observable.bindCallback(GDKWrapper.ResumeDataRead),
    // [param]: offset, size, data
    ResumeDataWriteAsync        = Rx.Observable.bindCallback(GDKWrapper.ResumeDataWrite),
    // [param]: data
    ResumeDataWriteStringAsync  = Rx.Observable.bindCallback(GDKWrapper.ResumeDataWriteString),
    // [param]: template, params
    PrintTicketAsync            = Rx.Observable.bindCallback(GDKWrapper.PrintTicket),
    // [param]: service, requestID, request
    GameServerMsgAsync          = Rx.Observable.bindCallback(GDKWrapper.GameServerMsg),


    // SETTER METHODS:

    //[param]: hide
    SetCreditHideAsync          = Rx.Observable.bindCallback(GDKWrapper.SetCreditHide),
    //[param]: volume
    SetSoundVolumeAsync         = Rx.Observable.bindCallback(GDKWrapper.SetSoundVolume),
    //[param]: lampMask, flashRate
    SetLampsAsync               = Rx.Observable.bindCallback(GDKWrapper.SetLamps),
    //[param]: flashRate
    SetAllLampsAsync            = Rx.Observable.bindCallback(GDKWrapper.SetAllLamps),
    //[param]: offset, bytesCount, data
    SetNVRAMAsync               = Rx.Observable.bindCallback(GDKWrapper.SetNVRAM),
    //[param]: skin
    SetDigitalPanelSkinAsync    = Rx.Observable.bindCallback(GDKWrapper.SetDigitalPanelSkin),
    //[param]: msg, timeToDisplay
    SetPlayerNotificationAsync  = Rx.Observable.bindCallback(GDKWrapper.SetPlayerNotification),
    //[param]: code
    SetLanguageAsync            = Rx.Observable.bindCallback(GDKWrapper.SetLanguage);
