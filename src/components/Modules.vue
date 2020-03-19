<template>
  <v-container>
    <v-card>
      <v-toolbar flat color="#3366cc" dark>
        <v-toolbar-title>
          Liste de vos modules
          <v-btn text @click="signOut">Logout</v-btn>
        </v-toolbar-title>
      </v-toolbar>

      <!-- Create each module -->
      <v-row>
        <v-col cols="12" xs="12" sm="12" md="12">
          <div class="d-block pa-2 red white--text">Drag and drop but doesn't save :/</div>
          <div v-for="module in this.modules" :key="module.id">  <!--La clé permet de lier une balise html avec le tableau-->
            <v-row>
              <v-col cols="12" xs="6" sm="3" md="3">
                <h2><router-link :to="{ name: 'module', params: { moduleId: module.id } }">{{ module.name }}</router-link></h2>
              </v-col>
            </v-row>
            <!-- Call component that creates sessions of the current module -->
            <Sessions :moduleId="module.id"/>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<style>
div{
  padding:5px }
</style>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Sessions from './Sessions.vue'

export default {

  name: 'modules',
  components: {
    Sessions
  },
  data: () => ({
  }),

  computed: {
    // On vrée un tab qui s'appelle module, en tant que propriété de notre objet. Même dans un composant éloigné,
    // l'état de la prop est modifiée aussi. Calculé par vuex poru vérif que c'est à jour
    ...mapState('modules', ['modules']),
    ...mapState('sessions', ['sessions']),
    ...mapGetters('user', ['isAuthenticated'])
  },
  async mounted () {
    // 1. Sans le await ya probleme, on attend pas que cette fonction que soit fini avant de charger la vue
    // 2. Si on a pas l'état de notre liste de mdules, ca sert à rien. Donc on doit récupérer l'état de modules[]
    await this.fetchModules()
  },
  methods: {
    // Créer un tab de fonction et on lattache à notre objet
    ...mapActions('user', ['logout']),
    ...mapActions('modules', ['fetchModules']),
    signOut () {
      this.logout()
      this.$router.push({ name: 'login' })
    }
  }
}
</script>
