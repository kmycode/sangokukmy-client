<template>
  <div class="chat-message-panel">
    <!-- 投稿フォーム -->
    <div v-show="canPost" class="loading-container">
      <div :class="'chat-new-message-parent country-color-' + countryColor">
        <div :class="{'icons': true}" v-show="isShowIcons">
          <CharacterIcon v-for="icon in icons"
                        :key="icon.id"
                        :icon="icon"
                        :canClick="true"
                        @onclick="isShowIcons = false; selectedIcon = icon"/>
        </div>
        <div class="chat-new-message" ref="chatMessageInputWrapper">
          <CharacterIcon :icon="selectedIcon" :canClick="true" @onclick="isShowIcons ^= true"/>
          <div class="post-pair">
            <div class="message-input-wrapper">
              <div ref="chatMessageInput"
                   class="message-input"
                   contenteditable="true"
                   @keyup.ctrl.enter.prevent.stop="postChat()"
                   @keyup.meta.enter="postChat()"></div>
            </div>
            <div v-if="model.sendTo && model.sendTo.id"
                class="message-target"
                @click="model.sendTo = undefined">
              <span class="target-text">{{ model.sendTo.name }} へ送信</span><span class="remove-mark">✕</span>
            </div>
            <div v-show="isImageSet" class="message-image" @click="isImageSet = false">
              <img ref="outputImage">
              <div class="message-image-clicker"></div>
              <span class="remove-mark">✕</span>
            </div>
            <div class="buttons">
              <div class="pick-image"><button class="btn btn-light" @click="$refs.pickImage.click()">画像</button><input type="file" ref="pickImage" @change="selectedImage" style="display:none"/></div>
              <div><button class="btn btn-primary" @click="postChat()" :disabled="!canSendChat">投稿</button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="loading" v-show="model.isPosting"><div class="loading-icon"></div></div>
    </div>
    <!-- 一覧 -->
    <div class="items" @scroll="onChatScrolled">
      <transition-group name="message" tag="div">
        <div
          class="item"
          v-for="mes in model.messages"
          :key="mes.id">
          <ChatMessageItem
            v-if="mes.character && mes.characterIcon"
            :countries="countries"
            :message="mes"
            :canSendPrivate="canSendPrivate"
            :canSendOtherCountry="canSendOtherCountry"
            :myCharacterId="myCharacterId"
            :myCountryId="myCountryId"
            :isLoading="model.isLoading"
            :mutes="mutes"
            :muteKeyword="muteKeyword"
            :isIssueLink="isIssueLink"
            @chat-private="$emit('chat-private', $event)"
            @chat-other-country="$emit('chat-other-country', $event)"
            @promotion-refuse="model.setPromotionStatusAsync($event, 10)"
            @promotion-apply="model.setPromotionStatusAsync($event, 9)"
            @open-image="$emit('open-image', $event)"
            @issue-link="$emit('issue-link', $event)"/>
        </div>
      </transition-group>
      <div v-show="model.isLoading" class="loading-container load-more">
        <div class="loading"><div class="loading-icon"></div></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import ChatMessageItem from '@/components/parts/ChatMessageItem.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import { IChatMessageContainer } from '@/models/status/chatmessagecontainer';
import * as api from '@/api/api';
import ArrayUtil from '@/models/common/arrayutil';
import EventObject from '@/models/common/EventObject';

@Component({
  components: {
    ChatMessageItem,
    CharacterIcon,
  },
})
export default class ChatMessagePanel extends Vue {
  @Prop() public model!: IChatMessageContainer;
  @Prop() public countries!: api.Country[];
  @Prop() public countryColor!: number;
  @Prop() public icons!: api.CharacterIcon[];
  @Prop() public mutes!: api.Mute[];
  @Prop() public muteKeyword!: api.MuteKeyword;
  @Prop({
    default: false,
  }) public canSendPrivate!: boolean;
  @Prop({
    default: 0,
  }) public myCharacterId!: number;
  @Prop({
    default: false,
  }) public canSendOtherCountry!: boolean;
  @Prop({
    default: true,
  }) public canPost!: boolean;
  @Prop({
    default: 0,
  }) public myCountryId!: number;
  @Prop({
    default: false,
  }) public isIssueLink!: boolean;
  private callFocus: EventObject = new EventObject(() => {
    (this.$refs.chatMessageInput as HTMLTextAreaElement).focus();
  });
  private isShowIcons: boolean = false;
  private selectedIcon: api.CharacterIcon = new api.CharacterIcon(-1);
  private isImageSet: boolean = false;
  private canSendChat: boolean = false;

