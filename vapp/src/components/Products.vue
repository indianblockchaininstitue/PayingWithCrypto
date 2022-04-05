<template>
  <section id="products">
    <v-row align="center">
      <v-col md="6">
        <v-card-title class="text-h4 title px-0">
          Your Products
        </v-card-title>
      </v-col>
      <v-col md="6">
        <AddProducts
          @snack="gotSnack"
          @refresh="loadData" />
      </v-col>
    </v-row>

    <v-img
      v-if="nothingHere"
      src="../assets/nothingToSeeHere.jpg"></v-img>

    <v-skeleton-loader
      v-if="loading"
      type="card, sentences, actions"
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
          <v-row>
            <v-col>
              <v-chip-group>
                <v-chip>{{ product.productBrand }}</v-chip>
                <v-chip
                  :color="
                    product.productQuantity === 0 ? 'red lighten-1' :
                      product.productQuantity <= 6 ? 'yellow lighten-2' : ''
                  ">{{ product.productQuantity === 0 ? 'Out of stock' : 'Quantity: ' + product.productQuantity }}</v-chip>
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

        <v-card-actions class="px-5 pb-5 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="selectProduct(index)">Increase Quantity</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-dialog
      v-model="show"
      max-width="350">
      <v-card>
        <v-container>
          <v-card-title class="px-0 pt-0">
            {{ selectedProduct.productName }}
          </v-card-title>
          <v-text-field
            type="number"
            label="New Quantity"
            v-model="newQuantity"
            hint="For example, 27"
            filled
          ></v-text-field>

          <v-card-actions class="pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="updateQuantity"
              :loading="loading2"
              :disabled="newQuantity === '' || loading2">
              Update
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import general from '../mixins/general'
import AddProducts from "./AddProducts"
import { getStorage, ref, getDownloadURL } from '@firebase/storage'

export default {
  name: 'Products',
  mixins: [general],
  components: {
    AddProducts
  },
  data() {
    return {
      products: [],
      loading: false,
      images: [],
      show: false,
      selectedProduct: {},
      newQuantity: '',
      loading2: false,
      nothingHere: false,
    }
  },
  methods: {
    gotSnack(snack) {
      this.$emit('snack', snack)
    },
    updateQuantity() {
      this.$http.post(this.$url + 'update-quantity', {
        productId: this.selectedProduct.productId,
        productOwner: this.selectedProduct.productOwner,
        newQuantity: this.newQuantity
      }).then(res => {
        if(res.data.status === 200) {
          this.selectedProduct.productQuantity = this.newQuantity
          this.show = false
          this.$emit('snack', {
            color: 'green',
            message: res.data.message
          })
        }
        this.loading2 = false
      })
    },
    selectProduct(index) {
      this.selectedProduct = this.products[index]
      this.show = true
    },
    async loadImage(image, index) {
      const storage = getStorage()
      const petRef = ref(storage, 'products/' + image);
      
      await getDownloadURL(petRef)
        .then(url => {
          this.products[index].url = url
        })
        .catch(() => {
          return ''
        })
    },
    loadData() {
      this.loading = true
      this.images = []
      this.$http.post(this.$url + 'owner-products', {
        productOwner: this.getAccount()
      }).then(res => {
        if(res.data.status === 200 && res.data.products.length !== 0) {
          this.nothingHere = false
          this.products = res.data.products
          this.products.map((a, index) => {
            this.loadImage(a.productImage, index)
          })
        } else if(res.data.products.length === 0) {
          this.nothingHere = true
        }
        this.loading = false
      })
    },
    authUser() {
      if(this.getUser().role === 'Purchaser') {
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

<style>
.products-container {
  display: grid;
  grid-template-columns: repeat( auto-fill, minmax(20rem, auto) );
  grid-gap: 2rem;
}

.card-title {
  width: fit-content;
  background-color: #2e0e49d3;
  border-radius: 0 10px 10px 0;
}
</style>