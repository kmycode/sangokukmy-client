<template>
  <div v-if="log.id > 0">
    <SimpleCharacterList :characters="characters" :countries="countries" :isShowCustomSoldierTypeDetail="true" :isShowFormationType="true"/>
    <div class="message first">
      {{ log.maplog.gameDate | gamedate }}、
      <KmyLogTagText
        :text="'<country>' + attackerCountry.name + '</country> の <character>' + log.attackerCache.name + '</character> は <country>' + defenderCountry.name + '</country> の <town>' + log.town.name + '</town> へ侵攻しました'"
      />
      <br>
      <KmyLogTagText
        v-show="log.lines.length > 0"
        :text="'<character>' + log.defenderCache.name + '</character> が応戦しました'"
      />
      <KmyLogTagText v-show="log.lines.length <= 0" :text="'応戦できる者はいませんでした'"/>
    </div>
    <div class="battle-info">
      <div class="chara attacker"><span class="mark soldier-type" v-if="isStrongerSoldierType(log.attackerCache.soldierType, log.defenderCache.soldierType)">兵種</span><span class="mark formation" v-if="isStrongerFormation(log.attackerCache.formationType, log.defenderCache.formationType)">陣形</span></div>
      <div class="label" style="height:0;overflow:hidden"><span style="visibility:hidden">攻撃力</span></div>
      <div class="chara defender"><span class="mark soldier-type" v-if="isStrongerSoldierType(log.defenderCache.soldierType, log.attackerCache.soldierType)">兵種</span><span class="mark formation" v-if="isStrongerFormation(log.defenderCache.formationType, log.attackerCache.formationType)">陣形</span></div>
    </div>
    <div class="battle-info last">
      <div class="chara attacker">{{ log.attackerAttackPower }}</div>
      <div class="label">攻撃力</div>
      <div class="chara defender">{{ log.defenderAttackPower }}</div>
    </div>
    <div class="lines">
      <div class="line" v-for="line in log.lines" :key="line.id">
        <div class="chara attacker">
          <div class="icon">
            <CharacterIcon :icon="log.attackerCache.mainIcon"/>
          </div>
          <div class="number">
            <span class="current">{{ line.attackerNumber }}</span>
            <span class="damage">(-{{ line.attackerDamage }})</span>
          </div>
        </div>
        <div :class="{ 'turn-command-1-attacker': line.attackerCommand === 1, 'turn-command-1-defender': line.defenderCommand === 1,
                       'turn-command-2-attacker': line.attackerCommand === 2, 'turn-command-2-defender': line.defenderCommand === 2,
                       'turn-command-3-attacker': line.attackerCommand === 3, 'turn-command-3-defender': line.defenderCommand === 3, }">
          <div class="turn">{{ line.turn }}</div>
          <div class="turn-comment" v-if="line.attackerCommand === 1 || line.defenderCommand === 1">突撃</div>
          <div class="turn-comment" v-if="line.attackerCommand === 2 || line.defenderCommand === 2">混乱</div>
          <div class="turn-comment" v-if="line.attackerCommand === 3 || line.defenderCommand === 3">同討</div>
        </div>
        <div class="chara defender">
          <div class="number">
            <span class="current">{{ line.defenderNumber }}</span>
            <span class="damage">(-{{ line.defenderDamage }})</span>
          </div>
          <div class="icon">
            <CharacterIcon :icon="log.defenderCache.mainIcon"/>
          </div>
        </div>
      </div>
    </div>
    <div class="message maplog">
      <MapLogLine :log="log.maplog"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import KmyLogTagText from '@/components/parts/KmyLogTagText.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import SimpleCharacterList from '@/components/parts/SimpleCharacterList.vue';
import MapLogLine from '@/components/parts/MapLogLine.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

@Component({
  components: {
    KmyLogTagText,
    CharacterIcon,
    SimpleCharacterList,
    MapLogLine,
  },
})
export default class BattleLogView extends Vue {
  @Prop({
    default: 0,
  })
  private logId!: number;
  @Prop() private countries!: api.Country[];
  private log: api.BattleLog = new api.BattleLog();

  private get characters(): api.Character[] {
    return [this.log.attackerCache, this.log.defenderCache];
  }

  private get attackerCountry(): api.Country {
    return this.getCountry(this.log.attackerCache.countryId);
  }

