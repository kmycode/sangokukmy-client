<template>
  <div class="parts-icon-picker">
    <button type="button" class="btn btn-secondary" @click="type = 1">デフォルト</button>
    <button type="button" class="btn btn-secondary" @click="type = 3">Gravatar</button><br>
    <CharacterIcon :icon="value"/><br>
    <div v-show="type === 1">
      <div class="label">デフォルトアイコン番号（0-{{ defaultIconMax }}）</div>
      <div class="input"><input type="number" :max="defaultIconMax" min="0" v-model="defaultIconId"></div>
    </div>
    <div v-show="type === 3">
      <div class="label">Gravatarメールアドレス</div>
      <div class="input"><input type="text" v-model="email"></div>
      <div class="detail">メールアドレスはハッシュ化してから送信されます。一度ハッシュ化された文字列は復元不可能なので、データベースからメールアドレスを取得することはできないようになっています。</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import Enumerable from 'linq';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

// tslint:disable-next-line:no-var-requires
const md5 = require('md5');

@Component({
  components: {
    CharacterIcon,
  },
})
export default class CharacterIconPicker extends Vue {
  @Prop() public value!: api.CharacterIcon;
  private defaultIconId: number = 0;
  private type: number = 1;
  private email: string = '';

  private get defaultIconMax(): number {
    return def.DEFAULT_ICON_NUM;
  }

  @Watch('defaultIconId')
  @Watch('type')
  @Watch('email')
  private onInput() {
    if (this.defaultIconId >= 0 && this.defaultIconId <= def.DEFAULT_ICON_NUM) {
      this.$emit('input', this.generateNewValue());
    }
  }

  private generateNewValue(): api.CharacterIcon {
    const fileName = this.type === 1 ? this.defaultIconId + '.gif' :
                     this.type === 3 ? md5(this.email.toLowerCase()) :
                     this.value.fileName;
    return new api.CharacterIcon(this.value.id,
                                 this.value.characterId,
                                 this.value.isMain,
                                 this.type,
                                 fileName);
  }
}
</script>

<style lang="scss">
</style>
