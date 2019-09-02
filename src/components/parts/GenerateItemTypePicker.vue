<template>
  <div class="item-list">
    <div
      :class="{'item': true, 'selected': value.id === item.id, 'selectable': true}"
      v-for="item in itemTypes"
      :key="item.id">
      <div class="item-info">
        <div class="standard">
          <div class="name responsive-header">{{ item.name }}</div>
          <div class="params">
            <span class="value-name">価格</span> <span class="value">{{ getItemMoney(item) }}</span>
            <span v-if="item.isResource">
              <span class="value-name">標準資源量</span> <span class="value">{{ item.defaultResource }}</span>
            </span>
          </div>
          <div class="description">{{ item.description }}</div>
        </div>
      </div>
      <div v-if="canEdit" class="select-cover" @click="$emit('input', item.id)"></div>
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
export default class CharacterItemList extends Vue {
  public itemTypes: def.CharacterItemType[] = [];
  @Prop({
    default: () => new def.CharacterItemType(-1),
  }) public value!: def.CharacterItemType;
  @Prop({
    default: () => [],
  }) public skills!: api.CharacterSkill[];

  @Watch('skills')
  public onSkillsChanged() {
    this.itemTypes = [];
  }

  private getItemMoney(item: def.CharacterItemType): number {
    const m = !item.isResource ? item.money : item.money * item.defaultResource;

    return m;
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/country-color.scss';

.item-list {
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

    .item-info {
      .name {
        flex: 1;
      }

      .description {
        color: #666;
        padding-left: 12px;
      }

      .params {
        padding-left: 12px;
        .value-name {
          color: #969;
        }
        .value {
          font-weight: bold;
          padding-left: 12px;
        }
      }
    }
  }
}
</style>