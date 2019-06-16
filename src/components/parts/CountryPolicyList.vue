<template>
  <div class="policy-list">
    <h2 v-show="(canEdit || isMyCountry) && policyTypes.length > 0">現在の政策</h2>
    <div
      :class="{'item': true}"
      v-for="policy in policyTypes"
      :key="policy.id">
      <div class="policy-info">
        <div class="standard">
          <div class="name responsive-header">{{ policy.name }}</div>
          <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ policy.point }}</span></div>
          <div class="description">{{ policy.description }}</div>
        </div>
      </div>
    </div>
    <div v-show="(canEdit || isMyCountry) && newPolicies.length > 0" style="margin-top:48px">
      <h2>追加可能な政策</h2>
      <h3>残りポイント: {{ country.policyPoint }}</h3>
      <div
        :class="{'item': true, 'selected': value.id === policy.type.id, 'selectable': canEdit}"
        v-for="policy in newPolicies"
        :key="policy.id">
        <div class="policy-info">
          <div class="standard">
            <div class="name responsive-header">{{ policy.type.name }}</div>
            <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ policy.requestedPoint }}</span> <span v-if="policy.isBoosted" class="boosted">[ブースト]</span></div>
            <div class="description">{{ policy.type.description }}</div>
          </div>
        </div>
        <div v-if="canEdit" class="select-cover" @click="$emit('input', policy.type)"></div>
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

class CountryPolicyListItem {
  public get requestedPoint(): number {
    if (this.data && this.data.status === api.CountryPolicy.statusBoosted) {
      return this.type.point / 2;
    }
    return this.type.point;
  }

  public get isBoosted(): boolean {
    if (this.data) {
      return this.data.status === api.CountryPolicy.statusBoosted;
    }
    return false;
  }

  public constructor(public type: def.CountryPolicyType,
                     public data?: api.CountryPolicy) {}
}

@Component({
  components: {
    CharacterIcon,
  },
})
export default class CountryPolicyList extends Vue {
  @Prop() public country!: api.Country;
  @Prop() public policies!: api.CountryPolicy[];
  public policyTypes: def.CountryPolicyType[] = [];
  public newPolicies: CountryPolicyListItem[] = [];
  @Prop({
    default: false,
  }) public canEdit!: boolean;
  @Prop({
    default: () => new def.CountryPolicyType(-1),
  }) public value!: def.CountryPolicyType;
  @Prop({
    default: false,
  }) public isMyCountry!: boolean;

  @Watch('policies')
  public onTypesChanged() {
    this.policyTypes = Enumerable.from(this.policies)
      .where((p) => p.status === api.CountryPolicy.statusAvailable)
      .join(def.COUNTRY_POLICY_TYPES, (p) => p.type, (p) => p.id, (pd, pt) => pt)
      .toArray();
    this.newPolicies = Enumerable.from(def.COUNTRY_POLICY_TYPES)
      .where((p) => !Enumerable
        .from(this.policies)
        .any((pp) => pp.type === p.id && pp.status === api.CountryPolicy.statusAvailable))
      .where((p) => p.canGet)
      .where((p) => p.subjectAppear === undefined || p.subjectAppear(this.policies))
      .select((p) => {
        const data = Enumerable
          .from(this.policies)
          .firstOrDefault((pp) => pp.type === p.id && pp.status === api.CountryPolicy.statusBoosted);
        return new CountryPolicyListItem(p, data);
      })
      .toArray();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
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
        .boosted {
          padding-left: 8px;
          color: #2af;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
