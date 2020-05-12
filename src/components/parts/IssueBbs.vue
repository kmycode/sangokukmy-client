<template>
  <div style="height:100%;overflow:auto">
    <div class="loading-container">
      <div v-show="currentThread.length <= 0">
        <h3>スレッド一覧</h3>
        <button type="button" class="btn btn-secondary" @click="loadPage(1)">更新</button>
        <button type="button" class="btn btn-secondary dropdown-toggle" @click="isOpenStatusPopup ^= true">
          <span v-show="filteringStatus === 0">状態</span>
          <span v-show="filteringStatus === 1">新規</span>
          <span v-show="filteringStatus === 2">議論中</span>
          <span v-show="filteringStatus === 3">準備完了</span>
          <span v-show="filteringStatus === 5">実装中</span>
          <span v-show="filteringStatus === 6">完了</span>
          <span v-show="filteringStatus === 12">保留</span>
          <span v-show="filteringStatus === 7">却下</span>
          <span v-show="filteringStatus === 8">重複</span>
          <span v-show="filteringStatus === 9">複合</span>
          <span v-show="filteringStatus === 10">無効</span>
          <span v-show="filteringStatus === 11">対応せず</span>
          <div class="dropdown-menu" :style="(isOpenStatusPopup ? 'display:block' : 'display:none') + ';top:auto;left:auto;margin-top:8px;margin-left:-16px'">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 1; loadPage(1)">新規</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 2; loadPage(1)">議論中</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 3; loadPage(1)">準備完了</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 5; loadPage(1)">実装中</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 6; loadPage(1)">完了</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 12; loadPage(1)">保留</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 7; loadPage(1)">却下</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 8; loadPage(1)">重複</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 9; loadPage(1)">複合</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 10; loadPage(1)">無効</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 11; loadPage(1)">対応せず</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenStatusPopup = false; filteringStatus = 0; loadPage(1)">全て</a>
          </div>
        </button>
        <button type="button" class="btn btn-secondary dropdown-toggle" @click="isOpenMilestonePopup ^= true">
          <span v-show="filteringMilestone === 0">マイルストーン</span>
          <span v-show="filteringMilestone === 1">今期</span>
          <span v-show="filteringMilestone === 2">来期</span>
          <div class="dropdown-menu" :style="(isOpenMilestonePopup ? 'display:block' : 'display:none') + ';top:auto;left:auto;margin-top:8px;margin-left:-16px'">
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMilestonePopup = false; filteringMilestone = 1; loadPage(1)">今期</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMilestonePopup = false; filteringMilestone = 2; loadPage(1)">来期</a>
            <a class="dropdown-item" href="#" @click.prevent.stop="isOpenMilestonePopup = false; filteringMilestone = 0; loadPage(1)">全て</a>
          </div>
        </button>
        <div v-show="isNeedUpdatePage" class="alert alert-warning">
          スレッド一覧を更新してください
        </div>
        <div class="threads">
          <div class="paging">
            <div class="paging-prev"><button v-show="page > 1" type="button" class="btn btn-light" @click="loadPage(page - 1)">戻る</button></div>
            <div class="paging-current"><span>{{ page }}</span></div>
            <div class="paging-next"><button v-show="canNextPage" type="button" class="btn btn-light" @click="loadPage(page + 1)">次へ</button></div>
          </div>
          <div :class="'thread-list-item' + (thread.status >= 6 && thread.status <= 11 ? ' completed' : '')"
              v-for="thread in threads"
              :key="thread.id">
            <h4><a href="#" @click.prevent.stop="loadThread(thread.id)">{{ thread.title }}</a></h4>
            <div class="thread-info">
              <div class="thread-writer">{{ thread.lastWriterAccountName }}</div>
              <div class="thread-updated">{{ thread.lastModified | realdate }}</div>
            </div>
            <div class="thread-info">
              <div :class="'thread-status thread-status-' + thread.status">{{ getThreadStatus(thread.status) }}</div>
              <div :class="'thread-category thread-category-' + thread.category">{{ getThreadCategory(thread.category) }}</div>
              <div class="thread-milestone">{{ thread.period }}<span v-if="thread.betaVersion">.{{ thread.betaVersion }}</span></div>
            </div>
            <div v-if="isAdministrator" class="thread-info">
              <div>
                <button class="btn btn-secondary dropdown-toggle" type="button" @click="toggleStatusPopupOpen(thread)">ステ</button>
                <div class="dropdown-menu" :style="(thread.isStatusPopupOpen ? 'display:block' : 'display:none') + ';top:auto;left:auto'">
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 2)">議論中</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 3)">準備完了</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 5)">実装中</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 6)">完了</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 12)">保留</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 7)">却下</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 8)">重複</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 9)">複合</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 10)">無効</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleStatusPopupOpen(thread); updateThreadStatus(thread, 11)">対応せず</a>
                </div>
              </div>
              <div>
                <button class="btn btn-secondary dropdown-toggle" type="button" @click="toggleCategoryPopupOpen(thread)">カテ</button>
                <div class="dropdown-menu" :style="(thread.isCategoryPopupOpen ? 'display:block' : 'display:none') + ';top:auto;left:auto'">
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleCategoryPopupOpen(thread); updateThreadCategory(thread, 2)">開発</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleCategoryPopupOpen(thread); updateThreadCategory(thread, 3)">バグ</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleCategoryPopupOpen(thread); updateThreadCategory(thread, 4)">ルール</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleCategoryPopupOpen(thread); updateThreadCategory(thread, 5)">その他</a>
                </div>
              </div>
              <div>
                <button class="btn btn-secondary dropdown-toggle" type="button" @click="toggleMilestonePopupOpen(thread)">マイル</button>
                <div class="dropdown-menu" :style="(thread.isMilestonePopupOpen ? 'display:block' : 'display:none') + ';top:auto;left:auto'">
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleMilestonePopupOpen(thread); updateThreadMilestone(thread, 1)">今期</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleMilestonePopupOpen(thread); updateThreadMilestone(thread, 2)">来期</a>
                  <a class="dropdown-item" href="#" @click.prevent.stop="toggleMilestonePopupOpen(thread); updateThreadMilestone(thread, 3)">リセット</a>
                </div>
              </div>
            </div>
          </div>
          <div class="paging">
            <div class="paging-prev"><button v-show="page > 1" type="button" class="btn btn-light" @click="loadPage(page - 1)">戻る</button></div>
            <div class="paging-current"><span>{{ page }}</span></div>
            <div class="paging-next"><button v-show="canNextPage" type="button" class="btn btn-light" @click="loadPage(page + 1)">次へ</button></div>
          </div>
        </div>
      </div>
      <div v-if="currentThread.length > 0" class="current-thread">
        <button type="button" class="btn btn-secondary" @click="currentThread = []; loadPage(page)">スレッド一覧に戻る</button>
        <h3 class="current-thread">{{ currentThread[0].title }}</h3>
        <div class="thread-info">
          <div :class="'thread-status thread-status-' + currentThread[0].status">{{ getThreadStatus(currentThread[0].status) }}</div>
          <div :class="'thread-category thread-category-' + currentThread[0].category">{{ getThreadCategory(currentThread[0].category) }}</div>
          <div class="thread-milestone">{{ currentThread[0].period }}<span v-if="currentThread[0].betaVersion">.{{ currentThread[0].betaVersion }}</span></div>
        </div>
        <div class="thread-items">
          <div v-for="thread in currentThread"
              :key="thread.id"
              class="thread-item">
            <div class="message">
              <div class="text"><KmyChatTagText :text="thread.text"/></div>
            </div>
            <div class="message-footer">
              <span class="character-name-group">
                <span class="character-name">{{ thread.accountName }}</span>
              </span>
              <span class="posted">{{ thread.written | realdate }}</span>
              <span v-if="!isShowForce && account.id !== thread.accountId">
                <a class="btn btn-sm btn-light" style="width:20px;height:16px;line-height:12px;margin-left:8px;font-size:12px" @click="toggleReportOpen(thread)">...</a>
                <div v-if="thread.isOpenReports" style="margin-top:8px">
                  <div v-if="!isReported(thread)">
                    <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(thread, true)">発言を報告</a>
                  </div>
                  <div v-else>
                    この発言はすでに報告済です
                    <a class="btn btn-sm btn-warning" style="height:20px;line-height:16px;margin-left:8px" @click="reportMessage(thread, false)">報告を取り消し</a>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
        <h3 class="current-thread">このスレッドに書き込み</h3>
        <div v-if="account.id > 0" class="item-post-form new-thread">
          <div class="label">名前</div>
          <div class="label-text">{{ account.name }}</div>
          <div class="label">本文</div>
          <div class="text"><textarea class="text" v-model="currentThreadReply" @keyup.ctrl.enter.prevent.stop="writeThread(currentThread[0], currentThreadReply)"></textarea></div>
          <div class="buttons"><button type="button" class="btn btn-primary" @click="writeThread(currentThread[0], currentThreadReply)">書き込む</button></div>
        </div>
        <div v-else>
          <div class="alert alert-warning">
            書き込みするには、アカウントを作成またはログインする必要があります
          </div>
        </div>
      </div>
      <div v-show="currentThread.length <= 0">
        <h3>新しいスレッド</h3>
        <div v-if="account.id > 0" class="item-post-form new-thread">
          <div class="label">名前</div>
          <div class="label-text">{{ account.name }}</div>
          <div class="label">タイトル</div>
          <div class="title"><input type="text" v-model="newThread.title"></div>
          <div class="label">本文</div>
          <div class="text"><textarea class="text" v-model="newThread.text" @keyup.ctrl.enter.prevent.stop="write(newThread)"></textarea></div>
          <div class="buttons"><button type="button" class="btn btn-primary" @click="write(newThread)">新規スレッド</button></div>
        </div>
        <div v-else>
          <div class="alert alert-warning">
            書き込みするには、アカウントを作成またはログインする必要があります
          </div>
        </div>
      </div>
      <div class="loading" v-show="isUpdating"><div class="loading-icon"></div></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import KmyChatTagText from '@/components/parts/KmyChatTagText.vue';
