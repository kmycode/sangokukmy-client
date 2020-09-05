<template>
  <div id="unit-list-view" class="loading-container" style="overflow:auto">
    <div style="width:100%;height:100%;display:flex;flex-direction:column;overflow:auto;margin:0;">
      <div class="mode-toggle">
        <button :class="{'btn': true, 'btn-secondary': mode === 0, 'btn-outline-secondary': mode !== 0}" @click="mode = 0" href="#">部隊一覧</button>
        <button v-if="!model.leaderUnit || model.leaderUnit.id < 0" :class="{'btn': true, 'btn-secondary': mode === 1, 'btn-outline-secondary': mode !== 1}" @click="mode = 1" href="#">部隊作成</button>
        <button v-if="model.leaderUnit && model.leaderUnit.id >= 0" :class="{'btn': true, 'btn-secondary': mode === 2, 'btn-outline-secondary': mode !== 2}" @click="mode = 2" href="#">部隊編集</button>
        <button v-if="model.leaderUnit && model.leaderUnit.id >= 0" :class="{'btn': true, 'btn-secondary': mode === 3, 'btn-outline-secondary': mode !== 3}" @click="mode = 3" href="#">武将一覧</button>
      </div>
      <div v-show="mode === 1" class="unit-form">
        <span class="input-label unit-name-input-label">名前</span><input type="text" class="unit-name-input" v-model="model.leaderUnit.name"><br>
        <span class="input-label unit-message-input-label">メッセージ</span><input type="text" class="unit-message-input" v-model="model.leaderUnit.message"><br>
        <div class="button-group">
          <button class="btn btn-primary" @click="model.createUnit()" href="#">作成</button>
        </div>
      </div>
      <div v-show="mode === 2">
        <h3>{{ model.leaderUnit.name }}</h3>
        <div class="unit-form">
          <span class="input-label unit-name-input-label">名前</span><input type="text" class="unit-name-input" v-model="model.leaderUnit.name"><br>
          <span class="input-label unit-message-input-label">メッセージ</span><input type="text" class="unit-message-input" v-model="model.leaderUnit.message"><br>
          <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': model.leaderUnit.isLimited }" @click="model.leaderUnit.isLimited = !model.leaderUnit.isLimited">入隊を制限する</button><br>
          <div class="button-group">
            <button class="btn btn-primary" @click="model.updateLeaderUnit()" href="#">保存</button>
            <button class="btn btn-light" @click="isShowUnitLeaderOperations = !isShowUnitLeaderOperations" href="#">その他の操作</button>
            <button v-show="isShowUnitLeaderOperations" class="btn btn-danger" @click="model.removeLeaderUnit()" href="#">削除</button>
          </div>
        </div>
      </div>
      <div v-show="mode === 0" class="unit-list">
        <div v-if="!selectedUnit || !selectedUnit.id" class="alert alert-info">あなたは現在、どの部隊にも所属していません</div>
        <div v-else class="alert alert-info">あなたは現在、<span style="font-weight:bold">{{ selectedUnit.name }}</span> に所属しています</div>
        <UnitPicker :units="model.units"
                    :value="selectedUnit"
                    :countries="model.countries"
                    :characters="model.characters"
                    :commands="model.commands"
                    :otherCharacterCommands="model.otherCharacterCommands"
                    @input="model.toggleUnit($event)"/>
      </div>
      <div v-show="mode === 3" style="display:flex;flex-direction:column;height:100%">
        <div style="overflow:auto;flex:1">
          <SimpleCharacterList
            :countries="model.countries"
            :characters="model.countryCharacters"
            canSelect="true"
            v-model="changeLeaderTarget"/>
        </div>
        <div v-show="changeLeaderTarget && changeLeaderTarget.id > 0" style="text-align:right">
          <button class="btn btn-secondary" @click="model.dischargeMember(changeLeaderTarget.id)">除隊</button>
          <button class="btn btn-secondary" @click="model.changeLeaderUnitLeader(changeLeaderTarget.id)">部隊長交代</button>
        </div>
      </div>
    </div>
    <div class="loading" v-show="model.isUpdating"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/api';
import UnitModel from '@/models/status/unitmodel';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import SimpleCharacterList from '@/components/parts/SimpleCharacterList.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import UnitPicker from '@/components/parts/UnitPicker.vue';
import * as def from '@/common/definitions';
import Enumerable from 'linq';

@Component({
  components: {
    MiniCharacterList,
    SimpleCharacterList,
    CharacterIcon,
    UnitPicker,
  },
})
export default class UnitListView extends Vue {
  @Prop() private model!: UnitModel;
  @Prop() private isShow!: boolean;
  private isShowUnitLeaderOperations: boolean = false;
  private mode: number = 0;
  private changeLeaderTarget: api.Character = new api.Character(-1);

  private get selectedUnit(): api.Unit | undefined {
    return Enumerable.from(this.model.units).firstOrDefault((u) => u.isSelected);
  }

  @Watch('isShow')
  private updateIsShow() {
    // 表示状態を初期化
    this.mode = 0;
    this.model.updateUnits();
  }

  @Watch('model.leaderUnit')
  private updateLeaderUnit() {
    this.mode = 0;
  }
}
</script>

<style lang="scss" scoped>
#unit-list-view {

  .mode-toggle {
    margin-bottom: 8px;
  }

  .unit-form {
    .unit-message-input {
      min-width: 70%;
      margin: 4px 0;
    }

    .button-group {
      text-align: right;
    }

    .input-label {
      color: #666;
      width: 6.5em;
      display: inline-block;
    }
  }
}
</style>
