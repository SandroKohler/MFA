// public/js/login.js

document.addEventListener('DOMContentLoaded', function() {
    // reCAPTCHA-Verifizierer initialisieren
    const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': function(response) {
        // reCAPTCHA wurde gelöst
        console.log('reCAPTCHA wurde gelöst');
      }
    });
    
    // Resolver für MFA-Anmeldung
    let resolver = null;
    
    // Login-Formular absenden
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Mit E-Mail und Passwort anmelden
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Benutzer erfolgreich angemeldet (kein MFA erforderlich)
          console.log('Anmeldung erfolgreich:', userCredential.user);
          window.location.href = '/dashboard';
        })
        .catch((error) => {
          if (error.code === 'auth/multi-factor-auth-required') {
            // MFA ist erforderlich
            console.log('MFA ist erforderlich');
            
            // MFA-Resolver erhalten
            resolver = error.resolver;
            
            // MFA-Verifikationsbereich anzeigen
            document.getElementById('mfaVerification').classList.remove('d-none');
            
            // Telefonnummer anzeigen (maskiert)
            const phoneNumber = resolver.hints[0].phoneNumber;
            console.log('Verifikation für:', phoneNumber);
            
            // SMS-Code an Telefonnummer senden
            const phoneInfoOptions = {
              multiFactorHint: resolver.hints[0],
              session: resolver.session
            };
            
            const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
            phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
              .then((verificationId) => {
                // Verifikations-ID speichern
                window.verificationId = verificationId;
              })
              .catch((error) => {
                console.error('Fehler beim Senden der SMS:', error);
                alert('Fehler beim Senden der SMS: ' + error.message);
              });
          } else {
            // Anderer Fehler
            console.error('Anmeldefehler:', error);
            alert('Anmeldefehler: ' + error.message);
          }
        });
    });
    
    // MFA-Bestätigungsbutton
    document.getElementById('verifyMfaBtn').addEventListener('click', function() {
      const verificationCode = document.getElementById('verificationCode').value;
      
      if (!verificationCode) {
        alert('Bitte geben Sie den Bestätigungscode ein');
        return;
      }
      
      // SMS-Code verifizieren
      const cred = firebase.auth.PhoneAuthProvider.credential(window.verificationId, verificationCode);
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
      
      // Anmeldung mit MFA abschließen
      resolver.resolveSignIn(multiFactorAssertion)
        .then((userCredential) => {
          // Benutzer erfolgreich angemeldet
          console.log('MFA-Anmeldung erfolgreich:', userCredential.user);
          window.location.href = '/dashboard';
        })
        .catch((error) => {
          console.error('MFA-Fehler:', error);
          alert('MFA-Fehler: ' + error.message);
        });
    });
  });