<template>
<div>

  <button onclick="get_readonly_by_editable_tag('myeditor',content)">Readonly by tags</button>
  <button onclick="readonly_lines('myeditor',content,[3,7])">Readonly lines 3 and 7 </button>
    <div id="myeditor" class="exercise-editor-ace-editor" :style='{ height: editorHeight }' ref="editor" />
    <div id="code" style="display:none;">//&lt;editable&gt;
      //&lt;/editable&gt;
      function refresheditor() {
        //&lt;editable&gt;
        document.getElementById("myeditor").innerHTML="&lt;div id='editor'&gt;&lt;/div&gt;";
        document.getElementById("editor").innerHTML=document.getElementById("code").innerHTML;
        //&lt;/editable&gt;
          var editor     = ace.edit("editor")
              , session  = editor.getSession()
              , Range    = require("ace/range").Range;
              ranges    = [];
              var text= document.getElementById("code").innerHTML.split("\n");
              var starts=[0],ends=[];
              text.forEach(function(line,index){
                if((line.indexOf("&amp;lt;editable&amp;gt;") !== -1))ends.push(index);
                if((line.indexOf("&amp;lt;/editable&amp;gt;") !== -1))starts.push(index+1);
              });
              ends.push(text.length);
              for(i=0;i&lt;starts.length;i++){
                ranges.push(new Range(starts[i], 0,ends[i] ,0));
              }
              ranges.forEach(function(range){session.addMarker(range, "readonly-highlight");});
          session.setMode("ace/mode/javascript");
          //&lt;editable&gt;
          editor.keyBinding.addKeyboardHandler({
              handleKeyboard : function(data, hash, keyString, keyCode, event) {
                  var pos=editor.getCursorPosition();
                  if (Math.abs(keyCode) == 13){
          for (i=0;i&lt;ranges.length;i++){
          if((ranges[i].end["row"]==pos["row"])&&(ranges[i].end["column"]==pos["column"])){ return false;}
          }
          }
                  if (hash === -1 || (keyCode &lt;= 40 && keyCode &gt;= 37)) return false;
                  for(i=0;i&lt;ranges.length;i++){
                    if (intersects(ranges[i])) {
                        return {command:"null", passEvent:false};
                    }
                  }
              }
          });
          //&lt;/editable&gt;
          before(editor, 'onPaste', preventReadonly);
          before(editor, 'onCut',   preventReadonly);
          for(i=0;i&lt;ranges.length;i++){
            ranges[i].start  = session.doc.createAnchor(ranges[i].start);
            ranges[i].end    = session.doc.createAnchor(ranges[i].end);
            ranges[i].end.$insertRight = true;
          }
          function before(obj, method, wrapper) {
              var orig = obj[method];
              obj[method] = function() {
                  var args = Array.prototype.slice.call(arguments);
                  return wrapper.call(this, function(){
                      return orig.apply(obj, args);
                  }, args);
              }
              return obj[method];
          }
          function intersects(range) {
              return editor.getSelectionRange().intersects(range);
          }
          function preventReadonly(next, args) {
              for(i=0;i&lt;ranges.length;i++){if (intersects(ranges[i])) return;}
              next();
          }
      }
      refresheditor();

      </div>

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
      default: '40rem'
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

// Notes: EditSession is a class that is attached to a document. Manage the editor state

function setReadonly (editor, readonlyRanges) {
  // getSession returns the current session we are using.
  var session = editor.getSession()
  // Get the range object
  const { Range } = ace.require('ace/range').Range
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

  session.setMode('ace/mode/javascript')

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

  // Use of before methode
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

// refresheditor
function refreshEditor (id, content, readonly) {
  // eslint-disable-next-line camelcase
  var tempId = id + '_temp'
  document.getElementById(id).innerHTML = "<div id='" + tempId + "'></div>"
  document.getElementById(tempId).innerHTML = content
  var editor = ace.edit(tempId)
  setReadonly(editor, readonly)
}

// getReadonlyByEditableTag
function getReadonlyByEditableTag (id, content) {
  var text = content.split('\n')
  var starts = [0]
  var ends = []
  text.forEach(function (line, index) {
    if ((line.indexOf('&lt;editable&gt;') !== -1))ends.push(index)
    if ((line.indexOf('&lt;/editable&gt;') !== -1))starts.push(index + 1)
  })

  ends.push(text.length)
  var readonlyRanges = []
  for (var i = 0; i < starts.length; i++) {
    readonlyRanges.push([starts[i], 0, ends[i], 0])
  }
  refreshEditor(id, content, readonlyRanges)
}

var content = document.getElementById('code').innerHTML

// readOnlyLines
function readOnlyLines (id, content, lineNumbers) {
  var readonlyRanges = []
  // var allLines = lineNumbers.sort()

  for (var i = 0; i < lineNumbers.length; i++) {
    readonlyRanges.push([lineNumbers[i] - 1, 0, lineNumbers[i], 0])
  }
  refreshEditor(id, content, readonlyRanges)
}
getReadonlyByEditableTag('myeditor', content)
readOnlyLines('myeditor', content, [5, 7, 9])

</script>

<style lang="css">
.exercise-editor-ace-editor {
  position: relative;
  font-size: 1.3rem;
  line-height: 3;
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
