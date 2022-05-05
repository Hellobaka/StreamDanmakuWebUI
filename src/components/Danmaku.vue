<template>
  <v-card>
    <v-card-title>
      历史弹幕
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-window-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table :search="search" :headers="headers" :items="danmaku_arr" item-key="danmaku_time" :loading="loading" class="elevation-1"
      loading-text="加载中" no-data-text="没有数据" no-results-text="没有符合结果"
      :footer-props="{
        'items-per-page-text':'每页显示条数',
        'items-per-page-all-text': '显示所有',
        'items-per-page-options': pageSize
      }">
        <template v-slot:top>
          <div style="display:flex;align-items: center; padding: 0 10px;">
            <v-btn icon @click="fetchDanmaku"><v-icon>mdi-refresh</v-icon></v-btn>
            <v-text-field
              v-model="search"
              label="搜索任何内容"
              class="mx-4"
            ></v-text-field>
          </div>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn :disabled="item.id === 0" text color="primary" @click="userShutUp(item)">禁言</v-btn>
        </template>
        <template v-slot:item.nickname="{ item }">
          <a title="点击跳转用户信息" @click="searchUser(item)" :style="item.id === 0 ? 'color: red;' : ''">{{item.nickname}}</a>
        </template>
        <template v-slot:item.danmaku_color="{ item }">
          <div :title="item.danmaku_color" :style="`width: 15px; height: 15px; border: 2px solid black; background-color: ${item.danmaku_color};`"></div>
        </template>

      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-text-field label="以管理员身份发送弹幕" v-model="danmaku" @keydown.enter="sendDanmaku">
      </v-text-field>
      <v-btn color="primary" style="margin-left: 5px;" @click="sendDanmaku">发送</v-btn>
      <v-spacer></v-spacer>
      <v-btn text @click="closeDialog">关闭</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'
import { emitListener } from '@/utils/tools'
export default {
  name: 'Danmaku',
  props: {
    room: Object
  },
  beforeDestroy () {
    this.server.Emit('RemoveMonitor_Admin', {
      invite_code: this.room.invite_code
    })
  },
  data () {
    return {
      server: Window.$WebSocket,
      danmaku_arr: [],
      loading: true,
      search: '',
      danmaku: '',
      headers: [
        {
          text: '用户ID',
          value: 'id'
        },
        {
          text: '昵称',
          value: 'nickname'
        },
        {
          text: '内容',
          value: 'danmaku_content'
        },
        {
          text: '颜色',
          value: 'danmaku_color'
        },
        {
          text: '位置',
          value: 'danmaku_position'
        },
        {
          text: '弹幕时间',
          value: 'danmaku_time'
        },
        {
          text: '操作',
          value: 'actions',
          sortable: false
        }
      ],
      pageSize: [20, 50, 100, -1]
    }
  },
  mounted () {
    this.fetchDanmaku()
    this.server.On('OnDanmaku', this.HandleDanmaku)
  },
  methods: {
    HandleDanmaku (data) {
      this.danmaku_arr.push(this.parseDanmaku(data))
    },
    parseDanmaku (data) {
      const d = {
        id: data.SenderUserID,
        nickname: data.SenderUserName,
        danmaku_content: data.Content,
        danmaku_color: data.Color,
        danmaku_position: data.Position,
        danmaku_time: data.Time
      }
      switch (d.danmaku_position) {
        case 0:
          d.danmaku_position = '滚动'
          break
        case 1:
          d.danmaku_position = '顶部'
          break
        case 2:
          d.danmaku_position = '底部'
          break
      }
      d.danmaku_time = moment.unix(d.danmaku_time).format('YYYY-MM-DD HH:mm:ss')
      return d
    },
    fetchDanmaku () {
      this.loading = true
      this.danmaku_arr = []
      this.server.On('GetDanmaku_Admin', data => {
        this.loading = false
        if (data.code === 200) {
          data.data.forEach(x => {
            this.danmaku_arr.push(this.parseDanmaku(x))
          })
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('GetDanmaku_Admin', {
        invite_code: this.room.invite_code
      })
    },
    closeDialog () {
      this.$emit('onDialogClose', true)
    },
    userShutUp (user) {
      this.server.On('ToggleSilent_Admin', data => {
        if (data.code === 200) {
          this.snackbar.Success('操作成功')
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('ToggleSilent_Admin', {
        uid: [user.id],
        action: false
      })
    },
    sendDanmaku () {
      this.server.On('SendDanmaku_Admin', data => {
        if (data.code !== 200) {
          this.snackbar.Error(data.msg)
        } else {
          this.danmaku = ''
        }
      })
      this.server.Emit('SendDanmaku_Admin', {
        invite_code: this.room.invite_code,
        content: this.danmaku
      })
    },
    searchUser (item) {
      emitListener('filter-user', item.nickname)
    }
  }
}
</script>

<style>

</style>
