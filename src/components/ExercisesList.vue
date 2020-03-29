<template>
  <v-container>

<!-- La vue étudiante, url dans quel on est session/3/exercise/15 -->
<!-- Les composants ne sont pas re-rendus lorsqu'on change d'exercise. Mais il faut juste changer les parametres
Le composant 'principale recoit exercise_id et sssion_id. utiliser watch pour déclencher la mise à jour -->
<!-- watch:  -->
    <v-btn class="ma-2" outlined small color="indigo" @click="createNewExercise()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-card class="mx-auto" max-width="500" tile>
      <v-list shaped>
        <v-subheader>Editeur d'exercises</v-subheader>
        <v-list-item-group color="primary">
          <v-list-item v-for="exercise in getExercisesBySessionId(sessionId)" :key="exercise.id">
            <v-list-item-content>
              <v-list-item-title @click="exerciseSelected(exercise.id)">{{ exercise.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
export default {

  name: 'exercises',
  data: () => ({
  }),

  computed: {
    sessionId () {
      return parseInt(this.$route.params.sessionId)
    },
    session () {
      return this.getSessionById(this.sessionId) || { name: 'Loading ... ' }
    },
    exercises () {
      return this.getExercisesBySessionId(this.sessionId)
    },
    ...mapState('sessions', ['sessions']),
    ...mapState('exercises', ['exercises']),
    ...mapGetters('sessions', ['getSessionsByModuleId']),
    ...mapGetters('exercises', ['getExercisesBySessionId']),
    ...mapGetters('sessions', ['getSessionById'])
  },
  async mounted () {
    // Fetch our session
    await this.fetchSession({ id: this.sessionId })

    // Fetch the exercises of each session
    await Promise.all(
      this.sessions.map(s => this.fetchExercisesForSession({ sessionId: s.id }))
    )
  },

  methods: {
    ...mapActions('exercises', ['fetchExercisesForSession']),
    ...mapActions('sessions', ['fetchSession']),
    exerciseSelected (id) {
      this.$emit('exerciseSelected', id)
    },
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    createNewExercise () {
      this.$router.push({ name: 'newExercise', params: { sessionId: this.sessionId, exerciseId: this.exercises.length } })
    }
  }
}
</script>
