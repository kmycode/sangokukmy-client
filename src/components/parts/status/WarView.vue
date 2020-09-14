<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 4 ? 'warning' : status.id === 1 ? 'danger' : 'info')">{{ status.name }}</div>
    <div v-if="diplomacy !== undefined && status.id !== 0" class="content-section current-diplomacy">
      <h3>戦争</h3>
      {{ diplomacy.startGameDate | gamedate }} 開戦 ({{ diplomacy.startGameDate | torealdate(system) | shortrealdate }})<br>
      種類: <span v-if="diplomacy.mode === 1">宗教</span><span v-else>通常</span>
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="status.id ===   0 || status.id === 3" :class="{'btn': true, 'btn-secondary': newData.status === 4, 'btn-outline-secondary': newData.status !== 4, }" @click="newData.status = 4" href="#">宣戦布告</button>
      <button v-show="status.id ===   4 || status.id === 1" :class="{'btn': true, 'btn-secondary': newData.status === 2, 'btn-outline-secondary': newData.status !== 2, }" @click="newData.status = 2" href="#">停戦申入</button>
      <button v-show="status.id === 102" :class="{'btn': true, 'btn-secondary': newData.status === 3, 'btn-outline-secondary': newData.status !== 3, }" @click="newData.status = 3" href="#">停戦承認</button>
      <button v-show="status.id === 102" :class="{'btn': true, 'btn-secondary': newData.status === 4, 'btn-outline-secondary': newData.status !== 4, }" @click="newData.status = 4" href="#">停戦拒否</button>
      <button v-show="status.id ===   2" :class="{'btn': true, 'btn-secondary': newData.status === 4, 'btn-outline-secondary': newData.status !== 4, }" @click="newData.status = 4" href="#">停戦撤回</button>
      <div v-show="newData.status === 4 && (status.id === 0 || status.id === 3)" class="content-section">
        <h3>宣戦布告</h3>
        <div class="alert alert-warning">12年後〜24年後までの年月を指定できます</div>
        <GameDateTimePicker v-model="newData.startGameDate" :system="system"/>
        <div v-if="ruleSet === 5">
          <h4>戦争の種類</h4>
          <button :class="{ 'bth': true, 'btn-secondary': !newData.mode, 'btn-outline-secondary': newData.mode, }" @click="newData.mode = 0">通常</button>
          <button :class="{ 'bth': true, 'btn-secondary': newData.mode === 1, 'btn-outline-secondary': newData.mode !== 1, }" @click="newData.mode = 1">宗教</button>
        </div>
      </div>
      <div v-show="newData.status === 3" class="content-section">
        <h3>停戦承認</h3>
      </div>
      <div v-show="newData.status === 4 && status.id === 102" class="content-section">
        <h3>停戦拒否</h3>
      </div>
      <div v-show="newData.status === 4 && status.id === 2" class="content-section">
        <h3>停戦撤回</h3>
      </div>
    </div>
    <div class="loading" v-show="isSending"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import GameDateTimePicker from '@/components/parts/GameDateTimePicker.vue';

@Component({
  components: {
    GameDateTimePicker,
  },
})
export default class WarView extends Vue {
  @Prop() private diplomacy?: api.CountryWar;
  @Prop() private status!: def.CountryWarStatus;
  @Prop() private newData!: api.CountryWar;
  @Prop() private isSending!: boolean;
  @Prop() private canEdit!: boolean;
  @Prop() private isShow!: boolean;
  @Prop() private ruleSet!: number;
  @Prop() private system?: api.SystemData;

  @Watch('isShow')
  private onIsShowChanged() {
    if (this.isShow) {
      this.newData.status = -1;
    }
  }

  private created() {
    this.onIsShowChanged();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
@import '@/scss/diplomacy-view-common.scss';

.diplomacy-view {
  overflow: auto;
}
</style>
