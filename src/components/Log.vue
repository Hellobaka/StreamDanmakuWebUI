<template>
  <v-container max-height="80%" id="top">
    <v-data-table
      :headers="headers"
      :items="log_arr"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalItems"
      :page.sync="page"
      item-key="uid"
      class="elevation-1"
      loading-text="加载中"
      no-data-text="没有数据"
      no-results-text="没有符合结果"
      :footer-props="{
        'items-per-page-text': '每页显示条数',
        'items-per-page-all-text': '显示所有',
        'items-per-page-options': pageSize,
      }"
      hide-default-footer
      @page-count="pageCount = $event"
    >
      <template v-slot:top>
        <div style="display: flex; align-items: baseline; padding: 0 10px">
          <v-btn icon @click="fetchLogs"><v-icon>mdi-refresh</v-icon></v-btn>
          <v-switch v-model="showSystemLog" label="是否显示系统日志"></v-switch>
          <v-select
            :items="log_type"
            label="常用日志类型筛选"
            v-model="logType"
            hide-details
            style="margin: 0 10px"
          ></v-select>
          <v-text-field
            v-model="search"
            @keyup="fetchLogs"
            append-icon="mdi-magnify"
            label="搜索任何内容"
            hide-details
          ></v-text-field>
        </div>
      </template>
    </v-data-table>
    <v-container style="display: flex">
      <v-row>
        <v-col style="display: flex;align-items:center;">
          <span style="margin-right:10px;">共有{{totalItems}}条日志</span>
          <v-select hide-details :items="pageSize" v-model="options.itemsPerPage" label="每页显示条数">
          </v-select>
        </v-col>
        <v-col></v-col>
        <v-col>
          <v-pagination
            v-model="page"
            :length="pageCount"
            total-visible="6"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
    <v-btn
      class="mx-2"
      fab
      large
      color="primary"
      style="position: fixed; bottom: 50px; right: 10px; z-index: 999;"
      @click="callTop"
    >
      <v-icon>
        mdi-arrow-up
      </v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import moment from 'moment'
export default {
  name: 'Log',
  mounted () {
    this.fetchLogs()
  },
  watch: {
    options: {
      handler () {
        this.fetchLogs()
      },
      deep: true
    },
    logType: {
      handler () {
        this.fetchLogs()
      }
    },
    showSystemLog: {
      handler () {
        this.fetchLogs()
      }
    }
  },
  data () {
    return {
      server: Window.$WebSocket,
      loading: true,
      page: 1,
      pageCount: 0,
      options: {},
      totalItems: 0,
      itemsPerPage: 20,
      search: '',
      showSystemLog: false,
      logType: '',
      log_type: [
        {
          text: '无',
          value: ''
        },
        {
          text: '登录',
          value: 'login'
        },
        {
          text: '创建房间',
          value: 'CreateRoom'
        },
        {
          text: '进入直播',
          value: 'RoomEntered'
        },
        {
          text: '拉取直播流',
          value: 'GetPullUrl'
        },
        {
          text: '推送直播流',
          value: 'GetPushUrl'
        },
        {
          text: '离开直播间',
          value: 'OnLeave'
        },
        {
          text: '发送弹幕',
          value: 'Danmaku'
        }
      ],
      log_arr: [],
      pageSize: [
        {
          text: '20',
          value: 20
        },
        {
          text: '50',
          value: 50
        },
        {
          text: '100',
          value: 100
        },
        {
          text: '显示全部',
          value: -1
        }
      ],
      headers: [
        {
          text: 'ID',
          value: 'RowID'
        },
        {
          text: '日志状态',
          value: 'Status'
        },
        {
          text: '日志时间',
          value: 'Time'
        },
        {
          text: '来源',
          value: 'Account'
        },
        {
          text: '日志类型',
          value: 'ActionName'
        },
        {
          text: '日志内容',
          value: 'Action',
          width: '300px'
        }
      ]
    }
  },
  methods: {
    callTop () {
      document.querySelector('#top').scrollIntoView()
    },
    fetchLogs () {
      this.loading = true
      this.server.On('GetLogs_Admin', (data) => {
        this.loading = false
        if (data.code === 200) {
          this.log_arr = data.data.data
          this.log_arr.forEach((x) => {
            x.Status = x.Status ? '成功' : '失败'
            x.Time = moment(x.Time).format('YYYY-MM-DD HH:mm:ss')
          })
          this.totalItems = data.data.count
        } else {
          this.snackbar.Error(data.msg)
        }
      })
      this.server.Emit('GetLogs_Admin', {
        logType: this.logType,
        search: this.search,
        showSystemLog: this.showSystemLog,
        ...this.options
      })
    }
  }
}
</script>

<style scoped></style>
