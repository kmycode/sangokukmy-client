<template>
  <div class="parts-map">
    <div
        v-for="t in towns"
        :key="t.id"
        :class="'map-cell country-color-' + getTownColor(t) + (currentTown.id === t.id ? ' current-town' : '')"
        :style="{ top: t.y + '0%', left: t.x + '0%', }"
        @click="$emit('selected', t.id)">
      <div v-if="mode < 1 || ((mode === 2 || mode > 3) && t.countryId !== store.character.countryId)" :class="'town-type town-type-' + t.type"></div>
      <span v-if="mode < 1 || ((mode === 2 || mode > 3) && t.countryId !== store.character.countryId)" class="town-name">{{ t.name }}</span>
      <div v-if="mode === 1 || (mode === 2 && t.countryId === store.character.countryId)" class="town-info-character-icons">
        <CharacterIcon
          class="icon-mini"
          v-for="chara in getModeCharacters(t)"
          :key="chara.id"
          :icon="chara.mainIcon"/>
      </div>
      <div v-if="mode === 3 || (mode === 4 && t.countryId === store.character.countryId)" class="town-info-number">
        <span class="number">{{ getModeCharactersCount(t) }}</span>
      </div>
      <div v-if="mode >= 5 && mode <= 10 && t.countryId === store.character.countryId" :class="{'town-info-graph': true, 'town-info-graph-triple': mode === 8}">
        <div class="graph-group">
          <div v-for="i in (mode === 8 ? 3 : 2)" :key="i" class="max" :style="{'height': getModeGraphMax(t, i - 1) + '%'}">
            <div :class="{'current': true, 'almost-all': isModeGraphAlmostAll(t, i - 1), 'max-val': isModeGraphMax(t, i - 1)}" :style="{'height': getModeGraphCurrent(t, i - 1) + '%'}"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="town.id > 0" class="selected" :style="{ top: town.y + '0%', left: town.x + '0%', }"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import Enumerable from 'linq';
import * as api from '@/api/api';
import StatusStore from '@/models/status/statusstore';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';

@Component({
  components: {
    CharacterIcon,
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
  @Prop({
    default: undefined,
  }) public store!: StatusStore;
  @Prop({
    default: 0,
  }) public mode!: number;

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

  private getModeCharacters(town: api.Town): api.Character[] {
    if (this.mode === 1) {
      return this.getCharacters(town);
    } else {
      return this.getDefenders(town);
    }
  }

  private getModeCharactersCount(town: api.Town): number {
    if (this.mode === 3) {
      return this.getCharacters(town).length;
    } else {
      return this.getDefenders(town).length;
    }
  }

  private getCharacters(town: api.Town): api.Character[] {
    return Enumerable
      .from(this.store.characters)
      .where((c) => c.townId === town.id && c.countryId === this.store.character.countryId)
      .toArray();
  }

  private getDefenders(town: api.Town): api.Character[] {
    if (town.countryId === this.store.character.countryId) {
      return Enumerable
        .from(this.store.defenders)
        .where((d) => d.townId === town.id)
        .join(this.store.characters, (d) => d.characterId, (c) => c.id, (d, c) => c)
        .toArray();
    } else {
      return [];
    }
  }

  private getModeGraphMax(town: api.Town, index: number): number {
    const townMax = this.getModeMaxValuePrivate(town, index);
    const maxMax = Enumerable
      .from(this.towns)
      .select((t) => this.getModeMaxValuePrivate(t, index))
      .where((t) => t !== undefined)
      .max((t) => t);

    return townMax / maxMax * 100;
  }

  private getModeGraphCurrent(town: api.Town, index: number): number {
    const max = this.getModeMaxValuePrivate(town, index);
    const current = this.getModeValuePrivate(town, index);
    return current / max * 100;
  }

  private isModeGraphAlmostAll(town: api.Town, index: number): boolean {
    return this.getModeGraphCurrent(town, index) >= 90;
  }

  private isModeGraphMax(town: api.Town, index: number): boolean {
    return this.getModeGraphCurrent(town, index) >= 100;
  }

  private getModeMaxValuePrivate(town: api.Town, index: number): number {
    return this.mode === 5 ? (index === 0 ? town.agricultureMax : town.commercialMax)
         : this.mode === 6 ? (index === 0 ? town.technologyMax : town.wallMax)
         : this.mode === 7 ? (index === 0 ? town.peopleMax : town.technologyMax)
         : this.mode === 8 ? (index === 0 ? town.peopleMax : index === 1 ? 100 : town.technologyMax)
         : 1;
  }

  private getModeValuePrivate(town: api.Town, index: number): number {
    return this.mode === 5 ? (index === 0 ? town.agriculture : town.commercial)
         : this.mode === 6 ? (index === 0 ? town.technology : town.wall)
         : this.mode === 7 ? (index === 0 ? town.people : town.technology)
         : this.mode === 8 ? (index === 0 ? town.peopleMax : index === 1 ? town.security : town.technologyMax)
         : 1;
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
    overflow: hidden;
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

    .town-info-character-icons {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      img.icon-mini {
        width: 16px;
        height: 16px;
      }
    }

    .town-info-number {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .town-info-graph {
      width: 100%;
      height: 100%;
      padding: 0;

      .graph-group {
        width: 100%;
        height: 100%;
        background: white;
        position: relative;

        .max {
          position: absolute;
          bottom: 0;
          width: 50%;
          background: #fde;

          &:nth-child(1) {
            left: 0;
          }
          &:nth-child(2) {
            right: 0;
          }
          
          .current {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            background: #56e;

            &.almost-all {
              background: #6bd;
            }
            &.max-val {
              background: #596;
            }
          }
        }
      }

      &.town-info-graph-triple .max {
        width: 33.3%;
        &:nth-child(2) {
          left: 33.3%;
        }
        &:nth-child(3) {
          right: 0;
        }
      }
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
