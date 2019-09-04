<template>
  <div class="soldier-list">
    <div
      :class="{'item': true, 'selected': value.id === soldier.id, 'selectable': true}"
      v-for="soldier in soldierTypes"
      :key="soldier.id">
      <div class="soldier-info">
        <div class="standard">
          <div class="name responsive-header"><span class="kind kind-wall" v-if="soldier.kind === 2">壁</span><span class="kind kind-needresource" v-if="soldier.isNeedResource">資</span>{{ soldier.name }}</div>
          <div class="detail">
            <span class="value-name">金</span><span class="value">{{ getSoldierMoney(soldier) }}<span v-if="!soldier.isCustom">0</span></span>
            <span v-if="!soldier.isCustom" class="value-name">攻撃力</span><span class="kind kind-strong" v-if="soldier.kind === 0 || soldier.kind === 2">武力</span><span class="kind kind-intellect" v-if="soldier.kind === 1">知力</span><span class="kind kind-popularity" v-if="soldier.kind === 3">人望</span><span class="kind-plus">+</span><span v-if="!soldier.isCustom" class="value">{{ soldier.attackPower }}</span>
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
  @Prop({
    default: () => [],
  }) public skills!: api.CharacterSkill[];

  public getSoldierMoney(type: def.SoldierType): number {
    if (this.skills.some((s) => s.type === 3)) {
      return Math.floor(type.money * 0.9);
    }
    return type.money;
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
@import '@/scss/common.scss';

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
        flex: 1;

        .kind {
          display: inline-block;
          width: 20px;
          height: 20px;
          line-height: 20px;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin-right: 8px;
        }

        .kind-wall {
          background: #ca0;
        }
        
        .kind-needresource {
          background: #c00;
        }
      }

      .description {
        color: #666;
        padding-left: 12px;
      }

      .detail {
        padding-left: 12px;

        .kind {
          display: inline-block;
          width: 32px;
          height: 16px;
          line-height: 16px;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          margin-right: 4px;
        }

        .kind-plus {
          margin-right: 4px;
          font-size: 12px;
          line-height: 16px;
        }

        .kind-intellect {
          background: #66c;
        }

        .kind-strong {
          background: #c66;
        }

        .kind-popularity {
          background: #b4f;
        }

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