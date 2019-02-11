<template>
  <span>
    <span v-bind:style="{'color':eventType.color}">【{{ eventType.name }}】</span><span v-if="log.isImportant">[{{ log.gameDate | gamedate }}]</span> <KmyLogTagText :text="log.message"/><span v-if="isShowBattleLog && log.battleLogId"><a href="#" @click.prevent.stop="$emit('battle-log', log.battleLogId)">(戦闘ログ)</a></span> ({{ log.date | shortrealdate }})
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import KmyLogTagText from '@/components/parts/KmyLogTagText.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';

@Component({
  components: {
    KmyLogTagText,
  },
})
export default class MapLogLine extends Vue {
  @Prop() private log!: api.MapLog;
  @Prop({
    default: false,
  }) private isShowBattleLog!: boolean;

  private get eventType(): def.EventType {
    const type = api.MapLog.getEventType(this.log);
    if (type) {
      return type;
    } else {
      return def.EventType.default;
    }
  }
}
</script>

