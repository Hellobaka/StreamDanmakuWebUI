<template>
  <v-card>
    <v-card-title>
      <v-switch v-model="timeSwitch" label="时间显示"></v-switch>
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-window-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div style="height: 600px; overflow: auto; display: flex;align-items: flex-start; flex-wrap: wrap;">
        <div class="item" v-for="item in remake" :key="item.timestamp">
          <img class="list_img" :src="item.src" @click="showImg(item)">
          <div class="item_text">{{ timeSwitch? item.streamTime:item.time}}</div>
        </div>
      </div>
      <v-dialog v-model="scaleImg" max-width="1200px">
        <img :src="selectImg" alt="">
        <v-btn @click="scaleImg=!scaleImg" icon dark style="background: rgba(0,0,0,.7); position: absolute; ">
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-dialog>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="closeDialog">关闭</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Captures',
  props: {
    captures: Array,
    room: Object
  },
  computed: {
    remake () {
      return this.captures.map(item => {
        item.time = this.timeFormat(item.timestamp)
        item.streamTime = this.streamTimeFormat(item.timestamp)
        item.src = `static/pic/${item.filename}`
        return item
      })
    }
  },
  mounted () {
  },
  data () {
    return {
      timeSwitch: false,
      scaleImg: false,
      selectImg: ''
    }
  },
  methods: {
    timeFormat (timestamp) {
      return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    streamTimeFormat (timestamp) {
      return moment.unix(timestamp)
        .subtract(this.room.start_time, 'seconds')
        .subtract(8, 'hour')
        .format('HH:mm:ss')
    },
    closeDialog () {
      this.$emit('onDialogClose', true)
    },
    showImg (item) {
      this.scaleImg = !this.scaleImg
      this.selectImg = item.src
    }
  }
}
</script>

<style scoped>
.list_img {
  width: 200px;
  height: 100%;
  display: block;
  cursor: pointer;
}
.item{
  width: 200px;
  margin-top: 10px;
  margin-right: 10px;
}
.item_text{
  text-align: center;
  font-size: 16px;;
}
</style>
