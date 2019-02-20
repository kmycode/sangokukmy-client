import * as api from '@/api/api';
import Enumerable from 'linq';
import ArrayUtil from '@/models/common/arrayutil';
import NotificationService from '@/services/notificationservice';

export interface IChatMessageContainer {
  messages: api.ChatMessage[];
  isPosting: boolean;
  isLoading: boolean;
  isUnread: boolean;
  sendTo?: any;

  canSend: boolean;
  isOpen: boolean;

  postChatAsync(message: string): Promise<any>;
  loadOldChatsAsync(): Promise<any>;
}

export default class ChatMessageContainer<T extends api.IIdentitiedEntity> implements IChatMessageContainer {
  public messages: api.ChatMessage[] = [];
  public isPosting: boolean = false;
  public isLoading: boolean = false;
  public isUnread: boolean = false;
  public sendTo?: T;
  private hasLoadAll: boolean = false;
  private isOpenPrivate: boolean = false;

  public get canSend(): boolean {
    if (this.isNeedSendTo) {
      return this.sendTo !== undefined;
    } else {
      return true;
    }
  }

  public get isOpen(): boolean {
    return this.isOpenPrivate;
  }

  public set isOpen(value: boolean) {
    this.isUnread = false;
    this.isOpen = value;
  }

  public constructor(private post: (message: string, sendTo?: number) => Promise<any>,
                     private load: (sinceId: number) => Promise<api.ChatMessage[]>,
                     private isNeedSendTo: boolean = false) {}

  public append(message: api.ChatMessage) {
    ArrayUtil.addLog(this.messages, message);
    if (!this.isOpen) {
      this.isUnread = true;
    }
  }

  public clear() {
    this.messages = [];
  }

  public async postChatAsync(message: string): Promise<any> {
    if (message.length > 0) {
      this.isPosting = true;

      let sendToId: number | undefined;
      if (this.sendTo) {
        sendToId = this.sendTo.id;
      }

      try {
        await this.post(message, sendToId);
      } catch (ex) {
        if (ex.data) {
          if (ex.data.code === api.ErrorCode.notPermissionError) {
            NotificationService.postChatFailedBecauseNotPermission.notify();
          } else if (ex.data.code === api.ErrorCode.countryNotFoundError ||
                     ex.data.code === api.ErrorCode.characterNotFoundError) {
            NotificationService.postChatFailedBecauseTargetNotFound.notify();
          } else {
            NotificationService.postChatFailed.notify();
          }
        } else {
          NotificationService.postChatFailed.notify();
        }
        throw ex;
      } finally {
        this.isPosting = false;
      }
    }
  }

  public async loadOldChatsAsync(): Promise<any> {
    if (!this.hasLoadAll) {
      this.isLoading = true;

      try {
        const oldMessages = await this.load(this.messages[this.messages.length - 1].id);
        if (oldMessages.length > 0) {
          Enumerable
            .from(oldMessages)
            .reverse()
            .forEach((m) => {
              ArrayUtil.addItem(this.messages, m);
            });
        } else {
          this.hasLoadAll = true;
        }
      } catch (ex) {
        NotificationService.getChatFailed.notify();
      } finally {
        this.isLoading = false;
      }
    }
  }
}
