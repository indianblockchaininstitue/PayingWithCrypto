<template>
  <section id="pets-market">
    <v-img
      v-if="nothingHere"
      src="../../assets/nothingToSeeHere.jpg"></v-img>

    <v-skeleton-loader
      v-if="loading"
      type="card, chip, actions"
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
              <v-img src="../../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
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

        <v-card-actions class="px-5 pb-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="buyPet(pet)">Purchase</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </section>
</template>

<script>
import general from '../../mixins/general'
import moment from "moment"
import { getStorage, ref, getDownloadURL } from '@firebase/storage'
import Web3 from "web3"

export default {
  name: 'PetsMarket',
  mixins: [general],
  data() {
    return {
      loading: false,
      pets: [],
      nothingHere: false
    }
  },
  methods: {
    async buyPet(pet) {
      await window.ethereum.enable();
      window.web3 = new Web3(window.ethereum);
      let price = window.web3.utils.toWei(pet.petPrice.toString(), 'ether') 
      window.web3.eth.sendTransaction({
        from: this.getAccount(),
        to: pet.petOwner,
        value: price
      })
      .then(() => {
        //buyPet Contract call
        this.getContract().buyPet(pet.petId).send({
          from: this.getAccount()
        })
        .then(() => {
          this.$http.post(this.$url + 'buy-pet', {
            petId: pet.petId,
            petOwner: this.getAccount()
          }).then(res => {
            if(res.data.status === 200) {
              this.$emit('snack', {
                color: 'green',
                message: 'Pet purchased successfully!'
              })
              this.$router.push('/u/my-pets')
            }
          })
        })
      })
      .catch((res) => {
        if(res.code === 4001) {
          this.$emit('snack', {
            color: 'red',
            message: 'Transaction denied'
          })
        }
      })
    },
    loadData() {
      this.loading = true
      this.$http.get(this.$url + 'get-pets')
        .then(res => {
          if(res.data.status === 200 && res.data.pets.length !== 0) {
            let pets = res.data.pets
            const storage = getStorage()
            pets.map(a => {
              a.dateAdded = moment(a.dateAdded).format('LL')
              const petRef = ref(storage, 'pets/' + a.petImage);
              getDownloadURL(petRef)
                .then(url => {
                  a.url = url
                })
                .catch(() => {
                  return ''
                })
            })
            this.pets = pets
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