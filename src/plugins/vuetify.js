import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
  dataFooter: {
    itemsPerPageAll: '显示所有',
    pageText: '每页显示条数'
  }
})
