<template>
  <div v-if="log.id > 0">
    <SimpleCharacterList :characters="characters" :countries="countries" :isShowCustomSoldierTypeDetail="true" :isWithFrom="false"/>
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
        <div :class="{'turn': true, 'turn-rush-attacker': line.isAttackerRush, 'turn-rush-defender': line.isDefenderRush }">{{ line.turn }}</div>
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
    .turn-rush-attacker {
      background-color: #f99;
    }
    .turn-rush-defender {
      background-color: #99f;
    }
  }
}
</style>

