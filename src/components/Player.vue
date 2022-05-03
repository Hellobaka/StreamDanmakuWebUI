<template>
  <div id="video_container" style="width:100%; height:auto;"></div>
</template>

<script>
const { TcPlayer } = require('@/utils/TcPlayer-module-2.4.1.js')
export default {
  name: 'Player',
  props: {
    url: String
  },
  data () {
    return {
      server: Window.$WebSocket,
      player: {}
    }
  },
  mounted () {
    this.player = new TcPlayer('video_container', {
      flv: this.url,
      autoplay: true,
      h5_flv: true,
      width: '100%',
      height: 'auto',
      listener: function (msg) {}
    })
  }
}
</script>

<style>

</style>
