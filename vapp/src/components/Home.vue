<template>
  <v-container class="home" fluid>
    <v-row>
      <v-col md="6 my-auto">
        <v-img
          alt="ecommerce"
          src="../assets/home.jpg"></v-img>
      </v-col>

      <v-col md="6">
        <v-card-text class="platform-title">
          The next generation of e-commerce!
        </v-card-text>
        <v-card-text class="platform-desc">
          Looking for a reliable platform to purchase or sell your products within the crypto ecosystem? Well look no further, we got you covered!
        </v-card-text>

        <v-card-text class="platform-actions py-0">
          To get started, please register or if you already have an account then login
        </v-card-text>
        <v-card-actions class="px-5">
          <Login @snack="gotSnack" />
          <Register @snack="gotSnack" />
        </v-card-actions>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Login from "./Login"
import Register from "./Register"

export default {
  name: 'Home',
  components: {
    Login, Register
  },
  methods: {
    gotSnack(snack) {
      this.$emit('snack', snack)
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Alegreya:wght@700&display=swap');

.home {
  height: 100%;
}

.platform-title {
  font-family: 'Alegreya', serif;
  font-size: 4rem !important;
  line-height: 4rem !important;
}
.platform-desc {
  font-size: 2rem !important;
  line-height: initial !important;
}
.platform-actions {
  font-size: 1.1rem !important;
  line-height: 3rem !important;
}
</style>