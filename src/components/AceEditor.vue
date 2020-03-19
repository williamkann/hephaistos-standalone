<template>
  <div class="custom-ace-editor" ref="editor" />
</template>

<script>
import ace from 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/webpack-resolver'
export default {
  props: ['value'], // Mandatory to allow v-model
  data () {
    return {
      editor: null,
      editorLang: 'python' // Defaults to 'python'
    }
  },
  mounted () {
    this.editor = ace.edit(this.$refs.editor)
    this.editor.setTheme('ace/theme/monokai') // Global theme for
    this.editor.session.setMode(`ace/mode/${this.editorLang}`)
    this.editor.selection.addRange()
    this.editor.setOptions({
      selectionStyle: 'line',
      cursorStyle: 'ace'
    })
    this.editor.resize() // Ensure the editor is the right size
    // React to changes and update the v-model
    this.editor.on('change', () => {
      this.$emit('input', this.editor.getValue())
    })
  }
}
</script>

<style scoped>
.custom-ace-editor {
  position: relative;
  height: 40rem;
  width: 40rem;
  font-size: 20px;
}
</style>
