<template>
  <div id="soldier-list-view" class="loading-container" style="overflow:auto">
    <h2>設定</h2>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">試行回数</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="battleCount"></div>
      </div>
    </div>
    <h2>攻撃側</h2>
    <h3>武将</h3>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">武力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.strong"></div>
      </div>
      <div class="data-row">
        <div class="label">知力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.intellect"></div>
      </div>
      <div class="data-row">
        <div class="label">兵士小隊数</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.soldierNumber"></div>
      </div>
      <div class="data-row">
        <div class="label">訓練</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.proficiency"></div>
      </div>
    </div>
    <h3>兵種</h3>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">基本攻撃力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.baseAttack"></div>
      </div>
      <div class="data-row">
        <div class="label">基本防御力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.baseDefend"></div>
      </div>
      <div class="data-row">
        <div class="label">知力攻撃力 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.intellectAttack"></div>
      </div>
      <div class="data-row">
        <div class="label">知力防御力 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.intellectDefend"></div>
      </div>
      <div class="data-row">
        <div class="label">突撃確率 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.rushProbability"></div>
      </div>
      <div class="data-row">
        <div class="label">突撃加算値</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="my.rushAttack"></div>
      </div>
    </div>
    <h2>防御側</h2>
    <h3>武将</h3>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">武力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.strong"></div>
      </div>
      <div class="data-row">
        <div class="label">知力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.intellect"></div>
      </div>
      <div class="data-row">
        <div class="label">兵士小隊数</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.soldierNumber"></div>
      </div>
      <div class="data-row">
        <div class="label">訓練</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.proficiency"></div>
      </div>
    </div>
    <h3>兵種</h3>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">基本攻撃力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.baseAttack"></div>
      </div>
      <div class="data-row">
        <div class="label">基本防御力</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.baseDefend"></div>
      </div>
      <div class="data-row">
        <div class="label">知力攻撃力 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.intellectAttack"></div>
      </div>
      <div class="data-row">
        <div class="label">知力防御力 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.intellectDefend"></div>
      </div>
      <div class="data-row">
        <div class="label">突撃確率 (基準値: 100)</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.rushProbability"></div>
      </div>
      <div class="data-row">
        <div class="label">突撃加算値</div>
        <div class="value"><input type="number" min="0" max="10" v-model.number="enemy.rushAttack"></div>
      </div>
    </div>
    <h2>結果</h2>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">攻撃側勝利数</div>
        <div class="value" style="color:red;font-weight:bold;font-size:large">{{ my.winCount }}</div>
      </div>
      <div class="data-row">
        <div class="label">攻撃側敗北数</div>
        <div class="value" style="color:blue;font-weight:bold;font-size:large">{{ enemy.winCount }}</div>
      </div>
      <div class="data-row">
        <div class="label">引分数</div>
        <div class="value" style="color:green;font-weight:bold;font-size:large">{{ my.drawCount }}</div>
      </div>
      <div class="data-row">
        <div class="label">相討数</div>
        <div class="value" style="color:purple;font-weight:bold;font-size:large">{{ my.drawLoseCount }}</div>
      </div>
      <div class="data-row">
        <div class="label">攻撃側残兵士数平均</div>
        <div class="value">{{ my.restSoldierNumberAverage }}</div>
      </div>
      <div class="data-row">
        <div class="label">防御側残兵士数平均</div>
        <div class="value">{{ enemy.restSoldierNumberAverage }}</div>
      </div>
    </div>
    <div class="buttons">
      <button type="button" class="btn btn-primary" @click="run()">実行</button>
    </div>
    <div class="loading" v-show="isCalcing"><div class="loading-icon"></div></div>
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

class BattleCharacter {
  public constructor(public strong = 0,
                     public intellect = 0,
                     public soldierNumber = 0,
                     public proficiency = 0,
                     public attack = 0,
                     public baseAttack = 0,
                     public baseDefend = 0,
                     public intellectAttack = 0,
                     public intellectDefend = 0,
                     public rushProbability = 0,
                     public rushAttack = 0,
                     public winCount = 0,
                     public drawCount = 0,
                     public drawLoseCount = 0,
                     public restSoldierNumberAverage = 0) {}

