<script setup lang="ts">
import type { ConditionNode} from '../nodes/type'
import type { Ref } from 'vue'
import type { Field } from '../Components/Render/type'
import AdvancedFilter from '../Components/AdvancedFilter/index.vue'

const { fields } = inject<{ fields: Ref<Field[]> }>('flowDesign', { fields: ref([]) })
const props=defineProps<{
  activeData: ConditionNode
}>()

const emit = defineEmits(['update:activeData'])
const curActiveData=computed({
  get: () => {
    return props.activeData
  },
  set: (val: ConditionNode) => {
    emit('update:activeData', val)
  }
})
const initialFormFields = ref<Field[]>([
])
</script>

<template>
  <AdvancedFilter
    v-model="curActiveData.conditions"
    :filter-fields="[...initialFormFields, ...fields]"
  />
</template>

<style scoped lang="scss"></style>
