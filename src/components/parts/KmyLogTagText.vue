<template>
  <span v-html="formatedText" ref="text">
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
      .replace(/<wall>/g, '<span class="kmy-format-wall">')
      .replace(/<\/wall>/g, '</span>')
      .replace(/<town>/g, '<span class="kmy-format-town">')
      .replace(/<\/town>/g, '</span>')
      .replace(/<country>/g, '<span class="kmy-format-country">')
      .replace(/<\/country>/g, '</span>')
      .replace(/<battle-log>/g, '<a class="kmy-format-battle-log-link" href="#" data-logid="')
      .replace(/<\/battle-log>/g, '">戦闘ログ</a>')
      .replace(/<emerge>/g, '<span class="kmy-format-emerge">')
      .replace(/<\/emerge>/g, '</span>');
  }

  private mounted() {
    const text = this.$refs.text as HTMLElement;
    const issues = text.getElementsByClassName('kmy-format-battle-log-link');
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i] as HTMLLinkElement;
      issue.addEventListener('click', (ev) => {
        ev.preventDefault();
        const numStr = (ev.target as HTMLLinkElement).dataset.logid;
        if (numStr !== undefined) {
          const num = parseInt(numStr, 10);
          this.$emit('battle-log', num);
        }
      });
    }
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
.kmy-format-wall {
  color: #d40eee;
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