  private get defenderCountry(): api.Country {
    return this.getCountry(this.log.defenderCache.countryId);
  }

  @Watch('logId')
  private onLogIdChanged() {
    this.$emit('loading');
    api.Api.getBattleLog(this.logId)
      .then((log) => {
        this.log = log;
      })
      .catch(() => {
        NotificationService.battleLogLoadFailed.notifyWithParameter(this.logId.toString());
      })
      .finally(() => {
        this.$emit('loaded');
      });
  }

  private getCountry(id: number): api.Country {
    const country = Enumerable.from(this.countries).firstOrDefault((c) => c.id === id);
    if (country !== undefined) {
      return country;
    } else {
      return api.Country.default;
    }
  }

  private isStrongerFormation(a: number, b: number): boolean {
    const ai = def.FORMATION_TYPES.find((f) => f.id === a);
    const bi = def.FORMATION_TYPES.find((f) => f.id === b);
    if (ai && bi) {
      if (ai.type === '水') {
        return bi.type === '金' || bi.type === '火';
      }
      if (ai.type === '木') {
        return bi.type === '水' || bi.type === '土';
      }
      if (ai.type === '火') {
        return bi.type === '木' || bi.type === '金';
      }
      if (ai.type === '土') {
        return bi.type === '火' || bi.type === '水';
      }
      if (ai.type === '金') {
        return bi.type === '土' || bi.type === '木';
      }
    }
    return false;
  }

  private isStrongerSoldierType(a: number, b: number): boolean {
    const ai = def.SOLDIER_TYPES.find((s) => s.id === a);
    const bi = def.SOLDIER_TYPES.find((s) => s.id === b);
    if (ai && bi) {
      if (ai.attribute === 4) {
        return bi.attribute === 5;
      }
      if (ai.attribute === 5) {
        return bi.attribute === 6;
      }
      if (ai.attribute === 6) {
        return bi.attribute === 4;
      }
      if (ai.attribute === 2) {
        return bi.name.indexOf('守兵') >= 0;
      }
    }
    return false;
  }
}
</script>

<style lang="scss" scoped>
.message {
  padding: 8px 16px;
  &.first {
    margin: 0 0 12px;
    background-color: #ddd;
  }
  &.maplog {
    font-size: 20px;
    margin: 16px 0 8px;
  }
}

.battle-info {
  display: flex;
  align-items: center;
  &.last {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 2px dashed #ccc;
  }
  .chara {
    flex: 1;
    text-align: center;
    font-size: 1.4em;
    color: #c00;
    font-weight: bold;
    .mark {
      color: black;
      font-weight: normal;
      font-size: 14px;
      padding: 4px 8px;
      height: 20px;
      line-height: 20px;
      border-radius: 10px;
      &.formation {
        background: #ccf;
      }
      &.soldier-type {
        background: #fcc;
      }
    }
  }
  .label {
    font-size: 1em;
  }
}

.lines {
  .line {
    display: flex;
    align-items: center;
    .chara {
      flex: 1;
      display: flex;
      align-items: center;
      .number {
        flex: 1;
        text-align: center;
        .current {
          font-weight: bold;
          font-size: 1.6em;
        }
        .damage {
          padding-left: 16px;
          color: #c00;
        }
      }
    }
    .turn {
      width: 48px;
      height: 48px;
      line-height: 48px;
      border-radius: 50%;
      background-color: #aaa;
      color: white;
      text-align: center;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .turn-command-1-attacker, .turn-command-2-attacker, .turn-command-3-attacker {
      .turn {
        background-color: #f99;
        margin-top: 8px;
      }
    }
    .turn-command-1-defender, .turn-command-2-defender, .turn-command-3-defender {
      .turn {
        background-color: #99f;
        margin-top: 8px;
      }
    }
    .turn-comment {
      text-align: center;
      font-weight: bold;
      color: gray;
      font-size: 0.9em;
    }
    .turn-command-1-attacker .turn-comment, .turn-command-1-defender .turn-comment {
      color: red;
    }
    .turn-command-2-attacker .turn-comment, .turn-command-2-defender .turn-comment {
      color: green;
    }
    .turn-command-3-attacker .turn-comment, .turn-command-3-defender .turn-comment {
      color: blue;
    }
  }
}
</style>

