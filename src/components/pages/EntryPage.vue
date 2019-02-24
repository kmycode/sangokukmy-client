<template>
  <div id="entry-page" class="loading-container">
    <div class="col-xg-6 offset-xg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1">
      <div class="cancel">
        <button type="button" class="btn btn-light" @click="$emit('entry-abort')">中止</button>
      </div>
      <div class="section">
        <h3>基本情報</h3>
        <div v-if="system.invitationCodeRequestedAtEntry" :class="{ 'form-row': true, 'error': !isOkInvitationCode, }">
          <div class="label">招待コード</div>
          <div class="field">
            <input type="text" v-model="invitationCode">
          </div>
          <div class="detail">
            別途連絡した招待コードを入力してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkName, }">
          <div class="label">名前</div>
          <div class="field">
            <input type="text" v-model="character.name">
          </div>
          <div class="detail">
            1 - 12 文字になるようにしてください。他の人と同じ名前にはできません
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkAliasId, }">
          <div class="label">ログイン用ID</div>
          <div class="field">
            <input type="text" v-model="character.aliasId">
          </div>
          <div class="detail">
            4 - 12 文字になるようにしてください。他の人と同じIDにはできません
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkPassword, }">
          <div class="label">パスワード</div>
          <div class="field">
            <input type="password" v-model="password">
          </div>
          <div class="detail">
            4 - 12 文字になるようにしてください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkPasswordConfirm, }">
          <div class="label">パスワード確認</div>
          <div class="field">
            <input type="password" v-model="passwordConfirm">
          </div>
          <div class="detail">
            パスワードを再度入力してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkIcon, }">
          <div class="label">アイコン</div>
          <div class="field">
            <CharacterIconPicker v-model="icon"/>
          </div>
          <div class="detail">
            アイコンを設定します。Gravatarは、外部サービスのアイコンを利用するものです
          </div>
        </div>
      </div>
      <div class="section">
        <h3>能力</h3>
        <div :class="{ 'form-row': true, 'error': !isOkStrong, }">
          <div class="label">武力</div>
          <div class="field">
            <input type="number" :max="extraData.attributeMax" min="5" v-model="character.strong">
          </div>
          <div class="detail">
            5 - {{ extraData.attributeMax }} の範囲で設定してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkIntellect, }">
          <div class="label">知力</div>
          <div class="field">
            <input type="number" :max="extraData.attributeMax" min="5" v-model="character.intellect">
          </div>
          <div class="detail">
            5 - {{ extraData.attributeMax }} の範囲で設定してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkLeadership, }">
          <div class="label">統率</div>
          <div class="field">
            <input type="number" :max="extraData.attributeMax" min="5" v-model="character.leadership">
          </div>
          <div class="detail">
            5 - {{ extraData.attributeMax }} の範囲で設定してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkPopularity, }">
          <div class="label">人望</div>
          <div class="field">
            <input type="number" :max="extraData.attributeMax" min="5" v-model="character.popularity">
          </div>
          <div class="detail">
            5 - {{ extraData.attributeMax }} の範囲で設定してください
          </div>
        </div>
        <div :class="{ 'form-row': true, 'error': !isOkSumOfAttributes, }">
          <div class="label">合計</div>
          <div class="field">
            <span style="padding-right:12px;font-size:32px;font-weight:bold">{{ sumOfAttributes }}</span>
            ( {{ character.strong }} + {{ character.intellect }} + {{ character.leadership }} + {{ character.popularity }} )
          </div>
          <div class="detail">
            能力合計が <span class="number">{{ extraData.attributeSumMax }}</span> になるようにしてください
          </div>
        </div>
      </div>
      <div class="section">
        <h3>所属</h3>
        <div :class="{ 'form-row': true, 'error': !isOkTown, }">
          <div class="label">初期都市</div>
          <div class="field" style="height:500px">
            <Map
              :towns="towns"
              :countries="countries"
              :town="town"
              :currentTown="town"
              @selected="onTownChanged($event)"/>
          </div>
          <div class="country-list">
            <div :class="'country-list-item row country-color-' + country.colorId + (!town.id || town.countryId === country.id ? ' selected' : '')"
                 v-for="country in countries"
                 :key="country.id"
                 v-show="!country.hasOverthrown">
              <div :class="'col-md-3 country-name country-color-' + country.colorId">{{ country.name }}</div>
              <div :class="'col-md-9 country-message country-color-' + country.colorId">
                <div class="icon"><CharacterIcon :icon="getCountryMessage(country).writerIcon"/></div>
                <div class="message">
                  <div class="text">{{ getCountryMessage(country).message }}</div>
                  <div class="writer" v-if="getCountryMessage(country).message">{{ getCountryMessage(country).writerCharacterName }} ({{ getCountryPostName(getCountryMessage(country).writerPost) }}) より</div>
                </div>
              </div>
            </div>
          </div>
          <div class="detail">
            地図上の都市をクリックして選択してください。選択した都市に国があれば、そこへ仕官します
          </div>
        </div>
      </div>
      <div class="section">
        <h3>建国</h3>
        <div :class="{ 'form-row': true, 'error': !isOkEstablishSelection, }">
          <div class="label">建国の可否</div>
          <div class="field">
            <button type="button" :class="{ 'btn': true, 'btn-toggle': true, 'selected': isPublish, }" @click="isPublish ^= true">建国する</button>
          </div>
          <div class="detail">
            建国する場合は、上のボタンをONにしてください
          </div>
        </div>
        <div v-show="isPublish" :class="{ 'form-row': true, 'error': !isOkCountryName, }">
          <div class="label">国名</div>
          <div class="field">
            <input type="text" v-model="country.name">
          </div>
          <div class="detail">
            1 - 8 文字になるようにしてください
          </div>
        </div>
        <div v-show="isPublish" :class="{ 'form-row': true, 'error': !isOkCountryColor, }">
          <div class="label">国色</div>
          <div class="field">
            <CountryColorPicker v-model="country.colorId"/>
          </div>
          <div class="detail">
            国の色を決めてください。他の国と同じ色にはできません
          </div>
        </div>
      </div>

