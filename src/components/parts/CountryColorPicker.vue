<template>
  <div class="country-color-picker">
    <button v-for="v in values"
            :key="v.num"
            :class="'btn btn-country country-color-' + v.num + (v.isSelected ? ' selected' : '')"
            @click="$emit('input', v.num)">国色 {{ v.num }}</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

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
}
</style>
