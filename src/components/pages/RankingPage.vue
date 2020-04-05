<template>
  <div id="all-characters-page" class="loading-container">
    <div class="col-xg-6 offset-xg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1">
      <div class="cancel">
        <button type="button" class="btn btn-light" @click="$router.push('home')">TOPに戻る</button>
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
                <div :class="{ 'number responsive-header': true, 'top': index === 0 }">{{ chara[ranking.property] }}</div>
              </div>
            </div>
          </div>
        </div>
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
import * as api from './../../api/api';
import ArrayUtil from '@/models/common/arrayutil';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';

class RankingData {
  public characters: api.Character[];

  public constructor(public name: string,
                     public property: string,
                     charas: api.Character[],
                     isContainsAi: boolean = false) {
    const ranking = Enumerable.from(charas)
      .where((c) => (c as any)[property] !== 0 && (isContainsAi || c.aiType === api.Character.aiHuman))
      .orderByDescending((c) => (c as any)[property])
      .take(5);
    this.characters = ranking.toArray();
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

  private created() {
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
      cdata.attributeSum = c.strong + c.intellect + c.leadership + c.popularity;
      cdata.winRate = (cdata.battleWonCount + cdata.battleLostCount >= 10) ?
        Math.round((cdata.battleWonCount / (cdata.battleWonCount + cdata.battleLostCount)) * 1000) / 10 :
        0;
      cdata.battleKillRate = (cdata.battleKilledCount + cdata.battleBeingKilledCount > 0) ?
        Math.round((cdata.battleKilledCount / (cdata.battleKilledCount + cdata.battleBeingKilledCount)) * 1000) / 10 :
        0;
    });

    this.rankings.push(new RankingData('総合力', 'attributeSum', charas));
    this.rankings.push(new RankingData('武力', 'strong', charas));
    this.rankings.push(new RankingData('知力', 'intellect', charas));
    this.rankings.push(new RankingData('統率', 'leadership', charas));
    this.rankings.push(new RankingData('人望', 'popularity', charas));
    this.rankings.push(new RankingData('階級', 'classValue', charas));
    this.rankings.push(new RankingData('資産', 'money', charas));
    this.rankings.push(new RankingData('対人戦闘勝利数', 'battleWonCount', charas, true));
    this.rankings.push(new RankingData('対人戦闘敗北数', 'battleLostCount', charas, true));
    this.rankings.push(new RankingData('勝率', 'winRate', charas, true));
    this.rankings.push(new RankingData('城壁破壊量', 'battleBrokeWallSize', charas, true));
    this.rankings.push(new RankingData('支配数', 'battleDominateCount', charas, true));
    this.rankings.push(new RankingData('連戦数', 'battleContinuousCount', charas, true));
    this.rankings.push(new RankingData('計略使用回数', 'battleSchemeCount', charas, true));
    this.rankings.push(new RankingData('倒した兵士数', 'battleKilledCount', charas, true));
    this.rankings.push(new RankingData('失った兵士数', 'battleBeingKilledCount', charas, true));
    this.rankings.push(new RankingData('殺人効率', 'battleKillRate', charas, true));
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
