<template>
  <div id="unit-picker">
    <div v-for="unit in units"
         :key="unit.id"
         :class="{ 'unit-list-item': true, 'selected': value && value.id === unit.id }"
         @click="$emit('input', unit)">
      <div class="left-side">
        <CharacterIcon :icon="unit.leader.character.mainIcon"/>
      </div>
      <div class="right-side">
        <div class="unit-name">{{ unit.name }}<span v-show="unit.isLimited" class="unit-limited">制限中</span></div>
        <div class="unit-message">{{ unit.message }}</div>
        <div class="unit-leader">隊長: {{ unit.leader.character.name }}</div>
        <div class="unit-members"><MiniCharacterList :characters="unitMemberCharacters(unit)" :countries="countries"/></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from './../../api/api';
import Enumerable from 'linq';

@Component({
  components: {
    MiniCharacterList,
    CharacterIcon,
  },
})
export default class UnitPicker extends Vue {
  @Prop() private units!: api.Unit[];
  @Prop() private value!: api.Unit;
  @Prop() private countries!: api.Country[];

  private unitMemberCharacters(unit: api.Unit): api.Character[] {
    // 部隊のメンバの武将リスト
    return Enumerable.from(unit.members)
      .select((um) => um.character)
      .toArray();
  }
}
</script>

<style lang="scss">

#unit-picker {
  margin-top: 12px;

  .unit-list-item {
    display: flex;
    cursor: pointer;
    padding: 4px;
    transition: background-color .14s ease-in;

    &:hover {
      background-color: #dee0f3;
    }

    &.selected {
      background-color: #c9cce7;

      &:hover {
        background-color: #acb0d1;
      }
    }

    .right-side {
      flex: 1;
      padding-left: 8px;

      .unit-name {
        font-size: 24px;
      }

      .unit-limited {
        color: red;
        margin-left: 16px;
        font-size: 14px;
        font-weight: bold;
      }

      .unit-message {
        padding: 4px 0;
        color: #888;
      }
    }
  }
}
</style>
