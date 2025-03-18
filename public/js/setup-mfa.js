// public/js/setup-mfa.js

document.addEventListener('DOMContentLoaded', function() {
  // Variablen für die MFA-Einrichtung
  let currentUser = null;
  let recaptchaVerifier = null;
  let verificationId = null;
  let userDisplayName = null;
  
  // Füge einen Email-Verifikationsbereich zur HTML hinzu
  const emailVerificationSection = `
    <div id="emailVerificationSection">
      <div class="alert alert-warning">
        <h4>E-Mail-Bestätigung erforderlich</h4>
        <p>Bevor Sie MFA einrichten können, müssen Sie Ihre E-Mail-Adresse bestätigen.</p>
        <p>Eine Bestätigungs-E-Mail wurde an <strong id="userEmail"></strong> gesendet.</p>
        <p>Nach der Bestätigung laden Sie diese Seite neu.</p>
      </div>
      <div class="d-grid">
        <button id="resendVerificationEmailBtn" class="btn btn-primary">Bestätigungs-E-Mail erneut senden</button>
      </div>
    </div>
  `;
  
  // HTML nach dem authSection einfügen
  document.querySelector('#authSection').insertAdjacentHTML('afterend', emailVerificationSection);
  document.getElementById('emailVerificationSection').classList.add('d-none');
  
  // Auth-Status überwachen
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Benutzer ist angemeldet
      currentUser = user;
      console.log('Angemeldeter Benutzer:', user);
      document.getElementById('userEmail').textContent = user.email;
    } else {
      // Benutzer ist nicht angemeldet, zur Anmeldeseite weiterleiten
      window.location.href = '/login';
    }
  });
  
  // Erneute Authentifizierung
  document.getElementById('reauthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
    
    currentUser.reauthenticateWithCredential(credential)
      .then(() => {
        // Erfolgreich erneut authentifiziert
        console.log('Erneut authentifiziert');
        
        // Überprüfen, ob die E-Mail verifiziert ist
        if (!currentUser.emailVerified) {
          // E-Mail ist nicht verifiziert, Verifikation erforderlich
          console.log('E-Mail nicht verifiziert, sende Verifikations-E-Mail');
          
          // Verifikations-E-Mail senden
          currentUser.sendEmailVerification().then(() => {
            console.log('Verifikations-E-Mail gesendet');
            
            // E-Mail-Verifikationsbereich anzeigen
            document.getElementById('authSection').classList.add('d-none');
            document.getElementById('emailVerificationSection').classList.remove('d-none');
          });
        } else {
          // E-Mail ist bereits verifiziert, zum Setup-Bereich wechseln
          document.getElementById('authSection').classList.add('d-none');
          document.getElementById('setupSection').classList.remove('d-none');
          
          // reCAPTCHA initialisieren
          recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'normal',
            'callback': function(response) {
              // reCAPTCHA wurde gelöst
              console.log('reCAPTCHA wurde gelöst');
            }
          });
          recaptchaVerifier.render();
        }
      })
      .catch((error) => {
        console.error('Fehler bei der erneuten Authentifizierung:', error);
        alert('Fehler bei der erneuten Authentifizierung: ' + error.message);
      });
  });
  
  // Verifikations-E-Mail erneut senden
  document.getElementById('resendVerificationEmailBtn').addEventListener('click', function() {
    currentUser.sendEmailVerification().then(() => {
      alert('Verifikations-E-Mail wurde erneut gesendet.');
    }).catch((error) => {
      console.error('Fehler beim Senden der Verifikations-E-Mail:', error);
      alert('Fehler beim Senden der Verifikations-E-Mail: ' + error.message);
    });
  });
  
  // MFA-Setup-Formular
  document.getElementById('setupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Zuerst überprüfen, ob E-Mail verifiziert ist
    if (!currentUser.emailVerified) {
      alert('Bitte verifizieren Sie zuerst Ihre E-Mail-Adresse, bevor Sie MFA einrichten.');
      return;
    }
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    userDisplayName = document.getElementById('displayName').value;
    
    // MFA-Sitzung starten
    currentUser.multiFactor.getSession()
      .then((multiFactorSession) => {
        // Telefonnummer-Informationen
        const phoneInfoOptions = {
          phoneNumber: phoneNumber,
          session: multiFactorSession
        };
        
        // SMS-Code senden
        const phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
        return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      })
      .then((vId) => {
        // Verifikations-ID speichern
        verificationId = vId;
        
        // Zum Verifikations-Bereich wechseln
        document.getElementById('setupSection').classList.add('d-none');
        document.getElementById('verificationSection').classList.remove('d-none');
      })
      .catch((error) => {
        console.error('Fehler beim Senden der SMS:', error);
        alert('Fehler beim Senden der SMS: ' + error.message);
        
        // reCAPTCHA zurücksetzen
        recaptchaVerifier.clear();
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          'size': 'normal'
        });
        recaptchaVerifier.render();
      });
  });
  
  // SMS-Code-Verifikation
  document.getElementById('verificationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const verificationCode = document.getElementById('verificationCode').value;
    
    // SMS-Code verifizieren
    const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
    
    // MFA-Registrierung abschließen
    currentUser.multiFactor.enroll(multiFactorAssertion, userDisplayName)
      .then(() => {
        // MFA erfolgreich eingerichtet
        console.log('MFA erfolgreich eingerichtet');
        
        // Zum Erfolgs-Bereich wechseln
        document.getElementById('verificationSection').classList.add('d-none');
        document.getElementById('successSection').classList.remove('d-none');
      })
      .catch((error) => {
        console.error('Fehler bei der MFA-Einrichtung:', error);
        alert('Fehler bei der MFA-Einrichtung: ' + error.message);
      });
  });
});