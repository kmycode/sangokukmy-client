<template>
  <div id="login-page">
    <div class="login-form">
      <h2 v-show="!isLogining">ログイン</h2>
      <div class="alert alert-danger" role="alert" v-show="isError">
        {{ errorMessage }}
      </div>
      <div class="alert alert-warning" role="alert" v-show="isWarning">
        {{ warningMessage }}
      </div>
      <form>
        <div class="container-fluid">
          <div class="row" v-show="!isLogining">
            <div class="col-md-1">ID</div>
            <div class="col-md-4"><input type="text" ref="firstFocused" v-model="loginId"></div>
            <div class="col-md-1">PASS</div>
            <div class="col-md-4"><input type="password" v-model="loginPassword"></div>
            <div class="col-md-2"><button type="button" class="btn btn-primary" @click="login">ログイン</button></div>
          </div>
          <div v-if="isLogining">
            ログイン中...
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
import LoginService, { LoginResult } from '../../models/character/loginservice';
import * as api from './../../api/api';

@Component({
  components: {
  },
})
export default class LoginPage extends Vue {
  private isError = false;
  private isWarning = false;
  private isLogining = false;
  private errorMessage = '';
  private warningMessage = '';
  private loginId = '';
  private loginPassword = '';

  public abortLogin() {
    this.$emit('login-abort');
  }

  public login() {
    this.isLogining = true;
    this.isError = false;
    this.isWarning = false;
    LoginService.loginWithIdAndPasswordAsync(this.loginId, this.loginPassword)
      .then((result) => {
        switch (result) {
          case LoginResult.cannotConnect:
            this.errorMessage = 'サーバへの接続に失敗しました';
            break;
          case LoginResult.wrongIdOrPassword:
            this.errorMessage = 'IDまたはパスワードが間違っています';
            break;
          case LoginResult.emptyId:
            this.warningMessage = 'IDが入力されていません';
            this.isWarning = true;
            break;
          case LoginResult.emptyPassword:
            this.warningMessage = 'パスワードが入力されていません';
            this.isWarning = true;
            break;
          case LoginResult.succeed:
            this.errorMessage = '';
            break;
          default:
            this.errorMessage = '不明なエラーが発生しました';
            break;
        }
        if (result === LoginResult.succeed) {
          this.$emit('login-succeed');
        } else {
          if (!this.isWarning) {
            this.isError = true;
          }
          this.isLogining = false;
        }
      });
  }

  private mounted() {
    (this.$refs.firstFocused as any).focus();
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
    height: auto;
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