  public getAttackCorrection(): number {
    return this.baseAttack + (this.intellectAttack / 100 * this.intellect);
  }

  public getDefendCorrection(): number {
    return this.baseDefend + (this.intellectDefend / 100 * this.intellect);
  }

  public isRush(): boolean {
    return this.rushProbability <= 0 ? false : Math.random() * 100 < this.rushProbability;
  }

  public calcPower(enemy: BattleCharacter) {
    this.attack =
      (this.strong + this.getAttackCorrection() - enemy.getDefendCorrection() - enemy.proficiency / 2.5) / 8;
  }

  public battle(count: number, enemy: BattleCharacter) {
    this.winCount = 0;
    enemy.winCount = 0;
    this.restSoldierNumberAverage = 0;
    enemy.restSoldierNumberAverage = 0;

    let winCount = 0;
    let enemyWinCount = 0;
    let drawCount = 0;
    let drawLoseCount = 0;

    let myRestNumberSum = 0;
    let enemyRestNumberSum = 0;

    this.calcPower(enemy);
    enemy.calcPower(this);

    for (let i = 0; i < count; i++) {
      let mySoldierNumber = this.soldierNumber;
      let enemySoldierNumber = enemy.soldierNumber;

      for (let t = 0; t < 50; t++) {
        let myDamage = Math.min(Math.max(Math.random() * enemy.attack, 1), mySoldierNumber);
        let enemyDamage = Math.min(Math.max(Math.random() * this.attack, 1), enemySoldierNumber);

        if (this.isRush()) {
          enemyDamage += this.rushAttack;
        } else if (enemy.isRush()) {
          myDamage += enemy.rushAttack;
        }

        mySoldierNumber -= myDamage;
        enemySoldierNumber -= enemyDamage;

        if (mySoldierNumber <= 0 || enemySoldierNumber <= 0) {
          break;
        }
      }

      myRestNumberSum += mySoldierNumber;
      enemyRestNumberSum += enemySoldierNumber;

      if (mySoldierNumber <= 0 && enemySoldierNumber <= 0) {
        drawLoseCount++;
      } else if (mySoldierNumber <= 0) {
        enemyWinCount++;
      } else if (enemySoldierNumber <= 0) {
        winCount++;
      } else {
        drawCount++;
      }
    }

    this.winCount = winCount;
    enemy.winCount = enemyWinCount;
    this.restSoldierNumberAverage = Math.round(myRestNumberSum / count * 10) / 10;
    enemy.restSoldierNumberAverage = Math.round(enemyRestNumberSum / count * 10) / 10;
    this.drawCount = enemy.drawCount = drawCount;
    this.drawLoseCount = enemy.drawLoseCount = drawLoseCount;
  }
}

@Component({
  components: {
  },
})
export default class BattleSimulatorView extends Vue {
  private my = new BattleCharacter();
  private enemy = new BattleCharacter();
  private isCalcing = false;
  private battleCount = 10000;

  private run() {
    this.isCalcing = true;
    this.my.battle(this.battleCount, this.enemy);
    this.isCalcing = false;
  }
}
</script>

<style lang="scss" scoped>
#soldier-list-view {
  height: 100%;

  h2 {
    background-color: #666;
    color: white;
    margin: 24px 0 0;
    padding: 4px;
    border-radius: 8px;
  }

  h3 {
    background-color: #ccc;
    margin: 8px 0 0;
    padding: 4px;
    border-radius: 8px;
  }

  .edit-list {
    padding-left: 16px;
    overflow: auto;
    -webkit-overflow-scroll: touch;

    .data-row {
      display: flex;
      align-items: center;
      margin: 8px 0;

      .label {
        flex: 1;
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
  }

  .buttons {
    text-align: right;
    margin-top: 32px;
    button {
      margin-left: 8px;
    }
  }
}
</style>
