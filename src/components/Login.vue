<template>
  <v-card
    class="mx-auto"
    max-width="500"
    outlined
  >
    <v-form v-model="valid">
      <v-container>
        <v-row justify-md="center">
          <v-col cols="12" md="12">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              :counter="20"
              label="Email"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="12">
            <v-text-field
              v-model="password"
              type="password"
              :rules="passwordRules"
              :counter="20"
              label="Password"
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <div class="text-md-center">
          <v-btn text large color="primary" @click="signIn">Sign in !</v-btn>
        </div>
      </v-container>
    </v-form>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  data: () => ({
    valid: '',
    email: '',
    password: '',
    emailRules: [
      v => !!v || 'Email is required',
      v => v.length <= 20 || 'Email must be less than 20 characters'],
    passwordRules: [
      v => !!v || 'Password is required',
      v => v.length <= 20 || 'Password must be less than 20 characters']
  }),

  computed: {
    ...mapState({ }),
    ...mapGetters('user', ['isAuthenticated'])
  },

  methods: {
    ...mapActions('user', ['login']),
    async signIn () {
      // Get the login before pushing
      // Await important. Permet d'attendre que cette fonction soit finie avant de passer à la suite. Appel au server et attendre la réponse
      try {
        await this.login({ email: this.email, password: this.password })
        this.$router.push({ name: 'modules' })
      } catch (err) {
        console.log('Ca marche pas')
      }
    }
  }
}
</script>
