<template>
  <div class="parameters">
    <div class="item" v-for="param in parameters" :key="param.name">
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
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Map from '@/components/parts/Map.vue';
import * as api from '@/api/api';
import { StatusParameter } from '@/models/status/statusparameter';

@Component({
  components: {
    Map,
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

    // パラメータの中身
    .item-container {
      position: relative;
      width: 100%;
      height: 100%;

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

      // パラメータ名
      .name {
        margin-top: 4px;
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
        &.value-norange, &.value-text {
          margin-top: 4px;
        }
        &.value-text .current {
          font-size: 0.9rem;
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
