// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Auth-Status überwachen
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Benutzer ist angemeldet
        console.log('Angemeldeter Benutzer:', user);
        
        // Benutzerinformationen anzeigen
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('welcomeMessage').textContent = `Willkommen, ${user.email}!`;
        
        // MFA-Status überprüfen
        firebase.auth().multiFactor(user).getEnrolledFactors()
          .then((enrolledFactors) => {
            if (enrolledFactors.length > 0) {
              // MFA ist aktiviert
              document.getElementById('mfaStatus').textContent = 'Ja';
              document.getElementById('mfaNotEnabled').classList.add('d-none');
              document.getElementById('mfaEnabled').classList.remove('d-none');
              
              // Telefonnummer anzeigen (maskiert)
              const phoneNumber = enrolledFactors[0].displayName || enrolledFactors[0].phoneNumber;
              document.getElementById('mfaPhoneNumber').textContent = phoneNumber;
            } else {
              // MFA ist nicht aktiviert
              document.getElementById('mfaStatus').textContent = 'Nein';
            }
          })
          .catch((error) => {
            console.error('Fehler beim Abrufen der MFA-Faktoren:', error);
          });
      } else {
        // Benutzer ist nicht angemeldet, zur Anmeldeseite weiterleiten
        window.location.href = '/login';
      }
    });
    
    // Abmelden-Button
    document.getElementById('logoutBtn').addEventListener('click', function() {
      firebase.auth().signOut()
        .then(() => {
          // Erfolgreich abgemeldet
          window.location.href = '/';
        })
        .catch((error) => {
          console.error('Abmeldefehler:', error);
          alert('Abmeldefehler: ' + error.message);
        });
    });
    
    // MFA-Einrichtung-Button
    document.getElementById('setupMfaBtn').addEventListener('click', function() {
      window.location.href = '/setup-mfa';
    });
  });