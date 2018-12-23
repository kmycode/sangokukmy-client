<template>
  <ul :class="{'map-log-list': type === 'normal', 'map-log-list-important': type === 'important', 'character-update-log-list': type === 'character-update-log'}">
    <li v-if="type !== 'character-update-log'" v-for="mlog in logs" :key="mlog.id">
      <MapLogLine :log="mlog"/>
    </li>
    <li v-if="type === 'character-update-log'" v-for="mlog in logs" :key="mlog.id">
      {{ mlog.characterName }} (<RealDateTime :date="mlog.date"/>)
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RealDateTime from './RealDateTime.vue';
import MapLogLine from '../parts/MapLogLine.vue';
import * as api from './../../api/api';

@Component({
  components: {
    RealDateTime,
    MapLogLine,
  },
})
export default class MapLogList extends Vue {
  @Prop() private logs!: api.MapLog[];
  @Prop() private type!: string;
}
</script>

<style lang="scss" scoped>
// マップログのリスト
ul.map-log-list {
  list-style: none;
  margin: 0;
  margin-left: 1em;
  padding: 0;
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
</style>

