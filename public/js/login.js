// const { default: axios } = require("axios");

const stripe = Stripe("pk_test_51NjB3uLX3Z2uEP5cz60rIiLkYig7jzQ2fbg4jR7aJdMU5rsv5Ou9yEj0OPwmNVFvYSinWs49nXxedPjf9iuc4WSY00fndjbHW1");
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};
const login = async (email, password) => {

    // const response = await fetch('http://localhost:3000/api/v1/users/logIn', {
    //     method: 'POST',
    //     body: {
    //         "email": email,
    //         "password": password
    //     }
    // })
    axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/logIn',
        data: {
            email,
            password
        }
    }).then(response => {
        showAlert("success", "Logged in succesfully");
        window.setTimeout(() => {
            location.assign('/')
        }, 1500)
    }).catch(err => showAlert("error", err.response.data.message));


}
const signup = (email, password, username, confirmPassword) => {

    // const response = await fetch('http://localhost:3000/api/v1/users/logIn', {
    //     method: 'POST',
    //     body: {
    //         "email": email,
    //         "password": password
    //     }
    // })
    axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/signUp',
        data: {
            email,
            name: username,
            password,
            confirmPassword
        }
    }).then(response => {
        showAlert("success", "Signed in succesfully");
        window.setTimeout(() => {
            location.assign('/')
        }, 1500)
    }).catch(err => showAlert("error", err.response.data.message));
    console.log(email);

}

const updateMe = (data) => {
    axios({
        method: 'PATCH',
        url: 'http://localhost:3000/api/v1/users/updateMe',
        data
    }).then(res => {
        showAlert("success", "Data updated!");
        // window.setTimeout(() => {
        //     location.assign('/me')
        // }, 2500)
    }).catch((err) => {
        showAlert("error", "Try again later !");
        window.setTimeout(() => {
            location.assign('/me')
        }, 2500)
    })
}
const updatePassword = () => {
    axios({
        method: 'PATCH',
        url: 'http://localhost:3000/api/v1/users/updatePassword',
        data: {
            currentPassword: document.getElementById('password-current').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('password-confirm').value,
        }
    }).then(response => {
        showAlert("success", "Password updated!");
        window.setTimeout(() => {
            location.assign('/me')
        }, 2500)
    }).catch(err => { console.log(err); showAlert("error", "Error try again later") });
}
if (document.querySelector('.form--login'))
    document.querySelector('.form--login').addEventListener('submit', async el => {
        el.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        await login(email, password);
    })

if (document.querySelector('.form--signUp'))
    document.querySelector('.form--signUp').addEventListener('submit', async el => {
        el.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        console.log({ email, password, username, confirmPassword });

        signup(email, password, username, confirmPassword);
    })
if (document.querySelector('.nav__el--logout'))
    document.querySelector('.nav__el--logout').addEventListener('click', async () => {
        axios({
            method: 'GET',
            url: 'http://localhost:3000/api/v1/users/LogOut',
        }).then(response => {
            console.log(response)
            showAlert("success", "Logged Out!");
            location.assign('/')
        }).catch(err => { console.log(err); showAlert("error", "Error try again later") });
    })

if (document.querySelector('.form-user-password')) {
    document.querySelector('.form-user-password').addEventListener('submit', (el) => {
        el.preventDefault()
        updatePassword();
    }
    )
}
if (document.querySelector('.form-user-data')) {
    document.querySelector('.form-user-data').addEventListener('submit', (el) => {
        el.preventDefault()
        const form = new FormData();
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])

        updateMe(form);
    })
}

if (document.getElementById('book-tour')) {
    document.getElementById('book-tour').addEventListener('click', async (e) => {
        e.target.textContent = "Processing ..."
        //1)get session id from stripe
        try {
            const session = await axios({
                method: 'GET',
                url: `http://localhost:3000/api/v1/bookings/checkout-session/${e.target.value}`
            });
            console.log(session);
            //2) create chgeckout page 
            await stripe.redirectToCheckout({
                sessionId: session.data.session.id
            })
        } catch (err) {
            console.log(err)
            showAlert('error', 'Try Again Later 😊!')
        }
    })
}