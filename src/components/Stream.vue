<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="rooms"
      :search="search"
      item-key="name"
      class="elevation-1"
      loading-text="加载中" no-data-text="没有数据" no-results-text="没有符合结果"
      :footer-props="{
        'items-per-page-text':'每页显示条数',
        'items-per-page-all-text': '显示所有',
      }">
      <template v-slot:top>
        <div style="display:flex;align-items: center; padding: 0 10px;">
          <v-btn icon @click="fetchRooms"><v-icon>mdi-refresh</v-icon></v-btn>
          <v-text-field
            v-model="search"
            label="搜索任何内容"
            class="mx-4"
          ></v-text-field>
        </div>
      </template>
      <template v-slot:item.bitmaps="{ item }">
        <v-btn text color="primary" @click="fetchBitmaps(item)">拉取</v-btn>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn text color="primary" @click="previewStream(item)">预览流</v-btn>
        <v-btn text color="primary" @click="danmakuStream(item)">弹幕</v-btn>
        <v-btn text color="primary" @click="stopStream(item)">断流</v-btn>
        <v-btn text color="primary" @click="blockStream(item)">拉黑</v-btn>
      </template>
    </v-data-table>
    <v-dialog max-width="1340px" v-model="captureOn" @click:outside="captureOn=false" persistent>
      <Captures @onDialogClose="captureOn=false" v-if="captureOn" :captures="captures" :room="selectItem"></Captures>
    </v-dialog>
    <v-dialog max-width="1340px" v-model="danmakuOn" @click:outside="danmakuOn=false" persistent>
      <Danmaku @onDialogClose="danmakuOn=false" v-if="danmakuOn" :room="selectItem"></Danmaku>
    </v-dialog>
    <v-dialog max-width="1340px" v-model="playerOn" @click:outside="playerOn=false" persistent>
      <Player @onDialogClose="playerOn=false" v-if="playerOn" :url="pull_url"></Player>
    </v-dialog>
  </v-container>
</template>

<script>
import Captures from '@/components/Captures.vue'
import Danmaku from '@/components/Danmaku.vue'
import Player from '@/components/Player.vue'
import { Confirm } from '@/utils/dialog'
import moment from 'moment'

export default {
  name: 'Stream',
  components: {
    Captures,
    Danmaku,
    Player
  },
  data () {
    return {
      search: '',
      captureOn: false,
      danmakuOn: false,
      playerOn: false,
      pull_url: '',
      captures: [],
      server: Window.$WebSocket,
      selectItem: {},
      rooms: [],
      headers: [
        {
          text: '房主ID',
          value: 'uid'
        },
        {
          text: '房主昵称',
          value: 'nickname'
        },
        {
          text: '房间邀请码',
          value: 'invite_code'
        },
        {
          text: '开播时间',
          value: 'start_time'
        },
        {
          text: '已开播时长',
          value: 'time'
        },
        {
          text: '观众/上限',
          value: 'cap'
        },
        {
          text: '直播流缩略图',
          align: 'center',
          value: 'bitmaps',
          sortable: false
        },
        {
          text: '操作',
          align: 'center',
          value: 'actions',
          sortable: false
        }
      ]
    }
  },
  mounted () {
    this.fetchRooms()
    this.server.On('RoomAdd', this.HandleRoomChange)
  },
  methods: {
    HandleRoomChange (data) {
      data.time = moment()
        .subtract(this.room.start_time, 'seconds')
        .subtract(8, 'hour')
        .format('HH:mm:ss')
      this.rooms.push(data)
    },
    fetchRooms () {
      this.loading = true
      this.server.On('GetRoom_Admin', data => {
        if (data.code === 200) {
          this.rooms = data.data
          this.snackbar.Success('刷新成功')
          this.rooms.forEach(x => {
            x.time = moment()
              .subtract(this.room.start_time, 'seconds')
              .subtract(8, 'hour')
              .format('HH:mm:ss')
          })
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('GetRoom_Admin', '')
    },
    fetchBitmaps (item) {
      this.selectItem = item
      this.captureOn = true
      this.server.Emit('GetCaptures', {
        invite_code: item.invite_code
      })
      this.server.On('GetCaptures', (data) => {
        if (data.code === 200) {
          this.captures = data.data
          console.log(this.captures)
        } else {
          this.captureOn = false
          this.snackbar.Error(data.msg)
        }
      })
    },
    previewStream (item) {
      this.server.Emit('GetPullUrl_Admin', { type: 1, invite_code: this.selectItem.invite_code })
      this.server.On('GetPullUrl_Admin', data => {
        if (data.code === 200) {
          console.log('拉流地址获取成功')
          this.pull_url = data.data.server + data.data.key
          this.playerOn = true
        } else {
          this.snackbar.Error(data.msg)
        }
      })
    },
    stopStream (item) {
      this.server.On('StopStream_Admin', (data) => {
        if (data.code === 200) {
          this.snackbar.Success(data.msg)
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      Confirm('确定要停止直播吗？', '停止直播', {
        confirmText: '确定',
        cancelText: '取消'
      }).then((data) => {
        if (data) {
          this.server.Emit('StopStream_Admin', {
            invite_code: item.invite_code
          })
        }
      })
    },
    blockStream (item) {
      this.server.On('StopStream_Admin', (data) => {
        if (data.code === 200) {
          this.snackbar.Success(data.msg)
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.On('BlockUser_Admin', data => {
        if (data.code === 200) {
          this.snackbar.Success('操作成功')
          Confirm('是否一起将直播断流？', '停止直播', {
            confirmText: '确定',
            cancelText: '取消'
          }).then((data) => {
            if (data) {
              this.server.Emit('StopStream_Admin', {
                invite_code: item.invite_code
              })
            }
          })
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      Confirm('确定要拉黑此用户吗？此操作可在用户管理中解除', '拉黑', {
        confirmText: '确定',
        cancelText: '取消'
      }).then((data) => {
        if (data) {
          this.server.Emit('BlockUser_Admin', {
            uid: item.uid
          })
        }
      })
    },
    danmakuStream (item) {
      this.selectItem = item
      this.danmakuOn = true
    }
  }
}
</script>

<style scoped>

</style>
