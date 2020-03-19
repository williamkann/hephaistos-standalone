<template>
<div>
    <div class="custom-ace-editor" ref="editor" />
</div>
</template>

<script>
import ace from 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/webpack-resolver'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  props: { value: String, sessionId: Number, exerciseId: Number }, // Mandatory to allow v-model
  data () {
    return {
      editor: null,
      editorLang: 'python' // Defaults to 'python'
    }
  },

  watch: {
    exerciseId: async function (newId) {
      // Fetch our session
      await this.fetchSession({ id: this.sessionId })

      // Fetch the exercises of each session
      await Promise.all(
        this.sessions.map(s => this.fetchExercisesForSession({ sessionId: s.id }))
      )
      await this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: this.exerciseIdSelected })

      const exercise = this.getExerciseById(this.exerciseId)
      this.editor.setValue(exercise.tests)
    }
  },
  computed: {
    ...mapGetters('exercises', ['getExerciseById']),
    ...mapState('sessions', ['sessions'])
  },
  methods: {
    ...mapActions('exercises', ['fetchExerciseForSession']),
    ...mapActions('exercises', ['fetchExercisesForSession']),
    ...mapActions('sessions', ['fetchSession'])
  },
  async mounted () {
    this.editor = ace.edit(this.$refs.editor)
    this.editor.setTheme('ace/theme/monokai') // Global theme for
    this.editor.session.setMode(`ace/mode/${this.editorLang}`)
    this.editor.selection.addRange()
    this.editor.setOptions({
      selectionStyle: 'line',
      cursorStyle: 'ace'
    })
    await this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: this.exerciseId })
    console.log(this.exerciseId)
    await this.editor.setValue(this.getExerciseById(this.exerciseId).tests)

    // this.editor.resize() // Ensure the editor is the right size
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
  font-size: 25px;
}
</style>
