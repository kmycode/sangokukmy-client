<template>
  <div class="mini-character-list">
    <div
      :class="'item country-color-' + getCountryColorId(chara.countryId)"
      v-for="chara in characters"
      :key="chara.id">
      <div class="icon"><CharacterIcon :icon="chara.mainIcon"/></div>
      <div class="name">{{ chara.name }}</div>
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
export default class MiniCharacterList extends Vue {
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
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.mini-character-list {
  .item {
    display: inline-flex;
    padding: 4px 8px;
    height: 40px;
    line-height: 32px;
    border-radius: 8px;
    margin: 0 4px 2px 0;
    @include country-color-light('background-color');
    @include country-color-deep('color');

    .icon img {
      width: 32px;
      height: 32px;
    }
  }
}
</style>
