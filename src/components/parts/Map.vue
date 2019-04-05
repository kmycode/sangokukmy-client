<template>
  <div class="parts-map">
    <div
        v-for="t in towns"
        :key="t.id"
        :class="'map-cell country-color-' + getTownColor(t) + (currentTown.id === t.id ? ' current-town' : '')"
        :style="{ top: t.y + '0%', left: t.x + '0%', }"
        @click="$emit('selected', t.id)">
      <div :class="'town-type town-type-' + t.type"></div>
      <span class="town-name">{{ t.name }}</span>
    </div>
    <div v-if="town.id > 0" class="selected" :style="{ top: town.y + '0%', left: town.x + '0%', }"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import Enumerable from 'linq';
import * as api from '@/api/api';

@Component({
  components: {
  },
})
export default class Map extends Vue {
  @Prop() public towns!: api.Town[];
  @Prop() public countries!: api.Country[];
  @Prop({
    default: () => new api.Town(-1),
  }) public town!: api.Town;
  @Prop({
    default: () => new api.Town(-1),
  }) public currentTown!: api.Town;

  private isSelected(current: api.Town): boolean {
    return this.town.id === current.id;
  }

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
  user-select: none;

  .selected {
    outline: 3px solid #f4d;
    z-index: 1;
    width: 10%;
    height: 10%;
    padding: 2px;
    margin: 1px;
    position: absolute;

    transition: top .1s, left .1s;
  }

  .map-cell {
    width: 10%;
    height: 10%;
    font-size: 14px;
    padding: 2px;
    margin: 1px;
    font-weight: bold;

    position: absolute;

    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;

    @include country-color-deep('background-color');
    @include country-color-light('color');

    &.current-town {
      @for $i from 0 through length($country-colors-light) - 1 {
        &.country-color-#{$i} {
          animation: current-town-#{$i} 3s linear infinite;
        }
      }
    }

    .town-type {
      width: 16px;
      height: 16px;
      margin: 0 auto;
      &.town-type-1 {
        background-image: url('../../assets/images/sangoku-originals/m_4.gif');
      }
      &.town-type-2 {
        background-image: url('../../assets/images/sangoku-originals/m_3.gif');
      }
      &.town-type-3 {
        background-image: url('../../assets/images/sangoku-originals/m_2.gif');
      }
      &.town-type-4 {
        background-image: url('../../assets/images/sangoku-originals/m_1.gif');
      }
    }
    .town-name {
      white-space: nowrap;
    }
  }
}

@for $i from 0 through length($country-colors-light) - 1 {
  @keyframes current-town-#{$i} {
    0% {
      background-color: nth($country-colors-deep, $i + 1);
      color: nth($country-colors-light, $i + 1);
    }
    30% {
      background-color: darken(nth($country-colors-light, $i + 1), 15%);
      color: nth($country-colors-deep, $i + 1);
    }
    60% {
      background-color: nth($country-colors-deep, $i + 1);
      color: nth($country-colors-light, $i + 1);
    }
  }
}
</style>
