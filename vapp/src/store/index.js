import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: 'rc4', isCompression: false });
Vue.use(Vuex);

export default new Vuex.Store({
  // Encrypts and compresses (optional) entire vuex state into localstorage automatically
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: key => ls.remove(key)
      },
      reducer(val) {
        // Check for which condition, empty (default) state should be sent
        if(val.user.email === undefined) {
          return {
            // Default vuex state
            user: {},
            account: '',
            contract: {},
          }
        }
        return val
      } 
    })
  ],
  state: {
    user: {},
    account: '',
    contract: {},
  },
  mutations: {
    'UPDATE_USER' (state, user) {
      state.user = user
    },
    'UPDATE_ACCOUNT' (state, account) {
      state.account = account
    },
    'UPDATE_CONTRACT' (state, contract) {
      state.contract = contract
    },
  },
  actions: {
    updateUser({ commit }, user) {
      commit('UPDATE_USER', user)
    },
    updateAccount({ commit }, account) {
      commit('UPDATE_ACCOUNT', account)
    },
    updateContract({ commit }, contract) {
      commit('UPDATE_CONTRACT', contract)
    }    
  },
  getters: {
    getUser: (state) => {
      return state.user
    },
    getAccount: (state) => {
      return state.account
    },
    getContract: (state) => {
      return state.contract
    }
  },
  modules: {},
});
