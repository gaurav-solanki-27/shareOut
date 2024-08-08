# ShareOut

## Project Overview

This project enables citizens to store and share important documents such as mark sheets, PAN cards, passports, and other critical documents in digital format. The system ensures secure access and sharing, reducing the need for physical copies.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Platform**: Web

## Features
 **1. Register**
- User registration with email and password.
- Redirect to the login page upon successful registration.

**2. Login**

- Secure login for registered users.
- Redirect to the document upload page upon successful login.

**3. Document Management**

- **Upload**: Upload important documents in various formats.
- **Update/Delete**: Update or delete previously uploaded documents.
- **Share**: Share documents securely via Gmail, WhatsApp or SharOut Web.

## Installation

1. **Clone the Repository**:
     ```bash
        git clone https://github.com/gaurav-solanki-27/ShareOut.git
     ```
2. **update config file**:
    ```bash
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
    };//Replace your firebase configuration here.
    ```
3. **Firestore Database rules**:
    ```bash
        rules_version = '2';

            service cloud.firestore {
                match /databases/{database}/documents {
                    match /{document=**} {
                        allow read, write: if true;
                         }
                    }
                }
    ```    
4. **Navigate to the Project Directory**:
    ```bash
       cd ShareOut
    ```
5. **Open the index.html file in your web browser**:

        You can open the index.html file directly in your web browser by double-clicking it, or by serving the file using a local server like Live Server in VSCode.

## Firebase Setup
**1. Create Firebase Project**:
- Go to Firebase Console.
- Create a new project and name it (e.g., "ShareOut").

**2. Add Firebase to Your Web App**:
- Click on the Web icon (</>) in the Firebase Console to add Firebase to your web app.
- Copy the Firebase configuration code and paste it into js/config.js.

**3. Enable Firebase Services**:
- **Authentication**: Enable "Email/Password" under Authentication > Sign-in method.
- **Firestore Database**: Create a Firestore database in production mode.
- **Storage**: Set up Firebase Storage for document uploads.

**4. Initialize Firebase**:
- Initialize Firebase in js/config.js using the provided configuration.

## Contributing
- Contributions are welcome. Please fork the repository and create a pull request with your changes. Make sure to follow the coding standards and update the README.md file with any new features or changes.

## License

[MIT License](LICENSE.txt)