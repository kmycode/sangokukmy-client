import * as api from '@/api/api';
import Enumerable from 'linq';
import ArrayUtil from '@/models/common/arrayutil';
import NotificationService from '@/services/notificationservice';
import Vue from 'vue';
import StatusStore from './statusstore';
import { TOWN_BUILDINGS } from '@/common/definitions';

export interface IChatMessageContainer {
  messages: api.ChatMessage[];
  isPosting: boolean;
  isLoading: boolean;
  isUnread: boolean;
  isScrolledTop: boolean;
  count: number;
  sendTo?: any;

  canSend: boolean;
  isOpen: boolean;

  postChatAsync(message: string, icon?: api.CharacterIcon, image?: string): Promise<any>;
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
  public isScrolledTop: boolean = true;
  public count: number = 0;
  public sendTo: T = {} as T;
  public onOpened: (() => void) | undefined;
  private hasLoadAll: boolean = false;
  private isOpenPrivate: boolean = false;
  private isUnreadQueue = false;
  private lastReadId: number = 0;

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
      this.isUnreadQueue = this.isUnread;
      this.isUnread = false;
    }
    this.isOpenPrivate = value;

    if (this.onOpened) {
      this.onOpened();
    }
  }

  public constructor(private store: StatusStore,
                     private post: (message: string, icon?: api.CharacterIcon, image?: string, sendTo?: number) => Promise<any>,
                     private load: (sinceId: number) => Promise<api.ChatMessage[]>,
                     private isNeedSendTo: boolean = false,
                     private setRead?: ((id: number) => any)) {
    if (this.setRead) {
      window.setInterval(() => {
        if (this.setRead && this.messages.length > 0 &&
            (this.isUnreadQueue || (this.isOpen && this.lastReadId !== this.messages[0].id))) {
          this.setRead(this.messages[0].id);
          this.isUnreadQueue = this.isUnread;
          this.lastReadId = this.messages[0].id;
        }
      }, 8000);
    }
  }

  public append(message: api.ChatMessage) {
    const old = ArrayUtil.find(this.messages, message.id);
    if (old) {
      old.type = message.type;
      old.message = message.message;
    } else {
      this.messages.unshift(message);

      // スクロールされていない状態であれば、古いのを消す
      if (this.isScrolledTop) {
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(0, 100);
          this.hasLoadAll = false;
        }
      }

      // 登用以外は無条件で加算する
      if (message.type === api.ChatMessage.typePromotion ||
          message.type === api.ChatMessage.typePromotionAccepted ||
          message.type === api.ChatMessage.typePromotionRefused) {
        if (message.type === api.ChatMessage.typePromotion && message.typeData !== this.store.character.id) {
          this.count++;
        }
      } else {
        this.count++;
      }
    }

    if (!this.isOpen) {
      this.isUnread = true;
    }
  }

  public clear() {
    this.messages = [];
  }

  public async postChatAsync(message: string, icon?: api.CharacterIcon, image?: string): Promise<any> {
    if (message.length > 0) {
      this.isPosting = true;

      let sendToId: number | undefined;
      if (this.sendTo) {
        sendToId = this.sendTo.id;
      }

      try {
        await this.post(message, icon, image, sendToId);
      } catch (ex) {
        if (ex.data) {
          if (ex.data.code === api.ErrorCode.notPermissionError) {
            NotificationService.postChatFailedBecauseNotPermission.notify();
          } else if (ex.data.code === api.ErrorCode.countryNotFoundError ||
                     ex.data.code === api.ErrorCode.characterNotFoundError) {
            NotificationService.postChatFailedBecauseTargetNotFound.notify();
          } else if (ex.data.code === api.ErrorCode.numberRangeError) {
            NotificationService.postChatFailedBecauseTooLong
              .notifyWithParameter(ex.data.data.current, ex.data.data.max);
          } else if (ex.data.code === api.ErrorCode.blockedActionError) {
            NotificationService.actionBlocked.notify();
          } else if (ex.data.code === api.ErrorCode.uploadImageFailedError) {
            NotificationService.postChatFailedBecauseUploadImageError.notify();
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
        this.count--;
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