<!-- https://developers.google.com/recaptcha/docs/invisible#js_api
     https://syncer.jp/how-to-introduction-recaptcha -->
      <div id='recaptcha' class="g-recaptcha"
          data-sitekey="your_site_key"
          data-callback=""
          data-size="invisible"></div>
      <button v-show="false" type="button" id="callback" @click="$emit('entry-abort')"></button>
      <button v-show="false" type="button" class="btn btn-primary" onclick="grecaptcha.execute()">送信</button>
      <button v-show="canEntry" type="button" class="btn btn-primary" @click="entry()">送信</button>
      <span v-show="!canEntry" style="color:red">上の記述項目の赤いところをすべて入力するか、修正してください</span>
    </div>
    <div v-show="isLoading" class="loading"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Map from '@/components/parts/Map.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import CharacterIconPicker from '@/components/parts/CharacterIconPicker.vue';
import CountryColorPicker from '@/components/parts/CountryColorPicker.vue';
import AsyncUtil from '../../models/common/AsyncUtil';
import ArrayUtil from '../../models/common/arrayutil';
import Streaming from './../../api/streaming';
import ApiStreaming from './../../api/apistreaming';
import * as api from './../../api/api';
import * as def from '@/common/definitions';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';
import LoginService from '@/models/character/loginservice';
import ValueUtil from '@/models/common/ValueUtil';

declare const grecaptcha: any;

@Component({
  components: {
    Map,
    CharacterIcon,
    CharacterIconPicker,
    CountryColorPicker,
  },
})
export default class EntryPage extends Vue {
  private character: api.Character = new api.Character();
  private country: api.Country = new api.Country();
  private defaultCountry: api.Country = new api.Country();
  private town: api.Town = new api.Town();
  private password: string = '';
  private passwordConfirm: string = '';
  private icon: api.CharacterIcon = new api.CharacterIcon(0, 0, true, 1, '0.gif');
  private isPublish: boolean = false;
  private invitationCode: string = '';

  private system: api.SystemData = new api.SystemData();
  private countries: api.Country[] = [];
  private countryMessages: api.CountryMessage[] = [];
  private extraData: api.EntryExtraData = api.EntryExtraData.default;
  private towns: api.Town[] = [];
  private nextMonthSeconds = 0;

  private isLoadingExtraData = true;
  private isEntrying = false;

  private get sumOfAttributes(): number {
    return parseInt(this.character.strong.toString(), 10) +
      parseInt(this.character.intellect.toString(), 10) +
      parseInt(this.character.leadership.toString(), 10) +
      parseInt(this.character.popularity.toString(), 10);
  }

