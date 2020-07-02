<template>
  <div class="queue-list">
    <div :class="{'item': true, 'selected': value.id === queue.data.id, 'selectable': false}"
         v-for="queue in queues"
         :key="queue.data.id">
      <div class="queue-info">
        <div class="standard">
          <div class="name responsive-header">{{ queue.header }}<span class="queue" v-show="!queue.data.isQueue">実行中</span></div>
          <div class="point" v-show="!queue.data.isQueue"><span class="value-name">開始</span> <span class="value">{{ queue.data.appearGameDateTime.year }} 年 {{ queue.data.appearGameDateTime.month }} 月</span></div>
          <div class="description">{{ queue.description }}</div>
        </div>
      </div>
      <div class="select-cover" @click="$emit('input', queue.data)"></div>
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

class QueueListItem {
  public constructor(public header: string,
                     public description: string,
                     public data: api.DelayEffect) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SkillList extends Vue {
  @Prop() public delayEffects!: api.DelayEffect[];
  @Prop() public towns!: api.Town[];
  @Prop({
    default: () => new api.DelayEffect(),
  }) public value!: api.DelayEffect;
  private queues: QueueListItem[] = [];

  @Watch('delayEffects')
  public onTypesChanged() {
    this.queues = [];
    this.delayEffects.forEach((d) => {
      if (d.type === 1) {
        // 都市投資
        const towns = this.towns.filter((t) => t.id === d.townId);
        if (towns.length > 0) {
          const town = towns[0];
          this.queues.push(new QueueListItem(town.name + ' 都市投資', '都市 ' + town.name + ' で都市投資をおこないます', d));
        }
      } else if (d.type === 3) {
        // アイテム生産
        const items = def.CHARACTER_ITEM_TYPES.filter((it) => it.id === d.typeData);
        if (items.length > 0) {
          const item = items[0];
          this.queues.push(new QueueListItem(item.name + ' 生産', 'アイテム「' + item.name + '」を生産します', d));
        }
      }
    });
  }

  public mounted() {
    this.onTypesChanged();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/country-color.scss';

.queue-list {
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

    .queue-info {
      .name {
        flex: 1;
      }

      .description {
        color: #666;
        padding-left: 12px;
      }

      .queue {
        display: inline-block;
        font-size: 12px;
        background: #b67c5b;
        color: white;
        font-weight: bold;
        margin-left: 16px;
        width: 56px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 8px;
      }

      .point {
        padding-left: 12px;
        .value-name {
          color: #969;
        }
        .value {
          font-weight: bold;
          padding-left: 4px;
          padding-right: 16px;
        }
      }
    }
  }
}
</style>
