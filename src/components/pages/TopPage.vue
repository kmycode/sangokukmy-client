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
          <div class="onlines">
            <MiniCharacterList
              class="online-list"
              :countries="countries"
              :characters="onlines.allCharacters"/>
          </div>
          <div v-show="isLoadingSystem" class="loading"><div class="loading-icon"></div></div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-10 offset-sm-1 col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          <div v-show="isLoadingSystem && nextMonthSeconds <= -15" class="not-loading-message-panel">
            <h2>読込に通常より時間がかかっています...</h2>
            <h3>ページのリロードで解決しますか？</h3>
            <div>
              このページを何度かリロードすることで解決することがあります。パソコンの場合は<code>Shift+F5</code>または<code>Shift+Cmd+R</code>、スマホの場合はデスクトップモード（iOSのSafariの場合は更新ボタン長押し）もお試しください
            </div>
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
        <div v-if="isLoadingCurrentCharacter || currentCharacter.id" class="top-auto-login-form col-sm-6 offset-sm-3 loading-container">
          <div v-if="currentCharacter.id" style="text-align:center">
            <div class="login-form">
              <CharacterIcon :icon="currentCharacter.mainIcon"/>
              <div><span class="name">{{ currentCharacter.name }}</span> でログイン中</div>
              <button type="button" class="btn btn-primary" @click="goStatus">GO</button>
            </div>
            <button type="button" class="btn btn-light btn-sm" @click="entry">新規登録画面を確認</button>
          </div>
          <div class="loading" v-if="isLoadingCurrentCharacter"><div class="loading-icon"></div></div>
        </div>
        <div v-else class="top-login-form col-sm-6 offset-sm-3">
          <button type="button" class="btn btn-light" @click="login">ログイン</button>
          <button type="button" class="btn btn-primary" @click="entry">新規登録</button>
        </div>
      </div>
      <div class="alert alert-danger">サーバに何らかの問題が発生し、統一記録を含むすべてのデータが消失しました。定期バックアップなど再発時対策を実施することで対処いたしました。ご迷惑おかけして大変申し訳ございませんが、プレイには再度ご登録頂く必要があります。(July 22, 2019)</div>
      <div v-show="selectedTab === 1">
        <EntryPage :system="system"
                   :countries="countries"
                   :countryMessages="countryMessages"
                   :towns="towns"
                   @entry-succeed="$emit('entry-succeed')"/>
      </div>
      <div v-show="selectedTab !== 1" class="row">
        <div class="top-content col-sm-12">
          <ul class="nav nav-tabs nav-fill">
            <li class="nav-item"><a :class="{'nav-link': true, 'active': selectedTab === 0}" href="#" @click.prevent.stop="selectedTab = 0">トップページ</a></li>
            <li class="nav-item"><a class="nav-link" href="https://sangoku-doc.kmycode.net/" target="_blank">説明書</a></li>
            <li class="nav-item"><a :class="{'nav-link': true, 'active': selectedTab === 2}" href="#" @click.prevent.stop="selectedTab = 2">勢力図</a></li>
            <li class="nav-item"><a class="nav-link" href="#" @click.prevent.stop="$router.push('characters')">武将一覧</a></li>
            <!-- <li class="nav-item"><a class="nav-link" href="#">名将一覧</a></li> -->
            <li class="nav-item"><a class="nav-link" href="#" @click.prevent.stop="$router.push('histories')">統一記録</a></li>
          </ul>
        </div>
      </div>
      <div v-show="selectedTab === 0" class="row">
        <div class="col-sm-12 loading-container">
          <!--マップログ（細字）-->
          <div class="top-table-flat">
            <MapLogList :logs="topMlogs" :type="'normal'"/>
          </div>
          <!--マップログ（太字）-->
          <div class="top-table-flat">
            <MapLogList :logs="topM2logs" :type="'important'"/>
          </div>
          <!-- 武将更新ログ -->
          <div class="top-table-flat">
            <MapLogList :logs="updateLogs" :type="'character-update-log'"/>
          </div>
          <div v-show="isLoadingSystem" class="loading"><div class="loading-icon"></div></div>
        </div>
      </div>
      <div v-show="selectedTab === 2" class="row">
        <div class="col-sm-12 loading-container">
          <Map style="height:100vh;max-height:600px" :towns="towns" :countries="countries"/>
          <button type="button" :class="{'btn': true, 'btn-toggle': true, 'selected': isImportantMapLogs}" @click="isImportantMapLogs = !isImportantMapLogs">重要ログのみ</button>
          <div class="top-table-flat">
            <MapLogList v-show="!isImportantMapLogs" :logs="mlogs" :type="'normal'"/>
            <MapLogList v-show="isImportantMapLogs" :logs="m2logs" :type="'normal'"/>
            <div v-show="isLoadingMoreMapLogs" class="loading-container" style="height:40px"><div class="loading"><div class="loading-icon"></div></div></div>
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
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import NotificationService from '@/services/notificationservice';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import Map from '@/components/parts/Map.vue';
import EntryPage from '@/components/pages/EntryPage.vue';
import AsyncUtil from '../../models/common/AsyncUtil';
import ArrayUtil from '../../models/common/arrayutil';
import Streaming from './../../api/streaming';
import ApiStreaming from './../../api/apistreaming';
import * as api from './../../api/api';
import * as def from '@/common/definitions';
import * as current from '@/common/current';
import OnlineModel from '@/models/status/onlinemodel';
import Enumerable from 'linq';

@Component({
  components: {
    MapLogList,
    MapLogLine,
    RealDateTime,
    MiniCharacterList,
    Map,
    CharacterIcon,
    EntryPage,
    Footer,
  },
})
export default class TopPage extends Vue {
  private mlogs: api.MapLog[] = [];
  private m2logs: api.MapLog[] = [];
  private updateLogs: api.CharacterUpdateLog[] = [];

