<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="4" offset-md="4" offset-sm="3">
        <v-card>
          <v-card-title>
            <span class="headline">输入后台存储的密码</span>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.password"
              label="密码"
              type="password"
              @keydown.enter="login"
              :loading="loading"
              prepend-icon="mdi-lock"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :loading="loading" color="primary" text @click="login">登录</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { writeLocalStorage } from '@/utils/tools'
export default {
  data: () => ({
    server: Window.$WebSocket,
    form: {
      password: ''
    },
    loading: false
  }),
  methods: {
    login () {
      this.loading = true
      this.server.On('Login', data => {
        this.loading = false
        if (data.code === 200) {
          this.snackbar.Success('登录成功')
          writeLocalStorage('danmaku-login', data.data)
          this.$router.replace('/')
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      if (!this.server.Emit('Login', this.form)) {
        this.loading = false
      }
    }
  }
}
</script>

<style>

</style>
