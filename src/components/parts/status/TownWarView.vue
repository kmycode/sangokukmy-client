<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 1 ? 'warning' : status.id === 2 ? 'danger' : 'info')">{{ status.name }}</div>
    <div v-if="lastWar !== undefined && status.id !== 0" class="content-section current-diplomacy">
      <h3>攻略</h3>
      <span class="town-name">{{ lastWar.town.name }}</span>
      {{ lastWar.gameDate | gamedate }} 交戦
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="canWar && town.id !== country.capitalTownId" :class="{ 'btn': true, 'btn-secondary': isOpen, 'btn-outline-secondary': !isOpen }" @click="isOpen = true" href="#">攻略布告</button>
      <div class="alert alert-danger" v-show="town.id === country.capitalTownId">攻略は、首都に対しては実行できません</div>
      <div class="alert alert-danger" v-show="!canWar">次回攻略には、前回攻略から10年経過する必要があります</div>
      <div v-show="isOpen" class="content-section">
        <h3>攻略布告</h3>
        <span class="town-name">{{ town.name }}</span>
        {{ nextMonth | gamedate }} 開戦
      </div>
    </div>
    <div class="alert alert-warning">次回攻略には、前回攻略から10年経過する必要があります<br>攻略は、同盟中または破棄猶予中の国に対しては布告できません<br>交戦または開戦6ヶ月前以内の国に対しては布告できません<br>攻略において、指定都市以外に攻め込むことはできません<br>布告された側が都市を奪還するには、新たな攻略を布告する必要があります<br>1都市しかない国には布告できません<br>首都に対しては実行できません</div>
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
  @Prop() private current!: api.GameDateTime;
  @Prop() private lastWar?: api.TownWar;
  @Prop() private status!: def.TownWarStatus;
  @Prop() private town!: api.Town;
  @Prop() private country!: api.Country;
  @Prop() private isSending!: boolean;
  @Prop() private canEdit!: boolean;
  @Prop() private isShow!: boolean;
  private isOpen: boolean = false;

  private get canWar(): boolean {
    if (this.status.id === 0) {
      return true;
    } else if (this.status.id === 3) {
      if (this.lastWar) {
        return api.GameDateTime.toNumber(this.current) - api.GameDateTime.toNumber(this.lastWar.gameDate) >= 120;
      }
      return true;
    }
    return false;
  }

  private get nextMonth(): api.GameDateTime {
    return api.GameDateTime.nextMonth(this.current);
  }

  @Watch('isShow')
  private onIsShowChanged() {
    if (this.isShow) {
      this.isOpen = false;
      this.$emit('can-apply', this.isOpen);
    }
  }

  @Watch('isOpen')
  private onIsOpenChanged() {
    this.$emit('can-apply', this.isOpen);
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
@import '@/scss/diplomacy-view-common.scss';

.diplomacy-view {
  overflow: auto;
}

.town-name {
  color: green;
  margin: 8px 0;
  font-size: 1.8em;
}
</style>
