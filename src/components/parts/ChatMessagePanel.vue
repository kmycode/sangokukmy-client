<template>
  <div class="chat-message-panel">
    <!-- 投稿フォーム -->
    <div v-if="canPost" class="loading-container">
      <div :class="'chat-new-message country-color-' + countryColor">
        <CharacterIcon :icons="icons"/>
        <div class="post-pair">
          <div class="message-input-wrapper">
            <textarea ref="chatMessageInput"
                      class="message-input"
                      v-model="chatPostMessage"
                      @keyup.ctrl.enter.prevent.stop="postChat()"
                      @keyup.meta.enter="postChat()"></textarea>
          </div>
          <div v-if="model.sendTo && model.sendTo.id"
               class="message-target"
               @click="model.sendTo = undefined">
            <span class="target-text">{{ model.sendTo.name }} へ送信</span><span class="remove-mark">✕</span>
          </div>
          <div class="buttons">
            <button class="btn btn-primary" @click="postChat()" :disabled="!canSendChat">投稿</button>
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
            @chat-private="$emit('chat-private', $event)"
            @chat-other-country="$emit('chat-other-country', $event)"
            @promotion-refuse="model.setPromotionStatusAsync($event, 10)"
            @promotion-apply="model.setPromotionStatusAsync($event, 9)"/>
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
  private chatPostMessage: string = '';
  private callFocus: EventObject = new EventObject(() => {
    (this.$refs.chatMessageInput as HTMLTextAreaElement).focus();
  });

  private mounted() {
    this.$emit('call-focus', this.callFocus);
  }

  private get canSendChat(): boolean {
    return this.chatPostMessage.length !== 0 &&
      this.model.canSend;
  }

  private postChat() {
    this.model.postChatAsync(this.chatPostMessage)
      .then(() => {
        this.chatPostMessage = '';
      });
  }

  private onChatScrolled(event: any) {
    if (this.isScrolled(event)) {
      this.model.loadOldChatsAsync();
    }
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

  .nav {
    .active {
      background-color: #6bf;
    }
  }

  .chat-new-message {
    display: flex;
    padding: 6px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    @include country-color-light('background-color');
    @include country-color-deep('border-bottom-color');

    .post-pair {
      padding-left: 6px;
      display: flex;
      flex-direction: column;
      flex: 1;

      .message-input-wrapper {
        flex: 1;
        
        .message-input, .message-input textarea {
          height: 72px;
          width: 100%;
          border: 0;
          padding: 4px;
          font-size: 0.9rem;
        }
      }

      .message-target {
        padding: 4px 12px;
          margin-top: -8px;
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
        text-align: right;
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