  private get isLoading(): boolean {
    return this.isLoadingExtraData || this.isEntrying;
  }

  private get isOkName(): boolean {
    return this.character.name !== '' && this.character.name.length >= 1 && this.character.name.length <= 12;
  }

  private get isOkAliasId(): boolean {
    return this.character.aliasId !== '' && this.character.aliasId.length >= 4 && this.character.aliasId.length <= 12;
  }

  private get isOkPassword(): boolean {
    return this.password !== '' && this.password.length >= 4 && this.password.length <= 12;
  }

  private get isOkPasswordConfirm(): boolean {
    return this.password === this.passwordConfirm && this.isOkPassword;
  }

  private get isOkIcon(): boolean {
    return true;
  }

  private get isOkTown(): boolean {
    return this.town.id !== 0;
  }

  private get isOkEstablishSelection(): boolean {
    return (this.town.countryId !== 0 && !this.isPublish) ||
      (this.town.countryId === 0 && this.isPublish);
  }

  private get isOkCountryName(): boolean {
    return !this.isPublish ||
      (this.country.name !== '' && this.country.name.length >= 1 && this.country.name.length <= 8);
  }

  private get isOkCountryColor(): boolean {
    return !this.isPublish ||
      (this.country.colorId >= 1 && this.country.colorId <= def.COUNTRY_COLOR_NUM);
  }

  private get isOkStrong(): boolean {
    return this.character.strong >= 5 && this.character.strong <= this.extraData.attributeMax;
  }

  private get isOkIntellect(): boolean {
    return this.character.intellect >= 5 && this.character.intellect <= this.extraData.attributeMax;
  }

  private get isOkLeadership(): boolean {
    return this.character.leadership >= 5 && this.character.leadership <= this.extraData.attributeMax;
  }

  private get isOkPopularity(): boolean {
    return this.character.popularity >= 5 && this.character.popularity <= this.extraData.attributeMax;
  }

  private get isOkSumOfAttributes(): boolean {
    return this.sumOfAttributes === this.extraData.attributeSumMax;
  }

  private get isOkInvitationCode(): boolean {
    return !this.system.invitationCodeRequestedAtEntry ||
      this.invitationCode.length > 0;
  }

  private get canEntry(): boolean {
    return this.isOkName &&
      this.isOkAliasId &&
      this.isOkPassword &&
      this.isOkPasswordConfirm &&
      this.isOkIcon &&
      this.isOkTown &&
      this.isOkEstablishSelection &&
      this.isOkCountryName &&
      this.isOkCountryColor &&
      this.isOkStrong &&
      this.isOkIntellect &&
      this.isOkLeadership &&
      this.isOkPopularity &&
      this.isOkSumOfAttributes &&
      this.isOkInvitationCode
      ;
  }

  private initializeRecaptcha() {
    // https://stackoverflow.com/questions/43890035/vue-js-google-recaptcha-callback
    setTimeout(() => {
      if (typeof grecaptcha === 'undefined') {
        this.initializeRecaptcha();
      } else {
        grecaptcha.render('recaptcha', {
          sitekey: 'SITE_KEY',
          size: 'invisible',
          badge: 'inline',
          // callback: self.submit,
        });
      }
    }, 100);
  }

  private getExtraData(country: api.Country): api.CountryExtraData {
    const data = ArrayUtil.findUniquely(this.extraData.countryData, country.id, (ed) => ed.countryId);
    if (data) {
      return data;
    } else {
      return api.CountryExtraData.default;
    }
  }

  private getCountryMessage(country: api.Country): api.CountryMessage {
    const data = ArrayUtil.findUniquely(this.countryMessages, country.id, (cm) => cm.countryId);
    if (data) {
      return data;
    } else {
      return new api.CountryMessage();
    }
  }

  private getCountryPostName(post: number): string {
    return ValueUtil.getPostName(post);
  }

