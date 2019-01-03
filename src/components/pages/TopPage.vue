<template>
  <div id="top-page">
    <div class="container">
      <div class="row">
        <div class="top-table top-title-logo loading-container col-sm-10 offset-sm-1 col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          <h1>三国志NET KMY Version 9</h1>
          <h2>第{{ system.period }}<span v-if="system.betaVersion > 0">.{{ system.betaVersion }}</span>期</h2>
          [<span class="number">{{ system.gameDateTime.year }}</span>年<span class="number">{{ system.gameDateTime.month | zeroformat(2) }}</span>月]<br>
          来月まであと <span class="number">{{ nextMonthSeconds }}</span>秒
          <div v-show="isLoadingSystem" class="loading"><div class="loading-icon"></div></div>
        </div>
      </div>
      <div class="row">
        <div class="top-login-form col-sm-6 offset-sm-3">
          <button type="button" class="btn btn-light" @click="login">ログイン</button>
          <button type="button" class="btn btn-primary">新規登録</button>
        </div>
      </div>
      <div class="row">
        <div class="top-content col-sm-12">
          <ul class="nav nav-tabs nav-fill">
            <li class="nav-item"><a class="nav-link active" href="#">トップページ</a></li>
            <li class="nav-item"><a class="nav-link" href="#">説明書</a></li>
            <li class="nav-item"><a class="nav-link" href="#">勢力図</a></li>
            <li class="nav-item"><a class="nav-link" href="#">武将一覧</a></li>
            <li class="nav-item"><a class="nav-link" href="#">名将一覧</a></li>
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
import Footer from '..//common/Footer.vue';
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

  private created() {
    AsyncUtil.tryTimes(3, async () => {
      this.updateLogs = await api.Api.getCharacterLogs(5);
    }, () => undefined);

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
</style>
