import ArrayUtil from '@/models/common/arrayutil';
import Streaming from '@/api/streaming';
import ApiStreaming from '@/api/apistreaming';
import * as api from '@/api/api';

export default class StatusModel {
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public towns: api.Town[] = [];
  public countries: api.Country[] = [];

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
    ApiStreaming.status.start();
  }

  public onDestroy() {
    ApiStreaming.status.stop();
  }

  public updateTown(town: api.Town) {
    ArrayUtil.addUniquelyItem(this.towns, town, (t) => t.id);
  }

  public updateCountry(country: api.Country) {
    ArrayUtil.addUniquelyItem(this.countries, country, (t) => t.id)
  }
}
