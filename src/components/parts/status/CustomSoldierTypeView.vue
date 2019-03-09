<template>
  <div id="soldier-list-view" class="loading-container" style="overflow:auto">
    <div class="select-types">
      <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" @click="isOpenSoliderDropdown = !isOpenSoliderDropdown">兵種を選択</button>
        <div class="dropdown-menu" :style="{ 'display': isOpenSoliderDropdown ? 'block' : 'none' }">
          <a class="dropdown-item"
             href="#"
             v-for="type in model.types"
             :key="type.id"
             @click.prevent.stop="isOpenSoliderDropdown = false; select(type)">
             {{ type.name }}
          </a>
        </div>
        <button class="btn btn-primary" @click="createNew()">新規作成</button>
      </div>
    </div>
    <div v-if="selectedType && selectedType.status" class="edit-type">
      <h3>{{ selectedType.name }}</h3>
      <div class="data-row">
        <div class="label">雑兵</div>
        <div class="value">{{ selectedType.commonSoldier }}</div>
      </div>
      <div class="data-row">
        <div class="label">軽歩兵</div>
        <div class="value">{{ selectedType.lightInfantory }}</div>
      </div>
      <div class="data-row">
        <div class="label">弓兵</div>
        <div class="value">{{ selectedType.archer }}</div>
      </div>
      <div class="data-row">
        <div class="label">軽騎兵</div>
        <div class="value">{{ selectedType.lightCavalry }}</div>
      </div>
      <div class="data-row">
        <div class="label">強弩兵</div>
        <div class="value">{{ selectedType.strongCrossbow }}</div>
      </div>
      <div class="data-row">
        <div class="label">神鬼兵</div>
        <div class="value">{{ selectedType.lightIntellect }}</div>
      </div>
      <div class="data-row">
        <div class="label">重歩兵</div>
        <div class="value">{{ selectedType.heavyInfantory }}</div>
      </div>
      <div class="data-row">
        <div class="label">重騎兵</div>
        <div class="value">{{ selectedType.heavyCavalry }}</div>
      </div>
      <div class="data-row">
        <div class="label">智攻兵</div>
        <div class="value">{{ selectedType.intellect }}</div>
      </div>
      <div class="data-row">
        <div class="label">連弩兵</div>
        <div class="value">{{ selectedType.repeatingCrossbow }}</div>
      </div>
      <div class="data-row">
        <div class="label">壁守兵</div>
        <div class="value">{{ selectedType.strongGuards }}</div>
      </div>
      <div class="data-row">
        <div class="label">井闌</div>
        <div class="value">{{ selectedType.seiran }}</div>
      </div>
      <div class="data-row">
        <div class="label">兵1あたり金</div>
        <div class="result">{{ money }}</div>
      </div>
      <div class="data-row">
        <div class="label">徴兵に必要な技術</div>
        <div class="result">{{ technology }}</div>
      </div>
      <div class="data-row">
        <div class="label">研究コスト残り</div>
        <div class="value">{{ selectedType.researchCost }}</div>
      </div>
    </div>
    <div v-if="selectedType && !selectedType.status" class="edit-type">
      <h3>{{ selectedType.name }}</h3>
      <div class="data-row">
        <div class="label">名前</div>
        <div class="value"><input type="text" v-model="selectedType.name"></div>
      </div>
      <div v-show="selectedType.name.length > 10" class="alert alert-warning">
        文字数は10以下にしてください（現在：{{ selectedType.name.length }}）
      </div>
      <div class="data-row">
        <div class="label">雑兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.commonSoldier"></div>
      </div>
      <div class="data-row">
        <div class="label">軽歩兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.lightInfantory"></div>
      </div>
      <div class="data-row">
        <div class="label">弓兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.archer"></div>
      </div>
      <div class="data-row">
        <div class="label">軽騎兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.lightCavalry"></div>
      </div>
      <div class="data-row">
        <div class="label">強弩兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.strongCrossbow"></div>
      </div>
      <div class="data-row">
        <div class="label">神鬼兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.lightIntellect"></div>
      </div>
      <div class="data-row">
        <div class="label">重歩兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.heavyInfantory"></div>
      </div>
      <div class="data-row">
        <div class="label">重騎兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.heavyCavalry"></div>
      </div>
      <div class="data-row">
        <div class="label">智攻兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.intellect"></div>
      </div>
      <div class="data-row">
        <div class="label">連弩兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.repeatingCrossbow"></div>
      </div>
      <div class="data-row">
        <div class="label">壁守兵</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.strongGuards"></div>
      </div>
      <div class="data-row">
        <div class="label">井闌</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="selectedType.seiran"></div>
      </div>
      <div class="data-row">
        <div class="label">兵1あたり金</div>
        <div class="result">{{ money }}</div>
      </div>
      <div class="data-row">
        <div class="label">徴兵に必要な技術</div>
        <div class="result">{{ technology }}</div>
      </div>
      <div class="data-row">
        <div class="label">研究費用（概算）</div>
        <div class="result">{{ researchMoney }}</div>
      </div>
      <div class="data-row">
        <div class="label">研究コスト（概算）</div>
        <div class="result">{{ researchCost }}</div>
      </div>
      <div class="alert alert-warning">
        合計が 10 - 15 になるようにしてください。国家研究で合計が増えている場合は、それにあわせてください（ごめんまだ画面側のチェック処理が追いつかないｗ）
      </div>
      <div class="buttons">
        <button type="button" class="btn btn-light" @click="cancel()">キャンセル</button>
        <button type="button" class="btn btn-primary" @click="save()">保存</button>
      </div>
    </div>
    <div class="loading" v-show="model.isUpdating"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import SoldierTypeModel from '@/models/status/soldiertypemodel';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as def from '@/common/definitions';
