<template>
  <span v-html="formatedText">
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as api from './../../api/api';

@Component({
  components: {
  },
})
export default class KmyChatTagText extends Vue {
  @Prop() private text!: string;

  private get formatedText(): string {
    return this.text
      .replace('\n', '<br>');
  }
}
</script>

<style lang="scss">
</style>
