<template>
  <div class="home">
    <v-navigation-drawer app v-model="showMenu">
      <v-list
        dense
        nav
      >
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              导航
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item-group v-model="selectItem" color="primary">
          <v-list-item link @click="changeStatus('stream')">
            <v-list-item-icon>
              <v-icon>mdi-access-point</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>直播一览</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="changeStatus('user')">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>用户管理</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link @click="changeStatus('log')">
            <v-list-item-icon>
              <v-icon>mdi-history</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>操作日志</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-container fluid>
      <Stream v-if="status.stream"></Stream>
      <Log v-if="status.log"></Log>
      <User v-if="status.user"></User>
    </v-container>
  </div>
</template>

<script>
import Stream from '@/components/Stream.vue'
import Log from '@/components/Log.vue'
import User from '@/components/User.vue'
import { addListener } from '@/utils/tools'

export default {
  name: 'Home',
  components: {
    Stream,
    Log,
    User
  },
  data () {
    return {
      selectItem: 0,
      status: {
        stream: true,
        user: false,
        log: false
      },
      showMenu: true
    }
  },
  methods: {
    changeStatus (name) {
      for (const key in this.status) {
        if (key === name) {
          this.status[key] = true
        } else {
          this.status[key] = false
        }
      }
    }
  },
  mounted () {
    addListener('toggleMenu', () => {
      this.showMenu = !this.showMenu
    })
  }
}
</script>
