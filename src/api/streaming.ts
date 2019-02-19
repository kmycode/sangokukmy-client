
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
  private isLastError: boolean = false;
  private length: number = 0;

  /**
   * ストリーミングを開始する
   * @param requestBody リクエスト時の中身
   */
  public start(requestBody: string | null = null) {
    this.ajax = new XMLHttpRequest();

    this.ajax.open(this.method, this.uri);

    // 受信がすべて完了したとき
    this.ajax.onreadystatechange = () => {
      const ajax = this.ajax;
      if (ajax != null && ajax.readyState === 4) {
        switch (ajax.status) {
          case 200:
            if (this.onFinished !== null) {
              this.onFinished(ajax.status);
            }
            break;
          default:
            if (this.onError !== null) {
              let errobj: api.ApiError | null = null;
              if (ajax.responseText.length > 0) {
                const line = Enumerable
                  .from(ajax.responseText.split('\n'))
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
              this.onError(ajax.status, errobj);
            }
            break;
        }
        ajax.onreadystatechange = null;
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
    this.receiveLoop();
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

  private receiveLoop() {
    const ajax = this.ajax;
    if (ajax != null) {
      if (this.length !== ajax.responseText.length || this.isLastError) {
        const updatedText = ajax.responseText.slice(this.length);
        this.length = ajax.responseText.length;

        // JSONになおしてイベント発行
        this.isLastError = false;
        const lines = updatedText.split('\n');
        const availableLines = lines.filter((line) => line);
        availableLines.forEach((line) => {
          this.output(line);
        });

        // 最後のデータがエラーなら、最後のデータを後でもう一度
        if (this.isLastError) {
          const lastAvailableLine = availableLines[availableLines.length - 1];
          this.length -= Enumerable.from(lines)
            .skipWhile((line) => line !== lastAvailableLine)
            .sum((line) => line.length + 1);
          if (updatedText[updatedText.length - 1] !== '\n') {
            this.length--;
          }
        }
      }

      // 並列処理を防止するため、setIntervalは使わない
      setTimeout(() => this.receiveLoop(), 100);
    }
  }

  private output(line: string) {
    try {
      const obj = JSON.parse(line);
      this.isLastError = false;

      if (this.onReceiveObject !== null) {
        this.onReceiveObject(obj);
      }
    } catch (ex) {
      if (this.onReceiveText !== null) {
        this.onReceiveText(line);
      }
      this.isLastError = true;
    }
  }

}
