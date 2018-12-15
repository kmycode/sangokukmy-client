<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Streaming from './../../api/streaming';
import ApiStreaming from './../../api/apistreaming';
import * as api from '@/api/api';

@Component({
  components: {
  },
})
export default class StatusPage extends Vue {

  public created() {
    ApiStreaming.status.on(api.DateTime.typeId, (obj) => console.dir(obj));
    ApiStreaming.status.start();
  }

  public destroyed() {
    ApiStreaming.status.stop();
  }
}
</script>

<style lang="scss">
</style>
