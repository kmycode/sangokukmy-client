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
export default class KmyLogTagText extends Vue {
  @Prop() private text!: string;

  private get formatedText(): string {
    return this.text
      .replace(/<num>/g, '<span class="kmy-format-number">')
      .replace(/<\/num>/g, '</span>')
      .replace(/<character>/g, '<span class="kmy-format-character">')
      .replace(/<\/character>/g, '</span>')
      .replace(/<town>/g, '<span class="kmy-format-town">')
      .replace(/<\/town>/g, '</span>')
      .replace(/<country>/g, '<span class="kmy-format-country">')
      .replace(/<\/country>/g, '</span>')
      .replace(/<emerge>/g, '<span class="kmy-format-emerge">')
      .replace(/<\/emerge>/g, '</span>');
  }
}
</script>

<style lang="scss">
.kmy-format-number {
  color: #f00;
}
.kmy-format-character {
  color: #a00;
}
.kmy-format-town {
  color: #080;
}
.kmy-format-country {
  color: #00a;
}
.kmy-format-emerge {
  color: #f09;
  font-weight: bold;
}
</style>
