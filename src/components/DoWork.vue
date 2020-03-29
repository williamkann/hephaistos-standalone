<template>
  <v-container>
    <v-alert outlined color="#3366cc">
    <div v-show="fullscreen">
      <v-row>
        <v-col cols="12" sm="2" md="6">
            <v-text-field
              label="Regular"
              v-model="exercise.title"
            ></v-text-field>
        </v-col>
        <v-col cols="12" sm="2" md="3">
          <v-select
            v-model="select"
            :items="items"
            label="Langage"
            required
          ></v-select>
        </v-col>
        <v-col cols="12" sm="2" md="3">
          <v-btn class="ma-2" outlined small color="indigo" @click="saveExercise">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="2" md="12">
          <button @click="showInstruction">
            <v-icon>mdi-eye</v-icon>
          </button>
          <div v-if="instructionShow">
            <InstructionEditor :exerciseId="this.exerciseId" :sessionId="this.sessionId"></InstructionEditor>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-row>
      <v-col cols="12" sm="2" :md="editorSize">
        <h2>Tests
          <v-btn class="ma-2" outlined small color="indigo" @click="makeFullscreen()">
            <div v-if="fullscreen">
              <v-icon>mdi-fullscreen</v-icon>
            </div>
            <div v-else>
              <v-icon>mdi-fullscreen-exit</v-icon>
            </div>
          </v-btn>
        </h2>
        <AceEditorTests @inputTest="onAceEditorTest" :exerciseId="this.exerciseId" :sessionId="this.sessionId"></AceEditorTests>
      </v-col>
      <v-col cols="12" sm="2" md="6">
        <div v-show="fullscreen">
          <v-row>
            <v-col cols="12" sm="2" md="8">
              <h2>Template de résolution
                <v-btn class="ma-2" outlined small color="indigo" @click="attemptSend(exerciseId, sessionId, valueTemplate); runSandbox()">
                  <v-icon>mdi-play</v-icon>
                </v-btn>
              </h2>
            </v-col>
          </v-row>
          <AceEditorTemplate @inputTemplate="onAceEditorTemplate"></AceEditorTemplate>
         </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="2" :md="editorSize">
        <h2><v-icon>mdi-console</v-icon> Sortie de console</h2>
        <div>{{this.consoleOutput}}</div>
      </v-col>
      <v-col cols="12" sm="2" md="6">
        <div v-show="fullscreen">
          <h2><v-icon>mdi-sort-variant</v-icon> Résultat des tests</h2>
          <div v-if="attempt != ''">
              <v-card class="mx-auto" color="green" dark width="654" v-if="attempt != null && attempt.valid">
                <v-card-title>
                  <v-icon medium left>mdi-check</v-icon>
                  <span class="title font-weight-light">Results</span>
                </v-card-title>
                <v-card-text class="font-weight-bold">
                    <p>{{attempt.valid_tests}} tests validé(s)</p>
                    <p>{{attempt.invalid_tests}} tests invalide(s)</p>
                    <div v-if="attempt.syntax_error"><p>Syntaxe err !</p></div>
                </v-card-text>
              </v-card>
              <v-card class="mx-auto" color="red" dark width="654" v-if="attempt != null && !attempt.valid">
                <v-card-title>
                  <v-icon large left>mdi-close</v-icon>
                  <span class="title font-weight-light">Errors</span>
                </v-card-title>
                <v-card-text class="font-weight-bold">
                    <p>{{attempt.valid_tests}} tests validé(s)</p>
                    <p>{{attempt.invalid_tests}} tests invalide(s)</p>
                    <div v-if="attempt.syntax_error"><p>Syntaxe err !</p></div>
                </v-card-text>
              </v-card>
              <v-card class="mx-auto" color="#4d4d33" dark width="654" v-if="this.results.stats != null">
          <v-card-title>
            <v-icon large left>mdi-alert-outline</v-icon>
            <span class="title font-weight-light">Results</span>
          </v-card-title>
          <v-card-text class="font-weight-bold">
              <p>{{this.results.stats.errors}} Errors</p>
              <p>{{this.results.stats.skipped}} tests skipped</p>
              <p>{{testPassed}}/{{this.results.stats.tests}} tests passed</p>
              <p>Execution time: {{this.results.stats.time }}s</p>
          </v-card-text>
        </v-card>
            <v-expansion-panels v-if="results.tests != null">
              <v-expansion-panel v-for="test in this.results.tests" :key="test.id">
                <v-expansion-panel-header>{{test.name}}</v-expansion-panel-header>
                <div v-if="test.failure != null">
                  <v-expansion-panel-content v-html="test.failure.stacktrace">
                  </v-expansion-panel-content>
                  {{test.failure.message}}
                </div>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </v-col>
    </v-row>
    </v-alert>
  </v-container>
