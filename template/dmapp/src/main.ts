import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import * as zdan_jsapi from 'zdan_jsapi'
import pacakgeJson from '../package.json'
zdan_jsapi.init(pacakgeJson.dmappId)
const ms = new zdan_jsapi.MSService("main",`${Date.now()}`);

(async ()=>{
    await ms.Open({})
    createApp(App,{
        microService:ms,
    }).mount('#app')    
})()
