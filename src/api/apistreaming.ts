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
  public static top = new ApiStreaming(def.API_HOST + 'test/streaming', 'GET');

  /**
   * ステータス画面のストリーミング
   */
  public static status = new ApiStreaming(def.API_HOST + 'streaming/status', 'GET');

  /**
   * 前回接続でエラーが発生していたか
   */
  private isLastError: boolean = false;

  private isStreaming: boolean = false;
  private listeners: ApiStreamingListener[] = [];
  private streaming: Streaming = new Streaming();

  private constructor(uri: string,
                      method: string) {
    // ストリーミングを初期化
    this.streaming.onReceiveObject = (obj) => this.onReceiveObject(obj);
    this.streaming.onError = (code, err) => this.onError(code, err);
    this.streaming.uri = uri;
    this.streaming.method = method;
  }

  /**
   * ストリーミングを開始
   */
  public start() {
    this.streaming.header = {
      Authorization: 'Bearer ' + current.authorizationToken,
    };
    this.streaming.start();
    this.isStreaming = true;
  }

  /**
   * ストリーミングを停止
   */
  public stop() {
    this.streaming.stop();
    this.isStreaming = false;
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
    switch (obj.type) {
      case api.DateTime.typeId:
        this.fire(obj.type, obj.data as api.DateTime);
        break;
      case api.GameDateTime.typeId:
        this.fire(obj.type, obj.data as api.GameDateTime);
        break;
      case api.MapLog.typeId:
        this.fire(obj.type, obj.data as api.MapLog);
        break;
      case api.CharacterUpdateLog.typeId:
        this.fire(obj.type, obj.data as api.CharacterUpdateLog);
        break;
      case api.Character.typeId:
        this.fire(obj.type, obj.data as api.Character);
        break;
      case api.Country.typeId:
        this.fire(obj.type, obj.data as api.Country);
        break;
      case api.Town.typeId:
        this.fire(obj.type, obj.data as api.Town);
        break;
      case api.ApiSignal.typeId:
        this.fire(obj.type, obj.data as api.ApiSignal);
        break;
      default:
        this.fire(obj.type, obj.data);
        break;
    }
  }

  private onError(code: number, error: api.ApiError | null) {
    switch (code) {
      case 401:
      case 403:
        NotificationService.authenticationFailed.notify();
        break;
      case 0:
      case 404:
        NotificationService.serverConnectionFailed.notify();
        this.isLastError = true;
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
    setTimeout(() => {
      if (this.isStreaming) {
        this.start();
      }
    }, 5000);
  }
}

class ApiStreamingListener {
  public constructor(public type: number, public onFire: (obj: any) => void) {
  }
}
