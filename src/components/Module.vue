<template>
  <v-container>
     <v-card>
    <v-toolbar flat color="#3366cc" dark>
      <v-toolbar-title>
        <v-btn class="ma-2" outlined medium color="white" @click="sendPrevious()">
          <v-icon medium center>mdi-page-previous</v-icon>
        </v-btn>
        {{ module.name }}
        <v-btn text @click="signOut">Logout</v-btn>
      </v-toolbar-title>
    </v-toolbar>
    <v-row>
      <div><h1></h1></div>
    </v-row>
    <v-row>
      <div v-for="session in sessions" :key="session.id">
        <v-row>
          <v-col cols="12" md="5">
            <h2><router-link :to="{ name: 'exercises', params: { sessionId: session.id, exerciseId: getFirstExerciseIdOfSession(session.id) } }">{{ session.name }}</router-link></h2>
          </v-col>
        </v-row>
        <v-row>
              <div v-for="exercise in getExercisesBySessionId(session.id)" :key="exercise.id">
                <v-row>
                    <v-col cols="12" sm="2" md="12">
                        <v-card class="mx-auto" width="250" height="100" outlined color="#3366cc" hover>
                          <v-card-title>
                            {{ exercise.title | truncate(17, '...') }}
                          </v-card-title>
                           <v-list-item-subtitle>{{ exercise.lang }}</v-list-item-subtitle>
                        </v-card>
                    </v-col>
                </v-row>
              </div>
            </v-row>
      </div>
    </v-row>
     </v-card>
  </v-container>
</template>

<style>
div{
  padding:5px }
v-card-title {
  font-size: 20em;
}

</style>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
export default {

  name: 'module',
  data: () => ({
  }),

  computed: {
    moduleId () {
      return parseInt(this.$route.params.moduleId)
    },
    module () {
      // Si this.getModuleById(this.moduleId) est undefined, retourner l'bojet name avec comme valeur loading
      return this.getModuleById(this.moduleId) || { name: 'Loading ... ' }
    },
    sessions () {
      return this.getSessionsByModuleId(this.moduleId)
    },
    ...mapState('modules', ['modules']),
    ...mapState('sessions', ['sessions']),
    ...mapState('exercises', ['exercises']),
    ...mapGetters('modules', ['getModuleById']),
    ...mapGetters('exercises', ['getExercisesBySessionId'])
  },
  async mounted () {
    // Fetch the module with our Id
    await this.fetchModule({ id: this.moduleId })

    // Fetch the sessions of the module (TP1, TP2, TP3, TP4, TP5)
    await Promise.all(
      this.modules.map(m => this.fetchSessionsForModule({ moduleId: m.id }))
    )

    // Fetch the exercises of each session
    await Promise.all(
      this.sessions.map(s => this.fetchExercisesForSession({ sessionId: s.id }))
    )
  },

  methods: {
    ...mapActions('sessions', ['fetchSessionsForModule']),
    ...mapActions('exercises', ['fetchExercisesForSession']),
    ...mapActions('modules', ['fetchModule']),
    ...mapActions('user', ['logout']),
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    },
    getFirstExerciseIdOfSession (sessId) {
      const exos = this.getExercisesBySessionId(sessId)
      if (exos.length) {
        return exos[0].id
      } else {
        return 0
      }
    },
    sendPrevious () {
      this.$router.push({ name: 'modules' })
    }
  }
}
</script>
