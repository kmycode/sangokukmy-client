<template>
  <div id="notification-service">
    <transition-group name="notification-alert" tag="div">
      <div
          v-for="notification in notifications" :key="notification.id"
          :class="'alert alert-' + notification.className"
          @click="removeItem(notification.id)">
        <h4 class="alert-heading">{{ notification.title }}</h4>
        <p>{{ notification.message }}</p>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NotificationService from '../../services/notificationservice';

class NotificationItemClassName {
  public static readonly error = 'danger';
  public static readonly warning = 'warning';
  public static readonly info = 'info';
  public static readonly succeed = 'success';
  private constructor() {}
}

class NotificationItem {
  private static num: number = 0;
  public id: number;
  public removeTimerId: number = 0;
  constructor(public readonly title: string,
              public readonly message: string,
              public readonly className: string) {
    NotificationItem.num++;
    this.id = NotificationItem.num;
  }
}

@Component({
  components: {
  },
})
export default class Notification extends Vue {
  public notifications: NotificationItem[] = [];

  public created() {
    NotificationService.onError = (title, message) => {
      this.addNotification(new NotificationItem(title, message, NotificationItemClassName.error));
    };
    NotificationService.onWarning = (title, message) => {
      this.addNotification(new NotificationItem(title, message, NotificationItemClassName.warning));
    };
    NotificationService.onInformation = (title, message) => {
      this.addNotification(new NotificationItem(title, message, NotificationItemClassName.info));
    };
    NotificationService.onSucceed = (title, message) => {
      this.addNotification(new NotificationItem(title, message, NotificationItemClassName.succeed));
    };
  }

  public removeItem(id: number) {
    this.notifications.some((item, index) => {
      if (item.id === id) {
        this.notifications.splice(index, 1);
        clearTimeout(item.removeTimerId);
        return true;
      }
      return false;
    });
  }

  private addNotification(item: NotificationItem) {
    this.notifications.push(item);
    item.removeTimerId = setTimeout(() => this.notifications.shift(), 8000);
  }
}
</script>

<style lang="scss" scoped>
div#notification-service {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  div.alert {
    width: 30vw;
    max-width: 600px;
    min-width: 200px;
    font-size: 1rem;
    cursor: pointer;
    p {
      margin: 0;
    }
  }
}

.notification-alert-enter-active, .notification-alert-leave-active {
  transition: opacity .3s;
}

.notification-alert-enter, .notification-alert-leave-to {
  opacity: 0;
}

.notification-alert-move {
  transition: transform .3s;
}
</style>
