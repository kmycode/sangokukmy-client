<template>
  <div class="loading-container">
    <div v-show="canWrite" class="item-post-form new-thread">
      <div class="label">タイトル</div>
      <div class="title"><input type="text" v-model="newThread.title"></div>
      <div class="label">本文</div>
      <div class="text"><textarea class="text" v-model="newThread.text" @keyup.ctrl.enter.prevent.stop="write(newThread)"></textarea></div>
      <div class="buttons"><button type="button" class="btn btn-primary" @click="write(newThread)">新規スレッド</button></div>
    </div>
    <div v-for="thread in threads"
         :key="thread.id"
         :class="'thread country-color-' + getItemCountry(thread).colorId">
      <div :class="'thread-first country-color-' + getItemCountry(thread).colorId">
        <h3 :class="'thread-title country-color-' + getItemCountry(thread).colorId">{{ thread.title }}</h3>
        <div class="thread-row">
          <div class="thread-icon">
            <CharacterIcon :icon="thread.character.mainIcon"/>
          </div>
          <div :class="'thread-text country-color-' + getItemCountry(thread).colorId">
            <KmyChatTagText :text="thread.text"/>
          </div>
        </div>
        <div class="item-footer">
          <span class="character-name">{{ thread.character.name }}</span>
          <span class="country-name">{{ getItemCountry(thread).name }}</span>
          <span class="item-date">{{ thread.written | realdate }}</span>
        </div>
        <div v-show="canWrite" class="item-post-form reply">
          <div class="text"><textarea class="text" v-model="getThreadReply(thread).data.text" @keyup.ctrl.enter.prevent.stop="write(getThreadReply(thread).data)"></textarea></div>
          <div class="buttons">
            <button type="button" class="btn btn-primary" @click="write(getThreadReply(thread).data)">リプライ</button>
            <button v-show="bbsType === 1 && canRemove && (canRemoveAll || characterId === thread.character.id)" type="button" class="btn btn-light" @click="getThreadReply(thread).isOpenExtraOperations ^= true">その他の操作</button>
            <button v-show="bbsType === 1 && getThreadReply(thread).isOpenExtraOperations && (canRemoveAll || characterId === thread.character.id)" type="button" class="btn btn-danger" @click="remove(thread)">スレッド削除</button>
          </div>
        </div>
      </div>
      <transition-group name="message" tag="div">
        <div v-for="child in thread.children"
            :key="child.id"
            :class="'child country-color-' + getItemCountry(child).colorId">
          <div v-if="(!isCharacterMuted(child) && !isMessageMuted(child)) || isShowForce(child)">
            <div class="child-row">
              <div class="child-icon">
                <CharacterIcon :icon="child.character.mainIcon"/>
              </div>
              <div class="child-message">
                <KmyChatTagText :text="child.text"/>
              </div>
            </div>
            <div class="item-footer">
              <span class="character-name">{{ child.character.name }}</span>
              <span class="country-name">{{ getItemCountry(child).name }}</span>
              <span class="item-date">{{ child.written | realdate }}</span>
              <button v-show="canRemove && (canRemoveAll || characterId === child.character.id)" type="button" class="btn btn-light" @click="getThreadReply(thread).isOpenExtraOperations ^= true">操作</button>
              <button v-show="getThreadReply(thread).isOpenExtraOperations && (canRemoveAll || characterId === child.character.id)" type="button" class="btn btn-danger" @click="remove(child)">削除</button>
              <div v-show="characterId !== child.character.id">
                <a v-if="!isCharacterMuted(child)" class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="muteCharacter(child, true)">武将をミュート</a>
                <a v-if="!isReported(child)" class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(child, true)">発言を報告</a>
              </div>
            </div>
          </div>
          <div v-if="isCharacterMuted(child)" style="display:flex">
            この武将をミュートしました
            <div>
              <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="muteCharacter(child, false)">ミュートを解除</a>
              <a v-if="!child.isShowForce" class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="child.isShowForce = true">発言を見る</a>
              <a v-else class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="child.isShowForce = false">発言を隠す</a>
            </div>
          </div>
          <div v-else-if="isMessageMuted(child)" style="display:flex">
            この発言には特定のキーワードが含まれるためミュートしました
            <div>
              <a v-if="!child.isShowForce" class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="child.isShowForce = true">発言を見る</a>
              <a v-else class="btn btn-sm btn-light" style="height:20px;line-height:16px;margin-left:8px" @click="child.isShowForce = false">発言を隠す</a>
            </div>
          </div>
          <div v-if="isReported(child)" style="display:flex">
            この発言を報告しました。補足説明がある場合は、管理人へ個宛してください。（個人タブに案内があります）
            <div>
              <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(child, false)">報告を解除</a>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
    <div class="loading" v-show="isUpdating"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import KmyChatTagText from '@/components/parts/KmyChatTagText.vue';
