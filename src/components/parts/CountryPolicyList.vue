<template>
  <div class="policy-list">
    <div class="buttons">
      <button :class="{'btn': true, 'btn-secondary': category === 0, 'btn-outline-secondary': category !== 0,}" @click="category = 0">郡県制</button>
      <button :class="{'btn': true, 'btn-secondary': category === 1, 'btn-outline-secondary': category !== 1,}" @click="category = 1">経済</button>
      <button :class="{'btn': true, 'btn-secondary': category === 2, 'btn-outline-secondary': category !== 2,}" @click="category = 2">人材</button>
      <button :class="{'btn': true, 'btn-secondary': category === 4, 'btn-outline-secondary': category !== 4,}" @click="category = 4">軍事</button>
      <button :class="{'btn': true, 'btn-secondary': category === 5, 'btn-outline-secondary': category !== 5,}" @click="category = 5">宗教</button>
      <button :class="{'btn': true, 'btn-secondary': category === 3, 'btn-outline-secondary': category !== 3,}" @click="category = 3">特殊</button>
    </div>
    <div class="contents">
      <h3 v-show="(canEdit || isMyCountry) && currentAvailablePolicies.length > 0" class="already-policies">現在の政策</h3>
      <div
        class="item item-available"
        v-for="policy in currentAvailablePolicies"
        :key="policy.type.id">
        <div class="policy-info">
          <div class="standard">
            <div class="name responsive-header">{{ policy.type.name }}</div>
            <div v-if="policy.type.availableDuring > 0 && policy.data.status === 4" class="point"><span class="value-name">期限</span> <span class="value">{{ getPolicyLimit(policy).year }} 年 {{ getPolicyLimit(policy).month }} 月</span></div>
            <div class="description">{{ policy.type.description }}</div>
          </div>
        </div>
      </div>
      <div v-show="(canEdit || isMyCountry) && currentSelectablePolicies.length > 0">
        <h3 class="rest-point">残りポイント: {{ country.policyPoint }}</h3>
        <div
          :class="{'item': true, 'selected': value.id === policy.type.id, 'selectable': canEdit, 'item-selectable': true}"
          v-for="policy in currentSelectablePolicies"
          :key="policy.type.id">
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
      <div v-show="(canEdit || isMyCountry) && currentAfterPolicies.length > 0">
        <h3 class="after-description">前提政策の取得が必要</h3>
        <div
          class="item item-after"
          v-for="policy in currentAfterPolicies"
          :key="policy.type.id">
          <div class="policy-info">
            <div class="standard">
              <div class="name responsive-header">{{ policy.type.name }}</div>
              <div class="point"><span class="value-name">ポイント</span> <span class="value">{{ policy.requestedPoint }}</span> <span v-if="policy.isBoosted" class="boosted">[ブースト]</span></div>
              <div v-if="policy.type.specialGetSubject" class="point"><span class="value-name">取得条件</span> <span class="value">{{ policy.type.specialGetSubject }}</span> <span v-if="policy.isBoosted" class="boosted">[ブースト]</span></div>
              <div class="description">{{ policy.type.description }}</div>
            </div>
          </div>
          <div v-if="canEdit" class="select-cover" @click="$emit('input', policy.type)"></div>
        </div>
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
  public category: number = 0;
  public availablePolicies: CountryPolicyListItem[] = [];
  public selectablePolicies: CountryPolicyListItem[] = [];
  public afterPolicies: CountryPolicyListItem[] = [];
  public currentAvailablePolicies: CountryPolicyListItem[] = [];
  public currentSelectablePolicies: CountryPolicyListItem[] = [];
  public currentAfterPolicies: CountryPolicyListItem[] = [];
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
    const policiesAvailable = this.policies.filter((p) => p.status === api.CountryPolicy.statusAvailable ||
                                                          p.status === api.CountryPolicy.statusAvailabling);
    const policiesNotAvailable = this.policies.filter((p) => p.status !== api.CountryPolicy.statusAvailable);

    this.availablePolicies = Enumerable.from(def.COUNTRY_POLICY_TYPES)
      .join(policiesAvailable, (p) => p.id, (p) => p.type, (pt, pd) => new CountryPolicyListItem(pt, pd))
      .toArray();
    this.selectablePolicies = Enumerable.from(def.COUNTRY_POLICY_TYPES)
      .where((p) => !policiesAvailable.some((pp) => pp.type === p.id) && p.canGet)
      .where((p) => !p.subjectAppear || p.subjectAppear(policiesAvailable))
      .groupJoin(policiesNotAvailable,
        (p) => p.id, (p) => p.type, (p, ps) => new CountryPolicyListItem(p, ps.firstOrDefault()))
      .toArray();
    this.afterPolicies = Enumerable.from(def.COUNTRY_POLICY_TYPES)
      .where((p) => (p.subjectAppear ? !p.subjectAppear(policiesAvailable) : false) && p.canGet)
      .groupJoin(policiesNotAvailable,
        (p) => p.id, (p) => p.type, (p, ps) => new CountryPolicyListItem(p, ps.firstOrDefault()))
      .toArray();

    this.currentAvailablePolicies = this.availablePolicies;
    this.currentSelectablePolicies = this.selectablePolicies;
    this.currentAfterPolicies = this.afterPolicies;

    this.onCategoryChanged();
  }

  @Watch('category')
  public onCategoryChanged() {
    this.currentAvailablePolicies = this.availablePolicies.filter((p) => p.type.category === this.category);
    this.currentSelectablePolicies = this.selectablePolicies.filter((p) => p.type.category === this.category);
    this.currentAfterPolicies = this.afterPolicies.filter((p) => p.type.category === this.category);
  }

  private getPolicyLimit(policy: CountryPolicyListItem): api.GameDateTime {
    if (policy.data && policy.data.status === api.CountryPolicy.statusAvailabling) {
      return api.GameDateTime.fromNumber(
        api.GameDateTime.toNumber(policy.data.gameDate) + policy.type.availableDuring);
    }
    return new api.GameDateTime();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/country-color.scss';

.policy-list {
  display: flex;
  flex-direction: column;
  height: 100%;

  .contents {
    flex: 1;
    overflow: auto;
  }

  .already-policies, .rest-point, .after-description {
    background: #c3c4c9;
    border-radius: 8px;
    margin: 16px 0 0;
    font-size: 1.2em;
    padding: 4px 8px;
  }

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

    &.item-available {
      background: #efffef;
    }

    &.item-after {
      color: #aaa;
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
