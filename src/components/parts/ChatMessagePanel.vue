<template>
  <div class="chat-message-panel">
    <transition-group name="message" tag="div">
      <div
        class="item"
        v-for="mes in messages"
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
          @chat-other-country="$emit('chat-other-country', $event)"/>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ChatMessageItem from '@/components/parts/ChatMessageItem.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from '@/api/api';
import ArrayUtil from '@/models/common/arrayutil';

@Component({
  components: {
    ChatMessageItem,
    CharacterIcon,
  },
})
export default class ChatMessagePanel extends Vue {
  @Prop() public messages!: api.ChatMessage[];
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
}
</script>

<style lang="scss" scoped>
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
