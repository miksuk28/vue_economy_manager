<template>
  <div class="section">

    <WarningModal message="cock" />

    <div v-if="viewCategoryModal" class="modal is-active">
      <div class="modal-background"></div>
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Add New Category
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            <input v-model="newCategory" class="input" type="text" placeholder="Category Name">
          </div>
        </div>
        <footer class="card-footer">
          <a @click="createCategory(this.newCategory)" class="card-footer-item">Save</a>
          <a @click="this.viewCategoryModal = false; this.newCategory = '';" class="card-footer-item has-text-danger">Cancel</a>
        </footer>
      </div>
    </div>

    
    <div class="container">

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Store</label>
            <div class="control">
              <input v-model="store" type="text" class="input">
            </div>
          </div>
        </div>

        <div class="column">
          <label class="label">Category</label>

          <div class="field has-addons">
            <div class="control">
                <button @click="this.viewCategoryModal = !this.viewCategoryModal" class="button is-info"><span class="fa fa-plus"></span></button>
            </div>
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select v-model="category">
                  <option value=""></option>
                  <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}</option>

                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Date</label>
        <div class="control is-expanded">
          <input v-model="date" min="1970-01-01" max="2022-09-11" type="date" class="input">
        </div>
      </div>


      <div class="field">
        <label class="label">Product</label>
        <div class="control">
          <input v-model="newProduct.item" required type="text" class="input">
        </div>
      </div>

      <div class="columns">

        <div class="column">
          <div class="field">
            <label class="label">Price (Kroner)</label>
            <div class="control">
              <input v-model="newProduct.price" min="0" type="number" class="input">
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label class="label">Quantity</label>
            <div class="control">
              <input v-model="newProduct.quantity" min="0" type="number" class="input">
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label class="label">Total</label>
            <div class="control">
              <input v-model="getTotal" disabled class="input">
            </div>
          </div>
        </div>

      </div>

      <button @click="addProducts" class="has-background-info button has-text-white is-fullwidth">Add Product{{ multipleOrNot }}</button>
    
      <div v-if="products.length > 0">
        <hr>

        <table v-for="(product, index) in products" :key="index" class="table is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ product.item }}</td>
              <td>{{ product.price }} kr</td>
              <td>{{ product.quantity }}</td>
              <td>{{ product.total }} kr</td>
              <td><span @click="deleteProduct(index)" style="cursor: pointer;" class="icon is-pulled-right"><i class="fa fa-times"></i></span></td>
            </tr>
          </tbody>
        </table>

        <button @click="saveReceipt" class="mt-3 has-background-primary has-text-white button is-fullwidth">Save Receipt</button>
      </div>

    </div>  
  </div>
  
</template>

<script>
import axios from "axios"
import WarningModal from "../components/WarningModal.vue"
//axios.defaults.headers.common['Content-Type'] = "application/json"


export default {
    name: "NewReceipt",
    componets: {
      WarningModal
    },

    data() {
      return {
        newProduct: {
          item: "",
          category: null,
          price: null,
          quantity: 1
        },
        store: null,
        products: [],
        categories: [],
        category: null,
        newCategory: "",
        viewCategoryModal: false,
        date: ""
      }
    },

    mounted() {
      this.getCategories()
    },

    methods: {
      saveReceipt() {
        const receiptObject = JSON.stringify(
          {
            store: this.store,
            category: this.category || "",
            products: this.products
          }
        )

        const headers = {
          "Content-Type": "application/json"
        }

        axios.post("/api/receipt", receiptObject, {headers: headers})
          .then((response) => {
            console.log(response.data)
            this.$router.push("/receipts")
          })
          .catch((error) => {
            console.log(error)
          })
      },

      getCategories() {
        axios.get("/api/categories")
          .then((response) => {
            this.categories = response.data
            console.log(this.categories)
          })
          .catch((error) => {
            console.log(error)
          })
      },

      createCategory(name) {
        if (name === "" || name === null) {
          return
        }

        axios.post(`/api/category/${name}`)
          .then((response) => {
            const catObject = {
              id: response.data.id,
              name: name
            }

            this.viewCategoryModal = false
            // insert into categories object
            this.categories.splice(0, 0, catObject)
            this.newCategory = ""
            this.category = name
          })
          .catch((error) => {
            console.log(error)
          })
      },

      resetNewProduct() {
        this.newProduct.item = "",
        this.newProduct.category = null,
        this.newProduct.price = null,
        this.newProduct.quantity = 1
      },

      hasProducts() {
        if (this.products.length !== 0) {
          return true
        }

        return false
      },

      checkCollision(name) {
        for (let i = 0; i < this.products.length; i++) {
          if (this.products[i].item === name) {
            return true
          } 
        }

        return false
      },

      deleteProduct(index) {
        this.products.splice(index, 1)
      },

      addProducts() {
        console.log(this.newProduct)
        console.log(this.newProduct.price)

        if (this.newProduct.product === "") {
          alert("Product name cannot be empty")
          return
        } else if (isNaN(this.newProduct.price) || this.newProduct.price === 0 || this.newProduct.price == null || this.newProduct.price === "") {
          alert("Price cannot be zero")
          return
        } else if (isNaN(this.newProduct.quantity) || this.newProduct.quantity === 0 || this.newProduct.quantity == null || this.newProduct.quantity === "") {
          alert("Quantity cannot be zero")
          return
        } else if (this.newProduct.price < 0 || this.newProduct.quantity < 0) {
          alert("Quantity or Price cannot be less than zero")
          return
        }

        if (this.checkCollision(this.newProduct.item)) {
          alert("Product with this name already exists in receipt")
          return 
        }

        const productObject = {
          category: this.newProduct.category,
          price:    this.newProduct.price,
          item:  this.newProduct.item,
          quantity: this.newProduct.quantity,
          total:    this.newProduct.quantity * this.newProduct.price
        }

        this.products.push(productObject)
        this.resetNewProduct()
        //console.log(this.products)
      }
    },

    computed: {
      getTotal() {
        var total = this.newProduct.item * this.newProduct.quantity
        return `${this.newProduct.price * this.newProduct.quantity} kr`
      },

      multipleOrNot() {
        if (this.newProduct.quantity === 1 || null || undefined) {
          return ""
        } else {
          return "s"
        }
      }
    }
}
</script>