import * as api from '@/api/api';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

class ThreadBbsReplyData {
  public isOpenExtraOperations: boolean = false;

  public constructor(public readonly data: api.ThreadBbsReply) {}
}

@Component({
  components: {
    CharacterIcon,
    KmyChatTagText,
  },
})
export default class ThreadBbs extends Vue {
  @Prop() public countries!: api.Country[];
  @Prop() public threads!: api.ThreadBbsItem[];
  @Prop() public bbsType!: number;
  @Prop() public mutes!: api.Mute[];
  @Prop() public muteKeyword!: api.MuteKeyword;
  @Prop({
    default: 0,
  }) public characterId!: number;
  @Prop({
    default: false,
  }) public canRemoveAll!: boolean;
  @Prop({
    default: true,
  }) public canWrite!: boolean;
  @Prop({
    default: true,
  }) public canRemove!: boolean;

  private isUpdating: boolean = false;
  private replies: ThreadBbsReplyData[] = [];
  private newThread = new api.ThreadBbsReply();

  private getThreadReply(item: api.ThreadBbsItem): ThreadBbsReplyData {
    const reply = Enumerable
      .from(this.replies)
      .firstOrDefault((r) => r.data.parentId === item.id);
    if (reply !== undefined) {
      return reply;
    } else {
      const newReply = new api.ThreadBbsReply();
      newReply.parentId = item.id;
      const data = new ThreadBbsReplyData(newReply);
      this.replies.push(data);
      return data;
    }
  }

  private getItemCountry(item: api.ThreadBbsItem): api.Country {
    const country = Enumerable
      .from(this.countries)
      .firstOrDefault((c) => c.id === item.countryId);
    if (country !== undefined) {
      return country;
    } else {
      return api.Country.default;
    }
  }

  private write(item: api.ThreadBbsReply) {
    if (!item.text || item.text === '') {
      NotificationService.countryBbsPostFailedBecauseEmptyText.notify();
    } else if (!item.parentId && (!item.title || item.title === '')) {
      NotificationService.countryBbsPostFailedBecauseEmptyTitle.notify();
    } else {
      this.isUpdating = true;
      if (this.bbsType === 1) {
        api.Api.writeCountryBbsItem(item.text, item.parentId, item.title)
          .then(() => {
            NotificationService.countryBbsPosted.notify();
            item.title = '';
            item.text = '';
          })
          .catch(() => {
            NotificationService.countryBbsPostFailed.notify();
          })
          .finally(() => {
            this.isUpdating = false;
          });
      } else if (this.bbsType === 2) {
        api.Api.writeGlobalBbsItem(item.text, item.parentId, item.title)
          .then(() => {
            NotificationService.countryBbsPosted.notify();
            item.title = '';
            item.text = '';
          })
          .catch(() => {
            NotificationService.countryBbsPostFailed.notify();
          })
          .finally(() => {
            this.isUpdating = false;
          });
      }
    }
  }

  private remove(item: api.ThreadBbsItem) {
    this.isUpdating = true;
    if (this.bbsType === 1) {
      api.Api.removeCountryBbsItem(item.id)
        .then(() => {
          NotificationService.countryBbsRemoved.notify();
        })
        .catch(() => {
          NotificationService.countryBbsRemoveFailed.notify();
        })
        .finally(() => {
          this.isUpdating = false;
        });
    } else if (this.bbsType === 2) {
      api.Api.removeGlobalBbsItem(item.id)
        .then(() => {
          NotificationService.countryBbsRemoved.notify();
        })
        .catch(() => {
          NotificationService.countryBbsRemoveFailed.notify();
        })
        .finally(() => {
          this.isUpdating = false;
        });
    }
  }

