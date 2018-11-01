<template>
  <div id="top-page">
    <div class="container">
      <div class="row">
        <div class="top-table top-title-logo col-sm-10 offset-sm-1 col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          <h1>三国志NET KMY Version 9</h1>
          <h2>第1期 ※1期限り</h2>
          [<span class="number">000</span>年<span class="number">00</span>月]<br>
          来月まであと <span class="number">00</span>分<span class="number">00</span>秒
        </div>
      </div>
      <div class="row">
        <div class="top-login-form col-sm-6 offset-sm-3">
          ID: <input type="text">
          PASS: <input type="password"><br>
          <button type="button" class="btn btn-default">ログイン</button>
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
        <div class="col-sm-12">
          <!--マップログ（細字）-->
          <div class="top-table-flat">
            <ul class="map-log-list">
              <li v-for="mlog in mlogs" :key="mlog.id">
                <MapLogLine v-bind:log="mlog"/>
              </li>
            </ul>
          </div>
          <!--マップログ（太字）-->
          <div class="top-table-flat">
            <ul class="map-log-list-important">
              <li v-for="mlog in m2logs" :key="mlog.id">
                <MapLogLine v-bind:log="mlog"/>
              </li>
            </ul>
          </div>
          <!-- 武将更新ログ -->
          <div class="top-table-flat">
            <ul class="character-update-log-list">
              <li v-for="clog in updateLogs" :key="clog.id">
                {{ clog.characterName }} (<RealDateTime v-bind:date="clog.date"/>)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MapLogLine from '../parts/MapLogLine.vue';
import RealDateTime from '../parts/RealDateTime.vue';
import AsyncUtil from '../../models/common/AsyncUtil';
import * as api from './../../api/api';

@Component({
  components: {
    MapLogLine,
    RealDateTime,
  },
})
export default class TopPage extends Vue {
  private mlogs = new Array<api.MapLog>();
  private m2logs = new Array<api.MapLog>();
  private updateLogs = new Array<api.CharacterUpdateLog>();

  private created() {
    AsyncUtil.tryTimes(3, async () => {
      this.mlogs = await api.Api.getMapLogs(5);
      this.m2logs = await api.Api.getImportantMapLogs(5);
      this.updateLogs = await api.Api.getCharacterLogs(5);
    }, () => undefined);
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
