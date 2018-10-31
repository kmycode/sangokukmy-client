<template>
  <div id="app">
    <TopPage/>
    <Footer/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';
import Footer from './components/common/Footer.vue';

@Component({
  components: {
    TopPage,
    Footer,
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

// マップログのリスト
ul.map-log-list {
  list-style: none;
  margin: 0;
  margin-left: 1em;
  padding: 0;
  li::before {
    content: '●';
    margin-left: -1em;
    color: #080;
  }
}
// 重要マップログリスト
.map-log-list-important {
  @extend ul.map-log-list;
  li::before {
    color: #008;
  }
}
// 武将更新ログリスト
.character-update-log-list {
  @extend ul.map-log-list;
  li::before {
    color: inherit;
  }
}
</style>
