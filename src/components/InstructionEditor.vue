<template>
  <div class="instruction">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div>
          <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
            <v-icon>mdi-format-bold</v-icon>
          </button>
          <button :class="{ 'is-active': isActive.italic() }" @click="commands.italic">
            <v-icon>mdi-format-italic</v-icon>
          </button>
          <button :class="{ 'is-active': isActive.underline() }" @click="commands.underline">
            <v-icon>mdi-format-underline</v-icon>
          </button>
      </div>
    </editor-menu-bar>
    <editor-content style="color:white;" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History
} from 'tiptap-extensions'
import { mapGetters } from 'vuex'

export default {

  name: 'instructionEditor',
  props: ['exerciseId'],
  components: {
    EditorMenuBar,
    EditorContent
  },
  watch: {
    exerciseId: function (newId) {
      console.log(this.getExerciseById(newId))
      const instructions = this.getExerciseById(newId).instructions
      this.editor.setContent(instructions)
    }
  },
  data () {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new BulletList(),
          new OrderedList(),
          new ListItem(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History()
        ],
        content: ''
      })
    }
  },

  computed: {
    ...mapGetters('exercises', ['getExerciseById'])
  },
  async mounted () {
    const instructions = this.getExerciseById(this.exerciseId).instructions
    await this.editor.setContent(instructions)
  },
  beforeDestroy () {
    this.editor.destroy()
  }
}
</script>
