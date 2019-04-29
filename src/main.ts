import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import Waterfall from "../plugin/index"

Vue.config.productionTip = false;

Vue.use(Waterfall)
new Vue({
    store,
    render: h => h(App)
}).$mount("#app");