import * as api from '@/api/api';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';
import EventObjectWithParam from '../../models/common/EventObjectWithParam';

@Component({
  components: {
    KmyChatTagText,
  },
})
export default class IssueBbs extends Vue {
  @Prop() public account!: api.Account;
  @Prop() public mutes!: api.Mute[];
  @Prop() public isAdministrator!: boolean;
  @Prop() public onNewThreadReceived!: EventObjectWithParam<api.IssueBbsItem>;
  private isUpdating: boolean = false;
  private isNeedUpdatePage: boolean = false;
  private newThread: api.IssueBbsItem = new api.IssueBbsItem(-1);
  private threads: api.IssueBbsItem[] = [];
  private currentThread: api.IssueBbsItem[] = [];
  private currentThreadReply: string = '';
  private page = 1;
  private filteringMilestone = 0;
  private filteringStatus = 0;
  private isOpenMilestonePopup = false;
  private isOpenStatusPopup = false;
  private canNextPage = false;

  private created() {
    this.loadPage(1);
    this.onNewThreadReceived.onFire = (thread) => {
      if (this.currentThread.length > 0) {
        if (this.currentThread[0].id === thread.parentId) {
          this.currentThread.push(thread);
        }
        if (this.currentThread[0].id === thread.id) {
          Vue.set(this.currentThread, 0, thread);
        }
      }

      let isNotNeedUpdate = false;
      this.threads.forEach((t) => {
        if (t.id === thread.id) {
          t.status = thread.status;
          t.category = thread.category;
          t.period = thread.period;
          t.betaVersion = thread.betaVersion;
          isNotNeedUpdate = true;
        }
        if (t.id === thread.parentId) {
          t.lastModified = thread.lastModified;
          t.lastWriterAccountName = thread.accountName;
        }
      });

      if (!isNotNeedUpdate) {
        this.isNeedUpdatePage = true;
      }
    };
  }

