
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
      if (this.ajax != null && this.ajax.readyState === 4 && this.onFinished !== null) {
        this.onFinished(this.ajax.status);
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
