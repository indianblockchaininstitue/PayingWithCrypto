import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

// Not logged in components
import NotLoggedIn from "../views/NotLoggedIn"
import Home from "../components/Home"

// Logged in commponents
import LoggedIn from "../views/LoggedIn"
import Dashboard from "../components/Dashboard"
// For seller
import Pets from "../components/Pets"
import Products from "../components/Products"
// For purchaser
import MyPets from "../components/MyPets"
import OrderHistory from "../components/OrderHistory"
import PetsMarket from "../components/Market/PetsMarket"
import ProductsMarket from "../components/Market/ProductsMarket"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/home",
    name: "NotLoggedIn",
    component: NotLoggedIn,
    children: [
      {
        path: "/home",
        name: "Home",
        component: Home
      }
    ]
  },
  {
    path: "/u",
    redirect: "/u/dashboard",
    name: "LoggedIn",
    component: LoggedIn,
    children: [
      {
        path: "/u/dashboard",
        name: "Dashboard",
        component: Dashboard
      },
      {
        path: "/u/pets",
        name: "Pets",
        component: Pets
      },
      {
        path: "/u/products",
        name: "Products",
        component: Products
      },
      {
        path: "/u/pets-market",
        name: "PetsMarket",
        component: PetsMarket
      },
      {
        path: "/u/products-market",
        name: "ProductsMarket",
        component: ProductsMarket
      },
      {
        path: "/u/my-pets",
        name: "MyPets",
        component: MyPets
      },
      {
        path: "/u/order-history",
        name: "OrderHistory",
        component: OrderHistory
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if(store.getters['getUser'].email === undefined) {
    if(/\/u/.test(to.path)) {
      next('/home')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router;
