import ArrayUtil from '@/models/common/arrayutil';
import CancellableAsyncStack from '@/models/common/cancellableasyncstack';
import * as api from '@/api/api';
import Enumerable from 'linq';

export default class OnlineModel {
  public actives: api.CharacterOnline[] = [];
  public inactives: api.CharacterOnline[] = [];
  private lastSendStatus: number = api.CharacterOnline.statusOffline;
  private lastStatus: number = api.CharacterOnline.statusOffline;
  private lastActiveSeconds: number = 0;
  private activeInMoment: boolean = false;
  private forceInactive: boolean = false;
  private timer: number = 0;
  private timer2: number = 0;

  public get activeCharacters(): api.Character[] {
    return this.actives.map((o) => o.character);
  }

  public get inactiveCharacters(): api.Character[] {
    return this.inactives.map((o) => o.character);
  }

  public get allCharacters(): api.Character[] {
    return Enumerable.from(this.actives)
      .concat(this.inactives)
      .select((o) => o.character)
      .toArray();
  }

  public onOnlineDataReceived(online: api.CharacterOnline) {
    const old1 = Enumerable.from(this.actives).firstOrDefault((o) => o.character.id === online.character.id);
    const old2 = Enumerable.from(this.inactives).firstOrDefault((o) => o.character.id === online.character.id);
    if (online.status === api.CharacterOnline.statusActive) {
      if (old2) {
        this.inactives = this.inactives.filter((o) => o.character.id !== online.character.id);
      }
      if (!old1) {
        this.actives.push(online);
      }
    } else if (online.status === api.CharacterOnline.statusInactive) {
      if (old1) {
        this.actives = this.actives.filter((o) => o.character.id !== online.character.id);
      }
      if (!old2) {
        this.inactives.push(online);
      }
    } else {
      if (old1) {
        this.actives = this.actives.filter((o) => o.character.id !== online.character.id);
      }
      if (old2) {
        this.inactives = this.inactives.filter((o) => o.character.id !== online.character.id);
      }
    }
  }

  public beginWatch() {
    document.addEventListener('mousemove', this.activeInMomentListener);
    document.addEventListener('mouseenter', this.activeInMomentListener);
    document.addEventListener('keydown', this.activeInMomentListener);
    document.addEventListener('keyup', this.activeInMomentListener);
    document.addEventListener('touchstart', this.activeInMomentListener);
    document.addEventListener('touchmove', this.activeInMomentListener);
    document.addEventListener('touchend', this.activeInMomentListener);
    document.addEventListener('visibilitychange', this.visibilityStatusChangeListener);
    document.addEventListener('mouseleave', this.forceInactiveListener);
    this.timer = setInterval(() => {
      if (!this.forceInactive && !document.hidden && this.activeInMoment) {
        this.turnActive();
      } else if (this.forceInactive || document.hidden) {
        this.turnInactive();
      } else {
        this.lastActiveSeconds++;
        if (this.lastActiveSeconds > 180) {
          this.turnInactive();
        }
      }
    }, 500);
    this.timer2 = setInterval(() => {
      if (this.lastSendStatus !== this.lastStatus) {
        const status = this.lastStatus;
        api.Api.setOnlineStatus(status)
          .then(() => {
            this.lastSendStatus = status;
          });
      }
    }, 2000);

    // まず自分の状態を送る
    this.turnActive();
  }

  public dispose() {
    document.removeEventListener('mousemove', this.activeInMomentListener);
    document.removeEventListener('mouseenter', this.activeInMomentListener);
    document.removeEventListener('keydown', this.activeInMomentListener);
    document.removeEventListener('keyup', this.activeInMomentListener);
    document.removeEventListener('touchstart', this.activeInMomentListener);
    document.removeEventListener('touchmove', this.activeInMomentListener);
    document.removeEventListener('touchend', this.activeInMomentListener);
    document.removeEventListener('visibilitychange', this.visibilityStatusChangeListener);
    document.removeEventListener('mouseleave', this.forceInactiveListener);
    clearInterval(this.timer);
    clearInterval(this.timer2);
  }

  private activeInMomentListener = () => {
    this.activeInMoment = true;
  }

  private visibilityStatusChangeListener = () => {
    if (document.visibilityState === 'hidden') {
      this.forceInactive = true;
    } else if (document.visibilityState === 'visible') {
      this.activeInMoment = true;
    }
  }

  private forceInactiveListener = () => {
    this.forceInactive = true;
  }

  private turnActive() {
    this.forceInactive = false;
    this.activeInMoment = false;
    this.lastActiveSeconds = 0;
    if (this.lastStatus !== api.CharacterOnline.statusActive) {
      this.setStatus(api.CharacterOnline.statusActive);
    }
  }

  private turnInactive() {
    this.forceInactive = false;
    this.activeInMoment = false;
    if (this.lastStatus !== api.CharacterOnline.statusInactive) {
      this.setStatus(api.CharacterOnline.statusInactive);
    }
  }

  private setStatus(status: number) {
    this.lastStatus = status;
  }
}
