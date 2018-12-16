<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左カラム -->
      <div class="col-sm-6">
        <div id="current-display">
          <span class="number">{{ gameDate.year }}</span><span class="unit">年</span>
          <span class="number">{{ gameDate.month }}</span><span class="unit">月</span>
        </div>
        <div id="map-container">
          <Map :towns="towns" :countries="countries"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ArrayUtil from '../../models/common/arrayutil';
import Streaming from './../../api/streaming';
import ApiStreaming from './../../api/apistreaming';
import Map from './../parts/Map.vue';
import * as api from '@/api/api';

@Component({
  components: {
    Map,
  },
})
export default class StatusPage extends Vue {
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public towns: api.Town[] = [];
  public countries: api.Country[] = [];

  public created() {
    ApiStreaming.status.on<api.GameDateTime>(
      api.GameDateTime.typeId,
      (obj) => this.gameDate = obj);
    ApiStreaming.status.on<api.Town>(
      api.Town.typeId,
      (obj) => ArrayUtil.addUniquelyItem(this.towns, obj, (t) => t.id));
    ApiStreaming.status.on<api.Country>(
      api.Country.typeId,
      (obj) => ArrayUtil.addUniquelyItem(this.countries, obj, (t) => t.id));
    ApiStreaming.status.start();
  }

  public destroyed() {
    ApiStreaming.status.stop();
  }
}
</script>

<style lang="scss" scoped>
$current-display-height: 36px;
#current-display {
  text-align: center;
  height: $current-display-height;
  line-height: $current-display-height;
  .number {
    font-weight: bold;
    color: #080;
    padding: 0 8px;
  }
}
#map-container {
  height: calc(60vh - #{$current-display-height});
}
</style>
