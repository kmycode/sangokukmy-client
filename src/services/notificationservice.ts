
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
