<template>
  <div class="parameters">
    <div v-for="param in parameters" :key="param.id" :class="'item' + (param.type === 4 ? ' item-character-icon' : (param.type === 5 || param.type === 7) ? ' item-twin' : '')">
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
      <div v-if="param.type === 4" class="item-container">
        <div class="value value-icon">
          <CharacterIcon :icons="param.icons"/>
        </div>
      </div>
      <div v-if="param.type === 5 || param.type === 7" class="item-container">
        <div class="twin-part">
          <div class="name">{{ param.name }}</div>
          <div :class="'value ' + (param.type === 5 ? 'value-norange' : 'value-text')">
            <span class="current">{{ param.value }}</span>
          </div>
        </div>
        <div class="twin-part">
          <div class="bar-background"></div>
          <div :class="'bar' + (param.extraValueRatio === 100 ? ' bar-max' : param.extraValueRatio >= 90 ? ' bar-many' : '')" v-bind:style="{'width': param.ranged.valueRatio + '%'}"></div>
          <div class="name">{{ param.extraName }}</div>
          <div class="value value-ranged">
            <span class="current">{{ param.extraValue }}</span>
            <span class="split">/</span>
            <span class="max">{{ param.extraMax }}</span>
          </div>
        </div>
      </div>
      <div v-if="param.type === 6" class="item-container loading-container">
        <div class="name">{{ param.name }}</div>
        <div class="value value-norange">
          <span class="current">{{ param.value }}</span>
        </div>
        <div class="loading" v-show="param.isLoading"><div class="loading-icon"></div></div>
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
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Map from '@/components/parts/Map.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from '@/api/api';
import { StatusParameter } from '@/models/status/statusparameter';

@Component({
  components: {
    Map,
    CharacterIcon,
  },
})
export default class StatusParametersPanel extends Vue {
  @Prop() public parameters!: StatusParameter[];
}
</script>

<style lang="scss" scoped>
// 情報欄
.parameters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  align-items: flex-end;
  padding: 4px;
  height: 100%;

  .item {
    width: 100px;
    height: 54px;
    border-radius: 12px;
    margin: 4px;
    background: white;
    text-align: center;
    overflow: hidden;

    &.item-character-icon {
      height: 64px;
      background: none;
    }

    // パラメータの中身
    .item-container {
      position: relative;
      width: 100%;
      height: 54px;

      .bar-background {
        position: absolute;
        height: 8px;
        width: 100%;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fde;
      }

      .bar {
        position: absolute;
        height: 8px;
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

      // パラメータ名
      .name {
        padding-top: 4px;
        padding-bottom: 16px;
        font-weight: bold;
        font-size: 0.8rem;
        line-height: 0.9rem;
        height: 0.9rem;
        color: #888;
      }

      // パラメータの値
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
        &.value-norange {
          margin-top: 4px;
        }
        &.value-text {
          line-height: 1.1rem;
          height: 2.2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          .current {
            font-size: 0.9rem;
          }
        }
      }
    }

    &.item-twin {
      width: 208px;
      position: static;

      .item-container {
        display: flex;
        .twin-part {
          position: relative;
          width: 104px;
        }
      }
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
}
</style>
