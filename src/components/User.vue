<template>
  <v-card>
    <v-data-table
      :search="search"
      :headers="headers"
      :items="user_arr"
      :loading="loading"
      item-key="uid"
      show-select
      v-model="selected"
      class="elevation-1"
      loading-text="加载中"
      no-data-text="没有数据"
      no-results-text="没有符合结果"
      :footer-props="{
        'items-per-page-text': '每页显示条数',
        'items-per-page-all-text': '显示所有',
        'items-per-page-options': pageSize,
      }"
    >
      <template v-slot:top>
        <div style="display:flex;align-items: center; padding: 0 10px;">
          <v-btn icon @click="fetchUsers"><v-icon>mdi-refresh</v-icon></v-btn>
          <v-text-field
            v-model="search"
            @keydown="handleSearch"
            label="搜索任何内容"
            class="mx-4"
            clearable
          ></v-text-field>
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn text color="primary" @click="toggleSilent([item], !parseBool(item.silent))">{{parseBool(item.silent)?'解除禁言':'禁言'}}</v-btn>
        <v-btn text color="primary" @click="toggleStream([item], !parseBool(item.stream))">{{parseBool(item.stream)?'禁播':'解除禁播'}}</v-btn>
        <v-btn text color="primary" @click="editInfo(item)">修改信息</v-btn>
        <v-btn text color="primary" @click="streamHistory(item)">查询开播记录</v-btn>
        <v-btn text color="primary" @click="danmakuHistory(item)">查询弹幕记录</v-btn>
      </template>
    </v-data-table>
    <v-card-actions>
      <span style="margin-right: 10px;">已选中 {{selected.length}} 项</span>
      <v-btn color="primary" @click="toggleSilent(selected, false)">批量禁言</v-btn>
      <v-btn color="primary" @click="toggleSilent(selected, true)">批量解除禁言</v-btn>
      <v-btn color="primary" @click="toggleStream(selected, false)">批量禁播</v-btn>
      <v-btn color="primary" @click="toggleStream(selected, true)">批量解除禁播</v-btn>
    </v-card-actions>
    <v-dialog v-model="showEditInfo" max-width="60%">
      <v-card>
        <v-card-title>修改用户信息</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editInfoTarget.id"
            label="用户ID"
            disabled
          ></v-text-field>
          <v-text-field
            v-model="editInfoTarget.nickname"
            label="昵称"
            required
          ></v-text-field>
          <v-text-field
            v-model="editInfoTarget.email"
            label="邮箱"
            required
          ></v-text-field>
          <v-text-field
            v-model="editInfoTarget.pwd"
            label="密码（填入则会覆盖密码，可不填）"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showEditInfo = false">取消</v-btn>
          <v-btn color="primary" @click="sendEditInfo">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import moment from 'moment'
import { emitListener, md5Encrypt } from '@/utils/tools'
export default {
  name: 'User',
  props: {
    userOptions: Object
  },
  data () {
    return {
      server: Window.$WebSocket,
      user_arr: [],
      loading: true,
      search: '',
      selected: [],
      showEditInfo: false,
      editInfoTarget: {},
      headers: [
        {
          text: 'ID',
          value: 'uid'
        },
        {
          text: '昵称',
          value: 'nickname'
        },
        {
          text: '邮箱',
          value: 'email'
        },
        {
          text: '是否禁言',
          value: 'silent'
        },
        {
          text: '是否可开播',
          value: 'stream'
        },
        {
          text: '注册时间',
          value: 'reg_time'
        },
        {
          text: '上次登录',
          value: 'last_time'
        },
        {
          text: '操作',
          align: 'center',
          value: 'actions',
          sortable: false
        }
      ],
      pageSize: [20, 50, 100, -1]
    }
  },
  mounted () {
    this.search = this.userOptions.search
    this.fetchUsers()
  },
  methods: {
    parseBool (text) {
      return text === '是'
    },
    fetchUsers () {
      this.loading = true
      this.user_arr = []
      this.server.On('GetUsers_Admin', data => {
        this.loading = false
        if (data.code === 200) {
          data.data.forEach(x => {
            this.user_arr.push({
              uid: x.Id,
              nickname: x.NickName,
              email: x.Email,
              silent: !x.CanSendDanmaku ? '是' : '否',
              stream: x.CanStream ? '是' : '否',
              reg_time: moment(x.CreateTime).format('YYYY-MM-DD HH:mm:ss'),
              last_time: moment(x.LastLoginTime).format('YYYY-MM-DD HH:mm:ss')
            })
          })
          this.snackbar.Success('刷新成功')
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('GetUsers_Admin', '')
    },
    toggleSilent (item, action) {
      this.server.On('ToggleSilent_Admin', data => {
        if (data.code === 200) {
          this.snackbar.Success('操作成功')
          item.forEach(x => {
            x.silent = x.silent === '是' ? '否' : '是'
          })
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('ToggleSilent_Admin', { uid: item.map(x => x.uid), action })
    },
    toggleStream (item, action) {
      this.server.On('ToggleStream_Admin', data => {
        if (data.code === 200) {
          this.snackbar.Success('操作成功')
          item.forEach(x => {
            x.stream = x.stream === '是' ? '否' : '是'
          })
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('ToggleStream_Admin', { uid: item.map(x => x.uid), action })
    },
    editInfo (item) {
      this.showEditInfo = true
      this.editInfoTarget = item
    },
    sendEditInfo () {
      this.loading = true
      this.server.On('EditUser_Admin', data => {
        this.loading = false
        if (data.code === 200) {
          this.snackbar.Success('修改成功')
          this.showEditInfo = false
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('EditUser_Admin', {
        uid: this.editInfoTarget.uid,
        nickname: this.editInfoTarget.nickname,
        email: this.editInfoTarget.email,
        pwd: this.editInfoTarget.pwd ? md5Encrypt(this.editInfoTarget.pwd) : ''
      })
    },
    handleSearch (e) {
      if (!this.search) this.selected = []
    },
    streamHistory (item) {
      emitListener('filter-log', {
        actionName: 'CreateRoom',
        account: item.email
      })
    },
    danmakuHistory (item) {
      emitListener('filter-log', {
        actionName: 'Danmaku',
        account: item.email
      })
    }
  }
}
</script>

<style scoped>
.actions {
  margin-right: 5px;;
}
</style>
