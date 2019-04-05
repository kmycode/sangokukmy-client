<template>
  <div id="soldier-list-view" class="loading-container" style="overflow:auto">
    <h2>設定</h2>
    <div class="edit-list">
      <div class="data-row">
        <div class="label">初期農民</div>
        <div class="value"><input type="number" min="0" v-model.number="firstPeople"></div>
      </div>
      <div class="data-row">
        <div class="label">初期民忠</div>
        <div class="value"><input type="number" min="0" v-model.number="firstSecurity"></div>
      </div>
      <div class="data-row">
        <div class="label">兵1あたり農民</div>
        <div class="value"><input type="number" min="0" step="0.1" v-model.number="peoplePerSoldier"></div>
      </div>
      <div class="data-row">
        <div class="label">最大戦争ターン数</div>
        <div class="value"><input type="number" min="0" v-model.number="turnCount"></div>
      </div>
    </div>
    <h2>武将</h2>
    <h3>徴兵者</h3>
    <div class="edit-list">
      <div class="data-row-rice" v-for="chara in battlers" :key="chara.id">
        <div class="value"><input type="number" min="0" v-model.number="chara.loop"></div>
        <div class="label">人が</div>
        <div class="value"><input type="number" min="0" v-model.number="chara.soldierPer"></div>
        <div class="label">ヶ月毎に</div>
        <div class="value"><input type="number" min="0" v-model.number="chara.soldierNumber"></div>
        <div class="buttons"><button type="button" class="btn btn-outline-danger" @click="removeBattler(chara)">削除</button></div>
      </div>
      <div class="data-row">
        <div class="buttons buttons-single"><button type="button" class="btn btn-primary" @click="addBattler">追加</button></div>
      </div>
    </div>
    <h3>仁官</h3>
    <div class="edit-list">
      <div class="data-row-rice" v-for="chara in patrollers" :key="chara.id">
        <div class="label"><button type="button" :class="{'btn btn-toggle': true, 'selected': chara.isHarry}" @click="chara.isHarry = !chara.isHarry">緊急</button></div>
        <div class="label">人望</div>
        <div class="value"><input type="number" min="0" v-model.number="chara.popularity"></div>
        <div class="buttons"><button type="button" class="btn btn-outline-danger" @click="removePatroller(chara)">削除</button></div>
      </div>
      <div class="data-row">
        <div class="buttons buttons-single"><button type="button" class="btn btn-primary" @click="addPatroller">追加</button></div>
      </div>
    </div>
    <h2>結果</h2>
    <div class="edit-list">
      <div v-show="worstPeopleTurns >= 0 || worstSecurityTurns >= 0" class="data-row">
        <div class="label">最悪の場合</div>
        <div v-show="worstSecurityTurns >= 0 && (worstPeopleTurns < 0 || worstPeopleTurns > worstSecurityTurns)" class="value" style="font-weight:bold;color:red">{{ worstSecurityTurns }} ターンで民忠切れ</div>
        <div v-show="worstPeopleTurns >= 0 && (worstSecurityTurns < 0 || worstPeopleTurns <= worstSecurityTurns)" class="value" style="font-weight:bold;color:red">{{ worstPeopleTurns }} ターンで農民切れ</div>
      </div>
      <div v-show="worstPeopleTurns < 0 && worstSecurityTurns < 0" class="data-row">
        <div class="label">最悪の場合</div>
        <div class="value" style="font-weight:bold;color:blue">農民・民忠切れは発生しません</div>
      </div>
      <div v-show="peopleTurns >= 0 || securityTurns >= 0" class="data-row">
        <div class="label">標準的な場合</div>
        <div v-show="securityTurns >= 0 && (peopleTurns < 0 || peopleTurns > securityTurns)" class="value" style="font-weight:bold;color:red">{{ securityTurns }} ターンで民忠切れ</div>
        <div v-show="peopleTurns >= 0 && (securityTurns < 0 || peopleTurns <= securityTurns)" class="value" style="font-weight:bold;color:red">{{ peopleTurns }} ターンで農民切れ</div>
      </div>
      <div v-show="peopleTurns < 0 && securityTurns < 0" class="data-row">
        <div class="label">標準的な場合</div>
        <div class="value" style="font-weight:bold;color:blue">農民・民忠切れは発生しません</div>
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

class Battler {
  private static idNum: number = 1;
  public readonly id: number;

  public get useSecurity(): number {
    return Math.floor(this.soldierNumber / 10);
  }

  public constructor(public soldierNumber: number,
                     public soldierPer: number,
                     public loop: number) {
    this.id = Battler.idNum++;
  }
}

