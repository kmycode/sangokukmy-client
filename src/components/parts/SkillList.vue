<template>
  <div class="skill-list">
    <div class="item">
      <div class="skill-info"
           v-for="skill in skillTypes"
           :key="skill.type.id">
        <div class="standard">
          <div class="name">{{ skill.type.name }}</div>
          <div class="description">{{ skill.type.description }}</div>
        </div>
      </div>
    </div>
    <div v-show="newSkillTypes.length > 0" style="margin-top:48px">
      <h2>獲得可能な技能</h2>
      <h3>残りポイント: {{ skillPoint }}</h3>
      <div
        :class="{'item': true, 'selected': value.id === skill.id, 'selectable': true}"
        v-for="skill in newSkillTypes"
        :key="skill.id">
        <div class="skill-info">
          <div class="standard">
            <div class="name">{{ skill.name }}</div>
            <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ skill.point }}</span></div>
            <div class="description">{{ skill.description }}</div>
          </div>
        </div>
        <div class="select-cover" @click="$emit('input', skill)"></div>
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

class SkillListItem {
  public constructor(public type: def.CharacterSkillType,
                     public data: api.CharacterSkill) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class SkillList extends Vue {
  @Prop() public skillPoint!: number;
  @Prop() public skills!: api.CharacterSkill[];
  public skillTypes: SkillListItem[] = [];
  public newSkillTypes: def.CharacterSkillType[] = [];

  @Prop({
    default: () => new def.CharacterSkillType(-1),
  }) public value!: def.CharacterSkillType;

  @Watch('skills')
  public onTypesChanged() {
    this.skillTypes = Enumerable
      .from(this.skills)
      .select((s) => new SkillListItem(
        Enumerable.from(def.CHARACTER_SKILL_TYPES).firstOrDefault((ss) => ss.id === s.type),
        s))
      .toArray();
    this.newSkillTypes = Enumerable
      .from(def.CHARACTER_SKILL_TYPES)
      .where((s) => !Enumerable.from(this.skillTypes).any((ss) => ss.type.id === s.id))
      .where((s) => s.subjectAppear === undefined || s.subjectAppear(this.skills))
      .toArray();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.skill-list {
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
