<template>
  <div id="app">
    <TopPage/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';

@Component({
  components: {
    TopPage,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
body {
  font-family: "Hiragino Kaku Gothic", "Yu Gothic", "Meiryo";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ca8 url('./assets/images/sangoku-originals/o.gif');
  font-size: 14pt;
}
</style>
