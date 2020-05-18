<template>
  <div class="sub-building-list">
    <div :class="{'item': true, 'selected': subBuildingType.id === value.id, 'selectable': true}"
         v-for="subBuildingType in subBuildingTypes"
         :key="subBuildingType.id">
      <div class="skill-info">
        <div class="standard">
          <div class="name responsive-header">{{ subBuildingType.name }}</div>
          <div class="point"><span class="value-name">敷地</span> <span class="value">{{ subBuildingType.size }}</span><span class="value-name">金</span> <span class="value">{{ subBuildingType.money }}</span></div>
          <div class="description">{{ subBuildingType.description }}</div>
        </div>
        <div class="select-cover" @click="$emit('input', subBuildingType)"></div>
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
import StatusStore from '../../models/status/statusstore';

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SkillList extends Vue {
  public subBuildingTypes: def.TownSubBuildingType[] = [];

  @Prop({
    default: () => new StatusStore(),
  }) public store!: StatusStore;
  @Prop({
    default: () => new def.TownSubBuildingType(-1),
  }) public value!: def.TownSubBuildingType;
  @Prop({
    default: true,
  }) public isShowAll!: boolean;

  private mounted() {
    this.onStoreChanged();
  }

  @Watch('store')
  @Watch('isShowAll')
  private onStoreChanged() {
    if (!this.isShowAll) {
      this.subBuildingTypes = def.TOWN_SUB_BUILDING_TYPES
        .filter((t) => {
          if (t.needSkill) {
            if (typeof(t.needSkill) === 'number') {
              return this.store.skills.some((s) => s.type === t.needSkill);
            } else {
              return t.needSkill.some((ns) => this.store.skills.some((s) => s.type === ns));
            }
          }
          return true;
        });
    } else {
      this.subBuildingTypes = def.TOWN_SUB_BUILDING_TYPES;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/country-color.scss';

.sub-building-list {
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

    .skill-info {
      .name {
        flex: 1;
      }

      .description {
        color: #666;
        padding-left: 12px;
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
