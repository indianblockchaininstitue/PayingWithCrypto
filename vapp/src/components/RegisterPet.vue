<template>
  <v-container>
    <v-btn
      class="float-right"
      color="primary"
      dark
      @click.stop="show = true"
    >
      Register a new pet
    </v-btn>
    <v-dialog
      v-model="show"
      max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Register a new pet
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
            label="Pet Image"
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
            hint="For example, Rusty"
            filled
          ></v-text-field>
          <v-text-field
            label="Breed"
            v-model="breed"
            hint="For example, Golden Retriever"
            filled
          ></v-text-field>

          <div>Gender</div>
          <v-radio-group v-model="gender" row class="my-0">
            <template v-slot:label>
            </template>
            <v-radio
              label="Male"
              value="Male"
            ></v-radio>
            <v-radio
              label="Female"
              value="Female"
            ></v-radio>
          </v-radio-group>

          <v-row>
            <v-col>
              <v-text-field
                type="number"
                label="Age (years)"
                v-model="age"
                hint="For example, 4"
                filled
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                prepend-icon="mdi-ethereum"
                type="number"
                label="Price"
                v-model="price"
                hint="For example, 4"
                filled
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="primary"
            large
            :loading="loading"
            :disabled="isDisabled"
            @click="registerPet"
            class="mb-2"
          >
            Register
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
  name: 'RegisterPet',
  mixins: [general],
  data() {
    return {
      show: false,
      loading: false,
      file: {},
      url: '',
      name: 'Rusty',
      breed: 'Lab',
      gender: 'Male',
      age: '5',
      price: '3',
    }
  },
  methods: {
    onFileChange(e) {
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
    async registerPet() {
      this.loading = true
      await this.$http.post(this.$url + 'add-pet', {
        petOwner: this.getAccount(),
        petImage: this.file.name,
        petName: this.name,
        petBreed: this.breed,
        petGender: this.gender,
        petAge: this.age,
        petPrice: this.price,
        dateAdded: new Date()
      }).then((res) => {
        if(res.data.status === 209) {
          this.$emit('snack', {
            color: 'red',
            message: 'You have already added ' + this.name
          })
        } else {
          this.uploadImage()
          this.$emit('snack', {
            color: 'green',
            message: 'Pet registered successfully!'
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
      const folderRef = ref(storage, 'pets/' + this.file.name)
      uploadBytes(folderRef, file).then(() => {})
    }
  },
  computed: {
    isDisabled() {
      return this.loading || this.url === '' || this.name === '' || this.breed === '' || this.gender === '' || this.age === '' || this.price === ''
    }
  }
}
</script>