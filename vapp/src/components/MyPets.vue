<template>
  <section id="my-pets">
    <v-card-title class="text-h4 title px-0">
      My Pets
    </v-card-title>

    <v-img
      v-if="nothingHere"
      src="../assets/nothingToSeeHere.jpg"></v-img>

    <v-skeleton-loader
      v-if="loading"
      type="card-avatar"
      max-width="20rem"
    ></v-skeleton-loader>
    <v-container v-else fluid class="px-0 pets-container">
      <v-card
        v-for="(pet, index) in pets"
        :key="index">
        <v-img
          class="white--text align-end"
          height="200px"
          :src="pet.url">
            <v-card-title class="card-title">{{ pet.petName + ' (' + pet.petAge + ' y/o)' }}</v-card-title>
        </v-img>

        <v-card-subtitle class="pb-0">
          <v-row>
            <v-col>
              <v-chip-group>
                <v-chip>{{ pet.petBreed }}</v-chip>
                <v-chip>
                  <v-icon class="mr-1">{{ pet.petGender === 'Male' ? 'mdi-gender-male' : 'mdi-gender-female' }}</v-icon>
                  {{ pet.petGender }}
                </v-chip>
                <v-chip>{{ pet.dateAdded }}</v-chip>
              </v-chip-group>
            </v-col>
            <v-col class="price-row">
              <v-img src="../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
              <v-card-text class="text--primary px-0 py-0 price">
                {{ pet.petPrice }}
              </v-card-text>
            </v-col>
          </v-row>
        </v-card-subtitle>

        <v-card-text class="text--primary">
          <div>Owned by</div>
          <div>{{ pet.petOwner }}</div>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<script>
import general from '../mixins/general'
import moment from 'moment'
import { getStorage, ref, getDownloadURL } from '@firebase/storage'

export default {
  name: 'MyPets',
  mixins: [general],
  data() {
    return {
      pets: [],
      loading: false,
      images: [],
      nothingHere: false
    }
  },
  methods: {
    gotSnack(snack) {
      this.$emit('snack', snack)
    },
    async loadImage(image, index) {
      const storage = getStorage()
      const petRef = ref(storage, 'pets/' + image);

      await getDownloadURL(petRef)
        .then(url => {
          this.pets[index].url = url
        })
        .catch(() => {
          return ''
        })
    },
    async loadData() {
      this.loading = true
      this.images = []
      await this.$http.post(this.$url + 'owner-pets', {
        petOwner: this.getAccount(),
        sold: true,
      }).then(res => {
        if(res.data.status === 200 && res.data.pets.length !== 0) {
          this.nothingHere = false
          this.pets = res.data.pets
          this.pets.map((a, index) => {
            this.loadImage(a.petImage, index)
            a.dateAdded = moment(a.dateAdded).format('LL')
          })
        } else if(res.data.pets.length === 0) {
          this.nothingHere = true
        }
        this.loading = false
      })
    },
    authUser() {
      if(this.getUser().role === 'Seller') {
        this.$emit('snack', {
          color: 'red',
          message: 'You do not have access to this page'
        })
        this.$router.push('/u')
        return false
      }
      return true
    }
  },
  mounted() {
    if(this.authUser()) {
      this.loadData()
    }
  }
}
</script>