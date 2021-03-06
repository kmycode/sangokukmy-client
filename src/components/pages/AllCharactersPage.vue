<template>
  <div id="all-characters-page" class="loading-container">
    <div class="col-xg-6 offset-xg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1">
      <div class="cancel">
        <button v-if="!isApp" type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
        <button v-else type="button" class="btn btn-secondary" @click="reloadPage()">更新</button>
      </div>
      <div v-for="country in countries"
           :key="country.id"
           :class="'country country-color-' + country.colorId">
        <h3 :class="'country-name country-color-' + country.colorId">{{ country.name }}</h3>
        <div :class="'religion country-color-' + country.colorId">
          <div class="religion-inner">
            宗教 <strong>{{ getReligionName(country.religion) }}</strong>
          </div>
        </div>
        <div :class="'post country-color-' + country.colorId">
          <h4 class="post-name">君主</h4>
          <div class="post-character" v-if="country.monarch.id > 0">
            <div class="icon"><CharacterIcon :icon="country.monarch.mainIcon"/></div>
            <div class="name">{{ country.monarch.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div :class="'post post-small country-color-' + country.colorId">
          <h4 class="post-name">軍師</h4>
          <div class="post-character" v-if="country.warrior.id > 0">
            <div class="icon"><CharacterIcon :icon="country.warrior.mainIcon"/></div>
            <div class="name">{{ country.warrior.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div :class="'post post-small country-color-' + country.colorId">
          <h4 class="post-name">大将軍</h4>
          <div class="post-character" v-if="country.grandGeneral.id > 0">
            <div class="icon"><CharacterIcon :icon="country.grandGeneral.mainIcon"/></div>
            <div class="name">{{ country.grandGeneral.name }}</div>
          </div>
          <div class="post-character-notexists" v-else>不在</div>
        </div>
        <div :class="'numbers country-color-' + country.colorId">
          <div class="number-item">
            <div class="number-label">武将</div>
            <div class="number">{{ country.charactersCount }}</div>
          </div>
          <div class="number-item">
            <div class="number-label">人間武将</div>
            <div class="number">{{ country.humansCount }}</div>
          </div>
          <div class="number-item">
            <div class="number-label">活動中人間</div>
            <div class="number">{{ country.activeHumansCount }}</div>
          </div>
        </div>
        <div :class="'character-list country-color-' + country.colorId">
          <CharacterList :countries="countries" :characters="country.characters"/>
        </div>
      </div>
      <div class="country country-color-0">
        <h3 class="country-name country-color-0">無所属</h3>
        <CharacterList :countries="countries" :characters="defaultCountryCharacters"/>
      </div>
      <div class="summary">
        登録人間武将数: <span class="number">{{ count }}</span> 名<br>
        活動人間数: <span class="number-small">{{ activeCount }}</span> 名
      </div>
      <div class="cancel">
        <button v-if="!isApp" type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
        <button v-else type="button" class="btn btn-secondary" @click="reloadPage()">更新</button>
      </div>
    </div>
    <div v-show="isLoading" class="loading"><div class="loading-icon"></div></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import CharacterList from '@/components/parts/CharacterList.vue';
import * as api from './../../api/api';
import * as def from './../../common/definitions';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

@Component({
  components: {
    CharacterList,
    CharacterIcon,
  },
})
export default class AllCharactersPage extends Vue {
  public allCharacters: api.Character[] = [];
  public countries: api.Country[] = [];
  public defaultCountryCharacters: api.Character[] = [];
  public count: number = 0;
  public activeCount: number = 0;
  private isLoading: boolean = true;
  private isApp: boolean = false;

  private created() {
    if (this.$route.query.app) {
      this.isApp = true;
    }
    this.initializeAsync()
      .catch(() => {
        NotificationService.getAllCharactersFailed.notify();
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private async initializeAsync() {
    const charas = await api.Api.getAllCharacters();
    const allCountries = await api.Api.getAllCountries();
    this.count = Enumerable.from(charas).count((c) => c.aiType === api.Character.aiHuman ||
                                                      c.aiType === api.Character.aiAdministrator);
    this.activeCount = Enumerable.from(charas).count((c) =>
          (c.aiType === api.Character.aiHuman ||
           c.aiType === api.Character.aiAdministrator) && !c.deleteTurn);
    this.allCharacters = charas;

    const countries = Enumerable.from(allCountries)
      .where((c) => !c.hasOverthrown)
      .toArray();
    countries.forEach((country) => {
      const cdata = country as any;
      cdata.characters = Enumerable.from(charas)
        .where((c) => c.countryId === country.id)
        .orderByDescending((c) => c.classValue)
        .toArray();
      cdata.monarch = this.getMonarch(country);
      cdata.warrior = this.getWarrior(country);
      cdata.grandGeneral = this.getGrandGeneral(country);
      cdata.charactersCount = cdata.characters.length;
      cdata.humansCount = cdata.characters.filter((c: any) => (!c.aiType || c.aiType === 28)).length;
      cdata.activeHumansCount = cdata.characters.filter((c: any) => (!c.aiType || c.aiType === 28) &&
                                                                    !c.deleteTurn).length;
    });
    this.defaultCountryCharacters = Enumerable.from(charas)
      .except(Enumerable.from(countries).selectMany((c) => (c as any).characters as api.Character[]))
      .toArray();
    this.countries = countries;
  }

  private getReligionName(id: number): string {
    return def.RELIGION_TYPES[id];
  }

  private getMonarch(country: api.Country): api.Character {
    return this.getPostCharacter(country, api.CountryPost.typeMonarch);
  }

  private getWarrior(country: api.Country): api.Character {
    return this.getPostCharacter(country, api.CountryPost.typeWarrior);
  }

  private getGrandGeneral(country: api.Country): api.Character {
    return this.getPostCharacter(country, api.CountryPost.typeGrandGeneral);
  }

  private getPostCharacter(country: api.Country, pst: number): api.Character {
    const post = Enumerable.from(country.posts)
      .firstOrDefault((cp) => cp.type === pst);
    if (post) {
      const chara = Enumerable.from(this.allCharacters).firstOrDefault((c) => c.id === post.character.id);
      if (chara) {
        return chara;
      }
    }
    return new api.Character(-1);
  }

  private reloadPage() {
    window.location.reload();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/bootstrap-helper.scss';
@import '@/scss/country-color.scss';

#all-characters-page {
  min-height: 100px;

  .country {
    margin: 8px 0 56px;

    .country-name {
      padding: 4px 12px;
      border-radius: 16px 16px 0 0;
      margin-bottom: 0;
      font-weight: bold;
      text-align: center;
      @include country-color-deep('background-color');
      @include country-color-light('color');
    }

    .religion {
      text-align: center;
      padding-bottom: 8px;
      @include country-color-light('background-color');
      .religion-inner {
        padding: 4px;
        background: rgba(0, 0, 0, 0.12);
      }
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

    .numbers {
      display: flex;
      padding-top: 8px;
      border-top: 1px dashed black;
      @include country-color-light('background-color');
      @include country-color-deep('border-top-color');
      .number-item {
        flex: 1;
        text-align: center;
        margin-bottom: 8px;
        .number-label {
          color: #666;
          font-size: 14px;
        }
        .number {
          font-weight: bold;
        }
      }
    }

    .character-list {
      border-top-width: 5px;
      border-top-style: double;
      @include country-color-deep('border-top-color');
    }
  }

  .summary {
    text-align: center;

    .number {
      font-weight: bold;
      font-size: 2em;
    }

    .number-small {
      font-size: 1.8em;
    }
  }
}
</style>
