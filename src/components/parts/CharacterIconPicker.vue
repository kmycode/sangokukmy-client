<template>
  <div class="parts-icon-picker">
    <button type="button" :class="{ 'btn': true, 'btn-secondary': type === 1, 'btn-outline-secondary': type !== 1 }" @click="type = 1">デフォルト</button>
    <button type="button" :class="{ 'btn': true, 'btn-secondary': type === 3, 'btn-outline-secondary': type !== 3 }" @click="type = 3">Gravatar</button><br>
    <span class="main-icon">
      <CharacterIcon :icon="value"/>
    </span>
    <div class="setting-block">
      <div v-show="type === 1">
        <div class="label">デフォルトアイコン番号（0-{{ defaultIconMax }}）</div>
        <div class="input"><input type="number" :max="defaultIconMax" min="0" v-model="defaultIconId"></div>
        <div class="default-icons">
          <span v-for="i in 99"
                :key="i"
                @click="defaultIconId = i - 1"
                class="icon-parent">
            <img :src="getDefaultIconUri(i - 1)"/>
            <span class="overlay"></span>
          </span>
        </div>
      </div>
      <div v-show="type === 3">
        <div class="label">Gravatarメールアドレス</div>
        <div class="input"><input type="text" v-model="email"></div>
        <div class="detail">メールアドレスはハッシュ化してから送信されます。一度ハッシュ化された文字列は復元不可能なので、データベースからメールアドレスを取得することはできないようになっています。</div>
      </div>
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

  private getDefaultIconUri(id: number): string {
    const d = new api.CharacterIcon();
    d.fileName = id + '.gif';
    d.type = 1;
    return api.CharacterIcon.getUri(d);
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
button {
  margin-right: 8px;
  margin-bottom: 8px;
}

.main-icon img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.default-icons {
  .icon-parent {
    display: inline-block;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border-radius: 50%;
    transition: border-radius .2s;
    &:hover {
      border-radius: 20%;
      .overlay {
        opacity: 0.2;
      }
    }
    img {
      width: 48px;
      height: 48px;
    }
    .overlay {
      transition: opacity .2s;
      opacity: 0;
      background-color: black;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

.setting-block {
  margin: 8px 0 0 0;
}
</style>
