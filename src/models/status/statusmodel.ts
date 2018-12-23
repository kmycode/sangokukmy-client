import ArrayUtil from '@/models/common/arrayutil';
import Streaming from '@/api/streaming';
import ApiStreaming from '@/api/apistreaming';
import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import { StatusParameter,
  NoRangeStatusParameter,
  RangedStatusParameter,
  TextStatusParameter,
  CharacterIconStatusParameter,
} from '@/models/status/statusparameter';

export default class StatusModel {
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public towns: api.Town[] = [];
  public countries: api.Country[] = [];
  public town: api.Town = new api.Town(-1);
  public townParameters: StatusParameter[] = [];
  public character: api.Character = new api.Character(-1);
  public characterParameters: StatusParameter[] = [];
  public commands: api.CharacterCommand[] = [];

  public get townCountryColor(): number {
    return this.getCountry(this.town.countryId).colorId;
  }

  public get characterCountryColor(): number {
    return this.getCountry(this.character.countryId).colorId;
  }

  public onCreate() {
    ApiStreaming.status.on<api.GameDateTime>(
      api.GameDateTime.typeId,
      (obj) => this.gameDate = obj);
    ApiStreaming.status.on<api.Town>(
      api.Town.typeId,
      (obj) => this.updateTown(obj));
    ApiStreaming.status.on<api.Country>(
      api.Country.typeId,
      (obj) => this.updateCountry(obj));
    ApiStreaming.status.on<api.Character>(
      api.Character.typeId,
      (obj) => this.updateCharacter(obj));
    ApiStreaming.status.start();

    // TODO: debug
    for (let i = 0; i < 200; i++) {
      this.commands.push({ name: 'あああ', gameDate: new api.GameDateTime(180, 1) } as api.CharacterCommand);
    }
    Enumerable
      .from(this.commands)
      .orderBy((c) => c.gameDate.toNumber())
      .forEach((c, index) => c.commandNumber = index + 1);
  }

  public onDestroy() {
    ApiStreaming.status.stop();
  }

  // #region Town

  private updateTown(town: api.Town) {
    ArrayUtil.addItem(this.towns, town);

    // 現在表示中の都市を更新
    if (this.town.id < 0) {
      if (this.character.id >= 0 && town.id === this.character.townId) {
        this.setTown(town);
      }
    } else if (this.town.id === town.id) {
      this.setTown(town);
    }
  }

  private setTown(town: api.Town) {
    this.town = town;
    this.townParameters = this.getTownParameters(town);
  }

  private getTownParameters(town: api.Town): StatusParameter[] {
    const country = ArrayUtil.find(this.countries, town.countryId);
    const ps: StatusParameter[] = [];
    if (country) {
      ps.push(new TextStatusParameter('国', country.name));
    } else {
      ps.push(new TextStatusParameter('国', '無所属'));
    }
    ps.push(new NoRangeStatusParameter('相場', town.ricePrice));
    ps.push(new NoRangeStatusParameter('農民', town.people));
    ps.push(new RangedStatusParameter('民忠', town.security, 100));
    ps.push(new RangedStatusParameter('農業', town.agriculture, town.agricultureMax));
    ps.push(new RangedStatusParameter('商業', town.commercial, town.commercialMax));
    ps.push(new RangedStatusParameter('技術', town.technology, town.technologyMax));
    ps.push(new RangedStatusParameter('城壁', town.wall, town.wallMax));
    ps.push(new RangedStatusParameter('守兵', town.wallguard, town.wallguardMax));
    return ps;
  }

  // #endregion

  // #region Country

  private updateCountry(country: api.Country) {
    ArrayUtil.addItem(this.countries, country);

    // 現在表示している都市、武将の国であれば、国名を更新する
    if (country.id === this.town.countryId) {
      const townParameter = Enumerable.from(this.townParameters).firstOrDefault((tp) => tp.name === '国');
      if (townParameter) {
        (townParameter as TextStatusParameter).value = country.name;
      }
    }
    if (country.id === this.character.countryId) {
      const characterParameter = Enumerable.from(this.characterParameters).firstOrDefault((cp) => cp.name === '国');
      if (characterParameter) {
        (characterParameter as TextStatusParameter).value = country.name;
      }
    }
  }

  private getCountry(countryId: number): api.Country {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country;
    }
    return api.Country.default;
  }

  // #endregion

  // #region Character

  private updateCharacter(character: api.Character) {
    this.character = character;
    this.characterParameters = this.getCharacterParameters(character);

    // 現在表示中の都市が設定されていなければ、現在の武将の都市を設定
    if (this.town.id < 0) {
      const currentTown = ArrayUtil.find(this.towns, character.townId);
      if (currentTown) {
        this.town = currentTown;
      }
    }
  }

  private getCharacterParameters(character: api.Character): StatusParameter[] {
    const country = this.getCountry(character.countryId);
    const ps: StatusParameter[] = [];
    ps.push(new CharacterIconStatusParameter('アイコン', [ new api.CharacterIcon(0, 0, true, 1, '', '0.gif') ]));
    ps.push(new TextStatusParameter('国', country.name));
    ps.push(new NoRangeStatusParameter('武力', character.strong));
    ps.push(new RangedStatusParameter('武力EX', character.strongEx, 1000));
    ps.push(new NoRangeStatusParameter('知力', character.intellect));
    ps.push(new RangedStatusParameter('知力EX', character.intellectEx, 1000));
    ps.push(new NoRangeStatusParameter('統率', character.leadership));
    ps.push(new RangedStatusParameter('統率EX', character.leadershipEx, 1000));
    ps.push(new NoRangeStatusParameter('人望', character.popularity));
    ps.push(new RangedStatusParameter('人望EX', character.popularityEx, 1000));
    ps.push(new NoRangeStatusParameter('金', character.money));
    ps.push(new NoRangeStatusParameter('米', character.rice));
    ps.push(new NoRangeStatusParameter('貢献', character.contribution));
    ps.push(new NoRangeStatusParameter('階級値', character.classValue));
    ps.push(new TextStatusParameter('階級', api.Character.getClassName(character)));
    const soldierType = Enumerable.from(def.SOLDIER_TYPES).firstOrDefault((st) => st.id === character.soldierType);
    if (soldierType) {
      ps.push(new TextStatusParameter('兵種', soldierType.name));
    } else {
      ps.push(new TextStatusParameter('兵種', def.SOLDIER_TYPES[0].name));
    }
    ps.push(new RangedStatusParameter('兵士', character.soldierNumber, character.leadership));
    ps.push(new RangedStatusParameter('訓練', character.proficiency, 100));
    return ps;
  }

  // #endregion
}
