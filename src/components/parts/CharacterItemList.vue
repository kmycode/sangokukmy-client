<template>
  <div class="item-list">
    <div
      :class="{'item': true, 'selected': value.id === item.type.id, 'selectable': canEdit}"
      v-for="item in itemTypes"
      :key="item.data[0].id">
      <div class="item-info">
        <div class="standard">
          <div class="name">{{ item.type.name }}</div>
          <div class="params">
            <span class="value-name">価格</span> <span class="value">{{ (isSell ? item.type.money / 2 : item.type.money) }}</span>
            <span class="value-name">数量</span> <span class="value">{{ item.count }}</span>
          </div>
          <div class="description">{{ item.type.description }}</div>
        </div>
      </div>
      <div v-if="canEdit" class="select-cover" @click="$emit('input', item.type)"></div>
    </div>
    <div v-show="isShowPendings && pendingTypes.length > 0" style="margin-top:48px">
      <h2>受け取り保留中</h2>
      <div
        :class="{'item': true, 'selected': value.id === item.type.id, 'selectable': canEditPending}"
        v-for="item in pendingTypes"
        :key="item.data[0].id">
        <div class="item-info">
          <div class="standard">
            <div class="name">{{ item.type.name }}</div>
            <div class="params">
              <span class="value-name">価格</span> <span class="value">{{ (isSell ? item.type.money / 2 : item.type.money) }}</span>
              <span class="value-name">数量</span> <span class="value">{{ item.count }}</span>
            </div>
            <div class="description">{{ item.type.description }}</div>
          </div>
        </div>
        <div v-if="canEditPending" class="select-cover" @click="$emit('input', item.type)"></div>
      </div>
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

class CharacterItemListItem {
  public get count(): number {
    return this.data.length;
  }

  public constructor(public type: def.CharacterItemType,
                     public data: api.CharacterItem[]) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class CharacterItemList extends Vue {
  @Prop() public items!: api.CharacterItem[];
  public itemTypes: CharacterItemListItem[] = [];
  public pendingTypes: CharacterItemListItem[] = [];
  @Prop({
    default: false,
  }) public canEdit!: boolean;
  @Prop({
    default: false,
  }) public canEditPending!: boolean;
  @Prop({
    default: false,
  }) public isShowPendings!: boolean;
  @Prop({
    default: false,
  }) public isSell!: boolean;
  @Prop({
    default: false,
  }) public isHandOver!: boolean;
  @Prop({
    default: () => new def.CharacterItemType(-1),
  }) public value!: def.CharacterItemType;

  @Watch('items')
  @Watch('isSell')
  @Watch('isHandOver')
  public onTypesChanged() {
    this.itemTypes = this.getItemTypes((i) => i.status !== api.CharacterItem.statusCharacterPending);
    this.pendingTypes = this.getItemTypes((i) => i.status === api.CharacterItem.statusCharacterPending);
  }

  private getItemTypes(subject: (item: api.CharacterItem) => boolean): CharacterItemListItem[] {
    return Enumerable.from(this.items)
      .where((i) => subject(i))
      .groupBy((i) => i.type)
      .join(
        def.CHARACTER_ITEM_TYPES,
        (ig) => ig.key(),
        (i) => i.id,
        (ig, it) => new CharacterItemListItem(it, ig.toArray()))
      .where((i) => this.isHandOver ? i.type.canHandOver : true)
      .where((i) => this.isSell ? i.type.canSell : true)
      .toArray();
  }
}
</script>

<style lang="scss" scoped>
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
        font-size: 1.6rem;
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
