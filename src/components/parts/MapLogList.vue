<template>
  <ul :class="{'map-log-list': type === 'normal', 'map-log-list-important': type === 'important', 'character-update-log-list': type === 'character-update-log', 'character-log-list': type === 'character-log'}">
    <transition-group name="message" tag="div">
      <li v-if="type === 'normal' || type === 'important'" v-for="mlog in logs" :key="mlog.id">
        <MapLogLine :log="mlog" :isShowBattleLog="isShowBattleLog" @battle-log="$emit('battle-log', $event)"/>
      </li>
      <li v-if="type === 'character-update-log'" v-for="mlog in logs" :key="mlog.id">
        <span v-if="!mlog.isFirstAtMonth">{{ mlog.characterName }} を更新 ({{ mlog.date | realdate }})</span>
        <span v-if="mlog.isFirstAtMonth">=== {{ mlog.gameDate | gamedate }} ({{ mlog.date | realdate }}) ===</span>
      </li>
      <li v-if="type === 'character-log'" v-for="mlog in logs" :key="mlog.id">
        {{ mlog.gameDate | gamedate }}: <KmyLogTagText :text="mlog.message"/> ({{ mlog.date | shortrealdate }})
      </li>
    </transition-group>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MapLogLine from '@/components/parts/MapLogLine.vue';
import KmyLogTagText from '@/components/parts/KmyLogTagText.vue';
import * as api from '@/api/api';

@Component({
  components: {
    MapLogLine,
    KmyLogTagText,
  },
})
export default class MapLogList extends Vue {
  @Prop() private logs!: api.MapLog[];
  @Prop() private type!: string;
  @Prop({
    default: false,
  }) private isShowBattleLog!: boolean;
}
</script>

<style lang="scss" scoped>
// マップログのリスト
ul.map-log-list {
  list-style: none;
  margin: 0;
  margin-left: 1em;
  padding: 0;
  font-size: 1rem;
  li::before {
    content: '●';
    margin-left: -1em;
    color: #080;
    font-family: "Hiragino Kaku Gothic", "Hiragino Kaku Gothic ProN";
  }
}
// 重要マップログリスト
.map-log-list-important {
  @extend ul.map-log-list;
  font-weight: bold;
  li::before {
    color: #008;
  }
}
// 武将更新ログリスト
.character-update-log-list {
  @extend ul.map-log-list;
  li::before {
    color: inherit;
  }
}
// 武将行動ログリスト
.character-log-list {
  @extend ul.map-log-list;
  li::before {
    color: #666;
  }
}

.message-enter-active {
  transition: opacity .2s;
}

.message-leave-active {
  display: none;
}

.message-enter, .message-leave-to {
  opacity: 0;
}

.message-move {
  transition: transform .2s;
}
</style>

