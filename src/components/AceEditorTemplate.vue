<template>
  <div>
    <v-col cols="12" sm="2" md="12">
      <!-- Freeze Readonly lines here -->
      <v-checkbox v-model="checkbox" :label="immutable" @click="readOnlyLines(editor.getValue, [1,2,3, 5, 6, 7,9,10, 17])"></v-checkbox>
    </v-col>
    <v-row>
      <v-col cols="12" sm="2" md="12">
        <div class="exercise-editor-ace-editor" ref="editor" />
      </v-col>
    </v-row>
  </div>
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
      editorLang: 'python',
      immutable: 'Verrouiller les zones immuables',
      checkbox: ''
    }
  },
  methods: {
    // readOnlyLines
    readOnlyLines (content, lineNumbers) {
      var readonlyRanges = []
      console.log(lineNumbers)

      // We select the ranges to put in the array. format : like Range class
      for (var i = 0; i < lineNumbers.length; i++) {
        readonlyRanges.push([lineNumbers[i] - 1, 0, lineNumbers[i], 0])
      }
      // Send to refresh to update the editor.
      this.refreshEditor(content, readonlyRanges)
    },
    // refresheditor
    refreshEditor (content, readonly) {
      // Use setReadonly
      this.setReadonly(this.editor, readonly, this.checkbox)
    },

    setReadonly (editor, readonlyRanges, checkbox) {
    // getSession returns the current session we are using.
      var session = editor.getSession()
      // Get the range object
      const { Range } = ace.require('ace/range')
      var ranges = []

      // before methode
      // We passed obj : editor, method: 'onPaste' or 'onCut', wrapper: preventReadonly
      /*
        orig = editor['onPaste']
        on affecte à editor['onPaste'] le retour de wrapper.call qui lui prend en param this et une fonction
      */
      function before (obj, method, wrapper) {
        var orig = obj[method]
        obj[method] = function () {
          // args est l'array suivant [editor, 'onPaste', preventReadonly] ou [editor, 'onCut', preventReadonly]
          var args = Array.prototype.slice.call(arguments)
          // preventReadonly.call(this, orig qui est obj['onPaste'] tu apply .(editor, args))
          return wrapper.call(this, function () {
            return orig.apply(obj, args)
          }, args)
        }
        return obj[method]
      }

      // intersects methode
      function intersects (range) {
        return editor.getSelectionRange().intersects(range)
      }

      // intersectsRange
      function intersectsRange (newRange) {
        for (var i = 0; i < ranges.length; i++) {
          if (newRange.intersects(ranges[i])) {
            return true
          }
        }
        return false
      }

      // preventReadonly
      function preventReadonly (next, args) {
        for (var i = 0; i < ranges.length; i++) {
          if (intersects(ranges[i])) {
            return
          }
        }
        next()
      }

      // onEnd
      function onEnd (position) {
        var row = position.row
        var column = position.column
        for (var i = 0; i < ranges.length; i++) {
          if (ranges[i].end.row === row && ranges[i].end.column === column) {
            return true
          }
        }
        return false
      }

      // outSideRange
      function outSideRange (position) {
        var row = position.row
        var column = position.column
        for (var i = 0; i < ranges.length; i++) {
          if (ranges[i].start.row < row && ranges[i].end.row > row) {
            return false
          }
          if (ranges[i].start.row === row && ranges[i].start.column < column) {
            if (ranges[i].end.row !== row || ranges[i].end.column > column) {
              return false
            }
          } else if (ranges[i].end.row === row && ranges[i].end.column > column) {
            return false
          }
        }
        return true
      }

      // Fin des définitions des methodes

      // For loop pour définir var ranges. On push dans cet array
      for (var i = 0; i < readonlyRanges.length; i++) {
        ranges.push(new Range(...readonlyRanges[i]))
      }

      ranges.forEach(function (range) {
        session.addMarker(range, 'readonly-highlight')
      })

      session.setMode('ace/mode/python')

      if (checkbox === true) {
        console.log('DEDE')
        editor.keyBinding.addKeyboardHandler({
          handleKeyboard: function (data, hash, keyString, keyCode, event) {
            if (Math.abs(keyCode) === 13 && onEnd(editor.getCursorPosition())) {
              return false
            }
            if (hash === -1 || (keyCode <= 40 && keyCode >= 37)) return false
            for (var i = 0; i < ranges.length; i++) {
              if (intersects(ranges[i])) {
                return { command: 'null', passEvent: false }
              }
            }
          }

        })
      } else {
        console.log('frfr')
        editor.keyBinding.removeKeyboardHandler({
          handleKeyboard: function (data, hash, keyString, keyCode, event) {
            if (Math.abs(keyCode) === 13 && onEnd(editor.getCursorPosition())) {
              return false
            }
            if (hash === -1 || (keyCode <= 40 && keyCode >= 37)) return false

            for (var i = 0; i < ranges.length; i++) {
              if (intersects(ranges[i])) {
                return { command: 'null', passEvent: false }
              }
            }
          }
        })
      }

      before(editor, 'onPaste', preventReadonly)
      before(editor, 'onCut', preventReadonly)

      for (i = 0; i < ranges.length; i++) {
        ranges[i].start = session.doc.createAnchor(ranges[i].start)
        ranges[i].end = session.doc.createAnchor(ranges[i].end)
        ranges[i].end.$insertRight = true
      }

      var old$tryReplace = editor.$tryReplace
      editor.$tryReplace = function (range, replacement) {
        return intersectsRange(range) ? null : old$tryReplace.apply(this, arguments)
      }

      session = editor.getSession()

      var oldInsert = session.insert
      session.insert = function (position, text) {
        return oldInsert.apply(this, [position, outSideRange(position) ? text : ''])
      }

      var oldRemove = session.remove
      session.remove = function (range) {
        return intersectsRange(range) ? false : oldRemove.apply(this, arguments)
      }
      var oldMoveText = session.moveText
      session.moveText = function (fromRange, toPosition, copy) {
        if (intersectsRange(fromRange) || !outSideRange(toPosition)) return fromRange
        return oldMoveText.apply(this, arguments)
      }
    }
  },
  mounted () {
    this.editor = ace.edit(this.$refs.editor)
    this.editor.setTheme('ace/theme/monokai')
    this.editor.session.setMode(`ace/mode/${this.editorLang}`)
    this.editor.selection.addRange()
    this.editor.setOptions({
      selectionStyle: 'line',
      cursorStyle: 'ace'
    })
    this.editor.on('change', () => {
      this.$emit('inputTemplate', this.editor.getValue())
    })
  }
}
</script>

<style lang="css">
.exercise-editor-ace-editor {
  position: relative;
  font-size: 1.3rem;
  line-height: 1.8;
  height: 40rem;
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