  private isCharacterMuted(item: api.ThreadBbsItem): boolean {
    if (item.character) {
      const chara = item.character;
      return this.mutes.some((m) => m.targetCharacterId === chara.id);
    }
    return false;
  }

  private isMessageMuted(item: api.ThreadBbsItem): boolean {
    return api.MuteKeyword.isMute(this.muteKeyword, item.text);
  }

  private isReported(item: api.ThreadBbsItem): boolean {
    return this.mutes.some((m) => m.threadBbsItemId === item.id && m.type === api.Mute.typeReported);
  }

  private isShowForce(item: api.ThreadBbsItem) {
    const val = (item as any).isShowForce;
    if (val === undefined) {
      Vue.set(item, 'isShowForce', false);
    }
    return val;
  }

  private setShowForce(item: api.ThreadBbsItem, value: boolean) {
    Vue.set(item, 'isShowForce', value);
  }

  private muteCharacter(item: api.ThreadBbsItem, status: boolean) {
    if (item.character) {
      const chara = item.character;
      this.isUpdating = true;
      api.Api.muteCharacter(status ? api.Mute.typeMuted : api.Mute.typeNone, chara.id)
        .then(() => {
          NotificationService.muted.notify();
          (item as any).isShowForce = false;
        })
        .catch(() => NotificationService.muteFailed.notify())
        .finally(() => this.isUpdating = false);
    }
  }

  private reportMessage(item: api.ThreadBbsItem, status: boolean) {
    this.isUpdating = true;
    api.Api.reportThreadBbsItem(status ? api.Mute.typeReported : api.Mute.typeNone, item.id)
      .then(() => {
        NotificationService.reported.notify();
        (item as any).isShowForce = false;
      })
      .catch(() => NotificationService.reportFailed.notify())
      .finally(() => this.isUpdating = false);
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/country-color.scss';

.item-post-form {
  margin: 0 8px;
  input, textarea {
    width: 100%;
  }
  input {
    font-size: 20px;
  }
  .buttons {
    text-align: right;
  }
  .label {
    font-weight: bold;
    color: gray;
    font-size: 12px;
    margin-left: 12px;
  }
  &.reply {
    margin-top: 12px;
  }
}

.thread {
  @include country-color-light('background-color');
  @include country-color-deep('color');
  word-wrap: break-word;
  border-radius: 16px 16px 8px 8px;
  overflow: hidden;
  margin: 24px 0;
  .thread-first {
    .thread-title {
      font-size: 28px;
      padding: 4px 8px;
      @include country-color-deep('background-color');
      @include country-color-light('color');
    }
    .thread-row {
      display: flex;
      .thread-icon {
        margin: 8px;
        align-self: flex-start;
      }
      .thread-text {
        flex: 1;
        width: 0;
        padding: 4px 8px;
        @include country-color-deep('background-color');
        @include country-color-light('color');
      }
    }
  }

  .item-footer {
    text-align: right;
      font-size: 12px;
    .character-name {
      font-weight: bold;
    }
    .country-name {
      padding-left: 8px;
    }
    .item-date {
      padding-left: 8px;
      padding-right: 12px;
    }
  }

  .child {
    border-top-width: 1px;
    border-top-style: dashed;
    padding: 0 8px 12px;
    @include country-color-deep('border-top-color');
    @include country-color-deep('color');
    @include country-color-light('background-color');
    .child-row {
      display: flex;
      .child-icon {
        margin: 8px;
        align-self: flex-start;
      }
      .child-message {
        align-self: center;
        flex: 1;
        width: 0;
      }
    }
  }
}

.message-enter-active, .message-leave-active {
  transition: opacity .2s;
}

.message-enter, .message-leave-to {
  opacity: 0;
}

.message-move {
  transition: transform .2s;
}
</style>

