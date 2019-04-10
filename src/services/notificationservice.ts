
enum NotificationServiceItemDefaultType {
  error,
  warning,
  information,
  succeed,
}

class NotificationServiceItem {
  constructor(public readonly title: string,
              public readonly message: string,
              public readonly defaultType: NotificationServiceItemDefaultType) {}

  public notify() {
    switch (this.defaultType) {
      case NotificationServiceItemDefaultType.error:
        this.error();
        break;
      case NotificationServiceItemDefaultType.warning:
        this.warning();
        break;
      case NotificationServiceItemDefaultType.information:
        this.info();
        break;
      case NotificationServiceItemDefaultType.succeed:
        this.succeed();
        break;
    }
  }

  public notifyWithParameter(...params: string[]) {
    switch (this.defaultType) {
      case NotificationServiceItemDefaultType.error:
        this.errorWithParameter(...params);
        break;
      case NotificationServiceItemDefaultType.warning:
        this.warningWithParameter(...params);
        break;
      case NotificationServiceItemDefaultType.information:
        this.infoWithParameter(...params);
        break;
      case NotificationServiceItemDefaultType.succeed:
        this.succeedWithParameter(...params);
        break;
    }
  }

  public error() {
    if (NotificationService.onError !== null) {
      NotificationService.onError(this.title, this.message);
    }
  }

  public errorWithParameter(...params: string[]) {
    this.getFormatedItem(params).error();
  }

  public warning() {
    if (NotificationService.onWarning !== null) {
      NotificationService.onWarning(this.title, this.message);
    }
  }

  public warningWithParameter(...params: string[]) {
    this.getFormatedItem(params).warning();
  }

  public info() {
    if (NotificationService.onInformation !== null) {
      NotificationService.onInformation(this.title, this.message);
    }
  }

  public infoWithParameter(...params: string[]) {
    this.getFormatedItem(params).info();
  }

  public succeed() {
    if (NotificationService.onSucceed !== null) {
      NotificationService.onSucceed(this.title, this.message);
    }
  }

  public succeedWithParameter(...params: string[]) {
    this.getFormatedItem(params).succeed();
  }

  private getFormatedItem(params: string[]): NotificationServiceItem {
    let currentTitle = this.title;
    let currentMessage = this.message;
    params.forEach((param, index) => {
      currentTitle = currentTitle.replace('{' + index + '}', param);
      currentMessage = currentMessage.replace('{' + index + '}', param);
    });
    return new NotificationServiceItem(currentTitle, currentMessage, this.defaultType);
  }
}

/**
 * 通知するサービス
 */