  private created() {
    this.character.strong = 5;
    this.character.intellect = 5;
    this.character.leadership = 5;
    this.character.popularity = 5;

    // ストリーミングを開始
    ApiStreaming.top.clearEvents();
    ApiStreaming.top.on<api.SystemData>(api.SystemData.typeId, (log) => {
      this.system = log;
      this.updateExtraData();
    });
    ApiStreaming.top.on<api.Country>(api.Country.typeId, (log) => {
      ArrayUtil.addItem(this.countries, log);
    });
    ApiStreaming.top.on<api.CountryMessage>(api.CountryMessage.typeId, (log) => {
      if (log.type === api.CountryMessage.typeSolicitation) {
        ArrayUtil.addItemUniquely(this.countryMessages, log, (cm) => cm.countryId);
      }
    });
    ApiStreaming.top.on<api.Town>(api.Town.typeId, (log) => {
      ArrayUtil.addItem(this.towns, log);
    });
    ApiStreaming.top.on<api.MapLog>(api.MapLog.typeId, (log) => {
      this.updateExtraData();
    });
    ApiStreaming.top.on<api.ApiSignal>(api.ApiSignal.typeId, (signal) => {
      if (signal.type === 7) {
        // リセットされた
        location.reload();
      }
    });
    ApiStreaming.top.start();
  }

  private updateExtraData() {
    const requested = Enumerable.from(this.countries)
      .any((c) => api.GameDateTime.toNumber(c.established) + def.BATTLE_STOP_TURN >
          api.GameDateTime.toNumber(this.system.gameDateTime));
    if (requested || this.isLoadingExtraData) {
      this.isLoadingExtraData = true;
      api.Api.getEntryExtraData()
        .then((data) => {
          this.extraData = data;
        })
        .catch(() => {
          NotificationService.entryExtraDataFailed.notify();
        })
        .finally(() => {
          this.isLoadingExtraData = false;
        });
    }
  }

  private onTownChanged(id: number) {
    const t = ArrayUtil.find(this.towns, id);
    if (t) {
      this.town = t;
      this.character.townId = t.id;
    }
  }

  private entry() {
    if (this.canEntry || true) {
      this.isEntrying = true;
      api.Api.entry(this.character,
                    this.icon,
                    this.password,
                    this.isPublish ? this.country : this.defaultCountry,
                    this.invitationCode)
        .then((auth) => {
          LoginService.setAccessToken(auth.accessToken);
          this.$emit('entry-succeed');
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.duplicateCharacterNameOrAliasIdError) {
            NotificationService.entryFailedBecauseSameNameOrAliasId.notify();
          } else if (ex.data.code === api.ErrorCode.duplicateCountryNameOrColorError) {
            NotificationService.entryFailedBecauseSameCountryNameOrColor.notify();
          } else if (ex.data.code === api.ErrorCode.duplicateEntryError) {
            NotificationService.entryFailedBecauseSameIpAddress.notify();
          } else if (ex.data.code === api.ErrorCode.invitationCodeRequestedError) {
            NotificationService.entryFailedBecauseInvitationCode.notify();
          } else {
            NotificationService.entryFailed.notify();
          }
        })
        .finally(() => {
          this.isEntrying = false;
        });
    }
  }

  private destroyed() {
    ApiStreaming.top.stop();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/country-color.scss';
span.number { font-weight: bold; }

.section {
  margin: 24px 0;

  .form-row {
    display: block;
    background-color: #def;
    border-right: 4px solid blue;
    padding: 12px 8px;

    &.error {
      background-color: #fde;
      border-right-color: red;
      .detail {
        color: red;
      }
    }

    .label {
      color: #999;
      font-weight: bold;
    }

    .field {
      margin-left: 12px;
    }

    .detail {
      font-size: 14px;
      margin-left: 16px;
      margin-top: 4px;
      color: #666;
    }

    input {
      width: 100%;
    }

    .country-list {
      margin: 8px 16px;
      overflow: hidden;
      border-radius: 16px;
      .country-list-item {
        @include country-color-light('background-color');
        @include country-color-deep('color');
        @include country-color-deep('border-bottom-color');
        padding: 8px;
        opacity: 0.5;
        border-bottom-width: 3px;
        border-bottom-style: double;
        &:last-child {
          border-bottom-width: 0;
        }
        &.selected {
          opacity: 1;
        }
        .country-name {
          align-self: center;
        }
        .country-message {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 12px;
          }
          .message {
            flex: 1;
          }
          .writer {
            text-align: right;
            font-weight: bold;
            font-size: 0.8em;
          }
        }
      }
    }
  }
}
</style>
