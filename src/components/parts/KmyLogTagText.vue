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
      .replace('<num>', '<span class="kmy-format-number">')
      .replace('</num>', '</span>')
      .replace('<character>', '<span class="kmy-format-character">')
      .replace('</character>', '</span>'
      .replace('<town>', '<span class="kmy-format-town">')
      .replace('</town>', '</span>')
      .replace('<country>', '<span class="kmy-format-country">')
      .replace('</country>', '</span>'));
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
</style>
