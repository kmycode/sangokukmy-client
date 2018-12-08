<template>
  <div id="login-page">
    <div class="login-form">
      <h2>ログイン</h2>
      <div class="alert alert-danger" role="alert" :style="{display: isError ? 'block' : 'none'}">
        {{ errorMessage }}
      </div>
      <form>
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-1">ID</div>
            <div class="col-md-4"><input type="text"></div>
            <div class="col-md-1">PASS</div>
            <div class="col-md-4"><input type="text"></div>
            <div class="col-md-2"><button type="button" class="btn btn-primary">ログイン</button></div>
          </div>
        </div>
      </form>
    </div>
    <div class="login-abort">
      <button type="button" class="btn btn-light" @click="abortLogin">中止</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class LoginPage extends Vue {
  private isError = false;
  private errorMessage = '';

  public abortLogin() {
    this.$emit('login-abort');
  }
}
</script>

<style lang="scss" scoped>
@import '../../scss/bootstrap-helper.scss';

#login-page {
  $panel-background: #ffffff99;

  width: 100vw;
  height: 100vh;
  background: #99ccff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;

  .login-form {
    $height: 40px;

    background: $panel-background;
    width: 100%;
    padding: 20px 40px;

    div.container-fluid >div {
      vertical-align: middle;
      line-height: $height;
      input {
        width: 100%;
        min-width: 0;
        height: $height;
      }
      button {
        @include media-query-lower(md) {
          margin-top: 16px;
        }
      }
    }
  }

  .login-abort {
    width: 100%;
    position: absolute;
    top: 0;
    background: $panel-background;
    padding: 8px 16px;
  }
}
</style>
