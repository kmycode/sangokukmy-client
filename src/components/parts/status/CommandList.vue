<template>
  <div id="command-list">
    <!-- コマンド選択のタブ -->
    <ul class="nav nav-pills nav-fill">
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 0 }" @click.prevent.stop="selectedCommandCategory = 0" href="#">内政</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 1 }" @click.prevent.stop="selectedCommandCategory = 1" href="#">施設</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 2 }" @click.prevent.stop="selectedCommandCategory = 2" href="#">軍事</a></li>
      <!-- <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 3 }" @click.prevent.stop="selectedCommandCategory = 3" href="#">計略</a></li> -->
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 4 }" @click.prevent.stop="selectedCommandCategory = 4" href="#">個人</a></li>
    </ul>
    <div class="loading-container">
      <!-- 内政コマンド -->
      <div v-show="selectedCommandCategory === 0" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(1)">農業<span class="redundant-text">開発</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(2)">商業<span class="redundant-text">発展</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(3)">技術<span class="redundant-text">開発</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(4)">城壁<span class="redundant-text">強化</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(5)">守兵<span class="redundant-text">増強</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(6)">米施し</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(30)">緊急米施し</button>
      </div>
      <!-- 増強コマンド -->
      <div v-show="selectedCommandCategory === 1" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(31)">都市施設<span class="redundant-text">強化</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(32)">国家施設<span class="redundant-text">強化</span></button>
        <button v-if="list.canUseCountrySafe" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'safe')">国庫納入</button>
        <button v-if="list.canUseCountrySafe && canSafeOut" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'safe-out')">国庫搬出</button>
        <button v-if="list.canUseCountrySpy" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(42)">技術破壊</button>
        <button v-if="list.canUseCountrySpy" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(43)">城壁破壊</button>
        <button v-if="list.canUseCountrySpy" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(37)">扇動</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'soldier-research')">兵種研究</button>
        <button v-if="list.canUseCountrySecretary && canSecretary" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'secretary-add')">政<span class="redundant-text">務官</span>募集</button>
        <button v-if="list.canUseCountrySecretary && canSecretary" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'secretary')">政<span class="redundant-text">務官</span>配属</button>
        <button v-if="list.canUseCountrySecretary && canSecretary" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'secretary-remove')">政<span class="redundant-text">務官</span>解任</button>
      </div>
      <!-- 軍事コマンド -->
      <div v-show="selectedCommandCategory === 2" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'soldier')">徴兵</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(11)"><span class="redundant-text">兵士</span>訓練</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(12)"><span class="redundant-text">城の</span>守備</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputMoveCommand(13)">戦争</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(14)">集合</button>
      </div>
      <!-- 計略コマンド -->
      <div v-show="selectedCommandCategory === 3" class="commands">
        <!-- <button type="button" class="btn btn-light">密偵</button> -->
      </div>
      <!-- 個人コマンド -->
      <div v-show="selectedCommandCategory === 4" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputMoveCommand(17)">移動</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'training')"><span class="redundant-text">能力</span>強化</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'promotion')">登用</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'rice')">米売買</button>
        <!-- <button type="button" class="btn btn-light">武器</button>
        <button type="button" class="btn btn-light">書物</button> -->
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputMoveCommand(0)">何もしない</button>
        <button type="button" class="btn btn-primary" :disabled="!list.inputer.canInput" @click="list.inputer.inputMoveCommand(23)">仕官</button>
        <!-- <button type="button" class="btn btn-light">下野</button> -->
      </div>
      <div class="loading" v-show="list.inputer.isInputing"><div class="loading-icon"></div></div>
    </div>
    <!-- 選択ツール -->
    <div class="command-input-options">
      <button type="button" class="btn btn-light" @click="list.inputer.clearAllCommandSelections()">消去</button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectAllCommands()">全て</button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectOddCommands()">偶数</button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectEvenCommands()">奇数</button>
      <button type="button" class="btn btn-light" @click="isOpenAxb = !isOpenAxb">ax+b</button>
    </div>
    <div v-show="isOpenAxb" class="command-input-axb">
      <input type="number" v-model.number="axbA" min="1"> の倍数＋ <input type="number" v-model.number="axbB" min="0">
      <button type="button" class="btn btn-light btn-sm" @click="list.inputer.selectAxbCommands(axbA, axbB)">選択</button>
    </div>
    <!-- 選択アルゴリズム -->
    <div class="command-select-options">
      <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': isMultiCommandsSelection }" @click="isMultiCommandsSelection = !isMultiCommandsSelection">複数選択</button>
      <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': isRanged }" @click="isRanged = !isRanged; list.inputer.setRanged(isRanged); updatePreview()">範囲</button>
      <button type="button" :class="{ 'btn': true, 'btn-outline-info': list.inputer.commandSelectMode !== 0, 'btn-info': list.inputer.commandSelectMode === 0 }" @click="list.inputer.commandSelectMode = 0">置換</button>
      <button type="button" :class="{ 'btn': true, 'btn-outline-info': list.inputer.commandSelectMode !== 1, 'btn-info': list.inputer.commandSelectMode === 1 }" @click="list.inputer.commandSelectMode = 1">OR</button>
    </div>
    <!-- 放置削除の通知 -->
    <div v-if="isShowDeleteTurn" class="alert alert-danger command-delete-turn-notify">
      このままコマンドを入力／実行しなかった場合、あなたは残り <span class="number">{{ deleteTurn }}</span> ターンで削除されます
    </div>
    <div v-else-if="list.isFewRemaining" class="alert alert-warning">
      50ターン以内に、何も実行しないコマンドが存在します
    </div>
    <div class="command-list">
      <div v-for="command in list.commands"
            :key="command.commandNumber"
            :class="{ 'command-list-item': true, 'selected': command.isSelected, 'disabled': !command.canSelect, 'previewed': command.isPreview }"
            @click="onCommandSelected(command, $event)">
        <div class="number">{{ command.commandNumber }}</div>
        <div class="command-information">
          <div class="command-helper"><span class="gamedate">{{ command.gameDate | gamedate }}</span><span class="realdate" v-if="command.commandNumber > 1">{{ command.date | realdate }}</span><span class="rest" v-if="command.commandNumber === 1">実行まであと<span class="rest-time">{{ list.secondsOfNextCommand }}</span>秒</span></div>
          <div class="command-text">{{ command.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import CommandList from '@/models/status/commandlist';
import * as def from '@/common/definitions';

@Component({
  components: {
  },
})
export default class CommandListView extends Vue {
  @Prop() private list!: CommandList;
  @Prop() private characterDeleteTurn!: number;
  @Prop() private canSafeOut!: boolean;
  @Prop() private canSecretary!: boolean;
  private selectedCommandCategory: number = 0;
  private isMultiCommandsSelection: boolean = false;
  private isOpenAxb: boolean = false;
  private isRanged: boolean = false;

  private axbA: number = 3;
  private axbB: number = 0;

  private get deleteTurn(): number {
    return def.CHARACTER_DELETE_TURN - this.characterDeleteTurn;
  }

  public get isShowDeleteTurn(): boolean {
    let isShow = this.characterDeleteTurn > 0;
    const firstCommand = this.list.commands.length > 0 ?
      this.list.commands[this.list.commands.length - 1] : undefined;
    if (firstCommand) {
      isShow = isShow && def.UPDATE_START_YEAR < firstCommand.gameDate.year;
    }
    return isShow;
  }

  @Watch('axbA')
  @Watch('axbB')
  @Watch('isOpenAxb')
  private updatePreview() {
    if (this.isOpenAxb) {
      this.list.inputer.previewAxbCommands(this.axbA, this.axbB);
    } else {
      this.list.inputer.removePreviews();
    }
  }

  private onCommandSelected(command: api.CharacterCommand, event?: MouseEvent) {
    if (this.isMultiCommandsSelection) {
      this.list.inputer.selectMultipleCommand(command);
    } else {
      if (event && event.shiftKey) {
        this.list.inputer.selectMultipleCommand(command);
      } else {
        this.list.inputer.selectSingleCommand(command);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/bootstrap-helper.scss';

$color-navigation-commands: #e0e0e0;

#command-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  .nav {
    .active {
      background-color: #6bf;
    }
  }
  .commands {
    display: flex;
    flex-flow: row wrap;
    button {
      margin: 4px 4px 0 0;
      @include media-query-lower(sm) {
        .redundant-text {
          display: none;
        }
      }
      &.btn-light {
        background-color: #e7e7e7;
        &:hover {
          background-color: #bbb;
        }
      }
    }
  }
  .command-input-options {
    margin-top: 4px;
    padding: 0 0 4px 4px;
    background-color: $color-navigation-commands;
    display: flex;
    flex-flow: row wrap;
    button {
      margin: 4px 4px 0 0;
    }
  }
  .command-input-axb {
    height: 44px;
    margin: 0;
    padding: 0 4px 8px;
    background-color: $color-navigation-commands;
    input {
      width: 4em;
      padding: 0 8px;
      font-size: 1.4em;
      text-align: right;
    }
    button {
      margin-left: 8px;
    }
  }
  .command-select-options {
    margin-top: 4px;
    padding: 0 0 4px 4px;
    display: flex;
    flex-flow: row wrap;
    button {
      margin: 4px 4px 0 0;
    }
  }
  .command-delete-turn-notify {
    .number {
      font-weight: bold;
      font-size: 24px;
    }
  }
  .command-list {
    flex: 1;
    margin-top: 4px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .command-list-item {
    background: #f4f4ff;
    padding: 2px 4px;
    display: flex;
    border-bottom: 1px dashed #ccf;
    cursor: pointer;
    user-select: none;
    transition: background-color .1s ease-in;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: #e4e4f6;
    }
    &.previewed {
      background: #fec;
    }
    &.selected {
      background: #c6caf0;
      &:hover {
        background: #b1b1df;
      }
      &.previewed {
        background: #afa474;
      }
    }
    &.disabled {
      opacity: 0.3;
      cursor: default;
    }
    .number {
      font-size: 1rem;
      width: 3rem;
      height: 2.5rem;
      line-height: 2.5rem;
      text-align: center;
    }
    .command-information {
      flex: 1;
      .command-helper {
        font-size: 0.9rem;
        height: 1.1rem;
        line-height: 1.1rem;
        .realdate {
          font-size: 0.8rem;
          margin-left: 24px;
          color: #777;
        }
        .rest {
          margin-left: 24px;
          .rest-time {
            margin: 0 4px;
            font-weight: bold;
            color: red;
          }
        }
      }
      .command-text {
        font-size: 1.1rem;
        height: 1.4rem;
        line-height: 1.4rem;
        font-weight: bold;
      }
    }
  }
}
</style>
