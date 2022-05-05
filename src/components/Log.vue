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
      no-data-text="没有数据 尝试更改筛选条件"
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
            v-model="userSearch"
            @keyup="fetchLogs"
            label="筛选用户"
            style="margin: 0 10px"
            hide-details
            clearable
          ></v-text-field>
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formatDate"
                label="日志时间范围（范围选择）"
                append-icon="mdi-calendar"
                readonly
                hide-details
                v-bind="attrs"
                v-on="on"
                show-current
                style="margin: 0 10px"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              range
              no-title
              locale="zh-cn"
              :max="maxDate"
              :allowed-dates="allowedDates"
              scrollable
              selected-items-text="选中 {0} 项"
              @change="fetchLogs"
            >
              <v-btn text color="primary" @click="date=[];menu=false;fetchLogs();">显示全部</v-btn>
            </v-date-picker>
          </v-menu>

          <v-text-field
            v-model="search"
            @keyup="fetchLogs"
            label="搜索任何内容"
            hide-details
            clearable
          ></v-text-field>
        </div>
      </template>
      <template v-slot:item.Account="{ item }">
          <a title="点击跳转用户信息" @click="searchUser(item)" :style="item.id === 0 ? 'color: red;' : ''">{{item.Account}}</a>
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
import { emitListener } from '@/utils/tools'
export default {
  name: 'Log',
  props: {
    logOptions: Object
  },
  mounted () {
    if (!(this.logOptions.account || this.logOptions.actionName)) {
      this.date = [moment().subtract(1, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    } else {
      this.date = []
      this.userSearch = this.logOptions.account
      this.logType = this.logOptions.actionName
    }
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
  computed: {
    formatDate: function () {
      return this.date.join(' ~ ')
    },
    maxDate: function () {
      return moment().add(1, 'day').format('YYYY-MM-DD')
    }
  },
  data () {
    return {
      server: Window.$WebSocket,
      loading: true,
      page: 1,
      menu: false,
      date: ['', ''],
      pageCount: 0,
      options: {},
      totalItems: 0,
      itemsPerPage: 20,
      search: '',
      userSearch: '',
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
        userSearch: this.userSearch,
        showSystemLog: this.showSystemLog,
        date: this.date,
        ...this.options
      })
    },
    allowedDates (val) {
      return moment(val).isSameOrBefore()
    },
    searchUser (item) {
      emitListener('filter-user', item.Account)
    }
  }
}
</script>

<style scoped></style>
