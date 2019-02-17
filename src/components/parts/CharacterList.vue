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
          <div class="name">{{ chara.name }}</div>
          <div v-if="chara.deleteTurn > 0" class="delete-turn">放置削除まで {{ getDeleteTurn(chara) }} ターン</div>
          <div class="class-name">階級: {{ getClassName(chara) }}</div>
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
export default class CharacterList extends Vue {
  @Prop() public characters!: api.Character[];
  @Prop() public countries!: api.Country[];

  private isOpenPostsPopup: boolean = false;

  private getCountryColorId(countryId: number): number {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }

  private getDeleteTurn(character: api.Character): number {
    return def.CHARACTER_DELETE_TURN - character.deleteTurn;
  }

  private getClassName(character: api.Character): string {
    return api.Character.getClassName(character);
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
        display: flex;

        .name {
          font-size: 1.6rem;
          flex: 1;
        }

        .delete-turn {
          font-weight: bold;
          color: red;
          margin-right: 16px;
        }

        .class-name {
          margin: 4px 8px 0 0;
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
