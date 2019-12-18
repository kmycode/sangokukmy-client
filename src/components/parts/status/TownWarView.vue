<template>
  <div class="diplomacy-view loading-container">
    <div :class="'current-status alert alert-' + (status.id === 1 ? 'warning' : status.id === 2 ? 'danger' : 'info')">{{ status.name }}</div>
    <div v-if="lastWar !== undefined && status.id !== 0" class="content-section current-diplomacy">
      <h3>攻略</h3>
      <span class="town-name">{{ lastWar.town.name }}</span>
      {{ lastWar.gameDate | gamedate }} 交戦
    </div>
    <div v-if="canEdit" class="editor">
      <button v-show="canWar" :class="{ 'btn': true, 'btn-secondary': isOpen, 'btn-outline-secondary': !isOpen }" @click="isOpen = true" href="#">攻略布告</button>
      <div class="alert alert-danger" v-show="!canWarWithNotCapital">対象都市は首都です</div>
      <div class="alert alert-danger" v-show="!canWarWithOtherCountry">対象都市は自国のものです</div>
      <div class="alert alert-danger" v-show="!canWarWithHasCountry">対象都市は無所属です</div>
      <div class="alert alert-danger" v-show="!canWarWithNear">対象都市は自国都市と隣接していません</div>
      <div class="alert alert-danger" v-show="!canWarWithNotSingleTown">対象国は都市を１つしか持っていません</div>
      <div class="alert alert-danger" v-show="!canWarWithNotTooEarly">次回攻略には、前回攻略から10年経過する必要があります</div>
      <div class="alert alert-danger" v-show="!canWarWithStartBefore6Months">対象国とは戦争状態か、または開戦前6ヶ月以内です</div>
      <div class="alert alert-danger" v-show="!canWarWithEachOtherWars">対象国は別の国と戦争準備中または交戦中です</div>
      <div v-show="isOpen" class="content-section">
        <h3>攻略布告</h3>
        <span class="town-name">{{ town.name }}</span>
        {{ nextMonth | gamedate }} 開戦
      </div>
    </div>
    <div class="alert alert-warning">次回攻略には、前回攻略から10年経過する必要があります<br>攻略は、同盟中または破棄猶予中の国に対しては布告できません<br>自国と交戦または開戦6ヶ月前以内の国に対しては布告できません<br>自国の関与しない他国同士の戦争に巻き込まれた都市に対しては布告できません<br>攻略において、指定都市以外に攻め込むことはできません<br>布告された側が都市を奪還するには、新たな攻略を布告する必要があります<br>1都市しかない国には布告できません<br>首都に対しては実行できません</div>
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
  @Prop() private myCountryId!: number;
  @Prop() private isSending!: boolean;
  @Prop() private canEdit!: boolean;
  @Prop() private isShow!: boolean;
  @Prop() private wars!: api.CountryWar[];
  @Prop() private towns!: api.Town[];
  private isOpen: boolean = false;

  private get canWar(): boolean {
    let result = false;
    if (this.status.id === 0 || this.status.id === 3) {
      result = true;
    }

    if (result) {
      result = this.canWarWithHasCountry &&
        this.canWarWithNotCapital && this.canWarWithNear && this.canWarWithNotSingleTown &&
        this.canWarWithNotTooEarly && this.canWarWithStartBefore6Months && this.canWarWithEachOtherWars;
    }

    return result;
  }

  private get canWarWithOtherCountry(): boolean {
    return this.town.countryId !== this.myCountryId;
  }

  private get canWarWithHasCountry(): boolean {
    return this.town.countryId > 0;
  }

  private get canWarWithNotCapital(): boolean {
    return this.town.id !== this.country.capitalTownId;
  }

  private get canWarWithNear(): boolean {
    return api.TownBase.getAroundTowns(this.towns, this.town).some((t) => t.countryId === this.myCountryId);
  }

  private get canWarWithNotSingleTown(): boolean {
    return this.towns.filter((t) => t.countryId).length > 1;
  }

  private get canWarWithNotTooEarly(): boolean {
    if (this.status.id === 3) {
      if (this.lastWar) {
        return api.GameDateTime.toNumber(this.current) - api.GameDateTime.toNumber(this.lastWar.gameDate) >= 120;
      }
    }
    return true;
  }

  private get canWarWithStartBefore6Months(): boolean {
    const war = this.wars.find((w) => api.CountryDipromacy.isEqualCountry(w, this.country.id, this.myCountryId));
    if (war) {
      if (api.GameDateTime.toNumber(this.current) > api.GameDateTime.toNumber(war.startGameDate) - 6) {
        return false;
      }
    }
    return true;
  }

  private get canWarWithEachOtherWars(): boolean {
    const war = this.wars.find((w) => api.CountryDipromacy.isEqualCountry(w, this.country.id, this.myCountryId));
    if (!war) {
      const otherWar = this.wars.find((w) => w.insistedCountryId === this.country.id ||
                                             w.requestedCountryId === this.country.id);
      if (otherWar && (otherWar.status === api.CountryWar.statusInReady ||
                       otherWar.status === api.CountryWar.statusAvailable ||
                       otherWar.status === api.CountryWar.statusStopRequesting)) {
        return false;
      }
    }
    return true;
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

  private created() {
    this.onIsShowChanged();
    this.onIsOpenChanged();
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
