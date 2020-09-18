<template>
  <div id="all-characters-page" class="loading-container">
    <div class="col-xg-6 offset-xg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1">
      <div class="cancel">
        <button v-if="!isApp" type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
        <button v-else type="button" class="btn btn-secondary" @click="reloadPage()">更新</button>
      </div>
      <div v-for="ranking in rankings"
           :key="ranking.name"
           :class="'country country-color-0'">
        <h3 :class="'country-name country-color-0'">{{ ranking.name }}</h3>
        <div class="character-list">
          <div :class="'character country-color-' + getCountryColorId(chara.countryId)"
               v-for="(chara, index) in ranking.characters"
               :key="chara.id">
            <div class="character-information">
              <div class="icon">
                <CharacterIcon :icon="chara.mainIcon"/>
              </div>
              <div class="information">
                <div class="name-column">
                  <div class="name responsive-header">{{ chara.name }}</div>
                  <div :class="'countryname country-color-' + getCountryColorId(chara.countryId)">{{ getCountryName(chara.countryId) }}</div>
                </div>
                <div :class="{ 'number responsive-header': true, 'top': index === 0 }">{{ ranking.isRankingObject ? chara.ranking[ranking.rankingProperty] : chara[ranking.property] }}</div>
              </div>
            </div>
          </div>
        </div>
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
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

class RankingData {
  public characters: api.Character[];
  public isRankingObject: boolean;

  public constructor(public name: string,
                     public property: string,
                     public rankingProperty: string,
                     charas: api.Character[],
                     isContainsAi: boolean = false) {
    this.isRankingObject = !(!rankingProperty);
    const ranking = Enumerable.from(charas)
      .where((c) => (!this.isRankingObject ? (c as any)[property] : c.ranking[rankingProperty]) > 0 &&
        (isContainsAi || (c.aiType === api.Character.aiHuman || c.aiType === api.Character.aiAdministrator)))
      .orderByDescending((c) => (!this.isRankingObject ? (c as any)[property] : c.ranking[rankingProperty]))
      .take(5);
    this.characters = ranking.toArray();
    console.dir(charas[0]);
  }
}

@Component({
  components: {
    CharacterList,
    CharacterIcon,
  },
})
export default class RankingPage extends Vue {
  public allCharacters: api.Character[] = [];
  public countries: api.Country[] = [];
  public rankings: RankingData[] = [];
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
    this.allCharacters = charas;
    this.countries = allCountries.filter((c) => !c.hasOverthrown);

    charas.forEach((c) => {
      const cdata = c as any;
      const crank = cdata.ranking;
      cdata.attributeSum = c.strong + c.intellect + c.leadership + c.popularity;
      cdata.winRate = (crank.battleWonCount + crank.battleLostCount >= 10) ?
        Math.round((crank.battleWonCount / (crank.battleWonCount + crank.battleLostCount)) * 1000) / 10 :
        0;
      cdata.battleKillRate = (crank.battleKilledCount + crank.battleBeingKilledCount > 0) ?
        Math.round((crank.battleKilledCount / (crank.battleKilledCount + crank.battleBeingKilledCount)) * 1000) / 10 :
        0;
    });

    this.rankings.push(new RankingData('総合力', 'attributeSum', '', charas));
    this.rankings.push(new RankingData('武力', 'strong', '', charas));
    this.rankings.push(new RankingData('知力', 'intellect', '', charas));
    this.rankings.push(new RankingData('統率', 'leadership', '', charas));
    this.rankings.push(new RankingData('人望', 'popularity', '', charas));
    this.rankings.push(new RankingData('階級', 'classValue', '', charas));
    this.rankings.push(new RankingData('対人戦闘勝利数', '', 'battleWonCount', charas, true));
    this.rankings.push(new RankingData('対人戦闘敗北数', '', 'battleLostCount', charas, true));
    this.rankings.push(new RankingData('勝率', 'winRate', '', charas, true));
    this.rankings.push(new RankingData('城壁破壊量', '', 'battleBrokeWallSize', charas, true));
    this.rankings.push(new RankingData('支配数', '', 'battleDominateCount', charas, true));
    this.rankings.push(new RankingData('連戦数', '', 'battleContinuousCount', charas, true));
    this.rankings.push(new RankingData('計略使用回数', '', 'battleSchemeCount', charas, true));
    this.rankings.push(new RankingData('倒した兵士数', '', 'battleKilledCount', charas, true));
    this.rankings.push(new RankingData('失った兵士数', '', 'battleBeingKilledCount', charas, true));
    this.rankings.push(new RankingData('戦闘効率', 'battleKillRate', '', charas, true));
    this.rankings.push(new RankingData('布教量', '', 'missionaryCount', charas, true));
    this.rankings.push(new RankingData('信仰・改宗させた回数', '', 'missionaryChangeReligionCount', charas, true));
  }

  private getCountryColorId(countryId: number): number {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country.colorId;
    } else {
      return 0;
    }
  }

  private getCountryName(countryId: number): string {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country.name;
    } else {
      return '無所属';
    }
  }

  private reloadPage() {
    window.location.reload();
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
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

    .character {
      padding: 4px;
      border-bottom-width: 1px;
      border-bottom-style: dashed;
      @include country-color-light('background-color');
      @include country-color-deep('border-bottom-color');

      .character-information {
        display: flex;

        .information {
          margin-left: 12px;
          flex: 1;
          display: flex;
          align-items: center;

          .name-column {
            flex: 1;

            .name {
              zoom: 0.8;
            }

            .countryname {
              @include country-color-deep('color');
              zoom: 0.9;
            }
          }

          .number {
            font-weight: bold;
            margin-right: 12px;
            color: #777;

            &.top {
              color: #f33;
            }
          }
        }
      }
    }
  }
}
</style>
