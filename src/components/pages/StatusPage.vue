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
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 0 }" @click.prevent.stop="selectedInformationTab = 0" href="#">都市</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 1 }" @click.prevent.stop="selectedInformationTab = 1" href="#">武将</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 2 }" @click.prevent.stop="selectedInformationTab = 2" href="#">国</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 3 }" @click.prevent.stop="selectedInformationTab = 3" href="#">報告</a></li>
          </ul>
        </div>
        <!-- 都市情報 -->
        <div v-show="selectedInformationTab === 0" :class="'information-content information-town country-color-' + model.townCountryColor">
          <h4 :class="'country-color-' + model.townCountryColor">{{ model.town.name }}</h4>
          <div class="content-main">
            <StatusParametersPanel :parameters="model.townParameters"/>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info">武将</button>
          </div>
        </div>
        <!-- 武将情報 -->
        <div v-show="selectedInformationTab === 1" :class="'information-content information-character country-color-' + model.characterCountryColor">
          <h4 :class="'country-color-' + model.characterCountryColor">{{ model.character.name }}</h4>
          <div class="content-main">
            <StatusParametersPanel :parameters="model.characterParameters"/>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info">部隊</button>
          </div>
        </div>
        <!-- 国情報 -->
        <div v-show="selectedInformationTab === 2" :class="'information-content information-country country-color-' + model.country.colorId">
          <h4 :class="'country-color-' + model.country.colorId">{{ model.country.name }}</h4>
          <div class="content-main">
            <StatusParametersPanel :parameters="model.countryParameters"/>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info">部隊</button>
          </div>
        </div>
        <!-- 報告 -->
        <div v-show="selectedInformationTab === 3" :class="'information-content information-logs country-color-' + model.country.colorId">
          <h4 v-show="selectedReportType === 0">報告（マップ）</h4>
          <h4 v-show="selectedReportType === 1">報告（武将）</h4>
          <div class="content-main">
            <MapLogList v-show="selectedReportType === 0" :logs="model.mapLogs" type="normal"/>
            <MapLogList v-show="selectedReportType === 1" :logs="model.characterLogs" type="character-log"/>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info" @click="selectedReportType = 0">マップ</button>
            <button type="button" class="btn btn-info" @click="selectedReportType = 1">武将</button>
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
            <li class="nav-item dropdown"><a :class="'nav-link dropdown-toggle' + (isOpenRightSidePopupMenu ? ' active' : '')" href="#" @click.prevent.stop="isOpenRightSidePopupMenu ^= true">会議室</a>
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
          <!-- コマンド選択のタブ -->
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 0 }" @click.prevent.stop="selectedCommandCategory = 0" href="#">内政</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 1 }" @click.prevent.stop="selectedCommandCategory = 1" href="#">増強</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 2 }" @click.prevent.stop="selectedCommandCategory = 2" href="#">軍事</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 3 }" @click.prevent.stop="selectedCommandCategory = 3" href="#">計略</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 4 }" @click.prevent.stop="selectedCommandCategory = 4" href="#">個人</a></li>
          </ul>
          <!-- 内政コマンド -->
          <div v-show="selectedCommandCategory === 0" class="commands">
            <button type="button" class="btn btn-light" @click="model.inputCommand(1)">農業開発</button>
            <button type="button" class="btn btn-light" @click="model.inputCommand(2)">商業発展</button>
            <button type="button" class="btn btn-light" @click="model.inputCommand(3)">技術開発</button>
            <button type="button" class="btn btn-light" @click="model.inputCommand(4)">城壁強化</button>
            <button type="button" class="btn btn-light" @click="model.inputCommand(5)">守兵増強</button>
            <button type="button" class="btn btn-light">米施し</button>
          </div>
          <!-- 増強コマンド -->
          <div v-show="selectedCommandCategory === 1" class="commands">
            <button type="button" class="btn btn-light">農地開拓</button>
            <button type="button" class="btn btn-light">市場拡大</button>
            <button type="button" class="btn btn-light">城壁増築</button>
          </div>
          <!-- 軍事コマンド -->
          <div v-show="selectedCommandCategory === 2" class="commands">
            <button type="button" class="btn btn-light">徴兵</button>
            <button type="button" class="btn btn-light">兵士訓練</button>
            <button type="button" class="btn btn-light">城の守備</button>
            <button type="button" class="btn btn-light">戦争</button>
            <button type="button" class="btn btn-light">集合</button>
          </div>
          <!-- 計略コマンド -->
          <div v-show="selectedCommandCategory === 3" class="commands">
            <button type="button" class="btn btn-light">登用</button>
            <button type="button" class="btn btn-light">密偵</button>
          </div>
          <!-- 個人コマンド -->
          <div v-show="selectedCommandCategory === 4" class="commands">
            <button type="button" class="btn btn-light">移動</button>
            <button type="button" class="btn btn-light">能力強化</button>
            <button type="button" class="btn btn-light">米売買</button>
            <button type="button" class="btn btn-light">武器</button>
            <button type="button" class="btn btn-light">書物</button>
            <button type="button" class="btn btn-light">何もしない</button>
            <button type="button" class="btn btn-primary">仕官</button>
            <button type="button" class="btn btn-light">下野</button>
          </div>
          <!-- 選択ツール -->
          <div class="command-input-options">
            <button type="button" class="btn btn-light" @click="model.clearAllCommandSelections()">クリア</button>
            <button type="button" class="btn btn-light">全て</button>
            <button type="button" class="btn btn-light">偶数</button>
            <button type="button" class="btn btn-light">奇数</button>
            <button type="button" class="btn btn-light">月</button>
            <button type="button" class="btn btn-light">ax+b</button>
          </div>
          <!-- 選択アルゴリズム -->
          <div class="command-select-options">
            <button type="button" :class="{ 'btn': true, 'btn-multiple-selection': true, 'selected': isMultiCommandsSelection }" @click="isMultiCommandsSelection = !isMultiCommandsSelection">複数選択</button>
            <button type="button" :class="{ 'btn': true, 'btn-outline-info': model.commandSelectMode !== 0, 'btn-info': model.commandSelectMode === 0 }" @click="model.commandSelectMode = 0">置換</button>
            <button type="button" :class="{ 'btn': true, 'btn-outline-info': model.commandSelectMode !== 1, 'btn-info': model.commandSelectMode === 1 }" @click="model.commandSelectMode = 1">OR</button>
            <button type="button" :class="{ 'btn': true, 'btn-outline-info': model.commandSelectMode !== 2, 'btn-info': model.commandSelectMode === 2 }" @click="model.commandSelectMode = 2">AND</button>
            <button type="button" :class="{ 'btn': true, 'btn-outline-info': model.commandSelectMode !== 3, 'btn-info': model.commandSelectMode === 3 }" @click="model.commandSelectMode = 3">XOR</button>
          </div>
          <div class="command-list">
            <div v-for="command in model.commands"
                 :key="command.commandNumber"
                 :class="{ 'command-list-item': true, 'selected': command.isSelected }"
                 @click="onCommandSelected(command, $event)">
              <div class="number">{{ command.commandNumber }}</div>
              <div class="command-information">
                <div class="command-helper"><span class="gamedate">{{ command.gameDate | gamedate }}</span><span class="realdate" v-if="command.commandNumber > 1">{{ command.date | realdate }}</span><span class="rest" v-if="command.commandNumber === 1">実行まであと<span class="rest-time">0</span>秒</span></div>
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
import MapLogList from '@/components/parts/MapLogList.vue';
import * as api from '@/api/api';
import StatusModel from '@/models/status/statusmodel';
import { StatusParameter } from '@/models/status/statusparameter';

