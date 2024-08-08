// Ensure Firebase is initialized
if (!firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}

const firestore = window.db;

document.getElementById('register-btn').addEventListener('click', async () => {
  const displayName = document.getElementById('displayName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Basic password validation
  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  try {
    // Create user with email and password
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await firestore.collection('users').doc(user.uid).set({
      displayName: displayName,
      email: email,
      role: 'user'
    });

    alert('Registration successful!');
    window.location.href = '/html/login.html'; // Redirect to login page
  } catch (error) {
    console.error('Error registering new user:', error);
    alert('Error registering new user. Please try again.');
  }
});

// Password strength feedback
const passwordInput = document.getElementById('password');
passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  const feedback = document.getElementById('password-feedback');
  let message = '';
  let color = '';

  if (value.length >= 6) {
    if (/[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)) {
      message = 'Strong password';
      color = 'green';
    } else if (/[A-Z]/.test(value) || /[a-z]/.test(value)) {
      message = 'Medium strength password';
      color = 'orange';
    } else {
      message = 'Weak password';
      color = 'red';
    }
  } else {
    message = 'Password too short';
    color = 'red';
  }

  feedback.textContent = message;
  feedback.style.color = color;
});
