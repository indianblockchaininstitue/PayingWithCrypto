<template>
  <span>
    <v-btn
      class="ml-5"
      color="primary"
      @click="modal = true">
      Register
    </v-btn>
    <v-dialog
      v-model="modal"
      max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Register
        </v-card-title>

        <v-container class="px-6 pb-5">
          <v-form
            @submit.prevent="register"
            :disabled="loading">
            <v-select
              v-model="role"
              :items="roles"
              :rules="[(v) => !!v || 'Role is required']"
              label="Role"
              outlined
              required
            ></v-select>
            <v-text-field
              v-model="name"
              label="Name"
              :rules="nameRules"
              outlined
              clearable
            ></v-text-field>
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
            <v-text-field
              :type="cShow ? 'text' : 'password'"
              v-model="confirmPassword"
              :rules="confirmPasswordRules()"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              label="Confirm Password"
              outlined
              clearable
              @click:append="cShow = !cShow"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              width="100%"
              :disabled="
                loading ||
                email === '' ||
                password === '' ||
                confirmPassword === '' ||
                role === '' ||
                password !== confirmPassword"
              :loading="loading"
              @click="register">
              Register
            </v-btn>
          </v-form>  
        </v-container>
        
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      loading: false,
      modal: false,
      show: false,
      cShow: false,
      name: 'Rahul',
      email: 'purchaser@gmail.com',
      password: '123',
      confirmPassword: '123',
      role: 'Purchaser',
      roles: [
        'Purchaser', 'Seller'
      ],
      nameRules: [(v) => !!v || "Name is required"],
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      passwordRules: [(v) => !!v || "Password is required"],
    }
  },
  methods: {
    register() {
      this.loading = true
      this.$http.post(this.$url + 'register', {
        role: this.role,
        name: this.name,
        email: this.email,
        password: this.password
      }).then(res => {
        if(res.data.status === 209) {
          this.$emit('snack', {
            color: 'red',
            message: 'An account with ' + this.email + ' already exists'
          })
        } else if(res.data.status === 204) {
          this.modal = false
          this.$emit('snack', {
            color: 'green',
            message: 'Registered successfully, please login'
          })
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
    },
    confirmPasswordRules() {
      return [
        (v) => !!v || "Please re-enter your password",
        (v) => v === this.password || "Password & Confirm Password must match",
      ];
    },
  }
}
</script>