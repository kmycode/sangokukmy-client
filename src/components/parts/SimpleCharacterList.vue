<template>
  <div class="simple-character-list">
    <div
      :class="'item country-color-' + getCountryColorId(chara.countryId)"
      v-for="chara in characters"
      :key="chara.id">
      <div class="icon">
        <CharacterIcon :icon="chara.mainIcon"/>
      </div>
      <div class="information">
        <div class="standard">
          <span class="name">{{ chara.name }}</span>
        </div>
        <div class="parameters">
          <span class="parameter-item">
            <span class="parameter-name">武力</span>
            <span class="parameter-value">{{ chara.strong }}</span>
          </span>
          <span class="parameter-item">
            <span class="parameter-name">知力</span>
            <span class="parameter-value">{{ chara.intellect }}</span>
          </span>
          <span class="parameter-item">
            <span class="parameter-name">統率</span>
            <span class="parameter-value">{{ chara.leadership }}</span>
          </span>
          <span class="parameter-item">
            <span class="parameter-name">人望</span>
            <span class="parameter-value">{{ chara.popularity }}</span>
          </span>
          <span v-if="hasSoldierData(chara)" class="parameter-item">
            <span class="parameter-name">{{ getSoldierTypeName(chara.soldierType) }}</span>
            <span class="parameter-value">{{ chara.soldierNumber }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SimpleCharacterList extends Vue {
  @Prop() public characters!: api.Character[];
  @Prop() public countries!: api.Country[];

  private getCountryColorId(countryId: number): number {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }

  private hasSoldierData(chara: api.Character): boolean {
    return chara.soldierType !== undefined && chara.soldierType !== null;
  }

  private getSoldierTypeName(type: number): string {
    const soldierType = Enumerable.from(def.SOLDIER_TYPES).firstOrDefault((st) => st.id === type);
    if (soldierType) {
      return soldierType.name;
    } else {
      return '雑兵';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.simple-character-list {
  .item {
    display: flex;
    padding: 4px;
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    @include country-color-light('background-color');
    @include country-color-deep('border-bottom-color');

    .information {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      margin-left: 12px;

      .standard {
        .name {
          font-size: 1.6rem;
        }
      }

      .parameters {
        .parameter-item {
          padding-right: 12px;
          .parameter-name {
            font-size: 0.8rem;
            color: #666;
            padding-right: 4px;
          }
          .parameter-value {
            display: inline-block;
            font-size: 1rem;
            font-weight: bold;
            width: 2rem;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
