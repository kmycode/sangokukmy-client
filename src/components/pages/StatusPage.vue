<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左カラム -->
      <div class="col-lg-7 col-md-6">
        <div id="current-display">
          <span class="number">{{ model.gameDate.year }}</span><span class="unit">年</span>
          <span class="number">{{ model.gameDate.month }}</span><span class="unit">月</span>
        </div>
        <div id="map-mode-tab">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a class="nav-link active" href="#">都市</a></li>
            <li class="nav-item"><a class="nav-link" href="#">外交</a></li>
            <li class="nav-item"><a class="nav-link" href="#">内政</a></li>
            <li class="nav-item"><a class="nav-link" href="#">軍事</a></li>
          </ul>
        </div>
        <div id="map-container">
          <Map :towns="model.towns" :countries="model.countries" :town="model.town"/>
        </div>
        <div id="information-mode-tab">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 0 }" @click="selectedInformationTab = 0" href="#">都市</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 1 }" @click="selectedInformationTab = 1" href="#">武将</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 2 }" @click="selectedInformationTab = 2" href="#">国</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 3 }" @click="selectedInformationTab = 3" href="#">情勢</a></li>
          </ul>
        </div>
        <!-- 都市情報 -->
        <div v-show="selectedInformationTab === 0" :class="'information-content information-town country-color-' + model.townCountryColor">
          <h4 :class="'country-color-' + model.townCountryColor">{{ model.town.name }}</h4>
          <StatusParametersPanel :parameters="model.townParameters"/>
          <div class="commands">
            <button type="button" class="btn btn-info">武将</button>
          </div>
        </div>
        <!-- 武将情報 -->
        <div v-show="selectedInformationTab === 1" :class="'information-content information-character country-color-' + model.characterCountryColor">
          <h4 :class="'country-color-' + model.characterCountryColor">{{ model.character.name }}</h4>
          <StatusParametersPanel :parameters="model.characterParameters"/>
          <div class="commands">
            <button type="button" class="btn btn-info">部隊</button>
          </div>
        </div>
      </div>
      <!-- 右カラム -->
      <div class="col-lg-5 col-md-6">
        <div id="right-side-mode-tab">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a class="nav-link active" href="#">コマンド</a></li>
            <li class="nav-item"><a class="nav-link" href="#">手紙</a></li>
            <li class="nav-item"><a class="nav-link" href="#">全国宛</a></li>
            <li class="nav-item dropdown"><a :class="'nav-link dropdown-toggle' + (isOpenRightSidePopupMenu ? ' active' : '')" href="#" @click="isOpenRightSidePopupMenu ^= true">会議室</a>
              <div class="dropdown-menu" :style="'right:0;left:auto;display:' + (isOpenRightSidePopupMenu ? 'block' : 'none')">
                <a class="dropdown-item" href="#">会議室</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">情報</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#">専用BBS</a>
              </div>
            </li>
          </ul>
        </div>
        <!-- コマンド入力 -->
        <div class="right-side-content content-command">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a class="nav-link active" href="#">内政</a></li>
            <li class="nav-item"><a class="nav-link" href="#">軍事</a></li>
            <li class="nav-item"><a class="nav-link" href="#">計略</a></li>
            <li class="nav-item"><a class="nav-link" href="#">個人</a></li>
          </ul>
          <div class="commands">
            <button type="button" class="btn btn-light">農業開発</button>
            <button type="button" class="btn btn-light">商業発展</button>
            <button type="button" class="btn btn-light">技術開発</button>
            <button type="button" class="btn btn-light">城壁強化</button>
            <button type="button" class="btn btn-light">守兵増強</button>
            <button type="button" class="btn btn-light">米施し</button>
          </div>
          <div class="command-input-options">
            <button type="button" class="btn btn-light">偶数</button>
            <button type="button" class="btn btn-light">奇数</button>
            <button type="button" class="btn btn-light">月</button>
            <button type="button" class="btn btn-light">ax+b</button>
          </div>
          <div class="command-select-options">
            <button type="button" class="btn btn-outline-info">置換</button>
            <button type="button" class="btn btn-info">OR</button>
            <button type="button" class="btn btn-outline-info">AND</button>
            <button type="button" class="btn btn-outline-info">NAND</button>
            <button type="button" class="btn btn-outline-info">XOR</button>
          </div>
          <div class="command-list">
            <div class="command-list-item" v-for="command in model.commands" :key="command.commandNumber">
              <div class="number">{{ command.commandNumber }}</div>
              <div class="command-information">
                <div class="command-helper"><span class="gamedate">{{ command.gameDate.toString() }}</span><span class="realdate">{{ command.gameDate.toRealDate().toString() }}</span></div>
                <div class="command-text">{{ command.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Map from '@/components/parts/Map.vue';
import StatusParametersPanel from '@/components/parts/StatusParameters.vue';
import * as api from '@/api/api';
import StatusModel from '@/models/status/statusmodel';
import { StatusParameter } from '@/models/status/statusparameter';

@Component({
  components: {
    Map,
    StatusParametersPanel,
  },
})
export default class StatusPage extends Vue {
  public model: StatusModel = new StatusModel();
  public isOpenRightSidePopupMenu: boolean = false;
  public selectedInformationTab: number = 0;

  public created() {
    this.model.onCreate();
  }

  public destroyed() {
    this.model.onDestroy();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

$current-display-height: 36px;
$nav-tab-height: 40px;
$left-side-fixed-height: $current-display-height + $nav-tab-height;
$right-side-fixed-height: $nav-tab-height;

$color-navigation-commands: #e0e0e0;

// Bootstrapによるタブ
ul.nav {
  font-size: 1rem;
  li {
    height: 40px;
  }
}

// 現在年月
#current-display {
  text-align: center;
  height: $current-display-height;
  line-height: $current-display-height;
  .number {
    font-weight: bold;
    color: #080;
    padding: 0 8px;
  }
}

// マップのモードを指定するタブ
#map-mode-tab {
}

// マップのコンテナ
#map-container {
  height: calc(65vh - #{$left-side-fixed-height});
  min-height: 320px;
}

// 情報欄のタブ
#information-mode-tab {
}

// 情報欄
.information-content {
  height: calc(35vh - #{$nav-tab-height});
  min-height: 200px;
  border-width: 1px;
  border-style: solid;
  @include country-color-deep('border-color');
  @include country-color-light('background-color');
  h4 {
    margin: 0;
    font-size: 1.4rem;
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    font-weight: bold;
    @include country-color-deep('background-color');
    @include country-color-light('color');
  }
  .commands {
    height: 48px;
    padding: 4px;
    background: $color-navigation-commands;
  }
}

// 右側の内容
.right-side-content {
  height: calc(100vh - #{$right-side-fixed-height});
  padding-top: 8px;

  &.content-command {
    display: flex;
    flex-direction: column;
    .nav {
      .active {
        background-color: #6bf;
      }
    }
    .commands {
      display: flex;
      flex-flow: row wrap;
      button {
        margin: 4px 4px 0 0;
        &.btn-light {
          background-color: #e7e7e7;
          &:hover {
            background-color: #bbb;
          }
        }
      }
    }
    .command-input-options {
      margin-top: 4px;
      padding: 0 0 4px 4px;
      background-color: $color-navigation-commands;
      display: flex;
      flex-flow: row wrap;
      button {
        margin: 4px 4px 0 0;
      }
    }
    .command-select-options {
      margin-top: 4px;
      padding: 0 0 4px 4px;
      display: flex;
      flex-flow: row wrap;
      button {
        margin: 4px 4px 0 0;
      }
    }
    .command-list {
      flex: 1;
      margin-top: 4px;
      overflow: auto;
    }
    .command-list-item {
      background: #f4f4ff;
      padding: 2px 4px;
      display: flex;
      border-bottom: 1px dashed #ccf;
      cursor: pointer;
      transition: background-color .1s ease-in;
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background: #e4e4f6;
      }
      .number {
        font-size: 1rem;
        width: 3rem;
        height: 2.5rem;
        line-height: 2.5rem;
        text-align: center;
      }
      .command-information {
        flex: 1;
        .command-helper {
          font-size: 0.9rem;
          height: 1.1rem;
          line-height: 1.1rem;
          .realdate {
            font-size: 0.8rem;
            margin-left: 24px;
            color: #777;
          }
        }
        .command-text {
          font-size: 1.1rem;
          height: 1.4rem;
          line-height: 1.4rem;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
