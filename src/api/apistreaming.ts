import Enumerable from 'linq';
import * as def from '../common/definitions';
import * as current from '../common/current';
import * as api from './api';
import Streaming from './streaming';
import NotificationService from '@/services/notificationservice';

/**
 * ストリーミングを、三国志NETのAPIにとって使いやすい形式で利用できるクラス。
 * Streamingクラスのラッパ
 */
export default class ApiStreaming {

  /**
   * トップ画面のストリーミング
   */
  public static top = new ApiStreaming(def.API_HOST + 'streaming/anonymous', 'GET', false);

  /**
   * ステータス画面のストリーミング
   */
  public static status = new ApiStreaming(def.API_HOST + 'streaming/status', 'GET', true);

  /**
   * エラー発生時の再接続の前に呼び出される
   */
  public onBeforeReconnect?: () => void;

  public onAuthenticationFailed?: () => void;

  /**
   * 前回接続でエラーが発生していたか
   */
  private isLastError: boolean = false;

  private isStreaming: boolean = false;
  private listeners: ApiStreamingListener[] = [];
  private streaming: Streaming = new Streaming();

  private constructor(private uri: string,
                      method: string,
                      private isAuthorize: boolean) {
    // ストリーミングを初期化
    this.streaming.onReceiveObject = (obj) => this.onReceiveObject(obj);
    this.streaming.onError = (code, err) => this.onError(code, err);
    this.streaming.method = method;
  }

  /**
   * ストリーミングを開始
   */
  public start() {
    if (!this.isStreaming) {
      if (this.isAuthorize) {
        this.streaming.header = {
          Authorization: 'Bearer ' + current.authorizationToken,
        };
      }
      this.streaming.uri = this.uri + '?unique=' + Math.random() * 10000000;
      this.streaming.start();
      this.isStreaming = true;
    }
  }

  /**
   * ストリーミングを停止
   */
  public stop() {
    this.isStreaming = false;
    this.streaming.stop();
  }

  /**
   * ストリーミングでオブジェクトを受け取った時のイベントを設定する。
   * 受け取るオブジェクトの型は、ジェネリックで指定する
   * @param onFire 受け取ったときのイベント
   */
  public on<T>(typeId: number, onFire: (obj: T) => void) {
    this.listeners.push(new ApiStreamingListener(typeId, onFire));
  }

  /**
   * 設定したイベントをクリアする
   */
  public clearEvents() {
    this.listeners = [];
  }

  private fire<T>(typeId: number, obj: T) {
    Enumerable
      .from(this.listeners)
      .where((element) => element.type === typeId)
      .forEach((element) => {
        element.onFire(obj);
      });
  }

  private onReceiveObject(obj: any) {
    if (this.isLastError) {
      this.isLastError = false;
      NotificationService.serverReconnectionSucceed.notify();
    }

    this.fire(obj.type, obj.data);
  }

  private onError(code: number, error: api.ApiError | null) {
    switch (code) {
      case 401:
      case 500:   // 臨時
        NotificationService.authenticationFailed.notify();
        this.isStreaming = false;
        if (this.onAuthenticationFailed) {
          this.onAuthenticationFailed();
        }
        break;
      case 403:
        NotificationService.authenticationFailed.notify();
        break;
      case 0:
      case 404:
        if (this.isStreaming) {
          NotificationService.serverConnectionFailed.notify();
          this.isLastError = true;
        }
        break;
      case 500:
        const errorCode: number = error === null ? -1 : error.code;
        const additionalData: any = error === null ? {} : error.data;
        NotificationService.serverApiFailed.notifyWithParameter(
          code.toString(),
          this.streaming.uri,
          errorCode.toString(),
          JSON.stringify(additionalData));
        break;
      case 503:
        NotificationService.serverDatabaseFailed.notify();
        break;
    }

    // 自分で停止したわけでなければ、再接続を試みる
    if (this.isStreaming) {
      this.stop();
      if (this.onBeforeReconnect) {
        this.onBeforeReconnect();
      }
      setTimeout(() => {
        if (!this.isStreaming) {
          this.start();
        }
      }, 5000);
    }
  }
}

class ApiStreamingListener {
  public constructor(public type: number, public onFire: (obj: any) => void) {
  }
}
