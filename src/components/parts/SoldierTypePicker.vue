<template>
  <div class="soldier-list">
    <div
      :class="{'item': true, 'selected': value.id === soldier.id, 'selectable': true}"
      v-for="soldier in soldierTypes"
      :key="soldier.id">
      <div class="soldier-info">
        <div class="standard">
          <div class="name">{{ soldier.name }}</div>
          <div class="detail">
            <span class="value-name">金</span><span class="value">{{ soldier.money }}</span>
            <span v-if="!soldier.isCustom" class="value-name">攻撃力</span><span v-if="!soldier.isCustom" class="value">{{ soldier.attackPower }}</span>
            <span v-if="!soldier.isCustom" class="value-name">防御力</span><span v-if="!soldier.isCustom" class="value">{{ soldier.defencePower }}</span>
          </div>
          <div class="description">{{ soldier.description }}</div>
        </div>
      </div>
      <div class="select-cover" @click="$emit('input', soldier)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SoldierTypePicker extends Vue {
  @Prop() public soldierTypes!: def.SoldierType[];
  @Prop({
    default: () => new def.SoldierType(-1),
  }) public value!: def.SoldierType;
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.soldier-list {
  .item {
    padding: 4px 8px;
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    position: relative;

    &.selectable {
      &:hover {
        .select-cover {
          background-color: rgba(0, 0, 0, 0.14);
        }
      }

      &.selected {
        .select-cover {
          background-color: rgba(0, 0, 0, 0.28);
        }
      }

      .select-cover {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        transition: background-color .12s ease-out;
        cursor: pointer;
      }
    }

    .soldier-info {
      .name {
        font-size: 1.6rem;
        flex: 1;
      }

      .description {
        color: #666;
        padding-left: 12px;
      }

      .detail {
        padding-left: 12px;
        .value-name {
          color: #969;
          padding-right: 4px;
        }
        .value {
          font-weight: bold;
          padding-right: 12px;
        }
      }
    }
  }
}
</style>