import Enumerable from 'linq';

@Component({
  components: {
  },
})
export default class CustomSoldierTypeView extends Vue {
  @Prop() private model!: SoldierTypeModel;
  @Prop() private buildingSize!: number;
  private isOpenSoliderDropdown: boolean = false;
  private selectedType: api.CharacterSoldierType = new api.CharacterSoldierType();
  private isNew: boolean = true;

  private get money(): number {
    return api.CharacterSoldierType.getMoney(this.selectedType);
  }

  private get technology(): number {
    return api.CharacterSoldierType.getTechnology(this.selectedType);
  }

  private get researchMoney(): number {
    return api.CharacterSoldierType.getResearchMoney(this.selectedType, this.buildingSize);
  }

  private get researchCost(): number {
    return api.CharacterSoldierType.getResearchCost(this.selectedType, this.buildingSize);
  }

  public constructor() {
    super();
    this.selectedType.name = '新規';
  }

  private select(type: api.CharacterSoldierType) {
    this.selectedType = type;
    this.isNew = false;
  }

  private createNew() {
    this.selectedType = new api.CharacterSoldierType();
    this.selectedType.name = '新規';
    this.isNew = true;
  }

  private save() {
    this.model.save(this.selectedType, (result) => {
      if (this.isNew) {
        this.selectedType = result;
        this.isNew = false;
      }
    });
  }

  private cancel() {
    if (this.isNew || !this.selectedType.id) {
      this.createNew();
    } else {
      const old = Enumerable
        .from(this.model.types)
        .firstOrDefault((t) => t.id === this.selectedType.id);
      if (old) {
        this.select(old);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#soldier-list-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .select-types {
    button {
      margin-right: 8px;
    }
  }

  .edit-type {
    flex: 1;
    padding-top: 16px;
    overflow: auto;

    .data-row {
      display: flex;
      align-items: center;
      margin: 8px 0;

      .label {
        width: 30%;
      }

      .value {
        flex: 1;
        input {
          width: 100%;
          font-size: 1.4em;
          padding-left: 8px;
          &[type=number] {
            max-width: 8em;
            text-align: center;
          }
        }
      }
    }

    .buttons {
      text-align: right;
      margin-top: 32px;
      button {
        margin-left: 8px;
      }
    }
  }
}
</style>
