<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 101 ? 'primary' : status.id === 3 ? 'success' : status.id === 4 ? 'warning' : 'info')">{{ status.name }}</div>
    <div v-if="diplomacy !== undefined && status.id !== 0 && status.id !== 2 && status.id !== 5" class="content-section current-diplomacy">
      <h3>同盟条件</h3>
      破棄猶予：{{ diplomacy.breakingDelay }}ヶ月<br>
      布教：{{ diplomacy.canMissionary ? '許可' : '禁止' }}<br>
      都市購入：{{ diplomacy.canBuyTown ? '許可' : '禁止' }}<br>
      公表：{{ diplomacy.isPublic ? 'する' : 'しない' }}<br>
      <span style="white-space:pre-line">{{ diplomacy.memo }}</span>
    </div>
    <div v-if="changingValue !== undefined && (status.id === 6 || status.id === 106)" class="content-section current-diplomacy">
      <h3>同盟条件修正案</h3>
      破棄猶予：{{ changingValue.breakingDelay }}ヶ月<br>
      布教：{{ changingValue.canMissionary ? '許可' : '禁止' }}<br>
      都市購入：{{ changingValue.canBuyTown ? '許可' : '禁止' }}<br>
      公表：{{ changingValue.isPublic ? 'する' : 'しない' }}<br>
      <span style="white-space:pre-line">{{ changingValue.memo }}</span>
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="status.id ===   1" :class="{ 'btn': true, 'btn-secondary': newData.status === 0, 'btn-outline-secondary': newData.status !== 0 }" @click="newData.status = 0" href="#">撤回</button>
      <button v-show="status.id === 101" :class="{ 'btn': true, 'btn-secondary': newData.status === 2, 'btn-outline-secondary': newData.status !== 2 }" @click="newData.status = 2" href="#">拒否</button>
      <button v-show="status.id === 101" :class="{ 'btn': true, 'btn-secondary': newData.status === 3, 'btn-outline-secondary': newData.status !== 3 }" @click="newData.status = 3" href="#">承認</button>
      <button v-show="status.id ===   0 || status.id === 2 || status.id === 5" :class="{ 'btn': true, 'btn-secondary': newData.status === 1, 'btn-outline-secondary': newData.status !== 1 }" @click="newData.status = 1" href="#">同盟申入</button>
      <button v-show="status.id ===   3" :class="{ 'btn': true, 'btn-secondary': newData.status === 4, 'btn-outline-secondary': newData.status !== 4 }" @click="newData.status = 4" href="#">破棄</button>
      <button v-show="status.id ===   3" :class="{ 'btn': true, 'btn-secondary': newData.status === 6, 'btn-outline-secondary': newData.status !== 6 }" @click="newData.status = 6" href="#">修正申請</button>
      <button v-show="status.id === 106" :class="{ 'btn': true, 'btn-secondary': newData.status === 8, 'btn-outline-secondary': newData.status !== 8 }" @click="newData.status = 8" href="#">修正承認</button>
      <button v-show="status.id === 106" :class="{ 'btn': true, 'btn-secondary': newData.status === 3, 'btn-outline-secondary': newData.status !== 3 }" @click="newData.status = 3" href="#">修正拒否</button>
      <button v-show="status.id ===   6" :class="{ 'btn': true, 'btn-secondary': newData.status === 3, 'btn-outline-secondary': newData.status !== 3 }" @click="newData.status = 3" href="#">修正撤回</button>
      <div v-show="newData.status === 0" class="content-section">
        <h3>同盟申入撤回</h3>
      </div>
      <div v-show="newData.status === 2" class="content-section">
        <h3>同盟打診拒否</h3>
      </div>
      <div v-show="newData.status === 3 && status.id === 101" class="content-section">
        <h3>同盟打診承認（同盟開始）</h3>
      </div>
      <div v-show="newData.status === 3 && status.id === 106" class="content-section">
        <h3>同盟修正拒否</h3>
      </div>
      <div v-show="newData.status === 3 && status.id === 6" class="content-section">
        <h3>同盟修正撤回</h3>
      </div>
      <div v-show="newData.status === 8" class="content-section">
        <h3>同盟修正承認</h3>
      </div>
      <div v-show="newData.status === 4" class="content-section">
        <h3>同盟破棄</h3>
      </div>
      <div v-show="newData.status === 1 || newData.status === 6" class="content-section">
        <h3 v-show="newData.status === 1">同盟申入</h3>
        <h3 v-show="newData.status === 6">同盟内容修正申請</h3>
        <div class="form-group">
          <label for="allianceOption2">破棄猶予（ヶ月）</label>
          <input type="number" min="0" id="allianceOption2" class="form-control" v-model="newData.breakingDelay">
        </div>
        <div class="form-check">
          <button type="button" class="btn btn-toggle selected">相互不可侵</button>
          <button type="button" :class="'btn btn-toggle' + (newData.canMissionary ? ' selected' : '')" @click="newData.canMissionary ^= true">布教</button>
          <button type="button" :class="'btn btn-toggle' + (newData.canBuyTown ? ' selected' : '')" @click="newData.canBuyTown ^= true">都市購入</button>
          <button type="button" :class="'btn btn-toggle' + (newData.isPublic ? ' selected' : '')" @click="newData.isPublic ^= true">同盟公表</button>
        </div>
        <div class="form-group">
          <label for="allianceOption3">備考</label>
          <textarea id="allianceOption3" class="form-control" style="height:8em" v-model="newData.memo"></textarea>
        </div>
      </div>
    </div>
    <div class="loading" v-show="isSending"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

@Component({
  components: {
  },
})
export default class AllianceView extends Vue {
  @Prop() private diplomacy?: api.CountryAlliance;
  @Prop() private changingValue?: api.CountryAlliance;
  @Prop() private status!: def.CountryAllianceStatus;
  @Prop() private newData!: api.CountryAlliance;
  @Prop() private isSending!: boolean;
  @Prop() private canEdit!: boolean;
  @Prop() private isShow!: boolean;

  @Watch('isShow')
  private onIsShowChanged() {
    if (this.isShow) {
      this.newData.status = -1;
    }
  }

  @Watch('diplomacy')
  private onDiplomacyChanged() {
    if (this.isShow && this.diplomacy) {
      this.newData.isPublic = this.diplomacy.isPublic;
      this.newData.canMissionary = this.diplomacy.canMissionary;
      this.newData.canBuyTown = this.diplomacy.canBuyTown;
      this.newData.breakingDelay = this.diplomacy.breakingDelay;
      this.newData.memo = this.diplomacy.memo;
    }
  }

  private created() {
    this.onIsShowChanged();
    this.onDiplomacyChanged();
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