  private isReported(item: api.IssueBbsItem): boolean {
    return this.mutes.some((m) => m.issueBbsItemId === item.id && m.type === api.Mute.typeReported);
  }

  private reportMessage(item: api.IssueBbsItem, status: boolean) {
    this.isUpdating = true;
    api.Api.reportIssueBbsItem(status ? api.Mute.typeReported : api.Mute.typeNone, item.id)
      .then(() => {
        NotificationService.reported.notify();
      })
      .catch(() => NotificationService.reportFailed.notify())
      .finally(() => this.isUpdating = false);
  }

  private toggleReportOpen(obj: api.IssueBbsItem) {
    const a = obj as any as { isOpenReports: boolean };
    Vue.set(a, 'isOpenReports', !a.isOpenReports);
  }

  private loadPage(num: number) {
    this.isUpdating = true;
    api.Api.getIssuePage(num - 1, this.filteringMilestone, this.filteringStatus)
      .then((items) => {
        this.threads = items;
        this.page = num;
        if (this.page === 1) {
          this.isNeedUpdatePage = false;
        }
        this.canNextPage = this.threads.length >= 20;
      })
      .catch(() => {
        NotificationService.loadThreadFailed.notify();
      })
      .finally(() => this.isUpdating = false);
  }

  private loadThread(id: number) {
    this.isUpdating = true;
    api.Api.getIssue(id)
      .then((items) => {
        this.currentThread = items;
        this.currentThreadReply = '';
      })
      .catch(() => {
        NotificationService.loadThreadFailed.notify();
      })
      .finally(() => {
        this.isUpdating = false;
      });
  }

