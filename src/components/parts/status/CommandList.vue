<template>
  <div id="command-list">
    <!-- コマンド選択のタブ -->
    <ul class="nav nav-pills nav-fill">
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 0 }" @click.prevent.stop="selectedCommandCategory = 0" href="#">内政</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 1 }" @click.prevent.stop="selectedCommandCategory = 1" href="#">政策</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 2 }" @click.prevent.stop="selectedCommandCategory = 2" href="#">軍事</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 4 }" @click.prevent.stop="selectedCommandCategory = 4" href="#">個人</a></li>
      <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedCommandCategory === 5 }" @click.prevent.stop="selectedCommandCategory = 5" href="#">特殊</a></li>
    </ul>
    <div class="loading-container">
      <!-- 内政コマンド -->
      <div v-show="selectedCommandCategory === 0" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(1)">農業<span class="redundant-text">開発</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(2)">商業<span class="redundant-text">発展</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(3)">技術<span class="redundant-text">開発</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(4)">城壁<span class="redundant-text">強化</span></button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(6)">米施し</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(30)">緊急米施し</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(31)">都市施設<span class="redundant-text">強化</span></button>
        <button v-if="canSubBuilding" class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenSubBuildingPopup = !isOpenSubBuildingPopup">建築物
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenSubBuildingPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSubBuildingPopup = false; $emit('open', 'subbuilding-build')">建設</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSubBuildingPopup = false; $emit('open', 'subbuilding-remove')">撤去</a>
          </div>
        </button>
      </div>
      <!-- 増強コマンド -->
      <div v-show="selectedCommandCategory === 1" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(44)">政策<span class="redundant-text">開発</span></button>
        <button v-if="list.canUseCountrySafe && !canSafeOut" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'safe')">国庫納入</button>
        <button v-if="list.canUseCountrySafe && canSafeOut" class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenSafePopup = !isOpenSafePopup">国庫
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenSafePopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSafePopup = false; $emit('open', 'safe')">納入</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSafePopup = false; $emit('open', 'safe-out')">搬出</a>
          </div>
        </button>
        <button v-if="list.canUseCountrySecretary && canSecretary" class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenSecretaryPopup = !isOpenSecretaryPopup">政務官
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenSecretaryPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSecretaryPopup = false; $emit('open', 'secretary-add')">雇用</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSecretaryPopup = false; $emit('open', 'secretary')">配属（部隊）</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSecretaryPopup = false; $emit('open', 'secretary-town')">配属（都市）</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenSecretaryPopup = false; $emit('open', 'secretary-remove')">解任</a>
          </div>
        </button>
      </div>
      <!-- 軍事コマンド -->
      <div v-show="selectedCommandCategory === 2" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'soldier')">徴兵</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(11)"><span class="redundant-text">兵士</span>訓練</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(12)"><span class="redundant-text">城の</span>守備</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'town-war')">戦争</button>
        <button class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenFormationPopup = !isOpenFormationPopup">陣形
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenFormationPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenFormationPopup = false; $emit('open', 'formation-add')">獲得</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenFormationPopup = false; $emit('open', 'formation-change')">変更</a>
          </div>
        </button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(14)">集合</button>
      </div>
      <!-- 個人コマンド -->
      <div v-show="selectedCommandCategory === 4" class="commands">
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'town-move')">移動</button>
        <button class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenTrainingPopup = !isOpenTrainingPopup"><span class="redundant-text">能力</span>強化
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenTrainingPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenTrainingPopup = false; list.inputer.inputTrainingCommand(18, 1)">武力</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenTrainingPopup = false; list.inputer.inputTrainingCommand(18, 2)">知力</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenTrainingPopup = false; list.inputer.inputTrainingCommand(18, 3)">統率</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenTrainingPopup = false; list.inputer.inputTrainingCommand(18, 4)">人望</a>
          </div>
        </button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'promotion')">登用</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'rice')">米売買</button>
        <button class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenItemPopup = !isOpenItemPopup">アイテム
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenItemPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenItemPopup = false; $emit('open', 'item-buy')">購入</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenItemPopup = false; $emit('open', 'item-sell')">売却</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenItemPopup = false; $emit('open', 'item-handover')">譲渡</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenItemPopup = false; $emit('open', 'item-use')">使用</a>
          </div>
        </button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(62)">探索</button>
        <button type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(0)">何もしない</button>
        <button v-if="!list.store.character.countryId" type="button" class="btn btn-primary" :disabled="!list.inputer.canInput" @click="list.inputer.inputMoveCommand(23)">仕官</button>
        <!-- <button type="button" class="btn btn-light">下野</button> -->
      </div>
      <!-- 特殊コマンド -->
      <div v-show="selectedCommandCategory === 5" class="commands">
        <button v-if="list.canInputTownPatrol" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(54)">都市巡回</button>
        <button v-if="list.canInputTownInvent" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(55)">都市投資</button>
        <button v-if="list.canInputGenerateItem" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'item-generate')">資源製造</button>
        <button v-if="list.canInputGenerateItem2" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'item-generate')">胡人交易</button>
        <button v-if="list.canInputGenerateItem3" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'item-generate')">精鋭検査</button>
        <button v-if="list.canInputGenerateItem4" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'item-generate')">書物執筆</button>
        <button v-if="list.canInputIncreasePeople" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(58)">農民呼寄</button>
        <button v-if="list.canInputDecreasePeople" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(59)">農民避難</button>
        <button v-if="list.canInputSoldierTrainingAll" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(60)">合同訓練</button>
        <button v-if="list.canInputSpy" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="$emit('open', 'town-spy')">偵察</button>
        <!-- <button class="btn btn-secondary dropdown-toggle dropdown-toggle-custom" :disabled="!list.inputer.canInput" @click="isOpenAiCharacterPopup = !isOpenAiCharacterPopup">別動隊
          <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenAiCharacterPopup && list.inputer.canInput ? 'block' : 'none' }">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenAiCharacterPopup = false; list.inputer.inputCommand(66)">雇用</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenAiCharacterPopup = false; $emit('open', 'flyingcolumn-customize')">指示</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenAiCharacterPopup = false; $emit('open', 'flyingcolumn-remove')">削除</a>
          </div>
        </button> -->
        <button v-if="list.canInputChangeTime" type="button" class="btn btn-light" :disabled="!list.inputer.canInput" @click="list.inputer.inputCommand(65)">静養</button>
        <button v-if="canCommandComment" type="button" class="btn btn-primary" :disabled="!list.inputer.canInput" @click="$emit('open', 'command-comment')">コメント</button>
      </div>
      <div class="loading" v-show="list.inputer.isInputing"><div class="loading-icon"></div></div>
    </div>
    <!-- 選択ツール -->
    <div class="command-input-options">
      <button type="button" class="btn btn-light" @click="list.inputer.clearAllCommandSelections()">消<span class="redundant-text">去</span></button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectAllCommands()">全<span class="redundant-text">て</span></button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectOddCommands()">偶<span class="redundant-text">数</span></button>
      <button type="button" class="btn btn-light" @click="list.inputer.selectEvenCommands()">奇<span class="redundant-text">数</span></button>
      <button type="button" :class="{'btn': true, 'btn-light': !isOpenAxb, 'btn-primary': isOpenAxb}" @click="isOpenAxb = !isOpenAxb">ax+b</button>
      <button class="btn btn-light dropdown-toggle dropdown-toggle-custom" @click="isOpenMonthPopup = !isOpenMonthPopup">月
        <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenMonthPopup ? 'block' : 'none', 'min-width': '80px', 'right': '0', 'left': 'auto', }">
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(1)">1月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(2)">2月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(3)">3月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(4)">4月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(5)">5月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(6)">6月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(7)">7月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(8)">8月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(9)">9月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(10)">10月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(11)">11月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectMonthCommands(12)">12月</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectEvenMonthCommands()">偶数</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMonthPopup = false; list.inputer.selectOddMonthCommands()">奇数</a>
        </div>
      </button>
    </div>
    <div v-show="isOpenAxb" class="command-input-axb">
      <input type="number" v-model.number="axbA" min="1"> の倍数＋ <input type="number" v-model.number="axbB" min="0">
      <button type="button" class="btn btn-light btn-sm" @click="list.inputer.selectAxbCommands(axbA, axbB)">選択</button>
    </div>
    <!-- 選択アルゴリズム -->
    <div class="command-select-options">
      <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': isMultiCommandsSelection }" @click="isMultiCommandsSelection = !isMultiCommandsSelection">複数選択</button>
      <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': isRanged }" @click="isRanged = !isRanged; list.inputer.setRanged(isRanged); updatePreview()">範囲</button>
      <button type="button" class="btn btn-secondary loading-container" :disabled="!list.inputer.canInput || isRanged" @click="list.inputer.insertCommands()">挿<span class="redundant-text">入</span><div class="loading" v-show="list.inputer.isInputing"><div class="loading-icon"></div></div></button>
      <button type="button" class="btn btn-secondary loading-container" :disabled="!list.inputer.canInput || isRanged" @click="list.inputer.removeCommands()">削<span class="redundant-text">除</span><div class="loading" v-show="list.inputer.isInputing"><div class="loading-icon"></div></div></button>
      <button type="button" class="btn btn-secondary loading-container" :disabled="!list.inputer.canInput" @click="list.inputer.loopCommands()">繰返<div class="loading" v-show="list.inputer.isInputing"><div class="loading-icon"></div></div></button>
    </div>
    <!-- 放置削除の通知 -->
    <div v-if="list.inputer.isStopCommand" class="alert alert-danger">
      あなたは現在謹慎されています。謹慎中はコマンドの実行がスキップされます。新しいコマンドを入力することで、謹慎状態を解除できます。理由については自分の国にお問い合わせください
    </div>
    <div v-else-if="isShowDeleteTurn" class="alert alert-danger command-delete-turn-notify">
      このままコマンドを入力／実行しなかった場合、あなたは残り <span class="number">{{ deleteTurn }}</span> ターンで削除されます
    </div>
    <div v-else-if="list.isFewRemaining" class="alert alert-warning">
      50ターン以内に、何も実行しないコマンドが存在します
    </div>
    <div class="command-list" ref="list">
      <div v-for="command in list.commands"
           :key="command.commandNumber"
           :class="{ 'command-list-item': true, 'selected': command.isSelected, 'disabled': !command.canSelect, 'previewed': command.isPreview }"
           @click="onCommandSelected(command, $event)">
        <div v-if="command.isPreview" class="background-layer background-layer-previewed"></div>
        <div v-if="command.event === 1" class="background-layer background-layer-war-start"></div>
        <div v-if="command.event === 2" class="background-layer background-layer-in-war"></div>
        <div v-if="command.event === 3" class="background-layer background-layer-town-war"></div>
        <div v-if="command.event === 4" class="background-layer background-layer-reset"></div>
        <div v-if="command.event === 5" class="background-layer background-layer-battle-start"></div>
        <div v-if="command.event === 6" class="background-layer background-layer-after-reset"></div>
        <div v-if="command.event === 7" class="background-layer background-layer-custom-message"></div>
        <div class="command-list-item-background"></div>
        <div class="command-list-item-content">
          <div class="number">{{ command.commandNumber }}</div>
          <div class="command-information">
            <div class="command-helper"><span class="gamedate">{{ command.gameDate | gamedate }}</span><span class="realdate" v-if="command.commandNumber > 1">{{ command.date | realdate }}</span><span class="rest" v-if="command.commandNumber === 1">実行まであと<span class="rest-time">{{ list.secondsOfNextCommand }}</span>秒</span></div>
            <div class="command-text">{{ command.name }}</div>
            <div v-if="command.eventMessage" class="event-message">{{ command.eventMessage }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="command-list-action">
      <button type="button" class="btn btn-primary command-list-action-button" @click="isOpenMovePopup ^= true">移動
        <div class="dropdown-menu dropdown-menu-custom" :style="{ 'display': isOpenMovePopup ? 'block' : 'none', 'min-width': '80px', 'right': '0', 'left': 'auto', 'top': '-250px', }">
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(1)">1</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(50)">50</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(100)">100</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(150)">150</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(200)">200</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(250)">250</a>
          <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMovePopup = false; scrollToNumber(300)">300</a>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import CommandList from '@/models/status/commandlist';
import * as def from '@/common/definitions';
import Enumerable from 'linq';

@Component({
  components: {
  },
})
export default class CommandListView extends Vue {
  @Prop() private list!: CommandList;
  @Prop() private characterDeleteTurn!: number;
  @Prop() private canSafeOut!: boolean;
  @Prop() private canSecretary!: boolean;
  @Prop() private canCommandComment!: boolean;
  @Prop() private canSubBuilding!: boolean;
  @Prop() private gameDate!: api.GameDateTime;
  private selectedCommandCategory: number = 0;
  private isMultiCommandsSelection: boolean = false;
  private isOpenAxb: boolean = false;
  private isRanged: boolean = false;
  private isOpenSafePopup: boolean = false;
  private isOpenScouterPopup: boolean = false;
  private isOpenSecretaryPopup: boolean = false;
  private isOpenFormationPopup: boolean = false;
  private isOpenItemPopup: boolean = false;
  private isOpenTrainingPopup: boolean = false;
  private isOpenSubBuildingPopup: boolean = false;
  private isOpenMonthPopup: boolean = false;
  private isOpenAiCharacterPopup: boolean = false;
  private isOpenMovePopup: boolean = false;

  private axbA: number = 3;
  private axbB: number = 0;

  private get deleteTurn(): number {
    return def.CHARACTER_DELETE_TURN - this.characterDeleteTurn;
  }

  public get isShowDeleteTurn(): boolean {
    let isShow = this.characterDeleteTurn > 0;
    if (isShow && this.gameDate.year < def.UPDATE_START_YEAR) {
      isShow = this.list.isFewRemaining;
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

  private scrollToNumber(num: number) {
    (this.$refs.list as Element).scrollTo(0, (num - 1) * 45);
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
  min-height: 0;
  position: relative;
  .nav {
    .active {
      background-color: #6bf;
    }
  }
  button {
    @include media-query-lower(sm) {
      .redundant-text {
        display: none;
      }
    }
  }
  .dropdown-toggle-custom {
    position: relative;
  }
  .droptown-menu-custom {
    position: absolute;
    top: 100%;
  }
  .commands {
    display: flex;
    flex-flow: row wrap;
    button {
      margin: 4px 4px 0 0;
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
      width: 3.6em;
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
    border-bottom: 1px dashed #ccf;
    background: white;
    cursor: pointer;
    user-select: none;
    position: relative;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      .command-list-item-background {
        background: #c1c4ec;
      }
    }
    &.selected {
      .command-list-item-background {
        background: #9699e4;
      }
      &:hover {
        .command-list-item-background {
          background: #6161bf;
        }
      }
    }
    &.disabled {
      opacity: 0.3;
      cursor: default;
    }
  }
  .command-list-item-background {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: #eaeafc;
    opacity: 0.5;
    transition: background-color .1s ease-in;
    z-index: 0;
  }
  .background-layer {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0.5;
    &.background-layer-war-start {
      background: #f22;
    }
    &.background-layer-in-war {
      background: #f99;
    }
    &.background-layer-town-war {
      background: #f4c;
    }
    &.background-layer-reset {
      background: #892;
    }
    &.background-layer-battle-start {
      background: #29f;
    }
    &.background-layer-after-reset {
      background: #999;
    }
    &.background-layer-custom-message {
      background: #54ff42;
    }
    &.background-layer-previewed {
      background: #eb2;
    }
  }
  .command-list-item-content {
    padding: 2px 4px;
    display: flex;
    z-index: 1;
    position: relative;
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
      .event-message {
        font-size: 0.9rem;
        height: 1.1rem;
        line-height: 1.1rem;
        color: #454545;
      }
    }
  }
  .command-list-action {
    position: absolute;
    bottom: 16px;
    right: 16px;
    z-index: 1;
  }
}
</style>
