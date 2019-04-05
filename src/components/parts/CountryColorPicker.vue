<template>
  <div class="country-color-picker">
    <button v-for="v in values"
            :key="v.num"
            :class="'btn btn-country country-color-' + v.num + (v.isSelected ? ' selected' : '') + (isAlready(v.num) ? ' already' : '')"
            @click="$emit('input', v.num)">国色 {{ v.num }}</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import Enumerable from 'linq';

class ColorValue {
  public constructor(public num: number,
                     public isSelected: boolean) {}
}

@Component({
  components: {
  },
})
export default class CharacterIconPicker extends Vue {
  @Prop() public value!: number;
  @Prop({
    default: () => [],
  }) public countries!: api.Country[];

  public get values(): ColorValue[] {
    const vs: ColorValue[] = [];
    for (let i = 1; i < def.COUNTRY_COLOR_NUM; i++) {
      vs.push(new ColorValue(i, this.value === i));
    }
    return vs;
  }

  private get defaultIconMax(): number {
    return def.DEFAULT_ICON_NUM;
  }

  private isAlready(color: number): boolean {
    return Enumerable
      .from(this.countries)
      .any((c) => color === c.colorId);
  }
}
</script>

<style lang="scss">
@import '@/scss/country-color.scss';

.btn-country {
  @include country-color-light('background-color');
  @include country-color-deep('color');

  &.selected {
    @include country-color-deep('background-color');
    @include country-color-light('color')
  }

  &.already {
    @include country-color-deep('border-color');
    background: none;
    opacity: 0.24;
    pointer-events: none;
  }
}
</style>
