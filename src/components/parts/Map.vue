<template>
  <div class="parts-map">
    <div
        v-for="town in towns"
        :key="town.id"
        :class="'map-cell country-color-' + getTownColor(town)"
        :style="{ top: town.y + '0%', left: town.x + '0%', }">
      <div :class="'town-type town-type-' + town.type"></div>
      <span class="town-name">{{ town.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Enumerable from 'linq';
import * as api from '@/api/api';

@Component({
  components: {
  },
})
export default class Map extends Vue {
  @Prop() public towns!: api.Town[];
  @Prop() public countries!: api.Country[];

  private getTownColor(town: api.Town): number {
    const country = Enumerable
      .from(this.countries)
      .firstOrDefault((c) => c.id === town.countryId);
    if (country !== undefined) {
      return country.colorId;
    } else {
      return 0;
    }
  }
}
</script>

<style lang="scss">
@import '../../scss/country-color.scss';

.parts-map {
  width: 100%;
  height: 100%;
  position: relative;
  background: #080 url('../../assets/images/sangoku-originals/mapbg.gif');
  .map-cell {
    width: 10%;
    height: 10%;
    font-size: 14px;
    padding: 2px;
    margin: 1px;
    font-weight: bold;

    position: absolute;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    @include country-color-deep('background-color');
    @include country-color-light('color');

    .town-type {
      width: 16px;
      height: 16px;
      margin-right: 4px;
      &.town-type-1 {
        background-image: url('../../assets/images/sangoku-originals/m_1.gif');
      }
      &.town-type-2 {
        background-image: url('../../assets/images/sangoku-originals/m_2.gif');
      }
      &.town-type-3 {
        background-image: url('../../assets/images/sangoku-originals/m_3.gif');
      }
      &.town-type-4 {
        background-image: url('../../assets/images/sangoku-originals/m_4.gif');
      }
    }
    .town-name {
      white-space: nowrap;
    }
  }
}
</style>
