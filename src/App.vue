<template>
  <div id="app">
    <component :is="currentPage"
      @login-start="startLogin"
      @login-abort="abortLogin"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';
import LoginPage from './components/pages/LoginPage.vue';

// フィルタ
Vue.filter('zeroformat', (value: number, length: number): string | null => {
  return ('0000000000' + value).slice(-length);
});

@Component({
  components: {
    TopPage,
    LoginPage,
  },
})
export default class App extends Vue {
  private currentPage = 'TopPage';

  public startLogin() {
    this.currentPage = 'LoginPage';
  }

  public abortLogin() {
    this.currentPage = 'TopPage';
  }
}
</script>

<style lang="scss">
body {
  font-family: "Hiragino Kaku Gothic", "Yu Gothic", "Meiryo";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #ca8 url('./assets/images/sangoku-originals/o.gif');
  font-size: 14pt;
}

* {
  box-sizing: border-box;
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
  font-weight: bold;
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
