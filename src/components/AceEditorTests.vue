<template>
  <div>
    <div class="exercise-editor-ace-editor" :style='{ height: editorHeight }' ref="editor" />
  </div>
</template>

<script>
import ace from 'ace-builds/src-noconflict/ace'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/webpack-resolver'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  props: {
    value: String,
    sessionId: Number,
    exerciseId: Number,
    editorHeight: {
      type: String,
      default: '51rem'
    }
  }, // Mandatory to allow v-model
  data () {
    return {
      editor: null,
      editorLang: 'python', // Defaults to 'python'
      contentJustChanged: false
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

      const exercise = await this.getExerciseById(this.exerciseId)
      await this.editor.setValue(exercise.tests)
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
    this.editor.setTheme('ace/theme/monokai')
    this.editor.session.setMode(`ace/mode/${this.editorLang}`)
    this.editor.selection.addRange()
    this.editor.setOptions({
      selectionStyle: 'line',
      cursorStyle: 'ace'
    })
    await this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: this.exerciseId })
    console.log(this.exerciseId)
    await this.editor.setValue(this.getExerciseById(this.exerciseId).tests)

    this.editor.on('change', () => {
      this.$emit('inputTest', this.editor.getValue())
    })
  }
}

// Notes: EditSession is a class that is attached to a document. Manage the editor state

</script>

<style lang="css">
.exercise-editor-ace-editor {
  position: relative;
  font-size: 1.3rem;
  line-height: 1.5;
}
.readonly-highlight {
  background-color: green;
  opacity: 0.2;
  position: absolute;
}
.hide-in-template-highlight {
  background-color: #2196f3;
  opacity: 0.2;
  position: absolute;
}
.ace_gutter-cell.readonly-breakpoint {
  background-color: green;
  opacity: 0.4;
  color: black;
}
.ace_gutter-cell.hide-in-template-breakpoint {
  background-color: #2196f3;
  opacity: 0.4;
  color: black;
}
</style>
