<template>
  <v-app>
    <v-main>
      <v-fade-transition mode="out-in">
        <router-view />
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
*, body {
  margin: 0;
  padding: 0;
}

section {
  margin: 6rem 2rem 0 18rem;
}
.v-image__image--cover {
    background-size: auto !important;
}

.v-snack {
  top: 5.5rem !important;
}
.v-snack__wrapper {
  word-break: break-word;
}

/* Scroll bar styling */
/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>