  private mounted() {
    this.$emit('call-focus', this.callFocus);
    this.onIconsChanged();

    // 画像のクリップボード貼り付け対応
    // https://jsfiddle.net/2tkc99n2/1/
    const element = this.$refs.chatMessageInput as any;
    const elementWrapper = this.$refs.chatMessageInputWrapper as any;
    const pickImage = this.$refs.pickImage as any;
    if (!element) {
      return;
    }
    element.addEventListener('paste', (e: any) => {
      const result = this.loadFromDataTransfer(e.clipboardData, element);
      if (!result) {
        e.preventDefault();
      }
      return result;
    });
    element.addEventListener('input', (e: any) => {
      // 仮のエレメントを作り、張り付けた内容にimgタグがあるか探す
      const temp = document.createElement('div');
      temp.innerHTML = element.innerHTML;
      const pastedImage = temp.querySelector('img');

      // イメージタグがあればsrc属性からbase64が得られるので
      // あとは煮るなり焼くなり
      if (pastedImage) {
        const base64 = pastedImage.src;
        (this.$refs.outputImage as HTMLImageElement).src = base64;
        element.innerHTML = element.innerText;
      }

      this.updateCanSendChat();
      return true;
    });

    // 画像ファイルのドロップ対応
    const cancelEvent = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    elementWrapper.addEventListener('dragenter', cancelEvent);
    elementWrapper.addEventListener('dragover', (e: any) => {
      cancelEvent(e);
      element.className += ' dragging';
    });
    elementWrapper.addEventListener('dragleave', (e: any) => {
      cancelEvent(e);
      element.className = (element.className as string).split(' ').filter((s) => s !== 'dragging').join(' ');
    });
    elementWrapper.addEventListener('drop', (event: any) => {
      const result = this.loadFromDataTransfer(event.dataTransfer, element);
      if (!result) {
        event.preventDefault();
      }
      element.className = (element.className as string).split(' ').filter((s) => s !== 'dragging').join(' ');
      return result;
    });
  }

  @Watch('model.sendTo')
  private onSendToChanged() {
    this.updateCanSendChat();
  }

  private selectedImage(ev: any) {
    if (ev.target.files && ev.target.files.length > 0) {
      this.loadImageFromFile(ev.target.files[0]);
    }
  }

  private loadFromDataTransfer(dt: DataTransfer, element: HTMLElement): boolean {
    if (!dt || !dt.types || dt.types.length <= 0) {
      return true;
    }

    let fileIndex = -1;
    for (let i = 0; i < dt.types.length; i++) {
      if (dt.types[i] === 'Files') {
        fileIndex = i;
        break;
      }
    }

    if (fileIndex < 0) {
      if (dt.types[0] === 'text/html') {
        const temp = document.createElement('div');
        temp.innerHTML = dt.getData('text/html');
        const pastedImage = temp.querySelector('img');

        // イメージタグがあればsrc属性からbase64が得られるので
        // あとは煮るなり焼くなり
        if (pastedImage) {
          const base64 = pastedImage.src;
          (this.$refs.outputImage as HTMLImageElement).src = base64;
          this.isImageSet = true;
        }
        element.focus();
        document.execCommand('insertText', false, dt.getData('text/plain'));
        return false;
      } else if (dt.types[0] === 'text/plain') {
        const plain = dt.getData('text/plain');
        element.focus();
        document.execCommand('insertText', false, plain);
        return false;
      } else if (dt.types[0] === 'text/uri-list') {
        const plain = dt.getData('URL');
        element.focus();
        document.execCommand('insertText', false, plain);
        return false;
      }
      return true;
    } else {
      if (dt.items.length > 0) {
        try {
          const imageFile = dt.items[0].getAsFile();
          this.loadImageFromFile(imageFile);
          element.innerHTML = element.innerText;
        } catch {
          if (dt.files.length > 0) {
            this.loadImageFromFile(dt.files[0]);
            element.innerHTML = element.innerText;
          }
        }
      } else if (dt.files.length > 0) {
        this.loadImageFromFile(dt.files[0]);
        element.innerHTML = element.innerText;
      }
    }

    return false;
  }

