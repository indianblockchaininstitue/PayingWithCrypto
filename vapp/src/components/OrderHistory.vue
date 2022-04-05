<template>
  <section id="order-history">
    <v-card-title class="text-h4 title px-0">
      Order History
    </v-card-title>

    <v-img
      v-if="nothingHere"
      src="../assets/nothingToSeeHere.jpg"></v-img>


    <v-skeleton-loader
      v-if="loading"
      type="card, sentences"
      max-width="20rem"
    ></v-skeleton-loader>
    <v-container v-else fluid class="px-0 products-container">
      <v-card
        v-for="(product, index) in products"
        :key="index">
        <v-img
          class="white--text align-end"
          height="200px"
          :src="product.url">
            <v-card-title class="card-title">{{ product.productName }}</v-card-title>
        </v-img>

        <v-card-subtitle class="pb-0">
          <v-subheader class="px-0 text-h6">
            Date purchased: {{ product.datePurchased }}
          </v-subheader>
          <v-row>
            <v-col>
              <v-chip-group>
                <v-chip>{{ product.productBrand }}</v-chip>
                <v-chip>{{ 'Quantity: ' + product.productQuantity }}</v-chip>
              </v-chip-group>
            </v-col>
            <v-col class="price-row">
              <v-img src="../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
              <v-card-text class="text--primary px-0 py-0 price">
                {{ product.productPrice }}
              </v-card-text>
            </v-col>
          </v-row>
        </v-card-subtitle>

        <v-card-text class="text--primary pb-0">
          {{ product.productDescription }}
        </v-card-text>

        <v-card-text class="text--primary">
          <div>Owned by</div>
          <div>{{ product.productOwner }}</div>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<script>
import general from '../mixins/general'
import { getStorage, ref, getDownloadURL } from '@firebase/storage'
import moment from "moment"

export default {
  name: 'OrderHistory',
  mixins: [general],
  data() {
    return {
      loading: false,
      products: [],
      nothingHere: false,
    }
  },
  methods: {
    loadData() {
      this.loading = true
      this.$http.post(this.$url + 'order-history', {
        productOwner: this.getAccount()
      })
      .then(res => {
        if(res.data.status === 200 && res.data.products.length !== 0) {
          let products = res.data.products
          const storage = getStorage()
          products.map(a => {
            a.datePurchased = moment(a.datePurchased).format('LL')
            const petRef = ref(storage, 'products/' + a.productImage);
            getDownloadURL(petRef)
              .then(url => {
                a.url = url
              })
              .catch(() => {
                return ''
              })
          })
          this.products = products
        } else if(res.data.products.length === 0) {
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