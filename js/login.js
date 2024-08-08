
// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (emailInput && passwordInput) {
                const email = emailInput.value;
                const password = passwordInput.value;

                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log('Login successful:', userCredential.user);
                        // Redirect to upload page on successful login
                        window.location.href = 'upload.html';
                    })
                    .catch((error) => {
                        console.error('Login error:', error.message);
                        // Display error message to the user
                        alert('Login failed. Please check your credentials and try again.');
                    });
            } else {
                console.error('Email or password input element not found.');
                alert('An error occurred. Please try again later.');
            }
        });
    } else {
        console.error('Login button element not found.');
        alert('An error occurred. Please try again later.');
    }
});
