<template>
  <span>{{date.hours | zeroformat(2)}}:{{date.minutes | zeroformat(2)}}:{{date.seconds | zeroformat(2)}}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as api from './../../api/api';

@Component({
  components: {
  },
})
export default class RealDateTime extends Vue {
  @Prop() private date!: api.DateTime;
}
</script>

<style lang="scss">
</style>