class Patroller {
  private static idNum: number = 1;
  public readonly id: number;

  public get actPopularity(): number {
    return this.isHarry ? this.popularity * 2 : this.popularity;
  }

  public get worstUp(): number {
    return Math.max(1, Math.floor(this.actPopularity / 20));
  }

  public get normalUp(): number {
    return Math.max(1, Math.floor(this.actPopularity / 20 + this.actPopularity / 40 / 2));
  }

  public constructor(public popularity: number,
                     public isHarry: boolean) {
    this.id = Patroller.idNum++;
  }
}

@Component({
  components: {
  },
})
export default class RiceSimulatorView extends Vue {
  private battlers: Battler[] = [];
  private patrollers: Patroller[] = [];
  private isCalcing = false;
  private turnCount = 2880;
  private peoplePerSoldier: number = 5;
  private firstPeople: number = 30000;
  private firstSecurity: number = 100;

  private worstSecurityTurns: number = -1;
  private worstPeopleTurns: number = -1;
  private securityTurns: number = -1;
  private peopleTurns: number = -1;

  private addBattler() {
    this.battlers.push(new Battler(0, 2, 1));
  }

  private addPatroller() {
    this.patrollers.push(new Patroller(0, false));
  }

  private removeBattler(chara: Battler) {
    this.battlers = this.battlers.filter((b) => b.id !== chara.id);
  }

  private removePatroller(chara: Patroller) {
    this.patrollers = this.patrollers.filter((b) => b.id !== chara.id);
  }

  private run() {
    this.isCalcing = true;

    this.firstSecurity = Math.min(this.firstSecurity, 100);

    let worstSecurity = this.firstSecurity;
    let worstPeople = this.firstPeople;
    let security = this.firstSecurity;
    let people = this.firstPeople;

    let worstSecurityTurns = -1;
    let worstPeopleTurns = -1;
    let securityTurns = -1;
    let peopleTurns = -1;

    for (let i = 0; i < this.turnCount; i++) {

      // 徴兵
      this.battlers.forEach((b) => {
        if (b.soldierPer > 0 && i % b.soldierPer === 0) {
          worstSecurity -= b.useSecurity * b.loop;
          security -= b.useSecurity * b.loop;

          const peoplePerSoldier = Math.floor(b.soldierNumber * b.loop * this.peoplePerSoldier);
          worstPeople -= peoplePerSoldier;
          people -= peoplePerSoldier;
        }
      });

      // 判定
      if (worstSecurity <= 0 && worstSecurityTurns < 0) {
        worstSecurityTurns = i;
      }
      if (worstPeople <= 0 && worstPeopleTurns < 0) {
        worstPeopleTurns = i;
      }
      if (security <= 0 && securityTurns < 0) {
        securityTurns = i;
      }
      if (people <= 0 && peopleTurns < 0) {
        peopleTurns = i;
      }
      if (worstSecurityTurns >= 0 && worstPeopleTurns >= 0 && securityTurns >= 0 && peopleTurns >= 0) {
        break;
      }

      // 回復
      this.patrollers.forEach((p) => {
        worstSecurity += p.worstUp;
        security += p.normalUp;
        if (worstSecurity > 100) {
          worstSecurity = 100;
        }
        if (security > 100) {
          security = 100;
        }
      });

      if (i % 6 === 0 && i > 0) {
        if (security > 50) {
          people += Math.max(80 * (security - 50), 500);
        } else {
          people -= -80 * (50 - security);
        }
        if (worstSecurity > 50) {
          worstPeople += Math.max(80 * (worstSecurity - 50), 500);
        } else {
          worstPeople -= -80 * (50 - worstSecurity);
        }

        if (i > 100 && worstPeople >= this.firstPeople && worstSecurity >= 100) {
          break;
        }

        // 人口だけ判定
        if (worstPeople <= 0 && worstPeopleTurns < 0) {
          worstPeopleTurns = i;
        }
        if (people <= 0 && peopleTurns < 0) {
          peopleTurns = i;
        }
        if (worstSecurityTurns >= 0 && worstPeopleTurns >= 0 && securityTurns >= 0 && peopleTurns >= 0) {
          break;
        }
      }
    }

    this.worstSecurityTurns = worstSecurityTurns;
    this.worstPeopleTurns = worstPeopleTurns;
    this.securityTurns = securityTurns;
    this.peopleTurns = peopleTurns;

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

    .data-row, .data-row-rice {
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

    .data-row-rice {
      .buttons {
        margin: 0;
      }
    }

    .buttons-single {
      flex: 1;
      text-align: right;
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
