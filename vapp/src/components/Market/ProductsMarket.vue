<template>
  <section id="products-market">
    <v-img
      v-if="nothingHere"
      src="../../assets/nothingToSeeHere.jpg"></v-img>


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
              <v-img src="../../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
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
          <v-btn color="primary" :disabled="product.productQuantity === 0" @click="openPurchaseModal(index)">Purchase</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-dialog
      v-model="show"
      max-width="350">
      <v-card>
        <v-container class="px-5 py-5">
          <v-card-title class="px-0 pt-0">
            {{ selectedProduct.productName }}
          </v-card-title>

          <v-subheader class="px-0 text-h6">Quantity to purchase</v-subheader>
          <v-slider
            color="orange darken-3"
            v-model="quantity"
            thumb-label="always"
            :max="selectedProduct.productQuantity"
          ></v-slider>

          <v-subheader class="px-0 text-h5">
            Price per item:
            <v-img src="../../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
            {{ selectedProduct.productPrice }}
          </v-subheader>
          <v-subheader class="px-0 text-h5">
            Total Price: 
            <v-img src="../../assets/ether.svg" class="mx-0 img" contain position="right" width="2rem" height="2rem"></v-img>
            {{ getPrice }}
          </v-subheader>

          <v-card-actions class="pb-0 px-0 pt-2">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :loading="purchasing"
              :disabled="purchasing || quantity === 0"
              @click="purchaseProduct">
              Purchase
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import general from '../../mixins/general'
import { getStorage, ref, getDownloadURL } from '@firebase/storage'
import Web3 from "web3"

export default {
  name: 'ProductsMarket',
  mixins: [general],
  data() {
    return {
      loading: false,
      products: [],
      nothingHere: false,
      selectedProduct: {},
      quantity: '',
      show: false,
      purchasing: false
    }
  },
  methods: {
    async purchaseProduct() {
      this.purchasing = true
      let p = this.selectedProduct

      await window.ethereum.enable();
      window.web3 = new Web3(window.ethereum);
      let price = window.web3.utils.toWei(this.getPrice.toString(), 'ether') 
      window.web3.eth.sendTransaction({
        from: this.getAccount(),
        to: p.productOwner,
        value: price
      })
      .then(() => {
        //buyItems contract call
        this.getContract().buyItems(p.productId).send({
          from: this.getAccount()
        })
        .then(() => {
          this.$http.post(this.$url + 'buy-product', {
            productId: p.productId,
            productImage: p.productImage,
            productName: p.productName,
            productQuantity: this.quantity,
            productBrand: p.productBrand,
            productDescription: p.productDescription,
            productPrice: p.productPrice,
            datePurchased: new Date(),
            productOwner: this.getAccount()
          }).then(res => {
            if(res.data.status === 200) {
              this.$emit('snack', {
                color: 'green',
                message: 'Product purchased successfully!' 
              })
              this.$router.push('/u/order-history')
            }
            this.purchasing = false
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
    openPurchaseModal(index) {
      this.show = true
      this.selectedProduct = this.products[index]
    },
    loadData() {
      this.loading = true
      this.$http.get(this.$url + 'get-products')
        .then(res => {
          if(res.data.status === 200 && res.data.products.length !== 0) {
            let products = res.data.products
            const storage = getStorage()
            products.map(a => {
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
  computed: {
    getPrice() {
      return this.quantity * this.selectedProduct.productPrice
    }
  },
  mounted() {
    if(this.authUser()) {
      this.loadData()
    }
  }
}
</script>