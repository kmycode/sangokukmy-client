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
              <button v-if="!canSelect" class="btn btn-light btn-sm" type="button" @click="toggleDetail(chara)">詳細</button>
            </div>
            <div v-if="chara.reinforcement && chara.reinforcement.status === 4" class="reinforcement-status">援軍</div>
            <div class="post">{{ getPostName(chara.id, chara.countryId, true) }}</div>
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
            <span v-if="isShowSoldier && hasSoldierData(chara)" class="parameter-item">
              <span class="parameter-name">{{ getSoldierTypeName(chara) }}</span>
              <span class="parameter-value">{{ chara.soldierNumber }}</span>
            </span>
            <span class="parameter-item" v-if="isShowMoney && chara.money !== undefined">
              <span class="parameter-name">金</span>
              <span class="parameter-value">{{ chara.money }}</span>
            </span>
            <span class="parameter-item" v-if="isShowTown && towns && chara.townId">
              <span class="parameter-name">所在</span>
              <span class="parameter-value">{{ getTownName(chara.townId) }}</span>
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
          <div class="character-detail loading-container" v-if="chara.isOpenDetail">
            <div class="detail-commands">
              <div class="message" v-if="chara.detail && chara.detail.message">
                <KmyChatTagText :isNewLine="false" :text="chara.detail.message"/>
              </div>
              <span v-if="chara.detail && chara.detail.isStopCommand" class="stop-command">謹慎中</span>
              <div class="commands">
                <button v-if="canPunishment && chara.id !== myCharacterId && (!chara.aiType || chara.aiType === 28) && chara.countryId === myCountryId" v-show="openMoreCommands == 1" class="btn btn-sm btn-warning" @click="stopCommand(chara)">謹慎</button>
                <button v-if="canPunishment && chara.id !== myCharacterId && (!chara.aiType || chara.aiType === 28) && chara.countryId === myCountryId" v-show="openMoreCommands == 2" class="btn btn-sm btn-danger" @click="dismissal(chara)">解雇</button>
                <button v-if="canPunishment && chara.id !== myCharacterId && (!chara.aiType || chara.aiType === 28) && chara.countryId === myCountryId" class="btn btn-light btn-sm" type="button" @click="toggleOpenMoreCommands()">操作</button>
                <button v-if="canReinforcement && chara.countryId !== myCountryId && (!chara.aiType || chara.aiType === 28) && getPostName(chara.id, chara.countryId) !== '君主' && (!chara.reinforcement || (chara.reinforcement.status === 2 || chara.reinforcement.status === 3 || chara.reinforcement.status === 5 || chara.reinforcement.status === 6))" class="btn btn-warning btn-sm" type="button" @click="$emit('reinforcement-request', chara)">援軍要請</button>
                <button v-if="canReinforcement && chara.countryId !== myCountryId && (!chara.aiType || chara.aiType === 28) && chara.reinforcement && chara.reinforcement.status === 1" class="btn btn-light btn-sm" type="button" @click="$emit('reinforcement-cancel', chara)">援軍要請取消</button>
                <button v-if="canPrivateChat && chara.id !== myCharacterId && (!chara.aiType || chara.aiType === 28)" class="btn btn-light btn-sm" type="button" @click="$emit('private-chat', chara)">個宛</button>
              </div>
              <div v-if="canEdit && chara.countryId === myCountryId && chara.countryId > 0 && chara.id !== myCharacterId && getPostName(chara.id, chara.countryId) !== '君主'" class="post-selection">
                <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" @click="togglePostsPopup(chara)">
                  {{ getPostName(chara.id, chara.countryId) }}
                </button>
                <div class="dropdown-menu" :style="(chara.isOpenPostsPopup ? 'display:block' : 'display:none') + ';top:auto;left:auto;right:20px;margin-top:-4px'">
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 2, 'characterId': chara.id })">軍師</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 3, 'characterId': chara.id })">大将軍</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 14, 'characterId': chara.id })">司令官</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 10, 'characterId': chara.id })">政務官長</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 9, 'characterId': chara.id })">建築官</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 11, 'characterId': chara.id })">外交官</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 12, 'characterId': chara.id })">金庫番</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 13, 'characterId': chara.id })">政策番</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 4, 'characterId': chara.id })">騎兵将軍</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 5, 'characterId': chara.id })">弓将軍</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 7, 'characterId': chara.id })">将軍</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup(chara); $emit('appoint', { 'type': 0, 'characterId': chara.id })">一般</a>
                </div>
                <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" @click="togglePostsPopup2(chara)">
                  ロール
                </button>
                <div class="dropdown-menu" :style="(chara.isOpenPostsPopup2 ? 'display:block' : 'display:none') + ';top:auto;left:auto;right:20px;margin-top:-4px'">
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 15, 'characterId': chara.id })">ロール1</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 16, 'characterId': chara.id })">ロール2</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 17, 'characterId': chara.id })">ロール3</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 18, 'characterId': chara.id })">ロール4</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 19, 'characterId': chara.id })">ロール5</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 20, 'characterId': chara.id })">ロール6</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 21, 'characterId': chara.id })">ロール7</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 22, 'characterId': chara.id })">ロール8</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="togglePostsPopup2(chara); $emit('appoint', { 'type': 23, 'characterId': chara.id })">ロール9</a>
                </div>
              </div>
            </div>
            <div class="parameters" v-if="chara.detail && chara.detail.formation">
              <span class="parameter-item">
                <span class="parameter-name">金</span>
                <span class="parameter-value">{{ chara.detail.money }}</span>
              </span>
              <span class="parameter-item">
                <span class="parameter-name">米</span>
                <span class="parameter-value">{{ chara.detail.rice }}</span>
              </span>
            </div>
            <div class="detail-formation" v-if="chara.formationInfo && chara.detail.formation">
              陣形 <span class="formation-name">{{ chara.formationInfo.name }} Lv.{{ chara.detail.formation.level }} ({{ chara.formationInfo.type }})</span> - <span class="description">{{ chara.formationInfo.descriptions[chara.detail.formation.level - 1] }}</span>
            </div>
            <div class="detail-skills" v-if="chara.skillInfos">
              <div v-for="info in chara.skillInfos" :key="info.id">
                <span class="skill-name">{{ info.name }}</span> - <span class="description">{{ info.description }}</span>
              </div>
            </div>
            <div class="loading" v-show="chara.isLoadingDetail"><div class="loading-icon"></div></div>
          </div>
        </div>
      </div>
      <div v-if="chara.lastUpdated && chara.lastUpdated.year > 2000" class="item-commands">
        <div class="next-update">次回更新: <span class="num">{{ getCharacterNextTime(chara.lastUpdated).minutes }}</span> 分 <span class="num">{{ getCharacterNextTime(chara.lastUpdated).seconds }}</span> 秒</div>
        <div v-if="(!chara.aiType || chara.aiType === 28) && getCharacterCommands(chara).length > 0" class="commands">
          <div class="command"
               v-for="command in getCharacterCommands(chara)"
               :key="getCommandUniqueKey(command)"><span v-if="command && command.name" class="name"><KmyLogTagText :text="command.name"/></span><span v-else class="name name-no-input">未入力</span><span class="next">&gt;</span></div>
        </div>
      </div>
      <div class="select-cover" @click="$emit('input', chara)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import KmyChatTagText from '@/components/parts/KmyChatTagText.vue';
