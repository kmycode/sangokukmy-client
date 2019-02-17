<template>
  <div :class="'chat-message country-color-' + countryColor">
    <CharacterIcon :icon="message.characterIcon"/>
    <div class="message-container">
      <div class="message">
        <div class="text"><KmyChatTagText :text="message.message"/></div>
        <div class="commands">
          <button v-if="canSendPrivate && message.character.id !== myCharacterId" @click="$emit('chat-private', message.character.id)" type="button" class="btn btn-light btn-sm">個宛</button>
          <button v-if="canSendOtherCountry && message.characterCountryId !== myCountryId" @click="$emit('chat-other-country', message.characterCountryId)" type="button" class="btn btn-warning btn-sm">国宛</button>
        </div>
      </div>
      <div class="message-footer">
        <span v-if="message.receiverName" class="character-name-group">
          <span class="character-name">{{ message.character.name }}</span> から <span class="character-name">{{ message.receiverName }}</span> ヘ
        </span>
        <span v-else class="character-name-group">
          <span class="character-name">{{ message.character.name }}</span>
        </span>
        <span class="posted">{{ message.posted | realdate }}</span>
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

@Component({
  components: {
    CharacterIcon,
    KmyChatTagText,
  },
})
export default class ChatMessageItem extends Vue {
  @Prop() public message!: api.ChatMessage;
  @Prop() public countries!: api.Country[];
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

  private get countryColor(): number {
    const country = ArrayUtil.find(this.countries, this.message.characterCountryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.chat-message {
  display: flex;
  padding: 6px;
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  @include country-color-light('background-color');
  @include country-color-deep('color');
  @include country-color-deep('border-bottom-color');

  .message-container {
    flex: 1;
    padding-left: 6px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;

    .message {
      flex: 1;

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

        .character-name {
          font-weight: bold;
        }
      }
    }
  }
}
</style>
