<template>
  <v-container>

<!-- La vue étudiante, url dans quel on est session/3/exercise/15 -->
<!-- Les composants ne sont pas re-rendus lorsqu'on change d'exercise. Mais il faut juste changer les parametres
Le composant 'principale recoit exercise_id et session_id. utiliser watch pour déclencher la mise à jour -->
<!-- watch:  -->
    <v-alert outlined color="#3366cc">
    <v-row>
      <v-col cols="12" sm="2" md="6">
        <h1>{{ exercise.title }}</h1>
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
        <InstructionEditor :exerciseId="this.exerciseId" :sessionId="this.sessionId"></InstructionEditor>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="2" md="6">
        <h2>Tests
          <v-btn class="ma-2" outlined small color="indigo" @click="attemptSend(exerciseId, sessionId, value)">
            <v-icon>mdi-fullscreen</v-icon>
          </v-btn>
        </h2>
        <AceEditorTests @input="onAceEditor" :exerciseId="this.exerciseId" :sessionId="this.sessionId"></AceEditorTests>
      </v-col>
      <v-col cols="12" sm="2" md="6">
        <v-row>
          <v-col cols="12" sm="2" md="8">
            <h2>Template de résolution
              <v-btn class="ma-2" outlined small color="indigo" @click="attemptSend(exerciseId, sessionId, value)">
                <v-icon>mdi-play</v-icon>
              </v-btn>
            </h2>
          </v-col>
          <v-col cols="12" sm="2" md="4">
            <v-checkbox v-model="checkbox1" :label="immutable"></v-checkbox>
          </v-col>
        </v-row>
        <AceEditorTemplate @input="onAceEditor"></AceEditorTemplate>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="2" md="6">
        <h2>Sortie de console</h2>
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
      </v-col>
      <v-col cols="12" sm="2" md="6">
        <h2>Résultat des tests</h2>
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
        </div>
      </v-col>
    </v-row>
    </v-alert>
  </v-container>
</template>

<style scoped>
h1, h2, h3, p {
  color: white
}
</style>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import AceEditorTemplate from './AceEditorTemplate.vue'
import AceEditorTests from './AceEditorTests.vue'
import InstructionEditor from './InstructionEditor.vue'
export default {

  name: 'exercises',
  components: {
    AceEditorTests,
    AceEditorTemplate,
    InstructionEditor
  },
  watch: {
    exerciseId: function (newVal) {
      console.log('(In exercises.vue): Request the exercise ' + newVal)
    }
  },
  props: ['exerciseId'],
  data: () => ({
    value: '',
    results: '',
    immutable: 'Verrouiller les zones immuables',
    checkbox1: '',
    select: '',
    items: ['python', 'C']
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
      this.initResult()
      this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: this.exerciseId })
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
  },

  methods: {
    ...mapActions('exercises', ['fetchExerciseForSession']),
    ...mapActions('sessions', ['fetchSession']),
    ...mapActions('attempts', ['createAttemptForSession']),
    ...mapActions('attempts', ['fetchLastAttemptForExercise']),
    async attemptSend (exoId, sessId, sol) {
      // Create the attempt
      console.log('Creating the attempt for exercise ' + this.exerciseId + ' and fetch performed on session ' + this.sessionId + ' with solution: ' + sol)

      await this.createAttemptForSession({ exerciseId: exoId, sessionId: this.sessionId, regions: [sol, '(\'Hello World\')'] })
      this.results = this.lastAttemptResults
      await this.fetchLastAttemptForExercise({ sessionId: this.sessionId, exerciseId: this.exerciseId })
    },
    onAceEditor (input) {
      this.value = input
    },
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    initResult () {
      this.results = ''
    },
    saveExercise () {
      console.log(this.select)
      console.log(this.exercise)
    }
  }
}
</script>
