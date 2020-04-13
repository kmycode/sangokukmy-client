<template>
  <div class="simple-character-list">
    <div
      :class="'item country-color-' + getCountryColorId(chara.countryId) + (canSelect ? ' selectable' : '') + (value.id === chara.id ? ' selected' : '')"
      v-for="chara in orderedCharacters"
      :key="chara.id">
      <div class="item-character-info">
        <div class="icon">
          <CharacterIcon :icon="chara.mainIcon"/>
        </div>
        <div class="information">
          <div class="standard">
            <div class="name responsive-header"><span v-if="chara.isBeginner" class="beginner">🔰</span>{{ chara.name }}</div>
            <div class="commands">
            </div>
            <div class="commands">
              <button v-if="canReinforcement && chara.countryId !== myCountryId && !chara.aiType && getPostName(chara.id, chara.countryId) !== '君主' && (!chara.reinforcement || (chara.reinforcement.status === 2 || chara.reinforcement.status === 3 || chara.reinforcement.status === 5 || chara.reinforcement.status === 6))" class="btn btn-warning btn-sm" type="button" @click="$emit('reinforcement-request', chara)">援軍要請</button>
              <button v-if="canReinforcement && chara.countryId !== myCountryId && !chara.aiType && chara.reinforcement && chara.reinforcement.status === 1" class="btn btn-light btn-sm" type="button" @click="$emit('reinforcement-cancel', chara)">援軍要請取消</button>
              <button v-if="canPrivateChat && chara.id !== myCharacterId && (!chara.aiType || chara.aiType === 28)" class="btn btn-light btn-sm" type="button" @click="$emit('private-chat', chara)">個宛</button>
            </div>
            <div v-if="chara.reinforcement && chara.reinforcement.status === 4" class="reinforcement-status">援軍</div>
            <div v-if="chara.id === myCharacterId || (chara.countryId > 0 && (!canEdit || myCountryId !== chara.countryId || getPostName(chara.id, chara.countryId) === '君主'))" class="post">{{ getPostName(chara.id, chara.countryId) }}</div>
            <div v-else-if="chara.countryId > 0" class="post-selection">
              <button class="btn btn-secondary dropdown-toggle" type="button" @click="togglePostsPopup(chara)">
                {{ getPostName(chara.id, chara.countryId) }}
              </button>
              <div class="dropdown-menu" :style="(chara.isOpenPostsPopup ? 'display:block' : 'display:none') + ';top:auto;left:auto;right:24px'">
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 2, 'characterId': chara.id })">軍師</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 3, 'characterId': chara.id })">大将軍</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 9, 'characterId': chara.id })">建築官</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 4, 'characterId': chara.id })">騎兵将軍</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 5, 'characterId': chara.id })">弓将軍</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 7, 'characterId': chara.id })">将軍</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 0, 'characterId': chara.id })">一般</a>
              </div>
            </div>
          </div>
          <div class="parameters">
            <span v-if="isWithFrom" class="parameter-from-wrapper">
              <span :class="'parameter-from parameter-from-' + chara.from">
                {{ chara | charafromname }}
              </span>
            </span>
            <span class="parameter-item">
              <span class="parameter-name">武力</span>
              <span class="parameter-value">{{ chara.strong }}</span>
            </span>
            <span class="parameter-item">
              <span class="parameter-name">知力</span>
              <span class="parameter-value">{{ chara.intellect }}</span>
            </span>
            <span class="parameter-item">
              <span class="parameter-name">統率</span>
              <span class="parameter-value">{{ chara.leadership }}</span>
            </span>
            <span class="parameter-item">
              <span class="parameter-name">人望</span>
              <span class="parameter-value">{{ chara.popularity }}</span>
            </span>
            <span v-if="hasSoldierData(chara)" class="parameter-item">
              <span class="parameter-name">{{ getSoldierTypeName(chara) }}</span>
              <span class="parameter-value">{{ chara.soldierNumber }}</span>
            </span>
          </div>
          <div v-if="isShowFormationType && chara.formationLevel !== undefined" class="soldier-type-detail">
            <div class="parameters parameters-no-from">
              <span class="parameter-item">
                <span class="parameter-name">陣形</span>
                <span class="parameter-value">{{ getCharacterFormationName(chara) }}</span>
              </span>
              <span class="parameter-item">
                <span class="parameter-name">属性</span>
                <span class="parameter-value">{{ getCharacterFormationType(chara) }}</span>
              </span>
              <span class="parameter-item">
                <span class="parameter-name">Lv</span>
                <span class="parameter-value">{{ chara.formationLevel }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="chara.lastUpdated && chara.lastUpdated.year > 2000" class="item-commands">
        <div class="next-update">次回更新: <span class="num">{{ getCharacterNextTime(chara.lastUpdated).minutes }}</span> 分 <span class="num">{{ getCharacterNextTime(chara.lastUpdated).seconds }}</span> 秒</div>
        <div v-if="!chara.aiType && getCharacterCommands(chara).length > 0" class="commands">
          <div class="command"
               v-for="command in getCharacterCommands(chara)"
               :key="getCommandUniqueKey(command)"><span v-if="command && command.name" class="name">{{ command.name }}</span><span v-else class="name name-no-input">未入力</span><span class="next">&gt;</span></div>
        </div>
      </div>
      <div class="select-cover" @click="$emit('input', chara)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
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
export default class SimpleCharacterList extends Vue {
  @Prop() public characters!: api.Character[];
  @Prop() public countries!: api.Country[];
  @Prop({
    default: -1,
  }) public myCharacterId!: number;
  @Prop({
    default: -1,
  }) public myCountryId!: number;
  @Prop({
    default: false,
  }) public isShowCustomSoldierTypeDetail!: boolean;
  @Prop({
    default: false,
  }) public isShowFormationType!: boolean;
  @Prop({
    default: false,
  }) public canEdit!: boolean;
  @Prop({
    default: false,
  }) public canPrivateChat!: boolean;
  @Prop({
    default: false,
  }) public canReinforcement!: boolean;
  @Prop({
    default: true,
  }) public isWithFrom!: boolean;
  @Prop({
    default: false,
  }) public canSelect!: boolean;
  @Prop({
    default: () => new api.Character(-1),
  }) public value!: api.Character;
  @Prop({
    default: () => undefined,
  }) public commands?: api.CharacterCommand[];
  @Prop({
    default: () => undefined,
  }) public otherCharacterCommands?: api.CharacterCommand[];
  @Prop({
    default: false,
  }) public isSortByTime!: boolean;

  private isOpenPostsPopup: boolean = false;

  private get orderedCharacters(): api.Character[] {
    if (this.isSortByTime) {
      return Enumerable.from(this.characters)
        .orderBy((c) => api.DateTime.toDate(c.lastUpdated).getTime())
        .toArray();
    }
    return this.characters;
  }

  private getCountryColorId(countryId: number): number {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }

  private getPostName(charaId: number, countryId: number): string {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country && country.posts) {
      const post = Enumerable.from(country.posts).firstOrDefault((p) => p.characterId === charaId);
      const postTypeId = post ? post.type : 0;
      const postType = Enumerable.from(def.COUNTRY_POSTS).firstOrDefault((pt) => pt.id === postTypeId);
      if (postType) {
        return postType.name;
      }
    }
    return '';
  }

  private hasSoldierData(chara: api.Character): boolean {
    return chara.soldierType !== undefined && chara.soldierType !== null;
  }

  private getSoldierTypeName(chara: api.Character): string {
    const soldierType = Enumerable.from(def.SOLDIER_TYPES).firstOrDefault((st) => st.id === chara.soldierType);
    if (soldierType) {
      return soldierType.name;
    }
    return '雑兵';
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

  private getCharacterFormationName(chara: api.Character): string {
    const formationType = Enumerable.from(def.FORMATION_TYPES).firstOrDefault((st) => st.id === chara.formationType);
    if (formationType) {
      return formationType.name;
    }
    return '通常';
  }

  private getCharacterFormationType(chara: api.Character): string {
    const formationType = Enumerable.from(def.FORMATION_TYPES).firstOrDefault((st) => st.id === chara.formationType);
    if (formationType) {
      return formationType.type;
    }
    return '無';
  }

  private getCharacterCommands(chara: api.Character): Array<(api.CharacterCommand | undefined)> {
    if (chara.countryId !== this.myCountryId) {
      return [];
    }
    if (this.commands && this.otherCharacterCommands) {
      const startNumber = chara.lastUpdatedGameDate.year >= def.UPDATE_START_YEAR ?
        api.GameDateTime.toNumber(chara.lastUpdatedGameDate) + 1 :
        api.GameDateTime.toNumber(new api.GameDateTime(def.UPDATE_START_YEAR, 1));
      const endNumber = startNumber + 4;
      const cmds = Enumerable.from(this.otherCharacterCommands)
        .concat(this.commands)
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

  private togglePostsPopup(chara: api.Character) {
    Vue.set(chara, 'isOpenPostsPopup', !(chara as any).isOpenPostsPopup);
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/country-color.scss';
@import '@/scss/bootstrap-helper.scss';

.simple-character-list {
  .item {
    padding: 4px;
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    @include country-color-light('background-color');
    @include country-color-deep('border-bottom-color');

    &.selectable {
      position: relative;

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

    .item-character-info {
      display: flex;

      .information {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        margin-left: 12px;

        .standard {
          display: flex;
          flex-wrap: wrap;

          .name {
            flex: 1;
            white-space: nowrap;
          }

          .beginner {
            background: #74dac9;
            padding: 4px;
            border-radius: 12px;
            margin-right: 8px;
            font-size: 0.5em;
          }

          .commands {
            margin-right: 16px;
            button {
              margin-left: 4px;
            }
          }

          .reinforcement-status {
            margin: 4px 12px 0 0;
            color: green;
            font-weight: bold;
          }

          .post, .post-selection {
            margin: 4px 12px 0 0;
          }
        }

        .parameters {
          .parameter-from {
            width: 4em;
            padding: 2px 0;
            display: inline-block;
          }
          .parameter-item {
            padding-right: 12px;
            .parameter-name {
              font-size: 0.8rem;
              color: #666;
              padding-right: 4px;
            }
            .parameter-value {
              display: inline-block;
              font-size: 1rem;
              font-weight: bold;
              width: 2rem;
              text-align: center;
            }
          }
          &.parameters-no-from {
            margin-left: 4em;
          }
        }
      }
    }

    .item-commands {
      margin: 4px 4px 0;
      display: flex;

      .next-update {
        background-color: rgba(0, 0, 0, 0.4);
        color: white;
        padding: 2px;
        align-self: center;
      }
      .num {
        font-weight: bold;
      }

      .commands {
        margin-left: 16px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        font-size: 0.9em;

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
</style>
