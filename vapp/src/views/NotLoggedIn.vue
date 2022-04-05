<template>
  <v-container fluid>
    <v-app-bar
      app
      color="white"
      dark
      height="80">
      <div class="d-flex align-center">
        <v-list-item
          color="white"
          to="/">
          <v-img
            alt="Sapper Logo"
            class="shrink mr-2"
            contain
            src="../assets/sft.png"
            transition="scale-transition"
          />
        </v-list-item>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://snapperfuturetech.com/"
        target="_blank"
        text
        color="black"
      >
        <span class="mr-2">More Info</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-fade-transition name="notLoggedIn" mode="out-in">
      <router-view @snack="gotSnack" />
    </v-fade-transition>

    <v-snackbar
      :timeout="5000"
      :value="snack.show"
      :color="snack.color"
      fixed
      top
      width="18rem"
      min-width="0rem"
      transition="slide-y-reverse-transition">
      {{ snack.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'NotLoggedIn',
  data() {
    return {
      snack: {
        show: false,
        message: '',
        color: ''
      }
    }
  },
  methods: {
    gotSnack(snack) {
      this.snack.color = snack.color
      this.snack.message = snack.message
      this.snack.show = true

      setTimeout(() => {
        this.snack.show = false
      }, 5000)
    }
  }
}
</script>