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
import Map from './../parts/Map.vue';
import * as api from '@/api/api';
import StatusModel from '../../models/statusmodel';

@Component({
  components: {
    Map,
  },
})
export default class StatusPage extends Vue {
  public model: StatusModel = new StatusModel();

  public created() {
    this.model.onCreate();
  }

  public destroyed() {
    this.model.onDestroy();
  }
}
</script>

<style lang="scss" scoped>
$current-display-height: 36px;
$nav-tab-height: 40px;
$left-side-fixed-height: $current-display-height + $nav-tab-height;
$right-side-fixed-height: $nav-tab-height;
ul.nav {
  font-size: 1rem;
  li {
    height: 40px;
  }
}
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
