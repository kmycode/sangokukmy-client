<template>
  <div id="app">
    <component :is="currentPage"
      @login-start="startLogin"
      @login-abort="abortLogin"
      @login-succeed="enterStatusPage"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopPage from './components/pages/TopPage.vue';
import LoginPage from './components/pages/LoginPage.vue';
import StatusPage from './components/pages/StatusPage.vue';

// フィルタ
Vue.filter('zeroformat', (value: number, length: number): string | null => {
  return ('0000000000' + value).slice(-length);
});

@Component({
  components: {
    TopPage,
    LoginPage,
    StatusPage,
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

  public enterStatusPage() {
    this.currentPage = 'StatusPage';
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
</style>
