<template>
  <div v-loading="loading">
<!--    <VueOfficePDF-->
<!--      :src="pdfSource"-->
<!--      @rendered="renderedHandler"-->
<!--      @error="errorHandler"-->
<!--    />-->
  </div>
</template>
<script setup>
import { ref } from "vue";
import {isURL} from "@/utils";

const props=defineProps({
  file:{
    type:Object,
  },
  fileUrl: {
    type: String,
  }
})

let pdfSource = ref("");
let loading=ref(false)

const preview = (file) => {
  loading.value=true
  if (isURL(file)) {
    pdfSource = ref(file);
  } else {
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      pdfSource.value = reader.result;
    };
  }

}

defineExpose({preview})

const renderedHandler=()=>{
  loading.value=false
}
const errorHandler=()=>{
  loading.value=false
}
</script>


<style scoped lang="scss">
:deep(.vue-office-pdf-wrapper) {
  background: rgb(238, 238, 244) !important;
}
</style>
