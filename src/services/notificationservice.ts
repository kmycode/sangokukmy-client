
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
  public static readonly postChatFailed = new NotificationServiceItem(
    '手紙送信失敗',
    '手紙の送信に失敗しました。',
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
