<template>
  <div class="chat-message-panel">
    <transition-group name="message" tag="div">
      <div
        class="item"
        v-for="mes in messages"
        :key="mes.id">
        <ChatMessageItem v-if="mes.character && mes.characterIcon" :countries="countries" :message="mes"/>
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
