let searchForm = document.querySelector('.search-form');

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');
    shoppingCart.classList.remove('active');
    logingForm.classList.remove('active');
}

let shoppingCart = document.querySelector('.shopping-cart');

document.querySelector('#cart-btn').onclick = () =>{
    shoppingCart.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    logingForm.classList.remove('active');
}

let logingForm = document.querySelector('.login-form');

document.querySelector('#login-btn').onclick = () =>{
    logingForm.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');
}

let navbar = document.querySelector('.navbar');

document.querySelector('#menu-btn').onclick = () =>{
    navbar.classList.toggle('active');
    searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');
    logingForm.classList.remove('active');
}

window.onscroll = () =>{
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
    shoppingCart.classList.remove('active');
    logingForm.classList.remove('active');
}



// swiper js start

var swiper = new Swiper(".product-slider", {
    loop: true,
    spaceBetween: 20,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    centeredSlides: true,

    breakpoints: {
      0: {
        slidesPerView: 1},
      768: {
        slidesPerView: 2,
      },
      1020: {
        slidesPerView: 3,
      },
    },
  });


  // review section start

  var swiper = new Swiper(".review-slider", {
    loop: true,
    spaceBetween: 20,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    centeredSlides: true,

    breakpoints: {
      0: {
        slidesPerView: 1},
      768: {
        slidesPerView: 2,
      },
      1020: {
        slidesPerView: 3,
      },
    },
  });

  // review section end

// swiper js End