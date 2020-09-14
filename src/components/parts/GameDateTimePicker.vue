<template>
  <div class="parts-game-date-time-picker">
    <input type="number" min="0" :value="value.year" @input="$emit('input', generateNewValue($event.target.value, value.month))">年
    <input type="number" min="1" max="12" :value="value.month" @input="$emit('input', generateNewValue(value.year, $event.target.value))">月<br>
    {{ currentValue | torealdate(system) | shortrealdate }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import Enumerable from 'linq';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

@Component({
  components: {
  },
})
export default class GameDateTimePicker extends Vue {
  @Prop() public value!: api.GameDateTime;
  @Prop() public system?: api.SystemData;
  private currentValue: api.GameDateTime = new api.GameDateTime(0, 0);

  private mounted() {
    this.onValueChanged();
  }

  @Watch('value')
  private onValueChanged() {
    this.currentValue = new api.GameDateTime(parseInt(this.value.year.toString()),
      parseInt(this.value.month.toString()));
  }

  private generateNewValue(year: number, month: number): api.GameDateTime {
    return new api.GameDateTime(year, month);
  }
}
</script>

<style lang="scss">
</style>
