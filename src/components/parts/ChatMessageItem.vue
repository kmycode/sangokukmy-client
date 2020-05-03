<template>
  <div :class="'chat-message country-color-' + countryColor">
    <div v-if="isShowForce || (!isCharacterMuted && !isMessageMuted)" :class="'country-color-' + countryColor">
      <CharacterIcon :icon="message.characterIcon"/>
      <div class="message-container">
        <div class="message">
          <div class="text"><KmyChatTagText :text="message.message"/></div>
          <div class="commands">
            <button v-if="canSendPrivate && message.character.id !== myCharacterId" @click="$emit('chat-private', message.character.id)" type="button" class="btn btn-light btn-sm">個宛</button>
            <button v-if="canSendPrivate && message.character.id === myCharacterId" @click="$emit('chat-private', message.typeData2)" type="button" class="btn btn-outline-dark btn-sm">再送</button>
            <button v-if="canSendOtherCountry && message.characterCountryId !== myCountryId" @click="$emit('chat-other-country', message.characterCountryId)" type="button" class="btn btn-warning btn-sm">国宛</button>
            <button v-if="canSendOtherCountry && message.type === 2 && message.typeData === myCountryId" @click="$emit('chat-other-country', message.typeData2)" type="button" class="btn btn-outline-dark btn-sm">再送</button>
            <button v-if="message.type === 8 && message.typeData2 === myCharacterId && myCountryId === 0" class="loading-container btn btn-danger" @click="$emit('promotion-refuse', message.id)">
              拒否<div class="loading" v-show="isLoading"><div class="loading-icon"></div></div>
            </button>
            <button v-if="message.type === 8 && message.typeData2 === myCharacterId && myCountryId === 0" class="loading-container btn btn-primary" @click="$emit('promotion-apply', message.id)">
              承諾<div class="loading" v-show="isLoading"><div class="loading-icon"></div></div>
            </button>
            <span v-if="message.type === 9" style="color:red;font-weight:bold">承諾しました</span>
            <span v-if="message.type === 10" style="color:blue;font-weight:bold">丁重に断りました</span>
            <span v-if="message.type === 11" style="color:gray;font-weight:bold">登用国滅亡のため無効</span>
          </div>
        </div>
        <div class="message-footer">
          <span v-if="message.receiverName" class="character-name-group">
            <span class="character-name">{{ message.character.name }}</span> ({{ countryName }}) から <span class="character-name">{{ message.receiverName }}</span> ヘ
          </span>
          <span v-else class="character-name-group">
            <span class="beginner" v-if="message.character.isBeginner">🔰</span>
            <span class="character-name">{{ message.character.name }}</span>
          </span>
          <span class="posted">{{ message.posted | realdate }}</span>
          <span v-if="!isShowForce && myCharacterId !== message.character.id">
            <a class="btn btn-sm btn-light" style="width:20px;height:16px;line-height:12px;margin-left:8px;font-size:12px" @click="isOpenReports ^= true">...</a>
            <div v-if="isOpenReports" class="loading-container" style="margin-top:8px">
              <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(true)">発言を報告</a>
              <a class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="muteCharacter(true)">武将をミュート</a>
              <a class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="isOpenReports = false; $emit('chat-private', message.character.id)">個宛</a>
              <div v-if="isMuting" class="loading"><div class="loading-icon"></div></div>
            </div>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isCharacterMuted" :class="'mute country-color-' + countryColor">
      この武将をミュートしました
      <div class="loading-container">
        <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="muteCharacter(false)">ミュートを解除</a>
        <a v-if="!isShowForce" class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="isShowForce = true">発言を見る</a>
        <a v-else class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="isShowForce = false">発言を隠す</a>
        <div v-if="isMuting" class="loading"><div class="loading-icon"></div></div>
      </div>
    </div>
    <div v-else-if="isMessageMuted" :class="'mute country-color-' + countryColor">
      この発言には特定のキーワードが含まれるためミュートしました
      <div>
        <a v-if="!isShowForce" class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="isShowForce = true">発言を見る</a>
        <a v-else class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="isShowForce = false">発言を隠す</a>
      </div>
    </div>
    <div v-if="isReported" :class="'mute country-color-' + countryColor">
      この発言を報告しました。補足説明がある場合は、管理人へ個宛してください。（個人タブに案内があります）
      <div class="loading-container">
        <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(false)">報告を解除</a>
        <div v-if="isMuting" class="loading"><div class="loading-icon"></div></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import KmyChatTagText from '@/components/parts/KmyChatTagText.vue';
