<template>
  <span ref="text" v-html="formatedText">
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
  private static readonly reg = new RegExp('((https?|http)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))', 'g');
  private static readonly reg2 = new RegExp('((?!.+http)#([0-9]+)(?!.+<\/a>))', 'g');
  @Prop() private text!: string;
  @Prop({
    default: true,
  }) private isNewLine!: boolean;
  @Prop({
    default: false,
  }) private isIssueLink!: boolean;

  private get formatedText(): string {
    let text = this.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\\[/g, '&#91;')
      .replace(/\[r\]/g, '<span style="color:red">')
      .replace(/\[g\]/g, '<span style="color:green">')
      .replace(/\[b\]/g, '<span style="color:blue">')
      .replace(/\[p\]/g, '<span style="color:purple">')
      .replace(/\[s\]/g, '<span style="font-weight:bold">')
      .replace(/\[d\]/g, '<del>')
      .replace(/\[u\]/g, '<span style="text-decoration:underline">')
      .replace(/\[m\]/g, '<span style="background:yellow">')
      .replace(/\[-r\]/g, '</span>')
      .replace(/\[-g\]/g, '</span>')
      .replace(/\[-b\]/g, '</span>')
      .replace(/\[-s\]/g, '</span>')
      .replace(/\[-p\]/g, '</span>')
      .replace(/\[-d\]/g, '</del>')
      .replace(/\[-u\]/g, '</span>')
      .replace(/\[-m\]/g, '</span>')
      .replace(KmyChatTagText.reg, '<a href="$1" target="_blank">$1</a>');
    if (this.isIssueLink) {
      text = text.replace(KmyChatTagText.reg2, '<a href="#" class="issue-link">$1</a>');
    }
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

  private mounted() {
    const text = this.$refs.text as HTMLElement;
    const issues = text.getElementsByClassName('issue-link');
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i] as HTMLLinkElement;
      issue.addEventListener('click', (ev) => {
        ev.preventDefault();
        const num = parseInt((ev.target as HTMLLinkElement).innerText.substr(1), 10);
        this.$emit('issue-link', num);
      });
    }
  }
}
</script>

<style lang="scss">
</style>
