
var a, b, c, d;
a = document.getElementById("one");
b = document.getElementById("two");
c = document.getElementById("three");
d = document.getElementById("four");
var r = document.getElementById("b1");
var s = document.getElementById("b2");

r.onclick = function ()
{
    d.classList.add("mover");
    a.classList.add("hide");
    a.classList.remove("show");
    c.classList.add("movel2");
    b.classList.add("hide");
    b.classList.remove("show");
    c.classList.remove("hide");
    c.classList.add("show");
    d.classList.remove("hide");
    d.classList.add("show");
}
s.onclick = function ()
{
    b.classList.add("mover2");
    c.classList.add("hide");
    c.classList.remove("show");
    a.classList.add("movel");
    d.classList.add("hide");
    d.classList.remove("show");
    b.classList.remove("hide");
    b.classList.add("show");
    a.classList.remove("hide");
    a.classList.add("show");
}

// Get DOM elements
const signInForm = document.querySelector('.login.show');
const signUpForm = document.querySelector('.login.hide');
const signInPrompt = document.querySelector('.prompt_sign_in');
const signUpPrompt = document.querySelector('.prompt_sign_up');

// // Function to show the Sign In form and hide the Sign Up form
// function showSignInForm() {
//     signInForm.classList.remove('hide');
//     signInForm.classList.add('show');
//     signUpForm.classList.remove('show');
//     signUpForm.classList.add('hide');
// }

// // Function to show the Sign Up form and hide the Sign In form
// function showSignUpForm() {
//     signInForm.classList.remove('show');
//     signInForm.classList.add('hide');
//     signUpForm.classList.remove('hide');
//     signUpForm.classList.add('show');
// }

// // Event listener to show the Sign In form
// signInPrompt.addEventListener('click', showSignInForm);

// // Event listener to show the Sign Up form
// signUpPrompt.addEventListener('click', showSignUpForm);

// Sign In functionality
// Sign In functionality
// Your existing code ...

// Sign In functionality
// Sign In functionality
const signInBtn = document.querySelector('.sign_in_btn');
signInBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const email = signInForm.querySelector('input[type="text"]').value;
    const password = signInForm.querySelector('input[type="password"]').value;

    // Send a POST request to your login endpoint
    fetch('https://assp-api.vercel.app/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else {
            console.log("FAiled")
        }
    })
    .then(data => {
        // Handle the response from the API
        if (data.success) {
            alert('Sign-in Successful');
            window.location.href = '/index.html';
        } else {
            alert('Sign-in failed: ' + data.message);
            console.log("FAiled")
        }
    })
    .catch(error => {
        alert('An error occurred while signing in: ' + error.message);
    });
});

// Sign Up functionality
const signUpBtn = document.querySelector('.sign_up_btn');
signUpBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const name = signUpForm.querySelectorAll('input')[0].value;
    const email = signUpForm.querySelectorAll('input')[1].value;
    const password = signUpForm.querySelectorAll('input')[2].value;
    const phoneNumber = signUpForm.querySelectorAll('input')[3].value;
    const address = signUpForm.querySelectorAll('input')[4].value;

    const userData = {
        Name: name,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        address: address
    };

    // Send a POST request to your registration endpoint
    fetch('https://assp-api.vercel.app/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        if (response.ok) {
            // Sign-up was successful
            alert('Sign-up Successful');
            window.location.href = '../Index.html'; // Change to the appropriate path
        } else {
            // Sign-up failed, handle error response
            return response.json().then(data => {
                alert('Sign-up failed: ' + data.message);
                window.location.href = '../Index.html'; // Change to the appropriate path

            });
        }
    })
    .catch(error => {
        alert('An error occurred while signing up: ' + error.message);
    });
});


