
import Enumerable from 'linq';
import * as api from './api';
import NotificationService from '@/services/notificationservice';

/**
 * ストリーミングを行うクラス
 */
export default class Streaming {

  /**
   * ストリーミング対象のURI
   */
  public uri: string = '';

  /**
   * ストリーミングのメソッド
   */
  public method: string = 'GET';

  /**
   * ヘッダ
   */
  public header: any = {};

  /**
   * オブジェクトに変換できないテキストを受け取ったとき
   */
  public onReceiveText: ((text: string) => void) | null = null;

  /**
   * オブジェクトを受け取ったとき
   */
  public onReceiveObject: ((obj: any) => void) | null = null;

  /**
   * 受信が完了したとき
   */
  public onFinished: ((statusCode: number) => void) | null = null;

  /**
   * 受信でエラーが発生したとき
   */
  public onError: ((statusCode: number, error: api.ApiError | null) => void) | null = null;

  private ajax: XMLHttpRequest | null = null;

  /**
   * ストリーミングを開始する
   * @param requestBody リクエスト時の中身
   */
  public start(requestBody: string | null = null) {
    this.ajax = new XMLHttpRequest();

    this.ajax.open(this.method, this.uri);

    // 受信がすべて完了したとき
    this.ajax.onreadystatechange = () => {
      if (this.ajax != null && this.ajax.readyState === 4) {
        switch (this.ajax.status) {
          case 200:
            if (this.onFinished !== null) {
              this.onFinished(this.ajax.status);
            }
            break;
          default:
            if (this.onError !== null) {
              let errobj: api.ApiError | null = null;
              if (this.ajax.responseText.length > 0) {
                const line = Enumerable
                  .from(this.ajax.responseText.split('\n'))
                  .last((ln) => ln.length > 0);
                try {
                  const obj = JSON.parse(line) as api.ApiData<api.ApiError>;
                  if (obj.type === api.ApiError.typeId) {
                    errobj = obj.data;
                  }
                } catch (ex) {
                  NotificationService.empty();
                }
              }
              this.onError(this.ajax.status, errobj);
            }
            break;
        }
      }
    };

    // ヘッダを設定
    Object.keys(this.header).forEach((key) => {
      if (this.ajax != null) {
        this.ajax.setRequestHeader(key, this.header[key]);
      }
    });

    // リクエスト開始
    this.ajax.send(requestBody);

    // リクエストを受け取っていないか確認
    let length = 0;
    const ajaxTimer = setInterval(() => {
      if (this.ajax != null) {
        if (length !== this.ajax.responseText.length) {
          const updatedText = this.ajax.responseText.slice(length);
          length = this.ajax.responseText.length;

          // JSONになおしてイベント発行
          const lines = updatedText.split('\n');
          lines.filter((line) => line).forEach((line) => {
            this.output(line);
          });
        }
      } else {
        clearInterval(ajaxTimer);
      }
    }, 100);
  }

  /**
   * ストリーミングを停止する
   */
  public stop() {
    if (this.ajax != null) {
      this.ajax.abort();
      this.ajax = null;
    }
  }

  private output(line: string) {
    try {
      const obj = JSON.parse(line);
      if (this.onReceiveObject !== null) {
        this.onReceiveObject(obj);
      }
    } catch (ex) {
      if (this.onReceiveText !== null) {
        this.onReceiveText(line);
      }
    }
  }

}
