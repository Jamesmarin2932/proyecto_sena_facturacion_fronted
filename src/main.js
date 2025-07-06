import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // Importa los estilos de Element Plus
import App from './App.vue'
import router from './router'
import vueCountryRegionSelect from 'vue3-country-region-select';



// Importa la localización en español de Element Plus
import es from 'element-plus/es/locale/lang/es'

const app = createApp(App)

// Usa Element Plus y configura la localización en español
app.use(ElementPlus, { locale: es })

app.use(vueCountryRegionSelect);

app.use(router)
app.mount('#app')


