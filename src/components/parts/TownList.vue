<template>
  <div id="parts-town-list-wrapper">
    <div id="parts-town-list">
      <div
          v-for="t in townItems"
          :key="t.id"
          :class="'town-item country-color-' + t.colorId + (town.id === t.id ? ' selected' : '')"
          @click="$emit('selected', t.id)">
        <div :class="'town-name country-color-' + t.colorId">{{ t.name }}</div>
        <div v-if="t.hasParameters" class="parameters-wrapper">
          <StatusParametersPanel :parameters="t.parameters"/>
        </div>
        <div v-if="t.characters.length > 0" class="characters-row">
          <div class="characters-label">滞在</div>
          <MiniCharacterList :countries="store.countries" :characters="t.characters"/>
        </div>
        <div v-if="t.defenders.length > 0" class="characters-row">
          <div class="characters-label">守備</div>
          <MiniCharacterList :countries="store.countries" :characters="t.defenders"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import Enumerable from 'linq';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import StatusStore from '@/models/status/statusstore';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import StatusParametersPanel from '@/components/parts/StatusParameters.vue';
import { StatusParameter,
  NoRangeStatusParameter,
  RangedStatusParameter,
  TextStatusParameter,
  CharacterIconStatusParameter,
  TwinNoRangeAndRangedStatusParameter,
  NoRangeDelayStatusParameter,
  TwinTextAndRangedStatusParameter,
  LargeTextStatusParameter,
} from '@/models/status/statusparameter';

class TownItem {
  public id: number;
  public name: string;
  public parameters: StatusParameter[];
  public characters: api.Character[];
  public defenders: api.Character[];
  public colorId: number;
  public get isEmpty(): boolean {
    return this.parameters.length === 0 && this.characters.length === 0;
  }
  public get hasParameters(): boolean {
    return this.parameters.length > 0;
  }
  public constructor(town: api.TownBase, store: StatusStore) {
    this.id = town.id;
    this.name = town.name;
    this.characters = Enumerable
      .from(store.characters)
      .where((c) => c.townId === town.id && c.countryId === store.character.countryId)
      .toArray();

    const country = Enumerable
      .from(store.countries)
      .firstOrDefault((c) => c.id === town.countryId);
    if (country) {
      this.colorId = country.colorId;
    } else {
      this.colorId = 0;
    }

    if (town.countryId === store.character.countryId) {
      this.defenders = Enumerable
        .from(store.defenders)
        .where((d) => d.townId === town.id)
        .join(store.characters, (d) => d.characterId, (c) => c.id, (d, c) => c)
        .toArray();
      this.parameters = [];
      this.parameters.push(new NoRangeStatusParameter('相場', Math.round(town.ricePrice * 1000) / 1000));
      this.parameters.push(new NoRangeStatusParameter('農民', town.people));
      this.parameters.push(new RangedStatusParameter('民忠', town.security, 100));
      this.parameters.push(new RangedStatusParameter('農業', town.agriculture, town.agricultureMax));
      this.parameters.push(new RangedStatusParameter('商業', town.commercial, town.commercialMax));
      this.parameters.push(new RangedStatusParameter('技術', town.technology, town.technologyMax));
      this.parameters.push(new RangedStatusParameter('城壁', town.wall, town.wallMax));
      const townBuilding = Enumerable
        .from(def.TOWN_BUILDINGS)
        .firstOrDefault((b) => b.id === town.townBuilding);
      if (townBuilding && townBuilding.id) {
        this.parameters.push(new TwinTextAndRangedStatusParameter(
          '都市施設', townBuilding.name, '耐久', town.townBuildingValue, 2000));
      }
    } else {
      this.parameters = [];
      this.defenders = [];
    }
  }
}

@Component({
  components: {
    MiniCharacterList,
    StatusParametersPanel,
  },
})
export default class TownList extends Vue {
  @Prop({
    default: () => new api.Town(-1),
  }) public town!: api.Town;
  @Prop() public store!: StatusStore;

  private get townItems(): TownItem[] {
    return Enumerable
      .from(this.store.towns)
      .orderBy((t) => t.countryId === this.store.character.countryId ? 0 : 1)
      .select((t) => new TownItem(t, this.store))
      .where((t) => !t.isEmpty)
      .toArray();
  }

  private isSelected(current: api.Town): boolean {
    return this.town.id === current.id;
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/country-color.scss';

#parts-town-list-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  #parts-town-list {
    width: 100%;
    height: 100%;
    padding: 8px 12px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;

    .town-item {
      width: 1000px;
      margin: 8px 0;
      transition: background-color .2s;
      cursor: pointer;

      &.selected {
        background-color: rgba(0, 0, 0, 0.14);
      }

      .town-name {
        position: sticky;
        left: 0;
        padding: 4px 8px;
        width: 8em;
        font-size: 16px;
        @include country-color-deep('background-color');
        @include country-color-light('color');
      }

      .characters-row {
        display: flex;

        .characters-label {
          align-self: flex-end;
          position: sticky;
          left: 0;
          margin-right: 12px;
          padding: 4px;
          background-color: rgba(0, 0, 0, 0.64);
          border-radius: 8px;
          color: white;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
