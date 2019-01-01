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
export default class CharacterIcon extends Vue {
  @Prop({
    default: () => [],
  }) public icons!: api.CharacterIcon[];
  @Prop({
    default: () => api.CharacterIcon.default,
  }) public icon!: api.CharacterIcon;

  private get mainUri(): string {
    if (api.CharacterIcon.isDefault(this.icon)) {
      return api.CharacterIcon.getMainUri(this.icons);
    } else {
      return api.CharacterIcon.getUri(this.icon);
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  border-radius: 32px;
  width: 64px;
  height: 64px;
  transition: border-radius .16s ease-in;
  &:hover {
    border-radius: 8px;
  }
}
</style>
