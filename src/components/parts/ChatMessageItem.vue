<template>
  <div :class="'chat-message country-color-' + countryColor">
    <CharacterIcon :icon="message.characterIcon"/>
    <div class="message-container">
      <div class="message">
        <KmyChatTagText :text="message.message"/>
      </div>
      <div class="message-footer">
        <span class="character-name">{{ message.character.name }}</span> <span class="posted">{{ message.posted | realdate }}</span>
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
    }

    .message-footer {
      font-size: 0.7rem;
      text-align: right;

      .character-name {
        font-size: 0.8rem;
        font-weight: bold;
        padding-right: 12px;
      }
    }
  }
}
</style>