@Component({
  components: {
    Map,
    StatusParametersPanel,
    MapLogList,
  },
})
export default class StatusPage extends Vue {
  public model: StatusModel = new StatusModel();
  public isOpenRightSidePopupMenu: boolean = false;
  public selectedInformationTab: number = 0;
  public selectedReportType: number = 0;
  public selectedCommandCategory: number = 0;

  public isMultiCommandsSelection: boolean = false;

  public created() {
    this.model.onCreate();
  }

  public destroyed() {
    this.model.onDestroy();
  }

  private toggleMultiSelection() {
    this.isMultiCommandsSelection = !this.isMultiCommandsSelection;
  }

  private onCommandSelected(command: api.CharacterCommand, event?: MouseEvent) {
    if (this.isMultiCommandsSelection) {
      this.model.selectMultipleCommand(command);
    } else {
      if (event && event.shiftKey) {
        this.model.selectMultipleCommand(command);
      } else {
        this.model.selectSingleCommand(command);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
@import '@/scss/global-colors.scss';

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
  min-height: 140px;
  border-width: 0;
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
  .content-main {
    height: calc(100% - 2rem - 48px);
    overflow: auto;
  }
  .commands {
    height: 48px;
    padding: 4px;
    background: $color-navigation-commands;
    button {
      margin-right: 4px;
    }
  }
  &.information-logs {
    background-color: $global-table-background;
    border-color: $global-table-border;
    h4 {
      background-color: $global-table-border;
      color: $global-table-background;
    }
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
    .btn-multiple-selection {
      background: none;
      border: 1px solid #444;
      font-size: 1rem;
      &.selected {
        background: #444;
        color: white;
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
      user-select: none;
      transition: background-color .1s ease-in;
      &:last-child {
        border-bottom: none;
      }
      &:hover {
        background: #e4e4f6;
      }
      &.selected {
        background: #c6caf0;
        &:hover {
          background: #b1b1df;
        }
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
          .rest {
            margin-left: 24px;
            .rest-time {
              margin: 0 4px;
              font-weight: bold;
              color: red;
            }
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