export default class NotificationService {
  public static readonly serverConnectionFailed = new NotificationServiceItem(
    'サーバ接続失敗',
    'サーバとの接続に失敗しました。サーバが落ちているか、ネット接続に問題がある可能性があります',
    NotificationServiceItemDefaultType.error);
  public static readonly serverReconnectionSucceed = new NotificationServiceItem(
    'サーバ接続再開',
    'これまでエラーによりサーバ接続に失敗していましたが、接続が再開されました。一部の情報が更新されていない可能性がありますので、ページを再読込してください',
    NotificationServiceItemDefaultType.succeed);
  public static readonly serverApiFailed = new NotificationServiceItem(
    'サーバAPI呼び出し失敗',
    'サーバのAPI呼び出しに失敗しました。HTTPステータスコード: {0}, URI: {1}, エラーコード: {2}, 追加データ: {3}',
    NotificationServiceItemDefaultType.error);
  public static readonly serverDatabaseFailed = new NotificationServiceItem(
    'サーバAPI呼び出し失敗',
    'サーバのデータベース接続異常により、サーバのAPI呼び出しに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly authenticationFailed = new NotificationServiceItem(
    '認証失敗',
    '認証に失敗しました。再ログインを試みてください',
    NotificationServiceItemDefaultType.error);
  public static readonly getCommandListFailed = new NotificationServiceItem(
    'コマンド取得失敗',
    'コマンド取得に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly inputCommandsFailed = new NotificationServiceItem(
    'コマンド入力失敗',
    'コマンド入力に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly inputCommandsFailedBecauseCommandNotSelected = new NotificationServiceItem(
    'コマンド入力失敗',
    'コマンド入力に失敗しました。入力先のコマンドが選択されていません。',
    NotificationServiceItemDefaultType.error);
  public static readonly inputCommandsFailedBecauseLackOfSoldierTechnology = new NotificationServiceItem(
    '徴兵コマンド入力失敗',
    'コマンド入力に失敗しました。指定された兵種は、この都市で徴兵コマンドを入力することができません。',
    NotificationServiceItemDefaultType.error);
  public static readonly inputCommandsSucceed = new NotificationServiceItem(
    'コマンド入力完了',
    '{0} の入力が完了しました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly commandExecuted = new NotificationServiceItem(
    'コマンド実行完了',
    '{0} のコマンドが実行されました。',
    NotificationServiceItemDefaultType.information);
  public static readonly emptyCommandExecuted = new NotificationServiceItem(
    'コマンド実行をスキップ',
    '何もしないコマンドが実行されました。放置削除ターンが進んでいます。',
    NotificationServiceItemDefaultType.warning);
  public static readonly getIconsFailed = new NotificationServiceItem(
    'アイコン取得失敗',
    'アイコン取得に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly getChatFailed = new NotificationServiceItem(
    '手紙取得失敗',
    '手紙の取得に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly postChatFailed = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly postChatFailedBecauseNotPermission = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。送信するための権限がありません',
    NotificationServiceItemDefaultType.error);
  public static readonly postChatFailedBecauseTargetNotFound = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。送信先が見つかりません。手紙を書いている途中に削除されたか滅亡した可能性があります',
    NotificationServiceItemDefaultType.error);
  public static readonly attributeUp = new NotificationServiceItem(
    '能力上昇',
    '{0} が +{1} 上昇しました。',
    NotificationServiceItemDefaultType.information);
  public static readonly getTownCharactersFailed = new NotificationServiceItem(
    '都市滞在武将取得失敗',
    'その都市に滞在する武将一覧の取得に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly getCountryCharactersFailed = new NotificationServiceItem(
    '国の武将取得失敗',
    'その国に所属する武将一覧の取得に失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly scouted = new NotificationServiceItem(
    '諜報完了',
    '{0} を諜報しました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly scoutFailed = new NotificationServiceItem(
    '諜報失敗',
    '{0} を諜報できませんでした。',
    NotificationServiceItemDefaultType.error);
  public static readonly countryChanged = new NotificationServiceItem(
    '所属国変更',
    'あなたの所属国が変わりました',
    NotificationServiceItemDefaultType.information);
  public static readonly appointed = new NotificationServiceItem(
    '任命成功',
    '{0} を任命しました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly appointFailed = new NotificationServiceItem(
    '任命失敗',
    '{0} を任命できませんでした。',
    NotificationServiceItemDefaultType.error);
  public static readonly selfAppointed = new NotificationServiceItem(
    '任命',
    'おめでとうございます。あなたは、 {0} に任命されました。',
    NotificationServiceItemDefaultType.information);
  public static readonly selfDismissed = new NotificationServiceItem(
    '解任',
    'あなたは、役職を解任されました。',
    NotificationServiceItemDefaultType.information);
  public static readonly allianced = new NotificationServiceItem(
    '同盟手続き成功',
    '同盟の手続きは、無事相手に送信されました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly allianceFailed = new NotificationServiceItem(
    '同盟手続き失敗',
    '何らかの理由で、同盟の手続きに失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly allianceFailedBecauseSameStatus = new NotificationServiceItem(
    '同盟手続き失敗',
    '同盟手続きについて、現在と同じ状態に変更する操作をしようとしました。他の人があなたと同時に同じ操作をした可能性があります。',
    NotificationServiceItemDefaultType.error);
  public static readonly allianceCompleted = new NotificationServiceItem(
    '同盟締結',
    '{0} との同盟が締結されました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly allianceRejected = new NotificationServiceItem(
    '同盟否決',
    '{0} との同盟は拒否されました。',
    NotificationServiceItemDefaultType.warning);
  public static readonly allianceStartBreaking = new NotificationServiceItem(
    '同盟破棄猶予開始',
    '{0} との同盟は、破棄猶予期間に入りました。',
    NotificationServiceItemDefaultType.warning);
  public static readonly allianceBroken = new NotificationServiceItem(
    '同盟破棄',
    '{0} との同盟は、破棄されました。',
    NotificationServiceItemDefaultType.warning);
  public static readonly warInReady = new NotificationServiceItem(
    '宣戦布告',
    '{0} と {1} に開戦します。',
    NotificationServiceItemDefaultType.warning);
  public static readonly warStart = new NotificationServiceItem(
    '開戦',
    '{0} との戦争が始まりました。',
    NotificationServiceItemDefaultType.warning);
  public static readonly warSent = new NotificationServiceItem(
    '戦争手続き成功',
    '戦争の手続きは、無事相手に送信されました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly warFailed = new NotificationServiceItem(
    '戦争手続き失敗',
    '何らかの理由で、戦争の手続きに失敗しました。',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseSameStatus = new NotificationServiceItem(
    '戦争手続き失敗',
    '戦争手続きについて、現在と同じ状態に変更する操作をしようとしました。他の人があなたと同時に同じ操作をした可能性があります。',
    NotificationServiceItemDefaultType.error);
  public static readonly unitLoadFailed = new NotificationServiceItem(
    '部隊取得失敗',
    '部隊一覧を取得できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly unitJoined = new NotificationServiceItem(
    '入隊',
    '部隊 {0} に入りました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitJoinFailed = new NotificationServiceItem(
    '入隊失敗',
    '部隊 {0} に入ることができませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly unitJoinFailedBecauseLeader = new NotificationServiceItem(
    '入隊失敗',
    '隊長は部隊に入ることができません',
    NotificationServiceItemDefaultType.error);
  public static readonly unitJoinFailedBecauseCurrentUnit = new NotificationServiceItem(
    '入隊失敗',
    'すでに部隊 {0} に入っています',
    NotificationServiceItemDefaultType.error);
  public static readonly unitJoinFailedBecauseLimited = new NotificationServiceItem(
    '入隊失敗',
    '部隊 {0} には入場制限がかかっています',
    NotificationServiceItemDefaultType.error);
  public static readonly unitLeft = new NotificationServiceItem(
    '部隊脱退',
    '部隊 {0} から抜けました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitLeaveFailed = new NotificationServiceItem(
    '部隊脱退失敗',
    '部隊 {0} から抜けられません',
    NotificationServiceItemDefaultType.error);
  public static readonly unitLeaveFailedBecauseLeader = new NotificationServiceItem(
    '部隊脱退失敗',
    '部隊長は部隊から抜けられません。削除してください',
    NotificationServiceItemDefaultType.error);
  public static readonly unitCreated = new NotificationServiceItem(
    '部隊作成',
    '部隊 {0} を作成しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitCreateFailed = new NotificationServiceItem(
    '部隊作成失敗',
    '部隊 {0} を作成できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly unitCreateFailedBecauseLackOfParameters = new NotificationServiceItem(
    '部隊作成失敗',
    '部隊を作成できませんでした。名前が必要です',
    NotificationServiceItemDefaultType.error);
  public static readonly unitUpdated = new NotificationServiceItem(
    '部隊更新',
    '部隊 {0} の情報を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitUpdateFailed = new NotificationServiceItem(
    '部隊更新失敗',
    '部隊 {0} の情報を更新できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly unitRemoved = new NotificationServiceItem(
    '部隊削除',
    '部隊 {0} を削除しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitRemoveFailed = new NotificationServiceItem(
    '部隊削除失敗',
    '部隊 {0} を削除できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly belongsUnitRemoved = new NotificationServiceItem(
    '部隊削除',
    '所属していた部隊が削除されました',
    NotificationServiceItemDefaultType.information);
  public static readonly belongsUnitGathered = new NotificationServiceItem(
    '部隊集合',
    '所属部隊が集合されました',
    NotificationServiceItemDefaultType.information);
  public static readonly battleLogLoadFailed = new NotificationServiceItem(
    '戦闘ログ取得失敗',
    '戦闘ログ {0} を取得できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly countryBbsLoadFailed = new NotificationServiceItem(
    '会議室取得失敗',
    '会議室のデータを取得できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly countryBbsPosted = new NotificationServiceItem(
    '会議室書き込み',
    '会議室のスレッドに書き込みました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryBbsPostFailed = new NotificationServiceItem(
    '会議室書き込み失敗',
    '会議室のスレッドに書き込めませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly countryBbsPostFailedBecauseEmptyText = new NotificationServiceItem(
    '会議室書き込み失敗',
    'テキストを入力してください',
    NotificationServiceItemDefaultType.error);
  public static readonly countryBbsPostFailedBecauseEmptyTitle = new NotificationServiceItem(
    '会議室書き込み失敗',
    'タイトルを入力してください',
    NotificationServiceItemDefaultType.error);
  public static readonly countryBbsRemoved = new NotificationServiceItem(
    '会議室書き込み削除',
    '会議室のスレッドの書き込みを削除しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryBbsRemoveFailed = new NotificationServiceItem(
    '会議室書き込み削除失敗',
    '会議室のスレッドの書き込みの削除に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly entryExtraDataFailed = new NotificationServiceItem(
    '登録追加データ取得失敗',
    'データ取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailed = new NotificationServiceItem(
    '登録失敗',
    '登録に失敗しました。原因が分からない場合は、管理者に連絡してください。連絡先はトップページの下に書いてあります',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailedBecauseSameNameOrAliasId = new NotificationServiceItem(
    '登録失敗',
    '指定した武将名またはログインIDは、すでに登録されています',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailedBecauseSameCountryNameOrColor = new NotificationServiceItem(
    '登録失敗',
    '指定した国名または色は、すでに登録されています',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailedBecauseSameIpAddress = new NotificationServiceItem(
    '登録失敗',
    'すでに登録した人の中から同じIPアドレスが検出されました。スマホなどからの登録はお控えください',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailedBecauseInvitationCode = new NotificationServiceItem(
    '登録失敗',
    '招待コードが指定されていないか、間違っています',
    NotificationServiceItemDefaultType.error);
  public static readonly entryFailedBecauseInvalidSecretKey = new NotificationServiceItem(
    '登録失敗',
    'シークレットキーが不正です。ページをリロードして再試行してください。それでもだめなら管理者にお問い合わせください',
    NotificationServiceItemDefaultType.error);
  public static readonly getAllCharactersFailed = new NotificationServiceItem(
    '武将取得失敗',
    '武将取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly chatPrivateReceived = new NotificationServiceItem(
    '個宛',
    '{0} から個宛を受け取りました',
    NotificationServiceItemDefaultType.information);
  public static readonly countryOverthrown = new NotificationServiceItem(
    '滅亡',
    '所属している国が滅亡しました',
    NotificationServiceItemDefaultType.information);
  public static readonly loadMapLogFailed = new NotificationServiceItem(
    'マップログ取得失敗',
    'マップログ取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly loadCharacterLogFailed = new NotificationServiceItem(
    '武将ログ取得失敗',
    '武将ログ取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly requestReinforcementSucceed = new NotificationServiceItem(
    '援軍要請',
    '{0} に援軍要請しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly requestReinforcementFailed = new NotificationServiceItem(
    '援軍要請失敗',
    '援軍要請に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly cancelReinforcementSucceed = new NotificationServiceItem(
    '援軍要請取消',
    '{0} への援軍要請を取り消しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly cancelReinforcementFailed = new NotificationServiceItem(
    '援軍要請取消失敗',
    '援軍要請の取り消しに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly reinforcementRequested = new NotificationServiceItem(
    '援軍要求',
    '{0} から援軍要請がありました',
    NotificationServiceItemDefaultType.information);
  public static readonly reinforcementCanceled = new NotificationServiceItem(
    '援軍要求取り消し',
    '{0} からの援軍要請は取り消されました',
    NotificationServiceItemDefaultType.information);
  public static readonly dismissReinforcementSucceed = new NotificationServiceItem(
    '援軍拒否',
    '{0} への援軍要請を拒否しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly dismissReinforcementFailed = new NotificationServiceItem(
    '援軍拒否失敗',
    '援軍要請の拒否に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly applyReinforcementSucceed = new NotificationServiceItem(
    '援軍承諾',
    '{0} へ援軍に行きました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly applyReinforcementFailed = new NotificationServiceItem(
    '援軍承諾失敗',
    '援軍に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly returnReinforcementSucceed = new NotificationServiceItem(
    '援軍より帰還',
    '援軍を終了し、本国へ帰還しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly returnReinforcementFailed = new NotificationServiceItem(
    '援軍帰還失敗',
    '帰還に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly submitReinforcementSucceed = new NotificationServiceItem(
    '帰順',
    '{0} に帰順しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly submitReinforcementFailed = new NotificationServiceItem(
    '帰順失敗',
    '帰順に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionAccepted = new NotificationServiceItem(
    '登用受諾',
    '{0} からの登用を受託しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly promotionRefused = new NotificationServiceItem(
    '登用拒否',
    '{0} からの登用を拒否しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly myPromotionAccepted = new NotificationServiceItem(
    '登用受諾',
    '{0} は、あなたからの登用を受託しました',
    NotificationServiceItemDefaultType.information);
  public static readonly myPromotionRefused = new NotificationServiceItem(
    '登用拒否',
    '{0} は、あなたからの登用を拒否しました',
    NotificationServiceItemDefaultType.information);
  public static readonly promotionFailed = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionFailedBecauseInvalidTypeOrCountry = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました。登用文でないか、仕官しようとした国がすでに滅亡している可能性があります',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionFailedBecauseNoCountry = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました。仕官しようとした国がすでに滅亡している可能性があります',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionFailedBecauseNoCharacter = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました。武将が見つかりません',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionReceived = new NotificationServiceItem(
    '登用',
    '{0} から登用を受け取りました',
    NotificationServiceItemDefaultType.information);
  public static readonly countryCommandersMessageSet = new NotificationServiceItem(
    '指令更新',
    '指令を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryCommandersMessageSetFailed = new NotificationServiceItem(
    '指令更新失敗',
    '指令更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly countryCommandersMessageUpdated = new NotificationServiceItem(
    '指令更新',
    '指令が更新されました',
    NotificationServiceItemDefaultType.information);
  public static readonly countrySolicitationMessageSet = new NotificationServiceItem(
    '勧誘文更新',
    '新規登録者勧誘文を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countrySolicitationMessageSetFailed = new NotificationServiceItem(
    '勧誘文更新失敗',
    '新規登録者勧誘文更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly townWarSent = new NotificationServiceItem(
    '攻略布告',
    '{0}、 {1} への攻略を布告しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly townWarFailed = new NotificationServiceItem(
    '攻略布告失敗',
    '{0} への攻略布告に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly townWarSentByMyCountry = new NotificationServiceItem(
    '攻略布告',
    '{0}、 {1} へ攻略します',
    NotificationServiceItemDefaultType.warning);
  public static readonly townWarSentByOtherCountry = new NotificationServiceItem(
    '攻略布告',
    '{0}、 {1} は {2} へ攻略します',
    NotificationServiceItemDefaultType.warning);
  public static readonly soldierTypeAdded = new NotificationServiceItem(
    '兵種追加',
    '兵種 {0} を追加しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly soldierTypeAddFailed = new NotificationServiceItem(
    '兵種追加失敗',
    '兵種 {0} の追加に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly soldierTypeUpdated = new NotificationServiceItem(
    '兵種更新',
    '兵種 {0} を保存しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly soldierTypeUpdateFailed = new NotificationServiceItem(
    '兵種更新失敗',
    '兵種 {0} の更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly defenderWon = new NotificationServiceItem(
    '守備勝利',
    '{0} を守備中に {1} と戦闘し、勝利しました',
    NotificationServiceItemDefaultType.information);
  public static readonly defenderLose = new NotificationServiceItem(
    '守備敗北',
    '{0} を守備中に {1} と戦闘し、敗北しました',
    NotificationServiceItemDefaultType.warning);
  public static readonly addedIcon = new NotificationServiceItem(
    'アイコン追加',
    'アイコンを追加しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly addIconFailed = new NotificationServiceItem(
    'アイコン追加失敗',
    'アイコン追加に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly deletedIcon = new NotificationServiceItem(
    'アイコン削除',
    'アイコンを削除しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly deleteIconFailed = new NotificationServiceItem(
    'アイコン削除失敗',
    'アイコン削除に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly setMainIcon = new NotificationServiceItem(
    'メインアイコン設定',
    '選択したアイコンをメインアイコンに設定しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly setMainIconFailed = new NotificationServiceItem(
    'メインアイコン設定失敗',
    'メインアイコン設定に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly invalidStatus = new NotificationServiceItem(
    '異常な状態',
    '異常な状態が発生しました。開発者ツールなどを用いて、データに間違った値を埋め込んだときにこのエラーが発生します。もし、何もしていないのにこのエラーが発生した場合は、管理者に連絡してください。情報：{0}',
    NotificationServiceItemDefaultType.error);

  public static onError: ((title: string, message: string) => void) | null = null;
  public static onWarning: ((title: string, message: string) => void) | null = null;
  public static onInformation: ((title: string, message: string) => void) | null = null;
  public static onSucceed: ((title: string, message: string) => void) | null = null;

  public static empty() {
    if (NotificationService.onEmpty !== null) {
      NotificationService.onEmpty('EMPTY', 'EMPTY');
    }
  }
  private static onEmpty: ((title: string, message: string) => void) | null = null;

  private constructor() {}
}
