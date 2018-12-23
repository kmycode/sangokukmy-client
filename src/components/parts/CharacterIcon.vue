<template>
  <img :src="mainUri">
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import * as api from '@/api/api';

@Component({
  components: {
  },
})
export default class StatusParametersPanel extends Vue {
  @Prop() public icons!: api.CharacterIcon[];

  private get mainUri(): string {
    return api.CharacterIcon.getMainUri(this.icons);
  }
}
</script>

<style lang="scss" scoped>

</style>
