import { createApp, provide } from 'vue'
import App from './App.vue'
import router from './router'

let app = createApp(App)

app.use(router).mount("#app")
