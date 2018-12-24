<template>
  <span>
    <span v-bind:style="{'color':log.eventColor}">【{{ log.eventName }}】</span><span v-if="log.isImportant">[{{ log.gameDate | gamedate }}]</span><KmyLogTagText :text="log.message"/> ({{ log.date | realdate }})
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import KmyLogTagText from '@/components/parts/KmyLogTagText.vue';
import * as api from '@/api/api';

@Component({
  components: {
    KmyLogTagText,
  },
})
export default class MapLogLine extends Vue {
  @Prop() private log!: api.MapLog;
}
</script>