  private loadImageFromFile(imageFile: any) {
    const fr = new FileReader();
    fr.onload = (ev: any) => {
      const base64 = ev.target.result;
      (this.$refs.outputImage as HTMLImageElement).src = base64;
    };
    fr.readAsDataURL(imageFile);
    this.isImageSet = true;
  }

  private updateCanSendChat() {
    const element = this.$refs.chatMessageInput as any;
    if (element) {
      this.canSendChat = element.innerText.length !== 0 &&
        this.model.canSend;
      return;
    }
    this.canSendChat = false;
  }

  @Watch('icons')
  private onIconsChanged() {
    const icon = api.CharacterIcon.getMainOrFirst(this.icons);
    if (icon) {
      this.selectedIcon = icon;
    }
  }

  private postChat() {
    const element = this.$refs.chatMessageInput as any;
    const image = this.isImageSet ? (this.$refs.outputImage as any).src : undefined;
    const text = element.innerText.replace(/\n\n/g, '\n');
    this.model.postChatAsync(text, this.selectedIcon, image)
      .then(() => {
        element.innerHTML = '';
        this.isImageSet = false;
        this.updateCanSendChat();
      });
  }

  private onChatScrolled(event: any) {
    if (this.isScrolled(event)) {
      this.model.loadOldChatsAsync();
    }
    this.model.isScrolledTop = this.isOnTopScrolled(event);
  }

  private isOnTopScrolled(event: any): boolean {
    return 50 >= event.target.scrollTop;
  }

  private isScrolled(event: any): boolean {
    // スクロールの現在位置 + 親（.item-container）の高さ >= スクロール内のコンテンツの高さ
    return (event.target.scrollTop + 50 + event.target.offsetHeight) >= event.target.scrollHeight;
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.chat-message-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;

  .nav {
    .active {
      background-color: #6bf;
    }
  }

  .chat-new-message-parent {
    @include country-color-light('background-color');
    @include country-color-deep('border-bottom-color');

    .icons {
      padding: 8px;
      img {
        width: 48px;
        height: 48px;
      }
    }
  }

  .chat-new-message {
    display: flex;
    padding: 6px;
    border-bottom-width: 2px;
    border-bottom-style: solid;

    .post-pair {
      padding-left: 6px;
      display: flex;
      flex-direction: column;
      flex: 1;

      .message-input-wrapper {
        flex: 1;
        
        .message-input, .message-input textarea {
          height: 72px;
          max-height: 72px;
          width: 100%;
          overflow: auto;
          border: 0;
          padding: 4px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.356);
          margin-bottom: 4px;
          word-break: break-word;

          &.dragging {
            background: rgba(252, 184, 212, 0.507);
          }
        }
      }

      .message-image {
        cursor: pointer;
        position: relative;
        align-self: flex-start;
        &:hover {
          .message-image-clicker {
            display: block;
          }
          .remove-mark {
            visibility: visible;
          }
        }
        img {
          height: 128px;
          max-width: 128px;
        }
        .remove-mark {
          visibility: hidden;
          font-weight: bold;
          padding-left: 8px;
        }
        .message-image-clicker {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.16);
        }
      }

      .message-target {
        padding: 4px 12px;
        margin-top: -2px;
        cursor: pointer;
        transition: all .2s ease-in;

        &:hover {
          background-color: rgba(0, 0, 0, 0.16);
          .remove-mark {
            visibility: visible;
          }
        }

        .target-text {
          padding: 4px 24px 4px 0;
        }

        .remove-mark {
          visibility: hidden;
          font-weight: bold;
        }
      }

      .buttons {
        display: flex;
        .pick-image {
          flex: 1;
        }
      }
    }
  }

  .items {
    flex: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .load-more {
      height: 40px;
    }
  }
}

.message-enter-active, .message-leave-active {
  transition: opacity .2s;
}

.message-enter, .message-leave-to {
  opacity: 0;
}

.message-move {
  transition: transform .2s;
}
</style>
