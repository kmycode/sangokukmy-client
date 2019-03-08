<template>
  <div id="unit-list-view" class="loading-container" style="overflow:auto">
    <div style="width:100%;height:100%;overflow:auto;margin:0;">
      <div v-if="model.leaderUnit && model.leaderUnit.id >= 0">
        <h3>{{ model.leaderUnit.name }}</h3>
        <div class="unit-form">
          <span class="input-label unit-name-input-label">名前</span><input type="text" class="unit-name-input" v-model="model.leaderUnit.name"><br>
          <span class="input-label unit-message-input-label">メッセージ</span><input type="text" class="unit-message-input" v-model="model.leaderUnit.message"><br>
          <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': !model.leaderUnit.isLimited, 'btn-secondary': model.leaderUnit.isLimited }" @click="model.leaderUnit.isLimited = !model.leaderUnit.isLimited">入隊を制限する</button><br>
          <div class="button-group">
            <button class="btn btn-primary" @click="model.updateLeaderUnit()" href="#">保存</button>
            <button class="btn btn-light" @click="isShowUnitLeaderOperations = !isShowUnitLeaderOperations" href="#">その他の操作</button>
            <button v-show="isShowUnitLeaderOperations" class="btn btn-danger" @click="model.removeLeaderUnit()" href="#">削除</button>
          </div>
        </div>
      </div>
      <div v-else>
        <button class="btn btn-secondary" @click="isShowCreateUnitForm = true" href="#">部隊作成</button>
        <div v-show="isShowCreateUnitForm" class="unit-form">
          <h3>部隊作成</h3>
          <span class="input-label unit-name-input-label">名前</span><input type="text" class="unit-name-input" v-model="model.leaderUnit.name"><br>
          <span class="input-label unit-message-input-label">メッセージ</span><input type="text" class="unit-message-input" v-model="model.leaderUnit.message"><br>
          <div class="button-group">
            <button class="btn btn-primary" @click="model.createUnit()" href="#">作成</button>
          </div>
        </div>
      </div>
      <div class="unit-list">
        <UnitPicker :units="model.units"
                    :value="selectedUnit"
                    :countries="model.countries"
                    @input="model.toggleUnit($event)"/>
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
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import UnitPicker from '@/components/parts/UnitPicker.vue';
import * as def from '@/common/definitions';
import Enumerable from 'linq';

@Component({
  components: {
    MiniCharacterList,
    CharacterIcon,
    UnitPicker,
  },
})
export default class UnitListView extends Vue {
  @Prop() private model!: UnitModel;
  @Prop() private isShow!: boolean;
  private isShowUnitLeaderOperations: boolean = false;
  private isShowCreateUnitForm: boolean = false;

  private get selectedUnit(): api.Unit | undefined {
    return Enumerable.from(this.model.units).firstOrDefault((u) => u.isSelected);
  }

  @Watch('isShow')
  private updateIsShow() {
    // 表示状態を初期化
    this.isShowCreateUnitForm = false;
    this.model.updateUnits();
  }
}
</script>

<style lang="scss" scoped>
#unit-list-view {

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
