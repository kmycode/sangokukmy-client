<template>
  <div class="soldier-list">
    <div
      :class="{'item': true, 'selected': value.id === soldier.type.id, 'selectable': true}"
      v-for="soldier in types"
      :key="soldier.type.id">
      <div class="soldier-info">
        <div class="standard">
          <div class="name responsive-header"><span class="kind kind-wall" v-if="soldier.type.kind === 2">壁</span><span class="kind kind-needresource" v-if="soldier.type.isNeedResource">資</span>{{ soldier.type.name }}<span v-if="soldier.isLackOfResources" class="soldier-resource-lack">資源がありません</span><span v-else-if="soldier.resource > 0" class="soldier-resource-number">資源残り {{ soldier.resource }}</span></div>
          <div class="detail">
            <span class="value-name">金</span><span class="value">{{ getSoldierMoney(soldier.type) }}<span v-if="!soldier.type.isCustom">0</span></span>
            <span v-if="!soldier.type.isCustom" class="value-name">攻撃力</span><span class="kind kind-strong" v-if="soldier.type.kind === 0 || soldier.type.kind === 2">武力</span><span class="kind kind-intellect" v-if="soldier.type.kind === 1">知力</span><span class="kind kind-popularity" v-if="soldier.type.kind === 3">人望</span><span class="kind-plus">+</span><span v-if="!soldier.type.isCustom" class="value">{{ soldier.type.attackPower }}</span>
            <span v-if="!soldier.type.isCustom" class="value-name">防御力</span><span v-if="!soldier.type.isCustom" class="value">{{ soldier.type.defencePower }}</span>
          </div>
          <div class="description">{{ soldier.type.description }}</div>
        </div>
      </div>
      <div class="select-cover" @click="$emit('input', soldier.type)"></div>
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

class SoldierTypePickerItem {
  constructor(public type: def.SoldierType,
              public isLackOfResources: boolean,
              public resource: number) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SoldierTypePicker extends Vue {
  public types: SoldierTypePickerItem[] = [];
  @Prop() public soldierTypes!: def.SoldierType[];
  @Prop({
    default: () => new def.SoldierType(-1),
  }) public value!: def.SoldierType;
  @Prop({
    default: () => [],
  }) public skills!: api.CharacterSkill[];
  @Prop({
    default: () => [],
  }) public items!: api.CharacterItem[];

  @Watch('soldierTypes')
  @Watch('items')
  public onTypesChanged() {
    this.types = this.soldierTypes.map((st) => {
      let isLackOfResources = false;
      let resourceNumber = 0;
      if (st.isNeedResource) {
        const resources = this.items.filter((i) => i.type === st.requestedItemType);
        if (resources.length > 0) {
          isLackOfResources = false;
          resourceNumber = Enumerable.from(resources).sum((r) => r.resource);
        } else {
          isLackOfResources = true;
        }
      }
      return new SoldierTypePickerItem(st, isLackOfResources, resourceNumber);
    });
  }

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

        .soldier-resource-lack {
          font-size: 0.7em;
          color: #c33;
          margin-left: 0.5em;
        }

        .soldier-resource-number {
          font-size: 0.7em;
          color: #33c;
          margin-left: 0.5em;
        }

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