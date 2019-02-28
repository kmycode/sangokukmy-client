import * as api from '@/api/api';
import Enumerable from 'linq';
import ArrayUtil from '@/models/common/arrayutil';
import NotificationService from '@/services/notificationservice';
import Vue from 'vue';

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

export interface IPromotionChatMessageContainer extends IChatMessageContainer {
  setPromotionStatusAsync(id: number, status: number): Promise<any>;
}

export default class ChatMessageContainer<T extends api.IIdentitiedEntity> implements IPromotionChatMessageContainer {
  public messages: api.ChatMessage[] = [];
  public isPosting: boolean = false;
  public isLoading: boolean = false;
  public isUnread: boolean = false;
  public sendTo: T = {} as T;
  private hasLoadAll: boolean = false;
  private isOpenPrivate: boolean = false;

  public get canSend(): boolean {
    if (this.isNeedSendTo) {
      return this.sendTo !== undefined && this.sendTo.id > 0;
    } else {
      return true;
    }
  }

  public get isOpen(): boolean {
    return this.isOpenPrivate;
  }

  public set isOpen(value: boolean) {
    if (value) {
      this.isUnread = false;
    }
    this.isOpenPrivate = value;
  }

  public constructor(private post: (message: string, sendTo?: number) => Promise<any>,
                     private load: (sinceId: number) => Promise<api.ChatMessage[]>,
                     private isNeedSendTo: boolean = false) {}

  public append(message: api.ChatMessage) {
    const old = ArrayUtil.find(this.messages, message.id);
    if (old) {
      old.type = message.type;
      old.message = message.message;
    } else {
      this.messages.unshift(message);
    }

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

  public async setPromotionStatusAsync(id: number, status: number): Promise<any> {
    try {
      const message = Enumerable.from(this.messages).first((m) => m.id === id);
      this.isLoading = true;
      await api.Api.setPromotionStatus(id, status);
      message.type = status;
      if (status === api.ChatMessage.typePromotionAccepted && message.character) {
        NotificationService.promotionAccepted.notifyWithParameter(message.character.name);
      } else if (status === api.ChatMessage.typePromotionRefused && message.character) {
        NotificationService.promotionRefused.notifyWithParameter(message.character.name);
      }
    } catch (ex) {
      if (ex.data) {
        if (ex.data.code === api.ErrorCode.invalidOperationError) {
          NotificationService.promotionFailedBecauseInvalidTypeOrCountry.notify();
        } else if (ex.data.code === api.ErrorCode.countryNotFoundError) {
          NotificationService.promotionFailedBecauseNoCountry.notify();
        } else if (ex.data.code === api.ErrorCode.characterNotFoundError) {
          NotificationService.promotionFailedBecauseNoCharacter.notify();
        } else {
          NotificationService.promotionFailed.notify();
        }
      } else {
        NotificationService.promotionFailed.notify();
      }
    } finally {
      this.isLoading = false;
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
