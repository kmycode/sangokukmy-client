<template>
  <span>
    <span v-bind:style="{'color':log.type.color}">【{{ log.type.text }}】</span>{{ log.message }} (<RealDateTime v-bind:date="log.date"/>)
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RealDateTime from './RealDateTime.vue';
import * as api from './../../api/api';

@Component({
  components: {
    RealDateTime,
  },
})
export default class MapLogLine extends Vue {
  @Prop() private log!: api.MapLog;
}
</script>

