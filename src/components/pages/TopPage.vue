<template>
  <div id="top-page">
    <div class="container">
      <div class="row">
        <div class="top-table top-title-logo loading-container col-sm-10 offset-sm-1 col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          <h1>三国志NET KMY Version 9</h1>
          <h2>第{{ system.period }}<span v-if="system.betaVersion > 0">.{{ system.betaVersion }}</span>期</h2>
          [<span class="number">{{ system.gameDateTime.year }}</span>年<span class="number">{{ system.gameDateTime.month | zeroformat(2) }}</span>月]<br>
          来月まであと <span class="number">{{ nextMonthSeconds }}</span>秒
          <div v-if="system.gameDateTime.year < 24">更新開始: <span class="number">24</span>年<span class="number">01</span>月より</div>
          <div v-if="system.gameDateTime.year >= 24 && system.gameDateTime.year < 48">主要国戦闘解除: <span class="number">48</span>年<span class="number">01</span>月より</div>
          <div v-if="system.isWaitingReset">リセット: <span class="number">{{ system.resetGameDateTime.year }}</span>年<span class="number">{{ system.resetGameDateTime.month | zeroformat(2) }}</span>月より</div>
          <div class="onlines"></div>
          <div v-show="isLoadingSystem" class="loading"><div class="loading-icon"></div></div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-10 offset-sm-1 col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          <div v-show="isLoadingSystem && nextMonthSeconds <= -15" class="not-loading-message-panel">
            <h2>読込に通常より時間がかかっています...</h2>
            <h3>お使いのネットワーク回線は通常より混雑していませんか？</h3>
            <div>
              他のサイト（<a href="https://google.com/" target="_blank">Google</a>など）にもアクセスして、ネットワーク回線に問題がないか確認してください
            </div>
            <h3>アンチウィルスソフトの影響ではありませんか？</h3>
            <div>
              アンチウィルスソフトに除外サイト設定がある場合は、以下の２つのサイトを除外設定してから再接続を試みてください
              <ul>
                <li><code>https://sangoku.kmycode.net/</code></li>
                <li><code>https://sangokukmy-api.kmycode.net/</code></li>
              </ul>
              本サイトはHTTP Streamingという技術を採用しており、そのために一部のアンチウィルスソフトに引っかかるようです
            </div>
            <h3>サーバ自体が落ちていませんか？</h3>
            <div>
              サーバが落ちている場合、データのロードができません。
              その場合、画面右下に赤色の通知が表示されますので、ご確認ください。
              しばらく時間を置いて、もう一度アクセスしてみてください。
              なお、このまま放置しても自動的に再接続を試み続けるため、サーバが復帰した時に正常な表示に戻ります
            </div>
            <h3>どうしても解決しない場合は</h3>
            <div>
              管理者に連絡してください。連絡先は本ページのフッタに書いてあります
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="top-login-form col-sm-6 offset-sm-3">
          <button type="button" class="btn btn-light" @click="login">ログイン</button>
          <button type="button" class="btn btn-primary" @click="entry">新規登録</button>
        </div>
      </div>
      <div class="row">
        <div class="top-content col-sm-12">
          <ul class="nav nav-tabs nav-fill">
            <li class="nav-item"><a class="nav-link active" href="#" @click.prevent.stop="">トップページ</a></li>
            <!-- <li class="nav-item"><a class="nav-link" href="#">説明書</a></li>
            <li class="nav-item"><a class="nav-link" href="#">勢力図</a></li> -->
            <li class="nav-item"><a class="nav-link" href="#" @click.prevent.stop="$emit('show-all-characters')">武将一覧</a></li>
            <!-- <li class="nav-item"><a class="nav-link" href="#">名将一覧</a></li> -->
          </ul>
        </div>
      </div>
      <div id="app-index" class="row">
        <div class="col-sm-12 loading-container">
          <!--マップログ（細字）-->
          <div class="top-table-flat">
            <MapLogList :logs="mlogs" :type="'normal'"/>
          </div>
          <!--マップログ（太字）-->
          <div class="top-table-flat">
            <MapLogList :logs="m2logs" :type="'important'"/>
          </div>
          <!-- 武将更新ログ -->
          <div class="top-table-flat">
            <MapLogList :logs="updateLogs" :type="'character-update-log'"/>
          </div>
          <div v-show="isLoadingSystem" class="loading"><div class="loading-icon"></div></div>
        </div>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Footer from '../common/Footer.vue';
