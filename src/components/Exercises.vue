<template>
  <v-container>

<!-- La vue étudiante, url dans quel on est session/3/exercise/15 -->
<!-- Les composants ne sont pas re-rendus lorsqu'on change d'exercise. Mais il faut juste changer les parametres
Le composant 'principal' recoit exercise_id et session_id. utiliser watch pour déclencher la mise à jour -->
<!-- watch:  -->
    <v-card>
      <v-toolbar flat color="#3366cc" dark>
        <v-toolbar-title>
          <v-btn class="ma-2" outlined medium color="white" @click="sendPrevious()">
            <v-icon medium center>mdi-page-previous</v-icon>
          </v-btn>
          {{ session.name }}
          <v-btn text @click="signOut">Logout</v-btn>
        </v-toolbar-title>
      </v-toolbar>
      <!-- Col with exercisesList on the left and DoWork on the right -->
      <v-row>
        <v-col cols="12" sm="2" md="2">
          <ExercisesList @exerciseSelected="onExerciseSelected"/>
        </v-col>
        <v-col cols="12" sm="2" md="10">
          <DoWork :exerciseId="exerciseIdSelected" />
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import ExercisesList from './ExercisesList.vue'
import DoWork from './DoWork.vue'
import { mapGetters, mapState, mapActions } from 'vuex'
export default {

  name: 'exercises',
  watch: {
    exerciseIdSelected: async function () {
      console.log('(In exercises.vue): Request the exercise ' + this.exerciseIdSelected + ' from session ' + this.sessionId)
      this.$router.push({ name: 'exercises', params: { sessionId: this.sessionId, exerciseId: this.exerciseIdSelected } })
    }
  },

  components: {
    ExercisesList,
    DoWork
  },

  data () {
    return { exerciseIdSelected: parseInt(this.$route.params.exerciseId) }
  },

  computed: {
    sessionId () {
      return parseInt(this.$route.params.sessionId)
    },
    session () {
      return this.getSessionById(this.sessionId) || { name: 'Loading ... ' }
    },
    firstExerciseId () {
      return parseInt(this.$route.params.exerciseId)
    },
    firstExercise () {
      return this.getExerciseById({ id: this.firstExerciseId })
    },
    exercises () {
      return this.getExercisesBySessionId(this.sessionId)
    },
    ...mapState('sessions', ['sessions']),
    ...mapState('exercises', ['exercises']),
    ...mapGetters('sessions', ['getSessionsByModuleId']),
    ...mapGetters('exercises', ['getExercisesBySessionId']),
    ...mapGetters('exercises', ['getExerciseById']),
    ...mapGetters('sessions', ['getSessionById'])
  },
  async mounted () {
    // Fetch our session
    await this.fetchSession({ id: this.sessionId })

    // Fetch the exercises of each session
    await Promise.all(
      this.sessions.map(s => this.fetchExercisesForSession({ sessionId: s.id }))
    )
    this.fetchExerciseForSession({ sessionId: this.sessionId, exerciseId: this.exerciseIdSelected })
  },

  methods: {
    ...mapActions('exercises', ['fetchExercisesForSession']),
    ...mapActions('exercises', ['fetchExerciseForSession']),
    ...mapActions('sessions', ['fetchSession']),
    ...mapActions('user', ['logout']),
    onExerciseSelected (id) {
      console.log('ID PASSED TO PARENT: ' + id)
      this.exerciseIdSelected = id
    },
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    sendPrevious () {
      this.$router.push({ name: 'module', params: { moduleId: 1 } })
    }
  }
}
</script>
