<template>
  <div class="formation-list">
    <h2>現在の陣形</h2>
    <div class="item">
      <div class="formation-info">
        <div class="standard">
          <div class="name">{{ currentFormationTypeInfo.name }}</div>
            <div v-show="isShowChangePoint" class="point">
              <span class="value-name">レベル</span> <span class="value">{{ currentFormation.level }}</span>
              <span class="value-name">Ex</span> <span class="value">{{ currentFormation.experience }}</span>
            </div>
          <div class="description">{{ currentFormationTypeInfo.descriptions[currentFormation.level - 1] }}</div>
        </div>
      </div>
    </div>
    <div v-show="canChange && selectableFormationTypes.length > 0" style="margin-top:48px">
      <h2>変更可能な陣形</h2>
      <h3 v-show="isShowChangePoint">残りポイント: {{ formationPoint }}</h3>
      <div
        :class="{'item': true, 'selected': value.id === formation.type.id, 'selectable': true}"
        v-for="formation in selectableFormationTypes"
        :key="formation.type.id">
        <div class="formation-info">
          <div class="standard">
            <div class="name">{{ formation.type.name }}</div>
            <div v-show="isShowChangePoint" class="point">
              <span class="value-name">ポイント</span> <span class="value">50</span>
              <span class="value-name">レベル</span> <span class="value">{{ formation.data.level }}</span>
              <span class="value-name">Ex</span> <span class="value">{{ formation.data.experience }}</span>
            </div>
            <div class="description">{{ formation.type.descriptions[formation.data.level - 1] }}</div>
          </div>
        </div>
        <div class="select-cover" @click="$emit('input', formation.type)"></div>
      </div>
    </div>
    <div v-show="canAdd && newFormationTypes.length > 0" style="margin-top:48px">
      <h2>追加可能な陣形</h2>
      <h3>残りポイント: {{ formationPoint }}</h3>
      <div
        :class="{'item': true, 'selected': canAddSelect && value.id === formation.id, 'selectable': canAddSelect}"
        v-for="formation in newFormationTypes"
        :key="formation.id">
        <div class="formation-info">
          <div class="standard">
            <div class="name">{{ formation.name }}</div>
            <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ formation.point }}</span></div>
            <div class="description">{{ formation.descriptions[0] }}</div>
          </div>
        </div>
        <div class="select-cover" @click="$emit('input', formation)"></div>
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

class FormationListItem {
  public constructor(public type: def.FormationType,
                     public data: api.Formation) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class FormationList extends Vue {
  @Prop() public formationPoint!: number;
  @Prop() public currentFormationType!: number;
  @Prop() public formations!: api.Formation[];
  public formationTypes: def.FormationType[] = [];
  public selectableFormationTypes: FormationListItem[] = [];
  public newFormationTypes: def.FormationType[] = [];
  public currentFormation: api.Formation = new api.Formation(-1);
  public currentFormationTypeInfo: def.FormationType = new def.FormationType(-1);
  @Prop({
    default: () => new def.FormationType(-1),
  }) public value!: def.FormationType;
  @Prop({
    default: true,
  }) public canChange!: boolean;
  @Prop({
    default: true,
  }) public isShowChangePoint!: boolean;
  @Prop({
    default: true,
  }) public canAdd!: boolean;
  @Prop({
    default: true,
  }) public canAddSelect!: boolean;

  @Watch('formations')
  @Watch('currentFormationType')
  public onFormationChanged() {
    this.formationTypes = Enumerable
      .from(this.formations)
      .select((p) => Enumerable.from(def.FORMATION_TYPES).firstOrDefault((pp) => pp.id === p.type))
      .toArray();
    this.selectableFormationTypes = Enumerable
      .from(this.formations)
      .where((f) => f.type !== this.currentFormationType)
      .join(def.FORMATION_TYPES, (f) => f.type, (f) => f.id, (fd, fi) => new FormationListItem(fi, fd))
      .toArray();
    this.newFormationTypes = Enumerable
      .from(def.FORMATION_TYPES)
      .where((f) => !Enumerable.from(this.formationTypes).any((ff) => ff.id === f.id))
      .where((f) => f.canGet)
      .where((f) => f.subjectAppear === undefined || f.subjectAppear(this.formations))
      .toArray();
    this.currentFormation = Enumerable
      .from(this.formations)
      .firstOrDefault((f) => f.type === this.currentFormationType);
    this.currentFormationTypeInfo = Enumerable
      .from(def.FORMATION_TYPES)
      .firstOrDefault((f) => f.id === this.currentFormationType);
    if (!this.currentFormationTypeInfo) {
      this.currentFormationTypeInfo = Enumerable.from(def.FORMATION_TYPES).first((f) => f.id === 0);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.formation-list {
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

    .formation-info {
      .name {
        font-size: 1.6rem;
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
