// Wait for Firebase initialization
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('User authenticated:', user.uid, user.email);

        const fileUploadForm = document.getElementById('file-upload-form');
        const fileUploadInput = document.getElementById('file-upload');
        const fileListDiv = document.getElementById('file-list');
        const shareFileForm = document.getElementById('share-file-form');
        const fileSelect = document.getElementById('file-select');
        const recipientEmailInput = document.getElementById('recipient-shareOutId');
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeModal = document.getElementById('close-modal');
        const shareWhatsAppBtn = document.getElementById('shareWhatsApp');
        const shareGmailBtn = document.getElementById('shareGmail');
        const logoutBtn = document.querySelector(".logout-btn");

        const db = firebase.firestore();
        const storageRef = firebase.storage().ref();

        // Fetch uploaded and shared files immediately after user is authenticated
        fetchFiles();
        fetchSharedFiles();

        // Handle file upload
        fileUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = fileUploadInput.files[0];
            if (file) {
                const fileId = Date.now().toString();
                const fileRef = storageRef.child(`uploads/${fileId}_${file.name}`);
                fileRef.put(file)
                    .then(snapshot => fileRef.getDownloadURL())
                    .then(downloadURL => {
                        return db.collection('files').doc(fileId).set({
                            fileId: fileId,
                            fileName: file.name,
                            downloadURL: downloadURL,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            createdBy: user.uid
                        });
                    })
                    .then(() => {
                        fetchFiles();
                        fileUploadForm.reset();
                    })
                    .catch(error => {
                        console.error('File upload error:', error.message);
                        alert('File upload failed. Please try again.');
                    });
            } else {
                alert('Please select a file to upload.');
            }
        });

        // Fetch uploaded files
        function fetchFiles() {
            db.collection('files').where('createdBy', '==', user.uid)
                .get()
                .then(querySnapshot => {
                    fileListDiv.innerHTML = ''; // Clear previous images
                    fileSelect.innerHTML = ''; // Clear previous options
                    querySnapshot.forEach(doc => {
                        const fileData = doc.data();
                        const fileId = fileData.fileId;

                        // Display uploaded images
                        const imgContainer = document.createElement('div');
                        imgContainer.classList.add('img-container');

                        const imgElement = document.createElement('img');
                        imgElement.src = fileData.downloadURL;
                        imgElement.alt = fileData.fileName;
                        imgElement.classList.add('img-thumbnail');
                        imgElement.addEventListener('click', () => openModal(fileData.downloadURL));

                        // Add Update Button
                        const updateBtn = document.createElement('button');
                        updateBtn.textContent = 'Update';
                        updateBtn.classList.add('update-btn');
                        updateBtn.addEventListener('click', () => updateFile(fileId));

                        // Add Delete Button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.classList.add('delete-btn');
                        deleteBtn.addEventListener('click', () => deleteFile(fileId));

                        const buttonContainer = document.createElement('div');
                        buttonContainer.classList.add('button-container');
                        buttonContainer.appendChild(updateBtn);
                        buttonContainer.appendChild(deleteBtn);

                        imgContainer.appendChild(imgElement);
                        imgContainer.appendChild(buttonContainer);
                        fileListDiv.appendChild(imgContainer);

                        // Populate file select dropdown
                        const option = document.createElement('option');
                        option.value = fileId;
                        option.textContent = fileData.fileName;
                        fileSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching files:', error.message);
                });
        }

        // Fetch shared files
        function fetchSharedFiles() {
            db.collection('sharedFiles').where('recipientUid', '==', user.uid)
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        const sharedFile = doc.data();
                        db.collection('files').doc(sharedFile.fileId)
                            .get()
                            .then(fileDoc => {
                                if (fileDoc.exists) {
                                    const fileData = fileDoc.data();
                                    const imgContainer = document.createElement('div');
                                    imgContainer.classList.add('img-container');

                                    const imgElement = document.createElement('img');
                                    imgElement.src = fileData.downloadURL;
                                    imgElement.alt = fileData.fileName;
                                    imgElement.classList.add('img-thumbnail');
                                    imgElement.addEventListener('click', () => openModal(fileData.downloadURL));

                                    imgContainer.appendChild(imgElement);
                                    fileListDiv.appendChild(imgContainer);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching shared file details:', error.message);
                            });
                    });
                })
                .catch(error => {
                    console.error('Error fetching shared files:', error.message);
                });
        }

        // Open modal to view image
        function openModal(imageUrl) {
            modal.style.display = 'block';
            modalImage.src = imageUrl;
        }

        // Close modal when the close button is clicked
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside the image
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Handle file sharing
        shareFileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileId = fileSelect.value;
            const recipientEmail = recipientEmailInput.value;

            db.collection('users').where('email', '==', recipientEmail).get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        alert('Recipient email not found.');
                        return;
                    }

                    const recipientUid = querySnapshot.docs[0].id;
                    return db.collection('sharedFiles').add({
                        fileId: fileId,
                        senderUid: user.uid,
                        recipientUid: recipientUid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    alert('File shared successfully.');
                    shareFileForm.reset();
                })
                .catch(error => {
                    console.error('File sharing error:', error.message);
                    alert('File sharing failed. Please try again.');
                });
        });

        // Handle WhatsApp sharing
        shareWhatsAppBtn.addEventListener('click', () => {
            const fileId = fileSelect.value;
            db.collection('files').doc(fileId).get()
                .then(fileDoc => {
                    if (fileDoc.exists) {
                        const fileData = fileDoc.data();
                        const downloadURL = fileData.downloadURL;
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this file: ' + downloadURL)}`;
                        window.open(whatsappUrl, '_blank');
                    } else {
                        alert('File not found.');
                    }
                })
                .catch(error => {
                    console.error('WhatsApp sharing error:', error.message);
                });
        });

        // Handle Gmail sharing
        shareGmailBtn.addEventListener('click', () => {
            const fileId = fileSelect.value;
            db.collection('files').doc(fileId).get()
                .then(fileDoc => {
                    if (fileDoc.exists) {
                        const fileData = fileDoc.data();
                        const downloadURL = fileData.downloadURL;
                        const emailSubject = 'Check out this file';
                        const emailBody = `I wanted to share this file with you: ${downloadURL}`;
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                        window.open(gmailUrl, '_blank');
                    } else {
                        alert('File not found.');
                    }
                })
                .catch(error => {
                    console.error('Gmail sharing error:', error.message);
                });
        });

        // Handle file update
        function updateFile(fileId) {
            // Create an invisible file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';

            // Trigger the file input click event to open the file manager
            fileInput.click();

            // Listen for file selection
            fileInput.addEventListener('change', (event) => {
                const newFile = event.target.files[0];
                if (newFile) {
                    const fileRef = storageRef.child(`uploads/${fileId}_${newFile.name}`);
                    fileRef.put(newFile)
                        .then(snapshot => fileRef.getDownloadURL())
                        .then(downloadURL => {
                            return db.collection('files').doc(fileId).update({
                                fileName: newFile.name,
                                downloadURL: downloadURL,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            });
                        })
                        .then(() => {
                            fetchFiles();
                            alert('File updated successfully.');
                        })
                        .catch(error => {
                            console.error('File update error:', error.message);
                            alert('File update failed. Please try again.');
                        });
                } else {
                    alert('No file selected for update.');
                }
            });
        }

        // Handle file deletion
        function deleteFile(fileId) {
            if (confirm('Are you sure you want to delete this file?')) {
                db.collection('files').doc(fileId).get()
                    .then(doc => {
                        if (doc.exists) {
                            const fileData = doc.data();
                            const fileRef = storageRef.child(`uploads/${fileId}_${fileData.fileName}`);
                            return fileRef.delete();
                        } else {
                            throw new Error('File not found in database.');
                        }
                    })
                    .then(() => db.collection('files').doc(fileId).delete())
                    .then(() => {
                        fetchFiles();
                        alert('File deleted successfully.');
                    })
                    .catch(error => {
                        console.error('File deletion error:', error.message);
                        alert('File deletion failed. Please try again.');
                    });
            }
        }

        // Handle logout
        logoutBtn.addEventListener("click", () => {
            firebase.auth().signOut().then(() => {
                window.location.replace("login.html");
            }).catch(error => {
                console.error('Logout error:', error.message);
                alert('Logout failed. Please try again.');
            });
        });

    } else {
        console.log('No user signed in');
    }
});