  private write(thread: api.IssueBbsItem) {
    this.isUpdating = true;
    api.Api.postIssue(0, thread.title, thread.text)
      .then((th) => {
        NotificationService.writeThreadSucceed.notify();
        this.loadThread(th.id);
      })
      .catch(() => {
        NotificationService.writeThreadFailed.notify();
      })
      .finally(() => {
        this.isUpdating = false;
        thread.title = '';
        thread.text = '';
      });
  }

  private writeThread(parentThread: api.IssueBbsItem, text: string) {
    this.isUpdating = true;
    api.Api.postIssue(parentThread.id, '', text)
      .then(() => {
        NotificationService.writeThreadSucceed.notify();
      })
      .catch(() => {
        NotificationService.writeThreadFailed.notify();
      })
      .finally(() => {
        this.isUpdating = false;
        this.currentThreadReply = '';
      });
  }

  private getThreadStatus(val: number) {
    return val === api.IssueBbsItem.statusNew ? '新規' :
      val === api.IssueBbsItem.statusDiscussing ? '議論中' :
      val === api.IssueBbsItem.statusInReady ? '準備完了' :
      val === api.IssueBbsItem.statusWaiting ? '実装待ち' :
      val === api.IssueBbsItem.statusProcessing ? '実装中' :
      val === api.IssueBbsItem.statusCompleted ? '完了' :
      val === api.IssueBbsItem.statusRejected ? '却下' :
      val === api.IssueBbsItem.statusDuplicate ? '重複' :
      val === api.IssueBbsItem.statusComposite ? '複合' :
      val === api.IssueBbsItem.statusInvalid ? '無効' :
      val === api.IssueBbsItem.statusWontfix ? '対応せず' :
      val === api.IssueBbsItem.statusPending ? '保留' : '不明';
  }

  private toggleStatusPopupOpen(obj: api.IssueBbsItem) {
    const a = obj as any as { isStatusPopupOpen: boolean };
    Vue.set(a, 'isStatusPopupOpen', !a.isStatusPopupOpen);
  }

  private updateThreadStatus(item: api.IssueBbsItem, val: number) {
    this.isUpdating = true;
    api.Api.updateThreadProperty(item.id, val, item.category, 0)
      .then(() => {
        item.status = val;
        NotificationService.threadPropertyChanged.notify();
      })
      .catch(() => {
        NotificationService.threadPropertyChangeFailed.notify();
      })
      .finally(() => this.isUpdating = false);
  }

  private toggleMilestonePopupOpen(obj: api.IssueBbsItem) {
    const a = obj as any as { isMilestonePopupOpen: boolean };
    Vue.set(a, 'isMilestonePopupOpen', !a.isMilestonePopupOpen);
  }

  private updateThreadMilestone(item: api.IssueBbsItem, val: number) {
    this.isUpdating = true;
    api.Api.updateThreadProperty(item.id, item.status, item.category, val)
      .then(() => {
        NotificationService.threadPropertyChanged.notify();
      })
      .catch(() => {
        NotificationService.threadPropertyChangeFailed.notify();
      })
      .finally(() => this.isUpdating = false);
  }

