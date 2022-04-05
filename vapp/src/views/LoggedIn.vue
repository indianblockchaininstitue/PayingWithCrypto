<template>
  <v-container id="logged-in" fluid>
    <v-navigation-drawer
      permanent
      fixed
      color="rgb(52 67 106)">
      <v-list-item to="/u/dashboard">
        <v-img
          alt="Sapper Logo"
          class="shrink mt-2"
          contain
          color="rgb(3 91 98)"
          src="../assets/sft-white.png"
          transition="scale-transition"
        />          
      </v-list-item>

      <v-divider dark inset></v-divider>

      <v-list
        nav
        class="mt-10"
      >
        <template v-for="(item, index) in items">
          <div v-if="item.children" :key="index">
            <v-list-item @click="item.toggle = !item.toggle" dark link>
              <v-list-item-icon>
                <v-icon>{{ item.toggle ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>

              <v-list-item-icon>
                <v-icon>{{ item.toggle ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <ul class="children" :class="item.toggle ? 'toggled' : ''" v-if="item.children">
              <v-list-item
                v-for="(child, index) in item.children"
                :to="child.to"
                :key="index"
                active-class="sidebar-active-link"
                dark link>
                <v-list-item-icon>
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{ child.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </ul>
          </div>
          <v-list-item v-else active-class="sidebar-active-link" :key="index" :to="item.to" dark link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      absolute
      color="rgb(32 125 98)"
      dark
      elevation
      class="top-bar">

      <v-card-text class="text-h5">
        Welcome, {{ getUser().name }}
        <v-chip>{{ getUser().role }}</v-chip>        
      </v-card-text>

      <v-spacer></v-spacer>

      <v-btn @click="logout">
        <v-icon>mdi-logout</v-icon>
        Logout
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
import general from '../mixins/general'

import RegisterPet from '../components/RegisterPet'

import Web3 from "web3"
//import contract

export default {
  name: 'LoggedIn',
  mixins: [general],
  compenents: {
    RegisterPet: RegisterPet
  },
  data() {
    return {
      items: [],
      snack: {
        show: false,
        message: '',
        color: ''
      },
      showRegPet: false
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
    },
    async loadWeb3() {
      //for ethereum browser
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        //for legacy browsers
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        //for invalid response
      } else {
        window.alert("Non-ethereum browser detected");
      }
    },
    async loadBlockchainData() {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts(); //load accounts
      this.account = accounts[0] //setting account => store a/c in state obj. in react

      window.ethereum.on(
        "accountsChanged",
        async function () {
          // Time to reload your interface with accounts[0]!
          const accounts = await web3.eth.getAccounts(); //load accounts
          this.account = accounts[0] //setting account => store a/c in state obj. in react
          this.updateAccount(this.account)
        }.bind(this)
      );

      this.updateAccount(this.account)
      //loading contracts
      const networkId = await web3.eth.net.getId();
      const networkData = Token.networks[networkId];

      if (networkData) {
        const abi = Token.abi;
        const address = networkData.address;
        const contract = new web3.eth.Contract(abi, address);
        this.contract = contract //this.setState({ contract}) //ES6
        this.updateContract(contract.methods)
      } else {
        window.alert("Smart contract not deployed to detected network");
      }
    },
    logout() {
      this.updateUser({})
      this.$router.push('/')
    },
    registerPet() {
      this.showRegPet = true
    },
    loadData() {
      let d = this.getUser()
      if(d.role === 'Seller') {
        this.items = [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/u/dashboard' },
          { title: 'Pets', icon: 'mdi-paw', to: '/u/pets' },
          { title: 'Products', icon: 'mdi-package', to: '/u/products' },
        ]
      } else {
        this.items = [
          { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/u/dashboard' },
          { title: 'My Pets', icon: 'mdi-paw', to: '/u/my-pets' },
          { title: 'Order History', icon: 'mdi-history', to: '/u/order-history' },
          { 
            title: 'Market',
            icon: 'mdi-home-city',
            toggle: true,
            children: [
              {
                title: 'Pets',
                icon: 'mdi-dog',
                to: '/u/pets-market'
              },
              {
                title: 'Products',
                icon: 'mdi-basket',
                to: '/u/products-market'
              }
            ]
          },
        ]
      }
    }
  },
  mounted() {
    this.loadData()
    this.loadWeb3()
    this.loadBlockchainData()
  }
}
</script>

<style lang="scss">
#logged-in {
  padding: 0;
}

.children {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 2rem;
  margin: 0;
  opacity: 0;
  max-height: 0;
  transition: all 250ms ease-in-out;

  & a {
    visibility: collapse;
  }
}
.toggled {
  opacity: 1;
  max-height: 20rem;
  & a {
    visibility: visible;
  }

}

.top-bar {
  margin-left: 16rem;
}

.sidebar-link {
  font-size: 1.4rem !important;
}
.sidebar-active-link {
  color: #c1e1ff !important;
  background-color: #026276;
}
</style>