import * as api from '@/api/api';
import ArrayUtil from '@/models/common/arrayutil';
import NotificationService from '../../services/notificationservice';

@Component({
  components: {
    CharacterIcon,
    KmyChatTagText,
  },
})
export default class ChatMessageItem extends Vue {
  @Prop() public message!: api.ChatMessage;
  @Prop() public countries!: api.Country[];
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
    default: 0,
  }) public myCountryId!: number;
  @Prop({
    default: false,
  }) public isLoading!: boolean;
  private isOpenReports: boolean = false;
  private isShowForce: boolean = false;
  private isMuting: boolean = false;

  private get countryColor(): number {
    const country = ArrayUtil.find(this.countries, this.message.characterCountryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }

  private get countryName(): string {
    const country = ArrayUtil.find(this.countries, this.message.characterCountryId);
    if (country) {
      return country.name;
    } else {
      return '無所属';
    }
  }

  private get isCharacterMuted(): boolean {
    if (this.message.character) {
      const chara = this.message.character;
      return this.mutes.some((m) => m.targetCharacterId === chara.id);
    }
    return false;
  }

  private get isMessageMuted(): boolean {
    return api.MuteKeyword.isMute(this.muteKeyword, this.message.message);
  }

  private get isReported(): boolean {
    return this.mutes.some((m) => m.chatMessageId === this.message.id && m.type === api.Mute.typeReported);
  }

  private muteCharacter(status: boolean) {
    if (this.message.character) {
      const chara = this.message.character;
      this.isMuting = true;
      api.Api.muteCharacter(status ? api.Mute.typeMuted : api.Mute.typeNone, chara.id)
        .then(() => {
          NotificationService.muted.notify();
          this.isShowForce = false;
          this.isOpenReports = false;
        })
        .catch(() => NotificationService.muteFailed.notify())
        .finally(() => this.isMuting = false);
    }
  }

  private reportMessage(status: boolean) {
    this.isMuting = true;
    api.Api.reportChatMessage(status ? api.Mute.typeReported : api.Mute.typeNone, this.message.id)
      .then(() => {
        NotificationService.reported.notify();
        this.isShowForce = false;
        this.isOpenReports = false;
      })
      .catch((ex) => {
        if (ex.data) {
          if (ex.data.code === api.ErrorCode.blockedActionError) {
            NotificationService.actionBlocked.notify();
          } else {
            NotificationService.reportFailed.notify();
          }
        } else {
          NotificationService.reportFailed.notify();
        }
      })
      .finally(() => this.isMuting = false);
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.chat-message {
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  @include country-color-deep('border-bottom-color');
}

.chat-message > div {
  display: flex;
  padding: 6px;
  @include country-color-light('background-color');
  @include country-color-deep('color');

  .message-container {
    flex: 1;
    padding-left: 6px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;

    .message {
      flex: 1;
      word-break: break-word;

      .commands {
        text-align: right;
      }
    }

    .message-footer {
      font-size: 0.7rem;
      text-align: right;

      .character-name-group {
        font-size: 0.8rem;
        padding-right: 12px;

        .beginner {
          background: #74dac9;
          padding: 4px;
          border-radius: 12px;
          margin-right: 8px;
          font-weight: bold;
        }

        .character-name {
          font-weight: bold;
        }
      }
    }
  }
}
</style>