import MapLogList from '../parts/MapLogList.vue';
import MapLogLine from '../parts/MapLogLine.vue';
import RealDateTime from '../parts/RealDateTime.vue';
import AsyncUtil from '../../models/common/AsyncUtil';
import ArrayUtil from '../../models/common/arrayutil';
import Streaming from './../../api/streaming';
import ApiStreaming from './../../api/apistreaming';
import * as api from './../../api/api';
import * as def from '@/common/definitions';

@Component({
  components: {
    MapLogList,
    MapLogLine,
    RealDateTime,
    Footer,
  },
})
export default class TopPage extends Vue {
  private mlogs = new Array<api.MapLog>();
  private m2logs = new Array<api.MapLog>();
  private updateLogs = new Array<api.CharacterUpdateLog>();
  private system: api.SystemData = new api.SystemData();
  private nextMonthSeconds = 0;
  private isLoadingSystem = true;

  private nextMonthSecondsTimer = 0;

  public login() {
    this.$emit('login-start');
  }

  public entry() {
    this.$emit('entry-start');
  }

  private created() {
    // 次の月までの秒数を進めるタイマーを開始
    if (this.nextMonthSecondsTimer > 0) {
      clearInterval(this.nextMonthSecondsTimer);
    }
    this.nextMonthSecondsTimer = setInterval(() => this.nextMonthSeconds--, 1000);

    // ストリーミングを開始
    ApiStreaming.top.clearEvents();
    ApiStreaming.top.on<api.SystemData>(api.SystemData.typeId, (log) => {
      this.system = log;

      const systemMonthDate = api.DateTime.toDate(log.currentMonthStartDateTime);
      systemMonthDate.setSeconds(systemMonthDate.getSeconds() + def.UPDATE_TIME);
      this.nextMonthSeconds = Math.floor((systemMonthDate.getTime() - new Date().getTime()) / 1000);

      this.isLoadingSystem = false;
    });
    ApiStreaming.top.on<api.MapLog>(api.MapLog.typeId, (log) => {
      ArrayUtil.addLog(this.mlogs, log, 5);
      if (log.isImportant) {
        ArrayUtil.addLog(this.m2logs, log, 5);
      }
    });
    ApiStreaming.top.on<api.CharacterUpdateLog>(api.CharacterUpdateLog.typeId, (log) => {
      ArrayUtil.addLog(this.updateLogs, log, 5);
    });
    ApiStreaming.top.on<api.ApiSignal>(api.ApiSignal.typeId, (signal) => {
      if (signal.type === 7) {
        // リセットされた
        location.reload();
      }
    });
    ApiStreaming.top.start();
  }

  private destroyed() {
    ApiStreaming.top.stop();
  }
}
</script>

<style lang="scss" scoped>
span.number { font-weight: bold; }

h1 { color: #420; }

.top-table { background-color: #efe0c0; border: #deccab solid 1px; color: #8e4c28; }
.top-table-flat { background-color: #efe0c0; margin-bottom: 4px; padding: 4px; color: #8e4c28; }
.top-title-logo { margin-top: 20px; padding: 8px; text-align: center; }
.top-login-form { margin-top: 20px; text-align: center; }
.top-content { margin-top: 40px; }

.not-loading-message-panel {
  padding: 0 16px 24px;
  margin: 16px 0;
  h2, h3 {
    margin: 20px 0 12px;
  }
  h3 {
    font-size: 1.6rem;
  }
}
</style>
