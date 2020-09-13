<template>
  <span>
    <span v-if="ruleSet === 0">標準ルール</span>
    <span v-else-if="ruleSet === 1" style="color:purple;font-weight:bold">放浪ルール</span>
    <span v-else-if="ruleSet === 2" style="color:black;font-weight:bold">原理ルール</span>
    <span v-else-if="ruleSet === 3" style="color:#800;font-weight:bold">全国戦争ルール</span>
    <span v-else-if="ruleSet === 4" style="color:#990;font-weight:bold">玉璽ルール</span>
    <span v-else>不明のルール</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class RuleSetLabel extends Vue {
  @Prop() private ruleSet!: number;
}
</script>
