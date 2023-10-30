<script setup lang="ts">
import { onMounted,getCurrentInstance } from 'vue';
import { MSService } from "zdan_jsapi"
const microService:MSService = getCurrentInstance()?.appContext.config.globalProperties?.microService;
onMounted(async ()=>{
  
})
let callApi = async ()=>{
  console.log('[[call hello')
  let result = await microService.Call('hello',{})
  console.log(']]call hello result:',result)
}
</script>

<template>  
  <div  @click="callApi">call micro service api</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
