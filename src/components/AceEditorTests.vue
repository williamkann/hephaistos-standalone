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
// eslint-disable-next-line camelcase
// function set_readonly (editor, readonly_ranges) {
//   let session = editor.getSession()
//   this.editor.Range = require('ace/range').Range
//   var ranges = []

//   function before (obj, method, wrapper) {
//     var orig = obj[method]
//     obj[method] = function () {
//       var args = Array.prototype.slice.call(arguments)
//       return wrapper.call(this, function () {
//         return orig.apply(obj, args)
//       }, args)
//     }
//     return obj[method]
//   }

//   function intersects (range) {
//     return editor.getSelectionRange().intersects(range)
//   }

//   function intersectsRange (newRange) {
//     for (var i = 0; i < ranges.length; i++) {
//       if (newRange.intersects(ranges[i])) {
//         return true
//       }
//     }
//     return false
//   }

//   function preventReadonly (next, args) {
//     for (var i = 0; i < ranges.length; i++) {
//       if (intersects(ranges[i])) {
//         return
//       }
//     }
//     next()
//   }

//   function onEnd (position) {
//     var row = position.row
//     var column = position.column
//     for (var i = 0; i < ranges.length; i++) {
//       if (ranges[i].end.row === row && ranges[i].end.column === column) {
//         return true
//       }
//     }
//     return false
//   }

//   function outSideRange (position) {
//     var row = position.row
//     var column = position.column
//     for (var i = 0; i < ranges.length; i++) {
//       if (ranges[i].start.row < row && ranges[i].end.row > row) {
//         return false
//       }
//       if (ranges[i].start.row === row && ranges[i].start.column < column) {
//         if (ranges[i].end.row !== row || ranges[i].end.column > column) {
//           return false
//         }
//       } else if (ranges[i].end.row === row && ranges[i].end.column > column) {
//         return false
//       }
//     }
//     return true
//   }
//   for (var i = 0; i < readonly_ranges.length; i++) {
//     ranges.push(new Range(...readonly_ranges[i]))
//   }
//   ranges.forEach(function (range) {
//     session.addMarker(range, 'readonly-highlight')
//   })
//   session.setMode('ace/mode/javascript')
//   editor.keyBinding.addKeyboardHandler({
//     handleKeyboard: function (data, hash, keyString, keyCode, event) {
//       if (Math.abs(keyCode) === 13 && onEnd(editor.getCursorPosition())) {
//         return false
//       }
//       if (hash === -1 || (keyCode <= 40 && keyCode >= 37)) return false

//       for (i = 0; i < ranges.length; i++) {
//         if (intersects(ranges[i])) {
//           return {
//             command: 'null',
//             passEvent: false
//           }
//         }
//       }
//     }
//   })

//   before(editor, 'onPaste', preventReadonly)
//   before(editor, 'onCut', preventReadonly)
//   for (i = 0; i < ranges.length; i++) {
//     ranges[i].start = session.doc.createAnchor(ranges[i].start)
//     ranges[i].end = session.doc.createAnchor(ranges[i].end)
//     ranges[i].end.$insertRight = true
//   }

//   var old$tryReplace = editor.$tryReplace
//   editor.$tryReplace = function (range, replacement) {
//     return intersectsRange(range) ? null : old$tryReplace.apply(this, arguments)
//   }
//   session = editor.getSession()
//   var oldInsert = session.insert
//   session.insert = function (position, text) {
//     return oldInsert.apply(this, [position, outSideRange(position) ? text : ''])
//   }
//   var oldRemove = session.remove
//   session.remove = function (range) {
//     return intersectsRange(range) ? false : oldRemove.apply(this, arguments)
//   }
//   var oldMoveText = session.moveText
//   session.moveText = function (fromRange, toPosition, copy) {
//     if (intersectsRange(fromRange) || !outSideRange(toPosition)) return fromRange
//     return oldMoveText.apply(this, arguments)
//   }
// }

// function refresheditor (id, content, readonly) {
//   // eslint-disable-next-line camelcase
//   var temp_id = id + '_temp'
//   // eslint-disable-next-line camelcase
//   document.getElementById(id).innerHTML = "<div id='" + temp_id + "'></div>"
//   document.getElementById(temp_id).innerHTML = content
//   var editor = ace.edit(temp_id)
//   set_readonly(editor, readonly)
// }

// // eslint-disable-next-line camelcase
// function get_readonly_by_editable_tag (id, content) {
//   var text = content.split('\n')
//   var starts = [0]
//   var ends = []
//   text.forEach(function (line, index) {
//     if ((line.indexOf('&lt;editable&gt;') !== -1)) ends.push(index)
//     if ((line.indexOf('&lt;/editable&gt;') !== -1)) starts.push(index + 1)
//   })
//   ends.push(text.length)
//   // eslint-disable-next-line camelcase
//   var readonly_ranges = []
//   for (var i = 0; i < starts.length; i++) {
//     readonly_ranges.push([starts[i], 0, ends[i], 0])
//   }
//   refresheditor(id, content, readonly_ranges)
// }
// var content = document.getElementById('code').innerHTML

// // eslint-disable-next-line camelcase
// function readonly_lines (id, content, line_numbers) {
//   // eslint-disable-next-line camelcase
//   var readonly_ranges = []
//   // eslint-disable-next-line camelcase
//   // var all_lines = line_numbers.sort()

//   for (var i = 0; i < line_numbers.length; i++) {
//     readonly_ranges.push([line_numbers[i] - 1, 0, line_numbers[i], 0])
//   }
//   refresheditor(id, content, readonly_ranges)
// }
// get_readonly_by_editable_tag('myeditor', content)

// readonly_lines('myeditor', content, [5, 7, 9])
</script>

<style scoped>
.custom-ace-editor {
  position: relative;
  height: 40rem;
  width: 40rem;
  font-size: 25px;
}
</style>
