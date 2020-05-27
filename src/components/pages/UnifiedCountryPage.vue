<template>
  <div id="all-characters-page" class="loading-container">
    <div class="col-xg-6 offset-xg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1">
      <div class="cancel">
        <button type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
      </div>
      <div v-for="history in histories"
           :key="history.id"
           :class="'history country-color-' + history.unifiedCountry.colorId">
        <h2 :class="'history-name country-color-' + history.unifiedCountry.colorId">{{ history.label }}</h2>
        <h3 :class="'country-name country-color-' + history.unifiedCountry.colorId"><span class="label">統一国</span><br>{{ history.unifiedCountry.name }}</h3>
        <h4 :class="'unified-date country-color-' + history.unifiedCountry.colorId">{{ history.history.unifiedDateTime | realdate }}</h4>
        <div :class="'post country-color-' + history.unifiedCountry.colorId">
          <h4 class="post-name">君主</h4>
          <div class="post-character" v-if="history.monarch.name">
            <div class="icon"><CharacterIcon :icon="history.monarch.mainIcon"/></div>
            <div class="name">{{ history.monarch.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div :class="'post post-small country-color-' + history.unifiedCountry.colorId">
          <h4 class="post-name">軍師</h4>
          <div class="post-character" v-if="history.warrior.name">
            <div class="icon"><CharacterIcon :icon="history.warrior.mainIcon"/></div>
            <div class="name">{{ history.warrior.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div :class="'post post-small country-color-' + history.unifiedCountry.colorId">
          <h4 class="post-name">大将軍</h4>
          <div class="post-character" v-if="history.grandGeneral.name">
            <div class="icon"><CharacterIcon :icon="history.grandGeneral.mainIcon"/></div>
            <div class="name">{{ history.grandGeneral.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div class="history-toggle loading-container" v-show="!history.isOpen" @click="history.isOpen = true">詳細 ( {{ history.history.characters.length }} 名)<div class="layer"></div><div v-show="history.isLoading" class="loading"><div class="loading-icon"></div></div></div>
        <div class="history-toggle" v-show="history.isOpen" @click="history.isOpen = false">閉じる<div class="layer"></div></div>
        <div :class="'character-list country-color-' + history.unifiedCountry.colorId">
          <MiniCharacterList v-if="!history.isOpen" :countries="history.history.countries" :characters="history.history.characters"/>
          <CharacterList v-else :countries="history.history.countries" :characters="history.history.characters"/>
        </div>
        <div class="detail" v-if="history.isOpen">
          <div class="top-table-flat monarch-message">
            <div v-if="history.history.unifiedCountryMessage">
              <h3>統一国君主 {{ history.monarch.name }} より:</h3>
              <KmyChatTagText :text="history.history.unifiedCountryMessage"/>
            </div>
            <div v-else>
              <span class="no-message">統一国君主からのメッセージはありません</span>
            </div>
          </div>
          <Map style="height:400px" :countries="history.history.countries" :towns="history.history.towns"/>
          <div class="top-table-flat">
            <MapLogList :logs="history.history.maplogs" :type="'normal'"/>
          </div>
        </div>
        <div class="history-toggle" v-show="history.isOpen" @click="history.isOpen = false">閉じる<div class="layer"></div></div>
      </div>
      <div class="cancel">
        <button type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
      </div>
    </div>
    <div v-show="isLoading" class="loading"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import CharacterList from '@/components/parts/CharacterList.vue';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import Map from '@/components/parts/Map.vue';
import MapLogList from '../parts/MapLogList.vue';
import KmyChatTagText from '../parts/KmyChatTagText.vue';
import * as api from './../../api/api';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

class HistoryData {
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  public monarch: api.Character;
  public warrior: api.Character;
  public grandGeneral: api.Character;
  private mIsOpen: boolean = false;

  public get label(): string {
    if (this.history.betaVersion) {
      return '第' + this.history.period + '.' + this.history.betaVersion + '期';
    }
    return '第' + this.history.period + '期';
  }

  public get unifiedCountry(): api.Country {
    const country = Enumerable
      .from(this.history.countries)
      .firstOrDefault((h) => !h.hasOverthrown);
    if (country) {
      return country;
    }
    return new api.Country(-1);
  }

  public get isOpen(): boolean {
    return this.mIsOpen;
  }

  public set isOpen(val: boolean) {
    if (this.mIsOpen !== val) {
      this.toggleOpen();
    }
  }

  public constructor(public history: api.History) {
    this.monarch = this.getMonarch();
    this.warrior = this.getWarrior();
    this.grandGeneral = this.getGrandGeneral();
    this.updateData();
  }

  private load() {
    this.isLoading = true;
    api.Api.getHistory(this.history.id)
      .then((h) => {
        this.history = h;
        this.updateData();
        this.isLoaded = true;
      })
      .catch(() => {
        NotificationService.historyLoadFailed.notify();
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private getMonarch(): api.Character {
    return this.getPostCharacter(api.CountryPost.typeMonarch);
  }

  private getWarrior(): api.Character {
    return this.getPostCharacter(api.CountryPost.typeWarrior);
  }

  private getGrandGeneral(): api.Character {
    return this.getPostCharacter(api.CountryPost.typeGrandGeneral);
  }

  private getPostCharacter(pst: number): api.Character {
    const chara = Enumerable
      .from(this.history.characters)
      .firstOrDefault((c) => c.postType === pst);
    if (chara) {
      return chara;
    }
    return new api.Character(-1);
  }

  private updateData() {
    this.history.characters = Enumerable
      .from(this.history.characters)
      .where((c) => c.name.indexOf('_') < 0)
      .orderByDescending((c) => c.countryId)
      .toArray();
    this.history.characters.forEach((c) => {
      if (c.mainIcon) {
        c.mainIcon.isHistorical = true;
      }
    });
    this.history.countries.forEach((c) => {
      c.id = (c as any).countryId;
    });

    if (this.history.towns) {
      const unified = this.unifiedCountry;
      this.history.towns.forEach((t) => {
        t.countryId = unified.id;
      });
    }
  }

  private toggleOpen() {
    if (!this.mIsOpen) {
      if (!this.isLoaded && !this.isLoading) {
        this.load();
      }
      this.mIsOpen = true;
    } else {
      this.mIsOpen = false;
    }
  }
}

@Component({
  components: {
    CharacterList,
    CharacterIcon,
    MiniCharacterList,
    Map,
    MapLogList,
    KmyChatTagText,
  },
})
export default class UnifiedCountryPage extends Vue {
  public histories: HistoryData[] = [];
  private isLoading: boolean = true;

  private created() {
    api.Api.getHistories()
      .then((hs) => {
        this.histories = Enumerable
          .from(hs)
          .reverse()
          .select((i) => new HistoryData(i))
          .toArray();
      })
      .catch(() => {
        NotificationService.historyLoadFailed.notify();
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/bootstrap-helper.scss';
@import '@/scss/country-color.scss';

.top-table-flat { background-color: #efe0c0; margin-bottom: 4px; padding: 4px; color: #8e4c28; }

#all-characters-page {
  min-height: 100px;

  .history {
    margin: 8px 0 56px;

    .history-name {
      padding: 4px 12px;
      border-radius: 16px 16px 0 0;
      margin-bottom: 0;
      font-weight: bold;
      text-align: center;
      @include country-color-deep('background-color');
      @include country-color-light('color');
    }

    .country-name {
      padding: 4px 12px;
      margin-bottom: 0;
      font-weight: bold;
      text-align: center;
      @include country-color-light('background-color');
      @include country-color-deep('color');

      .label {
        color: #666;
        font-size: 20px;
        padding-bottom: 8px;
        font-weight: normal;
      }
    }

    .unified-date {
      padding: 4px 12px;
      margin-bottom: 0;
      text-align: center;
      font-size: 18px;
      @include country-color-light('background-color');
      @include country-color-deep('color');
    }

    .post {
      display: flex;
      align-items: center;
      min-height: 72px;
      padding: 0 16px;
      @include country-color-light('background-color');

      .post-name {
        font-size: 20px;
        margin-right: 48px;
        width: 60px;
      }

      .post-character {
        display: flex;
        flex-wrap: wrap;

        .icon {
          margin-right: 24px;
        }

        .name {
          font-size: 32px;
        }
      }

      .post-character-notexists {
        font-size: 20px;
        color: #888;
      }
    }

    .post-small {
      min-height: 48px;
      img {
        width: 36px;
        height: 36px;
      }
      .post-name {
        font-size: 16px;
      }
      .post-character .name {
        font-size: 24px;
      }
    }

    .character-list {
      margin-top: 8px;
    }

    .monarch-message {
      padding: 8px;
      h3 {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }
      .no-message {
        color: #999;
      }
    }

    .history-toggle {
      background: #efefef;
      text-align: center;
      padding: 8px 0;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 8px;
      cursor: pointer;
      .layer {
        background: rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity .2s;
        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .summary {
    text-align: center;

    .number {
      font-weight: bold;
      font-size: 2em;
    }
  }
}
</style>
