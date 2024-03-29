<template>
  <div class="formation-list">
    <h2>現在の陣形</h2>
    <div class="item">
      <div class="formation-info">
        <div class="standard">
          <div class="name responsive-header">{{ currentFormationTypeInfo.name }}</div>
            <div v-show="isShowChangePoint" class="point">
              <!-- <span class="value-name">属性</span> <span class="value">{{ currentFormationTypeInfo.type }}</span> -->
              <span class="value-name">レベル</span> <span class="value">{{ currentFormation.level }}</span>
              <span class="value-name">Ex</span> <span class="value">{{ currentFormation.experience }}</span>
            </div>
          <div :class="{ 'description': true, 'current': currentFormation.level - 1 === index }"
               v-for="(description, index) in currentFormationTypeInfo.descriptions"
               :key="description"><span v-if="currentFormation.level - 1 === index">現在の効果 ＞ </span>{{ currentFormationTypeInfo.descriptions[index] }}</div>
        </div>
      </div>
    </div>
    <div v-show="canChange && selectableFormationTypes.length > 0" style="margin-top:48px">
      <h2>変更可能な陣形</h2>
      <div
        :class="{'item': true, 'selected': value.id === formation.type.id, 'selectable': true}"
        v-for="formation in selectableFormationTypes"
        :key="formation.type.id">
        <div class="formation-info">
          <div class="standard">
            <div class="name responsive-header">{{ formation.type.name }}</div>
            <div v-show="isShowChangePoint" class="point">
              <!-- <span class="value-name">属性</span> <span class="value">{{ formation.type.type }}</span> -->
              <span class="value-name">レベル</span> <span class="value">{{ formation.data.level }}</span>
              <span class="value-name">Ex</span> <span class="value">{{ formation.data.experience }}</span>
            </div>
            <div :class="{ 'description': true, 'current': formation.data.level - 1 === index }"
                v-for="(description, index) in formation.type.descriptions"
                :key="description"><span v-if="formation.data.level - 1 === index">現在の効果 ＞ </span>{{ formation.type.descriptions[index] }}</div>
          </div>
        </div>
        <div class="select-cover" @click="$emit('input', formation.type)"></div>
      </div>
    </div>
    <div v-show="canAdd && newFormationTypes.length > 0" style="margin-top:48px">
      <h2>追加可能な陣形</h2>
      <div class="alert alert-warning">
        陣形は <strong>{{ formationMax }}</strong> まで獲得できます (現在 <strong>{{ currentFormationCount }}</strong> )
      </div>
      <div
        :class="{'item': true, 'selected': canAddSelect && value.id === formation.id, 'selectable': canAddSelect}"
        v-for="formation in newFormationTypes"
        :key="formation.id">
        <div class="formation-info">
          <div class="standard">
            <div class="name responsive-header">{{ formation.name }}</div>
            <!-- <div class="point"><span class="value-name">属性</span> <span class="value">{{ formation.type }}</span></div> -->
            <div :class="{ 'description': true, 'current': 0 === index }"
                v-for="(description, index) in formation.descriptions"
                :key="description"><span v-if="0 === index">現在の効果 ＞ </span>{{ formation.descriptions[index] }}</div>
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
  @Prop({
    default: () => [],
  }) public skills!: api.CharacterSkill[];

  public get currentFormationCount(): number {
    const defaultFormation = def.FORMATION_TYPES[0];
    return this.formations.filter((f) => f.type !== defaultFormation.id).length;
  }

  public get formationMax(): number {
    return this.skills.some((s) => s.type === 36) ? 4 : 2;
  }

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
      .orderBy((f) => f.type)
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

  private created() {
    this.onFormationChanged();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
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
        flex: 1;
      }

      .description {
        color: #999;
        padding-left: 24px;

        &.current {
          color: #666;
          font-weight: bold;
          padding-left: 12px;
        }
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
