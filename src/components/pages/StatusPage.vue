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
            <li class="nav-item"><a class="nav-link active" href="#">都市</a></li>
            <li class="nav-item"><a class="nav-link" href="#">武将</a></li>
            <li class="nav-item"><a class="nav-link" href="#">国</a></li>
            <li class="nav-item"><a class="nav-link" href="#">情勢</a></li>
          </ul>
        </div>
        <!-- 都市 -->
        <div :class="'information-content information-town country-color-' + model.townCountryColor">
          <h4 :class="'country-color-' + model.townCountryColor">{{ model.town.name }}</h4>
          <div class="parameters parameters-town">
            <div class="item" v-for="param in model.townParameters" :key="param.name">
              <div v-if="param.type === 1" class="item-container">
                <div class="bar-background"></div>
                <div :class="'bar' + (param.valueRatio === 100 ? ' bar-max' : param.valueRatio >= 90 ? ' bar-many' : '')" v-bind:style="{'width': param.valueRatio + '%'}"></div>
                <div class="name">{{ param.name }}</div>
                <div class="value value-ranged">
                  <span class="current">{{ param.value }}</span>
                  <span class="split">/</span>
                  <span class="max">{{ param.max }}</span>
                </div>
              </div>
              <div v-if="param.type === 2" class="item-container">
                <div class="name">{{ param.name }}</div>
                <div class="value value-norange">
                  <span class="current">{{ param.value }}</span>
                </div>
              </div>
              <div v-if="param.type === 3" class="item-container">
                <div class="name">{{ param.name }}</div>
                <div class="value value-text">
                  <span class="current">{{ param.value }}</span>
                </div>
              </div>
            </div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
            <div class="item item-empty"></div>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info">武将</button>
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
import * as api from '@/api/api';
import StatusModel, { StatusParameterType } from '@/models/statusmodel';

@Component({
  components: {
    Map,
  },
})
export default class StatusPage extends Vue {
  public model: StatusModel = new StatusModel();
  public isOpenRightSidePopupMenu: boolean = false;

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
  &.information-town {
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
  }
  .parameters {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: flex-start;
    padding: 4px;
    height: calc(100% - 2rem - 48px);
    overflow: auto;
    .item {
      width: 100px;
      height: 54px;
      border-radius: 12px;
      margin: 4px;
      background: white;
      text-align: center;
      overflow: hidden;
      .item-container {
        position: relative;
        width: 100%;
        height: 100%;
      }
      &.item-empty {
        height: 0;
        background: none;
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
      }
    }
    &.parameters-town {
      .item-container {
        .bar-background {
          position: absolute;
          height: 12px;
          width: 100%;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fde;
        }
        .bar {
          position: absolute;
          height: 12px;
          bottom: 0;
          left: 0;
          background: #56e;
          &.bar-max {
            background: #596;
          }
          &.bar-many {
            background: #6bd;
          }
        }
        .name {
          margin-top: 4px;
          font-weight: bold;
          font-size: 0.8rem;
          line-height: 0.9rem;
          height: 0.9rem;
          color: #888;
        }
        .value {
          .current {
            font-size: 1.2rem;
            font-weight: bold;
          }
          .split {
            font-size: 0.7rem;
            margin: 0 2px 0 4px;
          }
          .max {
            font-size: 0.9rem;
          }
          &.value-norange, &.value-text {
            margin-top: 4px;
          }
          &.value-text .current {
            font-size: 0.9rem;
          }
        }
      }
    }
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
