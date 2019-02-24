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
  @Prop({
    default: true,
  }) private isNewLine!: boolean;

  private get formatedText(): string {
    let text = this.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\\[/g, '&#91;')
      .replace(/\[r\]/g, '<span style="color:red">')
      .replace(/\[g\]/g, '<span style="color:green">')
      .replace(/\[b\]/g, '<span style="color:blue">')
      .replace(/\[s\]/g, '<span style="font-weight:bold">')
      .replace(/\[-r\]/g, '</span>')
      .replace(/\[-g\]/g, '</span>')
      .replace(/\[-b\]/g, '</span>')
      .replace(/\[-s\]/g, '</span>')
      .replace(KmyChatTagText.reg, '<a href="$1" target="_blank">$1</a>');
    if (this.isNewLine) {
      text = text.replace(/\n/g, '<br>');
    }
    const spanStart = text.match(/<span/gm);
    const spanEnd = text.match(/<\/span/gm);
    if (spanStart && spanEnd) {
      if (spanStart.length > spanEnd.length) {
        text = text + '</span>'.repeat(spanStart.length - spanEnd.length);
      } else if (spanStart.length < spanEnd.length) {
        text = '<span>'.repeat(spanEnd.length - spanStart.length) + text;
      }
    }
    return text;
  }
}
</script>

<style lang="scss">
</style>