  private system: api.SystemData = new api.SystemData();
  private countries: api.Country[] = [];
  private countryMessages: api.CountryMessage[] = [];
  private towns: api.Town[] = [];
  private nextMonthSeconds = 0;
  private isLoadingSystem = true;
  private onlines = new OnlineModel();

  private isLoadingCurrentCharacter = true;
  private currentCharacter = new api.Character();

  private nextMonthSecondsTimer = 0;
  private selectedTab = 0;
  private lastMapLogId = Number.MAX_VALUE;
  private isNoMoreMapLogs = false;
  private isLoadingMoreMapLogs = false;
  private isImportantMapLogs = false;

  public get topMlogs(): api.MapLog[] {
    return Enumerable.from(this.mlogs).take(5).toArray();
  }

  public get topM2logs(): api.MapLog[] {
    return Enumerable.from(this.m2logs).take(5).toArray();
  }

  public login() {
    this.$router.push('login');
  }

  public goStatus() {
    this.$router.push('status');
  }

  public entry() {
    if (this.selectedTab !== 1) {
      this.selectedTab = 1;
    } else if (this.selectedTab === 1) {
      this.selectedTab = 0;
    }
  }

  private created() {
    // 次の月までの秒数を進めるタイマーを開始
    if (this.nextMonthSecondsTimer > 0) {
      clearInterval(this.nextMonthSecondsTimer);
    }
    this.nextMonthSecondsTimer = setInterval(() => this.nextMonthSeconds--, 1000);

    // ログイン中の武将をロード
    const tokenLimit = new Date();
    tokenLimit.setHours(tokenLimit.getHours() + 24);
    if (current.tokenExpirationTime > tokenLimit) {
      api.Api.getMyCharacter()
        .then((c) => {
          this.currentCharacter = c;
        })
        .finally(() => {
          this.isLoadingCurrentCharacter = false;
        });
    } else {
      this.isLoadingCurrentCharacter = false;
    }

    // ストリーミングを開始
    ApiStreaming.top.clearEvents();
    ApiStreaming.top.on<api.SystemData>(api.SystemData.typeId, (log) => {
      this.system = log;

      const systemMonthDate = api.DateTime.toDate(log.currentMonthStartDateTime);
      systemMonthDate.setSeconds(systemMonthDate.getSeconds() + def.UPDATE_TIME);
      this.nextMonthSeconds = Math.floor((systemMonthDate.getTime() - new Date().getTime()) / 1000);

      this.isLoadingSystem = false;
    });
    ApiStreaming.top.on<api.Country>(api.Country.typeId, (log) => {
      ArrayUtil.addItem(this.countries, log);
    });
    ApiStreaming.top.on<api.CountryMessage>(api.CountryMessage.typeId, (log) => {
      if (log.type === api.CountryMessage.typeSolicitation) {
        ArrayUtil.addItemUniquely(this.countryMessages, log, (cm) => cm.countryId);
      }
    });
    ApiStreaming.top.on<api.Town>(api.Town.typeId, (log) => {
      ArrayUtil.addItem(this.towns, log);
    });
    ApiStreaming.top.on<api.MapLog>(api.MapLog.typeId, (log) => {
      this.onMapLogReceived(log);
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
    ApiStreaming.top.on<api.CharacterOnline>(
      api.CharacterOnline.typeId,
      (obj) => this.onlines.onOnlineDataReceived(obj));
    ApiStreaming.top.start();

    window.onscroll = (ev) => this.onPageScrolled(ev);
  }

  private destroyed() {
    ApiStreaming.top.stop();
  }

  private onMapLogReceived(log: api.MapLog, isLast: boolean = false) {
    if (!isLast) {
      ArrayUtil.addLog(this.mlogs, log);
      if (log.isImportant) {
        ArrayUtil.addLog(this.m2logs, log);
      }
    } else {
      ArrayUtil.addItem(this.mlogs, log);
      if (log.isImportant) {
        ArrayUtil.addItem(this.m2logs, log);
      }
    }
    if (log.id < this.lastMapLogId && (!log.isImportant || log.eventType === 14)) {
      this.lastMapLogId = log.id;
    }
  }

  private onPageScrolled(event: any) {
    if (this.isScrolled(event)) {
      if (this.selectedTab === 2) {
        // 地図
        if (!this.isNoMoreMapLogs) {
          this.isLoadingMoreMapLogs = true;
          api.Api.getMapLog(this.lastMapLogId, 300)
            .then((logs) => {
              if (logs.length > 0) {
                Enumerable.from(logs).reverse().forEach((l) => {
                  this.onMapLogReceived(l, true);
                  this.lastMapLogId = l.id;
                });
                this.mlogs = Enumerable
                  .from(this.mlogs)
                  .orderByDescending((m) => api.DateTime.toDate(m.date))
                  .toArray();
              } else {
                this.isNoMoreMapLogs = true;
              }
            })
            .catch(() => {
              NotificationService.loadMapLogFailed.notify();
            })
            .finally(() => {
              this.isLoadingMoreMapLogs = false;
            });
        }
      }
    }
  }

  private isScrolled(event: any): boolean {
    // スクロールの現在位置 + 親（.item-container）の高さ >= スクロール内のコンテンツの高さ
    return (window.pageYOffset + 250 + window.innerHeight) >= document.body.scrollHeight;
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

.onlines {
  background: white;
  margin-top: 12px;

  .online-list {
    margin: 4px 8px;
  }
}

.top-auto-login-form {
  min-height: 48px;
  .login-form {
    display: flex;
    align-items: center;
    justify-content: center;
    button {
      margin-left: 12px;
    }
  }
}
</style>
