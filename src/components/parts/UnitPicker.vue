<template>
  <div id="unit-picker">
    <div v-for="unit in units"
         :key="unit.id"
         :class="{ 'unit-list-item': true, 'selected': value && value.id === unit.id }"
         @click="$emit('input', unit)">
      <div class="left-side">
        <CharacterIcon :icon="unit.leader.character.mainIcon"/>
      </div>
      <div class="right-side">
        <div class="unit-name">{{ unit.name }}<span v-show="unit.isLimited" class="unit-limited">制限中</span></div>
        <div class="unit-message">{{ unit.message }}</div>
        <div class="unit-leader">隊長: {{ unit.leader.character.name }}
          <div v-if="!unit.leader.character.aiType && getCharacterCommands(unit.leader.character).length > 0" class="commands">
            <div class="next-update">次回更新: <span class="num">{{ getCharacterNextTime(unit.leader.character.lastUpdated).minutes }}</span> 分 <span class="num">{{ getCharacterNextTime(unit.leader.character.lastUpdated).seconds }}</span> 秒</div>
            <div class="command"
                v-for="command in getCharacterCommands(unit.leader.character)"
                :key="getCommandUniqueKey(command)"><span v-if="command && command.name" class="name">{{ command.name }}</span><span v-else class="name name-no-input">未入力</span><span class="next">&gt;</span></div>
          </div>
        </div>
        <div class="unit-members"><MiniCharacterList :characters="unitMemberCharacters(unit)" :countries="countries"/></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import * as api from './../../api/api';
import * as def from '@/common/definitions';
import Enumerable from 'linq';
import CommandList from '../../models/status/commandlist';

@Component({
  components: {
    MiniCharacterList,
    CharacterIcon,
  },
})
export default class UnitPicker extends Vue {
  @Prop() private units!: api.Unit[];
  @Prop() private value!: api.Unit;
  @Prop() private countries!: api.Country[];
  @Prop() private characters!: api.Character[];
  @Prop({
    default: () => undefined,
  }) private commands?: CommandList;
  @Prop({
    default: () => undefined,
  }) private otherCharacterCommands?: api.CharacterCommand[];

  private unitMemberCharacters(unit: api.Unit): api.Character[] {
    // 部隊のメンバの武将リスト
    return Enumerable.from(unit.members)
      .select((um) => um.character)
      .toArray();
  }

  private getCharacterNextTime(time: api.DateTime): api.DateTime {
    const dt = api.DateTime.toDate(time);
    dt.setSeconds(dt.getSeconds() + def.UPDATE_TIME);
    return api.DateTime.fromDate(dt);
  }

  private getCommandUniqueKey(cmd: api.CharacterCommand): number {
    if (cmd) {
      return api.GameDateTime.toNumber(cmd.gameDate);
    } else {
      return Math.random() * 1000;
    }
  }

  private getCharacterCommands(chara: api.Character): Array<(api.CharacterCommand | undefined)> {
    if (this.commands && this.otherCharacterCommands) {
      const startNumber = chara.lastUpdatedGameDate.year >= def.UPDATE_START_YEAR ?
        api.GameDateTime.toNumber(chara.lastUpdatedGameDate) + 1 :
        api.GameDateTime.toNumber(new api.GameDateTime(def.UPDATE_START_YEAR, 1));
      const endNumber = startNumber + 4;
      const cmds = Enumerable.from(this.otherCharacterCommands)
        .concat(this.commands.commands)
        .where((c) => c.characterId === chara.id)
        .where((c) => startNumber <= api.GameDateTime.toNumber(c.gameDate) &&
          api.GameDateTime.toNumber(c.gameDate) < endNumber);
      return [
        cmds.firstOrDefault((c) => api.GameDateTime.toNumber(c.gameDate) === startNumber),
        cmds.firstOrDefault((c) => api.GameDateTime.toNumber(c.gameDate) === startNumber + 1),
        cmds.firstOrDefault((c) => api.GameDateTime.toNumber(c.gameDate) === startNumber + 2),
        cmds.firstOrDefault((c) => api.GameDateTime.toNumber(c.gameDate) === startNumber + 3),
      ];
    } else if (chara.commands) {
      return chara.commands;
    }
    return [];
  }
}
</script>

<style lang="scss">

#unit-picker {
  margin-top: 12px;

  .unit-list-item {
    display: flex;
    cursor: pointer;
    padding: 4px;
    transition: background-color .14s ease-in;

    &:hover {
      background-color: #dee0f3;
    }

    &.selected {
      background-color: #c9cce7;

      &:hover {
        background-color: #acb0d1;
      }
    }

    .right-side {
      flex: 1;
      padding-left: 8px;

      .unit-name {
        font-size: 24px;
      }

      .unit-limited {
        color: red;
        margin-left: 16px;
        font-size: 14px;
        font-weight: bold;
      }

      .unit-message {
        padding: 4px 0;
        color: #888;
      }

      .unit-leader {

        .commands {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          font-size: 0.9em;
          margin-bottom: 8px;

          .next-update {
            background-color: rgba(0, 0, 0, 0.4);
            color: white;
            padding: 2px;
            align-self: center;
            margin-right: 16px;
          }
          .num {
            font-weight: bold;
          }

          .command {
            .name-no-input {
              color: #999;
            }
            .next {
              color: #aaa;
              margin: 0 8px;
            }
            &:first-child {
              .name {
                font-size: 1.2em;
                font-weight: bold;
              }
            }
            &:last-child {
              .next {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>
