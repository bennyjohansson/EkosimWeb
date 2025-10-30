<template>
  <div class="math-formula">
    <div v-if="displayMode" class="math-display" v-html="renderedFormula"></div>
    <span v-else class="math-inline" v-html="renderedFormula"></span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface Props {
  formula: string
  displayMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: false
})

const renderedFormula = ref('')

const renderFormula = () => {
  try {
    renderedFormula.value = katex.renderToString(props.formula, {
      displayMode: props.displayMode,
      throwOnError: false,
      trust: true,
      strict: false,
      macros: {
        '\\text': '\\mathrm'
      }
    })
  } catch (error) {
    console.error('KaTeX rendering error:', error)
    renderedFormula.value = props.formula // Fallback to plain text
  }
}

onMounted(() => {
  renderFormula()
})

// Re-render when formula changes
computed(() => {
  renderFormula()
  return props.formula
})
</script>

<style scoped>
.math-formula {
  margin: 0.5rem 0;
}

.math-display {
  text-align: center;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
}

.math-inline {
  display: inline;
}

/* KaTeX styling adjustments */
:deep(.katex) {
  font-size: 0.9em;
  line-height: 1.4;
}

:deep(.katex-display) {
  margin: 0.5rem 0;
  overflow-x: auto;
  max-width: 100%;
}

/* Allow long equations to wrap */
:deep(.katex-display .katex) {
  white-space: normal;
  word-wrap: break-word;
}
</style>
