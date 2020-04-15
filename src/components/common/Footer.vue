<template>
  <footer>
    <div id="footer">
      <hr>
      <span v-if="!isApp">
        三国志NET Ver2.7 <a href="http://www3.to/maccyu2/" target="_top">maccyu</a><br>
        三国志NET KMY Version (since 2006.8.21)<br>
        GitHub開発ページ: <a href="https://github.com/kmycode/sangokukmy">Server</a> / <a href="https://github.com/kmycode/sangokukmy-client">Client</a><br>
        Administered by 雪あすか(KMY) <a href="https://twitter.com/kmysangoku">公式Twitter</a> / <a href="https://twitter.com/askyq">緊急連絡先</a>
      </span>
      <span v-else>
        三国志NET Ver2.7 maccyu<br>
        三国志NET KMY Version (since 2006.8.21)<br>
        Administered by 雪あすか(KMY) 公式Twitter: @kmysangoku / 連絡先: @askyq
      </span>
      <div id="footer-last-mes">
        <span v-if="!isApp">
          ※本ゲームプログラムは、原作Ver2.7ならびに三国志NET KMY Version 3／7を参考に、一から再構成したものです<br>
          Google Chrome(Win, Mac)、Safari(Mac) で動作を確認しております<br>
          Internet Explorer、Microsoft Edgeでも、操作に不都合がないことは確認していますが、表示の崩れまでは対応していません。<del>滅んで</del>
        </span>
        <span v-else>
          ※本ゲームプログラムは、原作Ver2.7ならびに三国志NET KMY Version 3／7を参考に、一から再構成したものです<br>
          PC/スマホのブラウザからもお楽しみいただけます。なお、Internet Explorer、Microsoft Edgeからの閲覧は非推奨です
        </span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class Footer extends Vue {
  private isApp = false;

  private created() {
    if ((window as any).sangokukmy_app) {
      this.isApp = true;
    }
  }
}
</script>

<style lang="scss" scoped>
#footer {
  text-align: center;
  font-size: 1rem;
  color: #987;
}
#footer-last-mes {
  margin-top: 1em;
  font-size: 0.8rem;
  color: #cba;
  line-height: 120%;
}
</style>
