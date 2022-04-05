<template>
  <v-container>
    <v-btn
      class="float-right"
      color="primary"
      dark
      @click.stop="show = true"
    >
      Add a new product
    </v-btn>
    <v-dialog
      v-model="show"
      max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Add a new product
        </v-card-title>

        <v-img
          contain
          class="my-2"
          max-height="10rem"
          :src="this.url"></v-img>
        <v-form class="mx-5">
          <v-file-input
            v-model="file"
            @change="onFileChange"
            color="deep-purple accent-4"
            label="Product Image"
            placeholder="Select your files"
            prepend-icon="mdi-paperclip"
            outlined
            :show-size="1000">
            <template v-slot:selection="{ index, text }">
              <v-chip
                v-if="index < 2"
                color="deep-purple accent-4"
                dark
                label
                small
              >
                {{ text }}
              </v-chip>
            </template>
          </v-file-input>
          <v-text-field
            label="Name"
            v-model="name"
            hint="For example, Food"
            filled
          ></v-text-field>
          <v-text-field
            label="Brand"
            v-model="brand"
            hint="For example, Royal Canin"
            filled
          ></v-text-field>
          <v-row>
            <v-col>
              <v-text-field
                type="number"
                label="Quantity"
                v-model="quantity"
                hint="For example, 27"
                filled
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                prepend-icon="mdi-ethereum"
                type="number"
                label="Price (Ethers)"
                v-model="price"
                hint="For example, 5 Ethers per item"
                title="Price is given on a per item basis "
                filled
              ></v-text-field>
            </v-col>
          </v-row>
          <v-textarea
            name="input-7-1"
            filled
            label="Description"
            auto-grow
            v-model="description"
          ></v-textarea>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            large
            :loading="loading"
            :disabled="isDisabled"
            @click="addProduct"
            class="mb-2"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { getStorage, ref, uploadBytes } from '@firebase/storage'
import general from '../mixins/general'

export default {
  name: 'AdProducts',
  mixins: [general],
  data() {
    return {
      show: false,
      loading: false,
      file: {},
      url: '',
      name: '',
      brand: '',
      quantity: '',
      price: '',
      description: '',
    }
  },
  methods: {
    onFileChange(e) {
      console.log(e)
      if(e.type === 'image/png' || e.type === 'image/jpg' || e.type === 'image/jpeg') {
        this.file = e
        this.url = URL.createObjectURL(e);
      } else {
        this.file = {}
        this.url = ''
        this.$emit('snack', {
          color: 'red',
          message: 'Image must be of type JPEG, JPG or PNG'
        })
      }
    }, 
    async addProduct() {
      this.loading = true
      await this.$http.post(this.$url + 'add-product', {
        productImage: this.file.name,
        productName: this.name,
        productQuantity: this.quantity,
        productBrand: this.brand,
        productDescription: this.description,
        productPrice: this.price,
        productOwner: this.getAccount()
      }).then(res => {
        if(res.data.status === 209) {
          this.$emit('snack', {
            color: 'red',
            message: res.data.message
          })
          this.show = false
        } else if(res.data.status === 200) {
          this.uploadImage()
          this.$emit('snack', {
            color: 'green',
            message: 'Product added successfully!'
          })
          this.$emit('refresh')
          this.show = false
        }
        this.loading = false
      })
    },
    uploadImage() {
      // upload image to firebase
      let file = this.file
      const storage = getStorage()
      const folderRef = ref(storage, 'products/' + this.file.name)
      uploadBytes(folderRef, file).then(() => {})
    }
  },
  computed: {
    isDisabled() {
      return this.loading || this.name === '' || this.brand === '' || this.quantity === '' || this.description === '' || this.url === ''
    }
  }
}
</script>