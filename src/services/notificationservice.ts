
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
  public static readonly inputCommandsFailedBecauseTooLong = new NotificationServiceItem(
    'コマンド入力失敗',
    'コマンド入力に失敗しました。文章が長すぎます (現在: {0}, 最大: {1})',
    NotificationServiceItemDefaultType.error);
  public static readonly inputCommandsSucceed = new NotificationServiceItem(
    'コマンド入力完了',
    '{0} の入力が完了しました。',
    NotificationServiceItemDefaultType.succeed);
  public static readonly regularlyCommandInputed = new NotificationServiceItem(
    '定期実行コマンド入力完了',
    '定期実行コマンド {0} の入力が完了しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly regularlyCommandInputFalled = new NotificationServiceItem(
    '定期実行コマンド入力失敗',
    '定期実行コマンド {0} の入力に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly regularlyCommandCleared = new NotificationServiceItem(
    '定期実行コマンド削除',
    '定期実行コマンドを削除しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly regularlyCommandClearFalled = new NotificationServiceItem(
    '定期実行コマンド削除失敗',
    '定期実行コマンドの削除に失敗しました',
    NotificationServiceItemDefaultType.error);
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
  public static readonly postChatFailedBecauseTooLong = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。文章が長すぎます (現在: {0}, 最大: {1})',
    NotificationServiceItemDefaultType.error);
  public static readonly postChatFailedBecauseUploadImageError = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。画像がアップロードできませんでした。pixivの画像の場合、お手数ですが一度ローカルに保存してからアップロードしてください',
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
  public static readonly townCostUpdateFailed = new NotificationServiceItem(
    '都市購入費用取得失敗',
    '都市の購入費用の取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly townCostAdded = new NotificationServiceItem(
    '都市購入費用加算',
    '{0} の購入費用を 1000 加算しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly townCostAddFailed = new NotificationServiceItem(
    '都市購入費用加算失敗',
    '{0} の購入費用の加算に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly townBought = new NotificationServiceItem(
    '都市購入',
    '{0} を購入しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly townBuyFailed = new NotificationServiceItem(
    '都市購入失敗',
    '{0} の購入に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly townBuyFailedBecauseNotBorder = new NotificationServiceItem(
    '都市購入失敗',
    '{0} の購入に失敗しました。隣接していない都市は購入できません',
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
  public static readonly stopedCommand = new NotificationServiceItem(
    '謹慎',
    '{0} を謹慎しました。次のコマンド入力まで、コマンドが実行されなくなります',
    NotificationServiceItemDefaultType.succeed);
  public static readonly stopCommandFailed = new NotificationServiceItem(
    '謹慎失敗',
    '{0} の謹慎に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly myCommandsStoped = new NotificationServiceItem(
    '謹慎',
    '謹慎されました。次のコマンド入力まで、コマンドが実行されなくなります',
    NotificationServiceItemDefaultType.warning);
  public static readonly dismissaled = new NotificationServiceItem(
    '解雇',
    '{0} を解雇しました。解雇理由を連絡してください',
    NotificationServiceItemDefaultType.succeed);
  public static readonly dismissalFailed = new NotificationServiceItem(
    '解雇失敗',
    '{0} の解雇に失敗しました',
    NotificationServiceItemDefaultType.error);
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
    '{0} と {1} に開戦します',
    NotificationServiceItemDefaultType.warning);
  public static readonly warStart = new NotificationServiceItem(
    '開戦',
    '{0} との戦争が始まりました',
    NotificationServiceItemDefaultType.warning);
  public static readonly warStopRequested = new NotificationServiceItem(
    '停戦協議開始',
    '{0} との戦争の停戦協議が開始されました',
    NotificationServiceItemDefaultType.information);
  public static readonly warStopped = new NotificationServiceItem(
    '停戦',
    '{0} との戦争は停戦しました',
    NotificationServiceItemDefaultType.information);
  public static readonly warSent = new NotificationServiceItem(
    '戦争手続き成功',
    '戦争の手続きは、無事相手に送信されました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly warFailed = new NotificationServiceItem(
    '戦争手続き失敗',
    '何らかの理由で、戦争の手続きに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseOfStartDate = new NotificationServiceItem(
    '戦争手続き失敗',
    '開戦が早すぎる、または遅すぎます。現在より 12 年先、24 年より前の開戦年月の指定が必要です',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseNotPermission = new NotificationServiceItem(
    '戦争手続き失敗',
    'あなたにその操作をする権限がないか、同盟国に布告することはできません',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseInvalidOperation = new NotificationServiceItem(
    '戦争手続き失敗',
    '隣接していない国に布告することはできません',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseSameReligion = new NotificationServiceItem(
    '戦争手続き失敗',
    '同じ国教を持つ国に宗教戦争を仕掛けることはできません',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseMultipleWarMode = new NotificationServiceItem(
    '戦争手続き失敗',
    '自分または相手国は、通常戦争と宗教戦争を同時に行うことはできません',
    NotificationServiceItemDefaultType.error);
  public static readonly warFailedBecauseSameStatus = new NotificationServiceItem(
    '戦争手続き失敗',
    '戦争手続きについて、現在と同じ状態に変更する操作をしようとしました。他の人があなたと同時に同じ操作をした可能性があります。',
    NotificationServiceItemDefaultType.error);
  public static readonly penaltyDataGetFalled = new NotificationServiceItem(
    '戦争ペナルティ情報取得失敗',
    '戦争ペナルティ情報の取得がエラーにより失敗しました',
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
  public static readonly unitCreateFailedBecauseNameTooLong = new NotificationServiceItem(
    '部隊作成失敗',
    '部隊 {0} を作成できませんでした。名前が長すぎます (現在: {1}, 最大: {2})',
    NotificationServiceItemDefaultType.error);
  public static readonly unitCreateFailedBecauseMessageTooLong = new NotificationServiceItem(
    '部隊作成失敗',
    '部隊 {0} を作成できませんでした。メッセージが長すぎます (現在: {1}, 最大: {2})',
    NotificationServiceItemDefaultType.error);
  public static readonly unitUpdated = new NotificationServiceItem(
    '部隊更新',
    '部隊 {0} の情報を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitUpdateFailed = new NotificationServiceItem(
    '部隊更新失敗',
    '部隊 {0} の情報を更新できませんでした',
    NotificationServiceItemDefaultType.error);
  public static readonly unitUpdateFailedBecauseMessageTooLong = new NotificationServiceItem(
    '部隊更新失敗',
    '部隊 {0} の情報を更新できませんでした。メッセージが長すぎます (現在: {1}, 最大: {2})',
    NotificationServiceItemDefaultType.error);
  public static readonly unitUpdateFailedBecauseNameTooLong = new NotificationServiceItem(
    '部隊更新失敗',
    '部隊 {0} の情報を更新できませんでした。名前が長すぎます (現在: {1}, 最大: {2})',
    NotificationServiceItemDefaultType.error);
  public static readonly unitLeaderChanged = new NotificationServiceItem(
    '部隊長交代',
    '部隊 {0} の部隊長交代に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitLeaderChangeFailed = new NotificationServiceItem(
    '部隊長交代失敗',
    '部隊 {0} の部隊長交代に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly unitMemberDischarged = new NotificationServiceItem(
    '除隊',
    '隊員 {0} を除隊しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly unitMemberDischargeFalled = new NotificationServiceItem(
    '除隊失敗',
    '隊員 {0} の除隊に失敗しました',
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
  public static readonly belongsUnitDischarged = new NotificationServiceItem(
    '部隊からの除隊',
    '所属していた部隊から除隊されました',
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
  public static readonly getCharacterDetailFailed = new NotificationServiceItem(
    '武将詳細取得失敗',
    '武将詳細取得に失敗しました',
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
  public static readonly promotionFailedBecauseCountryLimited = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました。その国への仕官は現在制限されています。戦闘解除をお待ち下さい',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionFailedBecauseBlocked = new NotificationServiceItem(
    '登用文操作失敗',
    '登用文の操作に失敗しました。あなたは現在、下野などの理由で国に仕官することができません',
    NotificationServiceItemDefaultType.error);
  public static readonly promotionReceived = new NotificationServiceItem(
    '登用',
    '{0} から登用を受け取りました',
    NotificationServiceItemDefaultType.information);
  public static readonly countryCommandersMessageAddFalledBecauseSubjectAlreadyExists = new NotificationServiceItem(
    '指令追加失敗',
    '同条件の指令がすでに存在します',
    NotificationServiceItemDefaultType.warning);
  public static readonly countryCommandersMessageSet = new NotificationServiceItem(
    '指令更新',
    '指令を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryCommandersMessageSetFailed = new NotificationServiceItem(
    '指令更新失敗',
    '指令更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly countryCommandersMessageSetFailedBecauseTooLong = new NotificationServiceItem(
    '指令更新失敗',
    '指令更新に失敗しました。文章が長すぎます (現在: {0}, 最大: {1})',
    NotificationServiceItemDefaultType.error);
  public static readonly countryCommandersMessageUpdated = new NotificationServiceItem(
    '指令更新',
    '指令が更新されました',
    NotificationServiceItemDefaultType.information);
  public static readonly countryCommandersMessageReadFailed = new NotificationServiceItem(
    '指令既読失敗',
    '指令の既読付けに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly countrySolicitationMessageSet = new NotificationServiceItem(
    '勧誘文更新',
    '新規登録者勧誘文を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countrySolicitationMessageSetFailed = new NotificationServiceItem(
    '勧誘文更新失敗',
    '新規登録者勧誘文更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly countrySolicitationMessageSetFailedBecauseTooLong = new NotificationServiceItem(
    '勧誘文更新失敗',
    '新規登録者勧誘文更新に失敗しました。文章が長すぎます (現在: {0}, 最大: {1})',
    NotificationServiceItemDefaultType.error);
  public static readonly countryGyokujiRefusedUpdated = new NotificationServiceItem(
    '玉璽拒否設定更新',
    '玉璽拒否設定を更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryGyokujiRefusedUpdateFailed = new NotificationServiceItem(
    '玉璽拒否設定更新失敗',
    '玉璽拒否設定の更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly countryUnifiedMessageUpdated = new NotificationServiceItem(
    'あいさつ更新',
    'あいさつを更新しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly countryUnifiedMessageUpdateFailed = new NotificationServiceItem(
    'あいさつ更新失敗',
    'あいさつ更新に失敗しました',
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
  public static readonly townGave = new NotificationServiceItem(
    '割譲',
    '{0} の {1} への割譲に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly townGiveFailed = new NotificationServiceItem(
    '割譲失敗',
    '{0} の {1} への割譲に失敗しました。都市が相手国に隣接していないか、その他の要件を満たしていません',
    NotificationServiceItemDefaultType.error);
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
  public static readonly addPolicy = new NotificationServiceItem(
    '政策追加',
    '政策 {0} を追加しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly addPolicyFailed = new NotificationServiceItem(
    '政策追加失敗',
    '政策 {0} の追加に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly addPolicyFailedBecauseOfDuplicate = new NotificationServiceItem(
    '政策追加失敗',
    '政策 {0} の追加に失敗しました。他の人がすでに同じ政策を追加した可能性があります',
    NotificationServiceItemDefaultType.error);
  public static readonly addPolicyFailedBecauseOfLackOfPoints = new NotificationServiceItem(
    '政策追加失敗',
    '政策 {0} の追加に失敗しました。政策ポイントが足りません',
    NotificationServiceItemDefaultType.error);
  public static readonly policyAdded = new NotificationServiceItem(
    '政策追加',
    '所属国に政策 {0} が追加されました',
    NotificationServiceItemDefaultType.information);
  public static readonly policyBoosted = new NotificationServiceItem(
    '政策ブースト',
    '所属国の政策 {0} がブーストされました',
    NotificationServiceItemDefaultType.information);
  public static readonly reseted = new NotificationServiceItem(
    'リセット',
    'ゲームはリセットされました。新しいドラマが始まります',
    NotificationServiceItemDefaultType.information);
  public static readonly historyLoadFailed = new NotificationServiceItem(
    '統一履歴取得失敗',
    '統一履歴の取得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly formationChanged = new NotificationServiceItem(
    '陣形変更',
    '陣形を {0} に変更しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly formationChangeFailed = new NotificationServiceItem(
    '陣形変更失敗',
    '陣形を {0} に変更しようとしましたが、失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly itemGot = new NotificationServiceItem(
    'アイテム入手',
    'アイテム {0} を入手しました',
    NotificationServiceItemDefaultType.information);
  public static readonly itemPending = new NotificationServiceItem(
    'アイテム入手',
    'アイテム {0} を受け取りました。利用するには、アイテム一覧より受け取る必要があります',
    NotificationServiceItemDefaultType.information);
  public static readonly itemGotByPending = new NotificationServiceItem(
    'アイテム入手',
    'アイテムを入手しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly itemReleasedByPending = new NotificationServiceItem(
    'アイテム受取拒否',
    'アイテム受け取りを拒否しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly itemGetFailedByPending = new NotificationServiceItem(
    'アイテム入手失敗',
    'アイテム入手に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly itemGetFailedByPendingBecauseOfMax = new NotificationServiceItem(
    'アイテム入手失敗',
    'アイテム入手に失敗しました。アイテム所持数がすでに最大に達しています。不要なアイテムを売却するなどしてください',
    NotificationServiceItemDefaultType.error);
  public static readonly itemReleased = new NotificationServiceItem(
    'アイテム手放し',
    'アイテム {0} を手放しました',
    NotificationServiceItemDefaultType.information);
  public static readonly itemGetAll = new NotificationServiceItem(
    'アイテム一括入手',
    '入手できるだけのアイテムを入手しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly itemAvailableChangeFailed = new NotificationServiceItem(
    'アイテム状態変更失敗',
    'アイテムの状態変更に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly skillGetSucceed = new NotificationServiceItem(
    '技能獲得成功',
    '技能の獲得に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly skillGetFailed = new NotificationServiceItem(
    '技能獲得失敗',
    '技能の獲得に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly skillGot = new NotificationServiceItem(
    '技能獲得',
    '技能 {0} を獲得しました',
    NotificationServiceItemDefaultType.information);
  public static readonly commandInserted = new NotificationServiceItem(
    'コマンド挿入',
    'コマンドの挿入に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly commandRemoved = new NotificationServiceItem(
    'コマンド削除',
    'コマンドの削除に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly commandLooped = new NotificationServiceItem(
    'コマンドのループ',
    'コマンドの繰り返し入力に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly commandCommentUpdated = new NotificationServiceItem(
    'コマンドコメントの更新',
    'コマンドコメントが更新されました',
    NotificationServiceItemDefaultType.information);
  public static readonly commandCommentUpdateSucceed = new NotificationServiceItem(
    'コマンドコメントの更新',
    'コマンドコメントの更新に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly commandCommentUpdateFailed = new NotificationServiceItem(
    'コマンドコメントの更新失敗',
    'コマンドコメントの更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly privateMessageUpdated = new NotificationServiceItem(
    'メッセージ更新',
    'メッセージの更新に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly privateMessageUpdateFailed = new NotificationServiceItem(
    'メッセージ更新失敗',
    'メッセージ更新に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly privateMessageUpdateFailedBecauseTooLong = new NotificationServiceItem(
    'メッセージ更新失敗',
    'メッセージ更新に失敗しました。文章が長すぎます (現在: {0}, 最大: {1})',
    NotificationServiceItemDefaultType.error);
  public static readonly muted = new NotificationServiceItem(
    'ミュート',
    '対象のミュートの操作に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly muteFailed = new NotificationServiceItem(
    'ミュート失敗',
    '対象のミュートに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly keywordMuted = new NotificationServiceItem(
    'ミュートキーワード設定',
    '対象のミュートの操作に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly keywordMuteFailed = new NotificationServiceItem(
    'ミュートキーワード設定失敗',
    '対象のミュートに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly reported = new NotificationServiceItem(
    '報告',
    '対象の報告の操作に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly reportFailed = new NotificationServiceItem(
    '報告失敗',
    '対象の報告に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly accountCreated = new NotificationServiceItem(
    'アカウント作成成功',
    'アカウントの作成に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly accountCreateFailedBecauseIncorrectNameLength = new NotificationServiceItem(
    'アカウント作成失敗',
    'アカウントの作成に失敗しました。名前の長さが範囲外です。{0} - {1} 文字以内。現在：{2} 文字',
    NotificationServiceItemDefaultType.error);
  public static readonly accountCreateFailedBecauseIncorrectAliasIdLength = new NotificationServiceItem(
    'アカウント作成失敗',
    'アカウントの作成に失敗しました。IDの長さが範囲外です。{0} - {1} 文字以内。現在：{2} 文字',
    NotificationServiceItemDefaultType.error);
  public static readonly accountCreateFailedBecauseIncorrectPasswordLength = new NotificationServiceItem(
    'アカウント作成失敗',
    'アカウントの作成に失敗しました。パスワードの長さが範囲外です。{0} - {1} 文字以内。現在：{2} 文字',
    NotificationServiceItemDefaultType.error);
  public static readonly accountCreateFailedBecauseDuplicateNameOrAliasId = new NotificationServiceItem(
    'アカウント作成失敗',
    'アカウントの作成に失敗しました。そのIDまたは名前はすでに登録されています',
    NotificationServiceItemDefaultType.error);
  public static readonly accountCreateFailed = new NotificationServiceItem(
    'アカウント作成失敗',
    'アカウントの作成に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly accountLogined = new NotificationServiceItem(
    'アカウントログイン成功',
    'アカウントのログインに成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly accountLoginFailed = new NotificationServiceItem(
    'アカウントログイン失敗',
    'アカウントのログインに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly accountLoginFailedBecauseAccountNotFound = new NotificationServiceItem(
    'アカウントログイン失敗',
    'アカウントのログインに失敗しました。該当するIDを持ったアカウントは存在しません',
    NotificationServiceItemDefaultType.error);
  public static readonly threadPropertyChanged = new NotificationServiceItem(
    'スレッドのプロパティ変更',
    'スレッドのプロパティ変更に成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly threadPropertyChangeFailed = new NotificationServiceItem(
    'スレッドのプロパティ変更失敗',
    'スレッドのプロパティ変更に失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly loadThreadFailed = new NotificationServiceItem(
    'スレッドのロード失敗',
    'スレッドのロードに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly writeThreadSucceed = new NotificationServiceItem(
    'スレッド書き込み成功',
    'スレッドの書き込みに成功しました',
    NotificationServiceItemDefaultType.succeed);
  public static readonly writeThreadFailed = new NotificationServiceItem(
    'スレッド書き込み失敗',
    'スレッドの書き込みに失敗しました',
    NotificationServiceItemDefaultType.error);
  public static readonly actionBlocked = new NotificationServiceItem(
    '管理人により制限された操作',
    '該当の操作は管理人により制限されています。「手紙」→「個人」などで制限の理由など詳細をご確認ください。健全な運営のため、ご協力をよろしくお願いいたします',
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
