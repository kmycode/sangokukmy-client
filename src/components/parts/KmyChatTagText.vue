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
  private static readonly reg = new RegExp('((https?|http)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))');
  @Prop() private text!: string;

  private get formatedText(): string {
    return this.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(KmyChatTagText.reg, '<a href="$1" target="_blank">$1</a>');
  }
}
</script>

<style lang="scss">
</style>
