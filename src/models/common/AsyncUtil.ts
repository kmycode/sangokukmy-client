
export default class AsyncUtil {

  public static tryTimes(times: number, process: (() => void),
                         onError: ((result: any) => void) = () => undefined) {
    this.tryTimesAsync(times, process, onError);
  }

  public static async tryTimesAsync(times: number,
                                    process: (() => void),
                                    onError: ((result: any) => void) = () => undefined) {
    let isFailed = true;
    let failedResult: any = null;

    while (isFailed && times >= 0) {
      isFailed = false;
      times--;

      try {
        await process();
      } catch (ex) {
        isFailed = true;
        failedResult = ex;
      }
    }

    if (isFailed) {
      onError(failedResult);
    }
  }

}
