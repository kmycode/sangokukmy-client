<template>
  <div class="policy-list">
    <h2 v-show="canEdit && policyTypes.length > 0">現在の政策</h2>
    <div
      :class="{'item': true}"
      v-for="policy in policyTypes"
      :key="policy.id">
      <div class="policy-info">
        <div class="standard">
          <div class="name">{{ policy.name }}</div>
          <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ policy.point }}</span></div>
          <div class="description">{{ policy.description }}</div>
        </div>
      </div>
    </div>
    <div v-show="canEdit && newPolicyTypes.length > 0" style="margin-top:48px">
      <h2>追加可能な政策</h2>
      <h3>残りポイント: {{ country.policyPoint }}</h3>
      <div
        :class="{'item': true, 'selected': value.id === policy.id, 'selectable': true}"
        v-for="policy in newPolicyTypes"
        :key="policy.id">
        <div class="policy-info">
          <div class="standard">
            <div class="name">{{ policy.name }}</div>
            <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ policy.point }}</span></div>
            <div class="description">{{ policy.description }}</div>
          </div>
        </div>
        <div v-if="canEdit" class="select-cover" @click="$emit('input', policy)"></div>
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

@Component({
  components: {
    CharacterIcon,
  },
})
export default class CountryPolicyList extends Vue {
  @Prop() public country!: api.Country;
  @Prop() public policyTypes!: def.CountryPolicyType[];
  public newPolicyTypes: def.CountryPolicyType[] = [];
  @Prop({
    default: false,
  }) public canEdit!: boolean;
  @Prop({
    default: () => new def.CountryPolicyType(-1),
  }) public value!: def.CountryPolicyType;

  @Watch('policyTypes')
  public onTypesChanged() {
    this.newPolicyTypes = Enumerable.from(def.COUNTRY_POLICY_TYPES)
      .where((p) => !Enumerable.from(this.policyTypes).any((pp) => pp.id === p.id))
      .toArray();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';

.policy-list {
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

    .policy-info {
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
          padding-left: 12px;
        }
      }
    }
  }
}
</style>
