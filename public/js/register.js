document.addEventListener('DOMContentLoaded', function() {
    let currentUser = null;
  
    // Registrierungsformular
    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Passwörter überprüfen
      if (password !== confirmPassword) {
        alert('Die Passwörter stimmen nicht überein!');
        return;
      }
      
      // Benutzer registrieren
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          currentUser = userCredential.user;
          console.log('Benutzer erfolgreich registriert:', currentUser);
          
          // E-Mail-Verifikation senden
          return currentUser.sendEmailVerification();
        })
        .then(() => {
          console.log('Verifikations-E-Mail gesendet');
          
          // Registrierungsformular ausblenden
          document.getElementById('registerForm').classList.add('d-none');
          
          // E-Mail-Verifikationsbereich anzeigen
          document.getElementById('emailVerificationSection').classList.remove('d-none');
          document.getElementById('userEmail').textContent = currentUser.email;
        })
        .catch((error) => {
          console.error('Fehler bei der Registrierung:', error);
          alert('Registrierungsfehler: ' + error.message);
        });
    });
  
    // Verifikations-E-Mail erneut senden
    document.getElementById('resendVerificationEmailBtn').addEventListener('click', function() {
      if (currentUser) {
        currentUser.sendEmailVerification()
          .then(() => {
            alert('Verifikations-E-Mail wurde erneut gesendet.');
          })
          .catch((error) => {
            console.error('Fehler beim Senden der Verifikations-E-Mail:', error);
            alert('Fehler beim Senden der Verifikations-E-Mail: ' + error.message);
          });
      }
    });
  
    // Auth-Status überwachen
    firebase.auth().onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        // Wenn der Benutzer verifiziert ist, zum Login weiterleiten
        window.location.href = '/login';
      }
    });
  });