  private getThreadCategory(val: number) {
    return val === api.IssueBbsItem.categoryNew ? '確認中' :
      val === api.IssueBbsItem.categoryEnhancement ? '開発' :
      val === api.IssueBbsItem.categoryBug ? 'バグ' :
      val === api.IssueBbsItem.categoryRule ? 'ルール' :
      val === api.IssueBbsItem.categoryOther ? 'その他' : '不明';
  }

  private toggleCategoryPopupOpen(obj: api.IssueBbsItem) {
    const a = obj as any as { isCategoryPopupOpen: boolean };
    Vue.set(a, 'isCategoryPopupOpen', !a.isCategoryPopupOpen);
  }

  private updateThreadCategory(item: api.IssueBbsItem, val: number) {
    this.isUpdating = true;
    api.Api.updateThreadProperty(item.id, item.status, val, 0)
      .then(() => {
        item.category = val;
        NotificationService.threadPropertyChanged.notify();
      })
      .catch(() => {
        NotificationService.threadPropertyChangeFailed.notify();
      })
      .finally(() => this.isUpdating = false);
  }
}
</script>

<style lang="scss" scoped>
h3 {
  font-size: 20px;
  padding: 8px 16px;
  background: #999;
  color: white;
  font-weight: bold;
  border-radius: 16px;

  &.current-thread {
    border: 2px solid #999;
    background: none;
    color: #666;
    margin-bottom: 4px;
  }
}

.threads {
  margin: -16px 0 48px;

  .thread-list-item {
    padding: 8px;
    border-radius: 12px;

    h4 {
      margin: 0;
      font-weight: bold;
      text-decoration: underline;
    }

    &.completed {
      background: #e4e4e4;
      h4{
        font-weight: normal;
        a {
          color: #666;
          &:hover {
            color: #aaa;
          }
        }
      }
    }
  }
}

div.current-thread {
  margin: 0 0 48px;

  .thread-items {
    margin: 32px 0;
    
    .thread-item {
      background: white;
      border-bottom: 1px dashed black;
      padding: 8px;

      .message {
        flex: 1;
        word-break: break-word;

        .commands {
          text-align: right;
        }
      }

      .message-footer {
        font-size: 0.7rem;
        text-align: right;

        .character-name-group {
          font-size: 0.8rem;
          padding-right: 12px;

          .character-name {
            font-weight: bold;
          }
        }
      }
    }
  }
}

.thread-info {
  display: flex;

  > div {
    flex: 1;
    margin: 2px 4px;
    border-left: 4px solid black;
    padding: 2px 8px;
  }
  .thread-writer, .thread-updated {
    border-width: 0;
    margin-bottom: 0;
  }

  .thread-status {
    border-color: blue;
  }
  .thread-status-1 {
    font-weight: bold;
    color: #39f;
  }
  .thread-status-2 {
    font-weight: bold;
    color: #f39;
  }
  .thread-status-3 {
    font-weight: bold;
    color: #080;
  }
  .thread-status-4 {
    font-weight: bold;
    color: #00f;
  }
  .thread-status-5 {
    font-weight: bold;
    color: #66f;
  }
  .thread-status-6 {
    font-weight: bold;
    color: #0a6;
  }
  .thread-status-11 {
    font-weight: bold;
  }
  .thread-status-12 {
    color: #f39;
  }

  .thread-milestone {
    border-color: green;
  }

  .thread-category {
    border-color: purple;
  }
  .thread-category-1 {
    color: #39f;
  }
  .thread-category-2 {
    color: #03f;
  }
  .thread-category-3 {
    color: #800;
  }
  .thread-category-4 {
    color: #93f;
  }
  .thread-category-5 {
    color: #888;
  }
}

.paging {
  display: flex;
  margin: 32px 0 16px;

  > div {
    flex: 1;
  }

  .paging-current {
    text-align: center;
    line-height: 40px;
    span {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: #dedede;
      border-radius: 8px;
    }
  }

  .paging-next {
    text-align: right;
  }
}

.item-post-form {
  margin: 0 8px;
  input, textarea {
    width: 100%;
  }
  textarea {
    height: 12em;
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
  .label-text {
    margin: 8px 24px;
  }
  &.reply {
    margin-top: 12px;
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