import KmyLogTagText from '@/components/parts/KmyLogTagText.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';
import NotificationService from '../../services/notificationservice';

@Component({
  components: {
    CharacterIcon,
    KmyChatTagText,
    KmyLogTagText,
  },
})
export default class SimpleCharacterList extends Vue {
  @Prop() public characters!: api.Character[];
  @Prop() public countries!: api.Country[];
  @Prop({
    default: () => undefined,
  }) public towns?: api.Town[];
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
  }) public canPunishment!: boolean;
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
  @Prop({
    default: false,
  }) public isShowMoney!: boolean;
  @Prop({
    default: true,
  }) public isShowSoldier!: boolean;
  @Prop({
    default: false,
  }) public isShowTown!: boolean;

  private isOpenPostsPopup: boolean = false;
  private openMoreCommands: number = 0;
  private ignoreIds: number[] = [];

  private get orderedCharacters(): api.Character[] {
    if (this.isSortByTime) {
      return Enumerable.from(this.characters)
        .where((c) => !this.ignoreIds.some((id) => c.id === id))
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

  private getPostName(charaId: number, countryId: number, isContainsRole: boolean | undefined): string {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country && country.posts) {
      const posts = country.posts.filter((p) => p.characterId === charaId).map((p) => p.type);
      if (posts.length <= 0) {
        posts.push(0);
      }
      const postTypes = def.COUNTRY_POSTS
        .filter((pt) => posts.some((p) => p === pt.id) && (isContainsRole || !pt.isRoleGroup))
        .map((pt) => pt.name);
      return postTypes.join(' / ');
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
    return def.SOLDIER_TYPES[0].name;
  }

  private getTownName(townId: number): string {
    if (this.towns) {
      const town = this.towns.find((t) => t.id === townId);
      if (town) {
        return town.name;
      }
    }
    return '';
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

  private stopCommand(chara: api.Character) {
    this.$emit('yesno', {
      message: '本当に謹慎しますか？',
      onYes: () => {
        if (!chara.isStopCommand && (chara as any).detail) {
          Vue.set(chara, 'isLoadingDetail', true);
          api.Api.setCharacterStopCommand(chara.id)
            .then(() => {
              (chara as any).detail.isStopCommand = true;
              NotificationService.stopedCommand.notifyWithParameter(chara.name);
              this.openMoreCommands = 0;
            })
            .catch((ex) => {
              if (ex.data && ex.data.code === api.ErrorCode.blockedActionError) {
                NotificationService.actionBlocked.notify();
              } else {
                NotificationService.stopCommandFailed.notifyWithParameter(chara.name);
              }
            })
            .finally(() => {
              Vue.set(chara, 'isLoadingDetail', false);
            });
        }
      },
    });
  }

  private dismissal(chara: api.Character) {
    this.$emit('yesno', {
      message: '本当に解雇しますか？',
      onYes: () => {
        if ((chara as any).detail) {
          Vue.set(chara, 'isLoadingDetail', true);
          api.Api.setCharacterDismissal(chara.id)
            .then(() => {
              this.ignoreIds.push(chara.id);
              NotificationService.dismissaled.notifyWithParameter(chara.name);
              this.openMoreCommands = 0;
            })
            .catch((ex) => {
              if (ex.data && ex.data.code === api.ErrorCode.blockedActionError) {
                NotificationService.actionBlocked.notify();
              } else {
                NotificationService.dismissalFailed.notifyWithParameter(chara.name);
              }
            })
            .finally(() => {
              Vue.set(chara, 'isLoadingDetail', false);
            });
        }
      },
    });
  }

  private togglePostsPopup(chara: api.Character) {
    Vue.set(chara, 'isOpenPostsPopup', !(chara as any).isOpenPostsPopup);
  }

  private togglePostsPopup2(chara: api.Character) {
    Vue.set(chara, 'isOpenPostsPopup2', !(chara as any).isOpenPostsPopup2);
  }

  private toggleOpenMoreCommands() {
    this.openMoreCommands = ((this.openMoreCommands + 1) % 3);
  }

  private toggleDetail(chara: api.Character) {
    Vue.set(chara, 'isOpenDetail', !(chara as any).isOpenDetail);
    if ((chara as any).isOpenDetail) {
      Vue.set(chara, 'isLoadingDetail', true);
      const id = (chara as any).characterId ? (chara as any).characterId : chara.id;
      api.Api.getCharacterDetail(id)
        .then((detail) => {
          if (detail.skills) {
            const skillInfos = detail.skills.map((s) => {
              const st = def.CHARACTER_SKILL_TYPES.filter((stt) => stt.id === s.type);
              if (st.length > 0) {
                return st[0];
              }
              return undefined;
            }).filter((s) => s !== undefined);
            Vue.set(chara, 'skillInfos', skillInfos);
          }
          if (detail.formation) {
            const type = detail.formation.type;
            const info = def.FORMATION_TYPES.filter((ft) => ft.id === type);
            if (info.length > 0) {
              Vue.set(chara, 'formationInfo', info[0]);
            }
          }
          Vue.set(chara, 'detail', detail);
        })
        .catch(() => {
          NotificationService.getCharacterDetailFailed.notify();
        })
        .finally(() => {
          Vue.set(chara, 'isLoadingDetail', false);
        });
    }
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

    %parameters {
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

          .post {
            margin: 4px 12px 0 0;
            color: #5a5b61;
            font-size: 14px;
          }
        }

        .parameters {
          @extend %parameters;
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

    .character-detail {
      .detail-commands {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        align-items: center;

        .message {
          flex: 1;
          margin: 8px 0;
        }
      }

      .detail-formation {
        .formation-name {
          font-weight: bold;
        }
        .description {
          color: #666;
        }
      }

      .detail-skills {
        .skill-name {
          font-weight: bold;
        }
        .description {
          color: #666;
        }
      }

      .stop-command {
        color: red;
        font-weight: bold;
        margin-right: 16px;
      }

      .post, .post-selection {
        margin: 0 12px 0 0;
      }

      .parameters {
        @extend %parameters;
        .parameter-value {
          width: 5rem !important;
        }
      }
    }
  }
}
</style>
