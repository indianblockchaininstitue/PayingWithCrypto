<template>
  <span>
    <v-btn
      color="primary"
      @click="modal = true">
      Login
    </v-btn>
    <v-dialog
      v-model="modal"
      max-width="400">
      <v-card>
        <v-card-title class="text-h4">
          Login
        </v-card-title>

        <v-container class="px-6 pb-5">
          <v-form
            @submit.prevent="login"
            :disabled="loading">
            <v-text-field
              v-model="email"
              label="Email"
              :rules="emailRules"
              outlined
              clearable
            ></v-text-field>
            <v-text-field
              :type="show ? 'text' : 'password'"
              v-model="password"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              label="Password"
              :rules="passwordRules"
              outlined
              clearable
              @click:append="show = !show"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              width="100%"
              :disabled="loading"
              :loading="loading"
              @click="login">
              Login
            </v-btn>
          </v-form>  
        </v-container>
              
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import general from "../mixins/general"

export default {
  name: 'Login',
  mixins: [general],
  data() {
    return {
      loading: false,
      modal: false,
      show: false,
      email: 'purchaser@gmail.com',
      password: '123',
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      passwordRules: [(v) => !!v || "Password is required"],
    }
  },
  methods: {
    login() {
      this.loading = true
      this.$http.post(this.$url + 'login', {
        email: this.email,
        password: this.password
      }).then(res => {
        let status = res.data.status
        if(status === 404) {
          this.$emit('snack', {
            color: 'red',
            message: 'User does not exist, please register'
          })
        } else if(status === 403) {
          this.$emit('snack', {
            color: 'red',
            message: 'Incorrect credentials, please try again'
          })
        } else {
          this.modal = false
          this.updateUser(res.data.user)
          this.$router.push("/u/dashboard")
        }
        this.loading = false
      })
      .catch(() => {
        this.loading = false
        this.$emit('snack', {
          color: 'red',
          message: 'Unexpected error occurred'
        })
      })
    }
  }
}
</script>