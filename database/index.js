import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/cryptoECommerce",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB connected");
  }
);

let count = 0;
let product_count = 0;

// User Registration
const userSchema = new mongoose.Schema({
  role: String,
  name: String,
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

const petsSchema = new mongoose.Schema({
  petId: Number,
  petImage: String,
  petOwner: String,
  petName: String,
  petBreed: String,
  petGender: String,
  petAge: Number,
  petPrice: Number,
  dateAdded: Date,
  url: String,
  petSoldFlag: Boolean
});

const productSchema = new mongoose.Schema({
  productId: Number,
  productImage: String,
  productName: String,
  productQuantity: Number,
  productBrand: String,
  productDescription: String,
  productPrice: Number,
  url: String,
  productOwner: String,
});

const purchasesSchema = new mongoose.Schema({
  productId: Number,
  productImage: String,
  productName: String,
  productQuantity: Number,
  productBrand: String,
  productDescription: String,
  productPrice: Number,
  datePurchased: Date,
  url: String,
  productOwner: String,
});

const pet = new mongoose.model("pet", petsSchema);
const product = new mongoose.model("product", productSchema);
const purchase = new mongoose.model("purchase", purchasesSchema);

// get pet
app.get("/get-pets", (req, res) => {
  pet.find({
    petSoldFlag: false
  },(err, result) => {
    if(result) {
      res.send({ status: 200, pets: result })
    } else {
      res.send({ status: 500, message: 'An error occurred' })
    }
  })
})

//add pet
app.post("/add-pet", (req, res) => {
  let petId = count;
  const {
    petOwner,
    petImage,
    petName,
    petBreed,
    petGender,
    petAge,
    petPrice,
    dateAdded
  } = req.body;
  pet.findOne({ 
    $and: [
      { petOwner: petOwner },
      { petName: petName },
    ],
  }, (err, result) => {
    if (result) {
      res.send({ status: 209, message: "Pet already added" });
    } else {
      const newpet = new pet({
        petId,
        petImage,
        petOwner,
        petName,
        petBreed,
        petGender,
        petAge,
        petPrice,
        dateAdded,
        url: '',
        petSoldFlag: false
      });

      newpet.save((error) => {
        if (error) {
          res.status(500).json({ msg: "Something went wrong!" });
        } else {
          res.json({ status: 204, msg: "You data has been saved!" });
          count++;
        }
      });
    }
  });
});

//pet details
app.post("/owner-pets", (req, res) => {
  const details = req.body;
  pet.find({
      $and: [
        { petOwner: details.petOwner },
        { petSoldFlag: details.sold }
      ],
    })
    .then((data) => {
      res.json({ status: 200, pets: data });
    })
    .catch((error) => {
      console.log("error: ", error);
    });
});

// buy pet
app.post("/buy-pet", (req, res) => {
  const data = req.body;
  pet.findOne(
    {
      petId: data.petId,
    },
    (err, result) => {
      if (result) {
        let query = { petId: data.petId };
        let updatedValue = {
          $set: {
            petOwner: data.petOwner,
            petSoldFlag: true
          },
        };
        pet.updateOne(query, updatedValue, function (err, result) {
          if (err) {
            throw err;
          } else {
            res.send({ status: 200, message: "Updated" });
          }
        });
      }
    }
  );
});

// get products
app.get("/get-products", (req, res) => {
  product.find({},(err, result) => {
    if(result) {
      res.send({ status: 200, products: result })
    } else {
      res.send({ status: 500, message: 'An error occurred' })
    }
  })
})

// add product
app.post("/add-product", (req, res) => {
  let productId = product_count;
  const {
    productImage,
    productName,
    productQuantity,
    productBrand,
    productDescription,
    productPrice,
    productOwner
  } = req.body;
  product.findOne({
    $and: [
      { productOwner: productOwner },
      { productName: productName },
    ],
  }, (err, p) => {
    if (p) {
      res.send({ status: 209, message: "Product already added, consider increasing its quantity instead" });
    } else {
      const newproduct = new product({
        productId,
        productImage,
        productName,
        productQuantity,
        productBrand,
        productDescription,
        productPrice,
        url: '',
        productOwner
      });

      newproduct.save((error) => {
        if (error) {
          res.status(500).json({ msg: "Something went wrong!" });
        } else {
          res.json({ status: 200, msg: "You data has been saved!" });
          product_count++;
        }
      });
    }
  });
});

// get products of a specific owner from products table
app.post("/owner-products", (req, res) => {
  const details = req.body;
  product.find({
    $and: [
      { productOwner: details.productOwner },
    ],
  })
  .then((data) => {
    res.json({ status: 200, products: data});
  })
  .catch((error) => {
    console.log("error: ", error);
  });
});

// update product quantity
app.post("/update-quantity", (req, res) => {
  const { productId, productOwner, newQuantity } = req.body;

  product.updateOne(
    {
      $and: [
        { productId: productId },
        { productOwner: productOwner },
      ]
    },
    {
      $set: { productQuantity: newQuantity }
    },
    (err, result) => {
      if (result) {
        res.send({ status: 200, message: 'Product quantity updated!' })
      }
    }
  )
})

// buy product
app.post("/buy-product", (req, res) => {
  const { 
    productId,
    productImage,
    productName,
    productQuantity,
    productBrand,
    productDescription,
    productPrice,
    datePurchased,
    productOwner } = req.body;

  product.findOne(
    {
      productId: productId,
    },
    (err, result) => {
      if (result) {
        let query = { productId: productId };
        let updatedValue = {
          $set: {
            productQuantity: result.productQuantity - productQuantity,
          },
        };
        product.updateOne(query, updatedValue, function (err, result) {
          if(result) {
            const newPurchase = new purchase({
              productId,
              productImage,
              productName,
              productQuantity,
              productBrand,
              productDescription,
              productPrice,
              datePurchased,
              url: '',
              productOwner
            });

            newPurchase.save((error) => {
              if (error) {
                res.status(500).json({ msg: "Something went wrong!" });
              } else {
                res.json({ status: 200, msg: "You data has been saved!" });
              }
            });
          } else {
            throw err;
          }
        });
      }
    }
  );
});

// order history
app.post("/order-history", (req, res) => {
  const { productOwner } = req.body

  purchase.find({
    productOwner: productOwner
  }, (err, result) => {
    if(result) {
      res.send({ status: 200, products: result })
    } else {
      res.send({ status: 500, message: 'An error occurred' })
    }
  })
})

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password !== user.password) {
        res.send({ status: 403, message: "Password didn't match" });
      } else {
        res.send({ message: "Login Successfull", user: user });
      }
    } else {
      res.send({ status: 404, message: "User not registered" });
    }
  });
});

// Register
app.post("/register", (req, res) => {
  const { role, name, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ status: 209, message: "User already registerd" });
    } else {
      const user = new User({
        role,
        name,
        email,
        password,
      });
      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({
            status: 204,
            message: "Successfully Registered, Please login now.",
          });
        }
      });
    }
  });
});

app.listen(9002, () => {
  console.log("Database started at port 9002");
});
