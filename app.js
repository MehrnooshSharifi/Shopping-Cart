const cartShop = document.querySelector(".fa-cart-plus");
const finalCart = document.querySelector(".final-add");
const confirmBtn = document.querySelector(".confirm-item");
const clearItem = document.querySelector(".clear-item");
const backDrop = document.querySelector(".backdrop");
const productsDOM = document.querySelector(".products");
const cartNum = document.querySelector(".cart-num");
const totalPrice = document.querySelector(".total-price");
const finalContent = document.querySelector(".final-content");
const clearFinalItems = document.querySelector(".clear-item");
const number=document.querySelector(".number");


cartShop.addEventListener("click", openFinalCart);
confirmBtn.addEventListener("click", confirmFinal);
clearItem.addEventListener("click", clearItems);

import { productsData } from "/products.js";
let finalItems = [];
let buttonsDOM = [];

// 1.get product
class Products {
  getproducts() {
    return productsData;
  }
}
// 2.display product
class UI {
  displayproducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product-info">
            <div class="image-container">
                <img class="product-image" src=${item.imageUrl} alt="">
            </div>
            <div class="product-detail">
                <p class="product-price">${item.price}</p>
                <p class="product-desc">${item.title}</p>
            </div>
            <button class="add-product btn" data-id=${item.id}>add to cart</button>
        </div>`;
      productsDOM.innerHTML = result;
    });
  }
  getAddProductBtns() {
    const addproductBtns = [...document.querySelectorAll(".add-product")];
    buttonsDOM = addproductBtns;
    addproductBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInFinalItems = find((p) => p.id === id);
      if (isInFinalItems) {
        btn.innerHTML = "In Box";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerHTML = "In Box";
        btn.disabled = true;
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        finalItems = [...finalItems, addedProduct];
        Storage.saveFinalItems(finalItems);
        this.setFinalItemsValue(finalItems);
        this.addFinalItems(addedProduct);
      });
    });
  }
  setFinalItemsValue(finalItems) {
    let tempCartNum = 0;
    const finaltatalPrice = finalItems.reduce((acc, curr) => {
      tempCartNum += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    totalPrice.innerHTML = `Total Prise : ${finaltatalPrice} $`;
    cartNum.innerHTML = tempCartNum;
  }
  addFinalItems(finalItems) {
    const div = document.createElement("div");
    div.classList.add("final-item");
    div.innerHTML = ` 
    <img src=${finalItems.imageUrl} alt="" class="image-item">
    <div class="item-info">
        <p class="item-title">${finalItems.title}</p>
        <p class="item-price">${finalItems.price}</p>
    </div>
    <div class="item-number">
        <span class="add-number"><i class="fa-solid fa-chevron-up" data-id=${finalItems.id}></i></span>
        <span class="number">${finalItems.quantity}</span>
        <span class="reduce-number"><i class="fa-solid fa-chevron-down" data-id=${finalItems.id}></i></span>
    </div>
    <span class="trash"><i class="fa-solid fa-trash" data-id=${finalItems.id}></i></span>`;
    finalContent.appendChild(div);
  }
  setupApp() {
    finalItems = Storage.getFinalItems();
    finalItems.forEach((finalItems) => this.addFinalItems(finalItems));
    this.setFinalItemsValue(finalItems);
  }
  finalItemLogic() {
    clearFinalItems.addEventListener("click", () => {
      this.clearFinalItems();
    });

    finalContent.addEventListener("click",(event)=>{
      if(event.target.classList.contains("fa-chevron-up")){
        const addQuantity = event.target;
        const id=addQuantity.dataset.id;
        const addedItem = finalItems.find((c) => c.id == id);
        addedItem.quantity++;
        // update storage
        Storage.saveFinalItems(finalItems);
        // update total price
        this.setFinalItemsValue(finalItems);
        // update item quantity :
        // console.log(addQuantity.nextElementSibling);
        addQuantity.parentElement.nextElementSibling.innerHTML = addedItem.quantity;
      }
      else if(event.target.classList.contains("fa-trash")){
        const removeItem = event.target;
        const id = removeItem.dataset.id;
        console.log(id);
        finalContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      else if (event.target.classList.contains("fa-chevron-down")){
        const subQuantity = event.target;
        const id = subQuantity.dataset.id;
        const substractedItem = finalItems.find((c) => c.id == id);

        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          finalContent.removeChild(subQuantity.parentElement.parentElement.parentElement);
          return;
        }

        substractedItem.quantity--;
        // update storage
        Storage.saveFinalItems(finalItems);
        // update total price
        this.setFinalItemsValue(finalItems);
        // update item quantity :
        console.log(subQuantity.nextElementSibling);
        subQuantity.parentElement.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearFinalItems() {
    finalItems.forEach((fItems) => {
      this.removeItem(fItems.id);
      // console.log(finalContent);
      while (finalContent.children.length) {
        finalContent.removeChild(finalContent.children[0]);
      }
    });
  }
  removeItem(id) {
    finalItems = finalItems.filter((fItems) => fItems.id != id);
    this.setFinalItemsValue(finalItems);
    Storage.saveFinalItems(finalItems);
    const button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `add to cart`;
  }
  getSingleButton(id) {
    // should be parseInt to get correct result
    return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
  }
}
// 3.storage product
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id == id);
  }
  static saveFinalItems(finalItems) {
    localStorage.setItem("finalItems", JSON.stringify(finalItems));
  }
  static getFinalItems() {
    return JSON.parse(localStorage.getItem("finalItems"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getproducts();
  const ui = new UI();
  ui.displayproducts(productsData);
  ui.getAddProductBtns();
  Storage.saveProducts(productsData);
  ui.setupApp();
  ui.finalItemLogic();
});

function openFinalCart() {
  finalCart.style.top = "10%";
  finalCart.style.opacity = "1";
  finalCart.style.display = "block";
  backDrop.style.display = "block";
}
function confirmFinal() {
  finalCart.style.top = "-100%";
  finalCart.style.display = "block";
  finalCart.style.opacity = "0";
  backDrop.style.display = "none";
}
function clearItems() {
  finalCart.style.top = "-100%";
  finalCart.style.display = "block";
  finalCart.style.opacity = "0";
  backDrop.style.display = "none";
}
