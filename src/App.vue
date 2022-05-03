<template>
  <v-app id="inspire">
    <v-app-bar app>
      <v-toolbar-title>
        <v-btn icon @click="switchMenu" v-if="$route.path === '/'"><v-icon>mdi-menu</v-icon></v-btn>
        <span>{{$route.name}}</span>
        <v-btn icon style="position: absolute;right:60px;" @click="toggleTheme"><v-icon>{{theme==='light'?'mdi-white-balance-sunny':'mdi-weather-night'}}</v-icon></v-btn>
        <v-btn icon style="position: absolute;right:10px;" @click="logout" v-if="$route.path === '/'"><v-icon>mdi-logout-variant</v-icon></v-btn>
      </v-toolbar-title>
    </v-app-bar>

    <v-main :style="`background-image: url('img/y-so-serious-${theme === 'light'?'white':'black'}.png'); background-repeat: repeat;`">
      <v-container fluid>
        <!-- 如果使用 vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer>
      <v-spacer></v-spacer>
      <div
        :style="
          'margin-right:5px;;width: 15px;height:15px;border-radius:50%;border: 1px solid gray;background: ' +
          stateColor + ';'"
      ></div>
      <span>{{ stateText }}</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import { Confirm } from './utils/dialog'
import { emitListener } from './utils/tools'
export default {
  name: 'App',
  data: () => ({
    connect: Window.$WebSocket,
    activeState: false,
    stateText: '未连接',
    stateColor: 'red',
    theme: 'light'
  }),
  mounted () {
    setInterval(() => {
      if (this.connect.connection.readyState === 1) {
        this.stateText = '已连接'
        this.stateColor = '#5ee75e'
      } else {
        this.stateText = '未连接'
        this.stateColor = 'red'
      }
    }, 500)
  },
  methods: {
    switchMenu () {
      emitListener('toggleMenu')
    },
    logout () {
      Confirm('确认登出吗', '提示').then((data) => {
        if (data) {
          sessionStorage.removeItem('danmaku-login')
          this.$router.replace('/login')
        }
      })
    },
    toggleTheme () {
      if (this.theme === 'light') {
        this.theme = 'dark'
        this.$vuetify.theme.dark = true
      } else {
        this.theme = 'light'
        this.$vuetify.theme.dark = false
      }
    }
  }
}
</script>

<style>
.active {
  left: 256px;
}
</style>