</template>

<style scoped>
h1, h2, h3, p, div{
  color: white
}
</style>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import AceEditorTemplate from './AceEditorTemplate.vue'
import AceEditorTests from './AceEditorTests.vue'
import InstructionEditor from './InstructionEditor.vue'

export default {

  name: 'doWork',
  components: {
    AceEditorTests,
    AceEditorTemplate,
    InstructionEditor
  },
  watch: {
    exerciseId: function (newVal) {
      this.initResult()
      this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: newVal })
      console.log('(In DoWork.vue): Request the exercise ' + newVal)
    }
  },
  props: ['exerciseId'],
  data: () => ({
    valueTemplate: '',
    valueTest: '',
    consoleOutput: '',
    results: '',
    select: '',
    fullscreen: 'false',
    items: ['python', 'C'],
    editorSize: '6',
    instructionShow: true
  }),

  computed: {
    sessionId () {
      return parseInt(this.$route.params.sessionId)
    },
    session () {
      return this.getSessionById(this.sessionId) || { name: 'Loading...' }
    },
    exercises () {
      return this.getExercisesBySessionId(this.sessionId)
    },
    exercise () {
      console.log('(In DoWork.vue) : Fetch the exercise ' + this.exerciseId + ' and getExerciseById performed')
      return this.getExerciseById(this.exerciseId) || { name: 'Loading...' }
    },
    attempt () {
      return this.getLastAttemptForExercise(this.exerciseId) || ''
    },
    testPassed () {
      console.log('Number of tests: ' + this.results.stats.tests + 'Failures: ' + this.results.stats.failures)
      return this.results.stats.tests - this.results.stats.failures
    },
    ...mapState('sessions', ['sessions']),
    ...mapState('exercises', ['exercises']),
    ...mapState('attempts', ['lastAttemptResults']),
    ...mapState('attempts', ['attempts']),
    ...mapGetters('sessions', ['getSessionsByModuleId']),
    ...mapGetters('exercises', ['getExercisesBySessionId']),
    ...mapGetters('sessions', ['getSessionById']),
    ...mapGetters('exercises', ['getExerciseById']),
    ...mapGetters('attempts', ['getLastAttemptForExercise'])
  },
  async mounted () {
    await this.fetchLastAttemptForExercise({ sessionId: this.sessionId, exerciseId: this.exerciseId })
    this.select = await this.exercise.lang
    this.valueTest = await this.exercise.tests
  },

  methods: {
    ...mapActions('exercises', ['fetchExerciseForSession']),
    ...mapActions('sessions', ['fetchSession']),
    ...mapActions('attempts', ['createAttemptForSession']),
    ...mapActions('attempts', ['fetchLastAttemptForExercise']),
    ...mapActions('exercises', ['updateExerciseForSession']),
    async attemptSend (exoId, sessId, sol) {
      // Create the attempt
      console.log('Creating the attempt for exercise ' + this.exerciseId + ' and fetch performed on session ' + this.sessionId + ' with solution: ' + sol)

      await this.createAttemptForSession({ exerciseId: exoId, sessionId: this.sessionId, regions: [sol, ''] })
      this.results = this.lastAttemptResults
      await this.fetchLastAttemptForExercise({ sessionId: this.sessionId, exerciseId: this.exerciseId })
    },
    runSandbox () {
      console.log('running sandbox...')
      const tests = this.valueTest
      const solution = this.valueTemplate
      this.axios.post('http://localhost:3000/api/v1/exercise/sandbox', {
        lang: this.exercise.lang,
        tests,
        solution
      })
        .then((response) => {
          this.consoleOutput = response.data.stdout
        })
        .catch((err) => {
          console.log(err)
          console.log(err.response)
        })
    },
    onAceEditorTemplate (inputTemplate) {
      this.valueTemplate = inputTemplate
    },
    onAceEditorTest (inputTest) {
      this.valueTest = inputTest
    },
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    initResult () {
      this.results = ''
    },
    async saveExercise () {
      console.log(this.select)
      console.log(this.exercise.title)
      console.log('exercise', JSON.parse(JSON.stringify(this.exercise)))
      await this.updateExerciseForSession({ id: this.exerciseId, sessionId: this.sessionId, exercise: this.exercise })
    },
    makeFullscreen () {
      if (this.fullscreen === false) {
        this.fullscreen = true
        this.editorSize = 6
        this.$emit('fullscreenChanged', this.fullscreen)
      } else {
        this.fullscreen = false
        this.editorSize = 12
        this.$emit('fullscreenChanged', this.fullscreen)
      }
    },
    showInstruction () {
      if (this.instructionShow === true) {
        this.instructionShow = false
      } else {
        this.instructionShow = true
      }
    }
  }
}
</script>
