// firebase-app.js — versión compatible con file:// (sin ES modules)
(function () {

  const SYNC_KEYS = [
    'tareas', 'tareasCategorias', 'eventos', 'eventosV2',
    'habitos', 'aguaTracker', 'habitosDetalle', 'notas',
    'pomodorosHoy', 'ordenTareas', 'avisosConfig', 'temaUI',
    'tareasHistorial', 'preferenciaLimpieza', 'autoAgendaPrefs'
  ];

  const firebaseConfig = {
    apiKey: "AIzaSyBkuodUnPxs4SYwjheuIiPFs4OawLSl8_I",
    authDomain: "app-tidlig.firebaseapp.com",
    projectId: "app-tidlig",
    storageBucket: "app-tidlig.firebasestorage.app",
    messagingSenderId: "193170378782",
    appId: "1:193170378782:web:f14ac74c8434864a6e9e0f"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db   = firebase.firestore();

  let currentUserId = null;
  let syncTimeout   = null;

  async function cargarDatosUsuario(uid) {
    try {
      const snap = await db.collection('usuarios').doc(uid).get();
      if (snap.exists) {
        const datos = snap.data();
        SYNC_KEYS.forEach(key => {
          if (datos[key] !== undefined) {
            localStorage.setItem(key,
              typeof datos[key] === 'string' ? datos[key] : JSON.stringify(datos[key]));
          }
        });
      }
    } catch (e) { console.warn('Error cargando datos:', e); }
  }

  async function sincronizarAFirestore() {
    if (!currentUserId) return;
    try {
      const datos = {};
      SYNC_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try { datos[key] = JSON.parse(val); } catch { datos[key] = val; }
        }
      });
      await db.collection('usuarios').doc(currentUserId).set(datos, { merge: true });
    } catch (e) { console.warn('Error sincronizando:', e); }
  }

  function programarSync() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(sincronizarAFirestore, 2000);
  }

  const _origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    _origSet(key, value);
    if (currentUserId && SYNC_KEYS.includes(key)) programarSync();
  };

  function mostrarError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  function traducirError(code) {
    const map = {
      'auth/invalid-email':        'El correo no es válido.',
      'auth/user-not-found':       'No existe una cuenta con ese correo.',
      'auth/wrong-password':       'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
      'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
      'auth/too-many-requests':    'Demasiados intentos. Espera unos minutos.',
      'auth/invalid-credential':   'Correo o contraseña incorrectos.',
    };
    return map[code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
  }

  function setLoading(btn, loading, textoNormal) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Un momento…' : textoNormal;
  }

  const loginScreen   = document.getElementById('login-screen');
  const appContent    = document.getElementById('app-content');
  const loginForm     = document.getElementById('login-form');
  const registerForm  = document.getElementById('register-form');
  const loginError    = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const cargando      = document.getElementById('login-cargando');

  document.getElementById('btn-mostrar-registro').addEventListener('click', () => {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'flex';
  });

  document.getElementById('btn-mostrar-login').addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display    = 'flex';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = loginForm.querySelector('button[type="submit"]');
    setLoading(btn, true, 'Entrar');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      mostrarError(loginError, traducirError(err.code));
      setLoading(btn, false, 'Entrar');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm  = document.getElementById('register-confirm').value;
    if (password !== confirm) {
      mostrarError(registerError, 'Las contraseñas no coinciden.');
      return;
    }
    const btn = registerForm.querySelector('button[type="submit"]');
    setLoading(btn, true, 'Crear cuenta');
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (err) {
      mostrarError(registerError, traducirError(err.code));
      setLoading(btn, false, 'Crear cuenta');
    }
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await sincronizarAFirestore();
    currentUserId = null;
    SYNC_KEYS.forEach(k => localStorage.removeItem(k));
    await auth.signOut();
  });

  // ── Cambiar contraseña ──
  const formCambiarPass = document.getElementById('form-cambiar-password');
  if (formCambiarPass) {
    formCambiarPass.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgEl        = document.getElementById('cuenta-pass-msg');
      const passActual   = document.getElementById('cuenta-pass-actual').value;
      const passNueva    = document.getElementById('cuenta-pass-nueva').value;
      const passConfirm  = document.getElementById('cuenta-pass-confirmar').value;
      const btn          = formCambiarPass.querySelector('button[type="submit"]');

      msgEl.style.display = 'none';
      msgEl.className = 'cuenta-msg';

      if (passNueva !== passConfirm) {
        msgEl.textContent = 'Las contraseñas nuevas no coinciden.';
        msgEl.classList.add('error');
        msgEl.style.display = 'block';
        return;
      }

      if (passNueva.length < 6) {
        msgEl.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
        msgEl.classList.add('error');
        msgEl.style.display = 'block';
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      btn.disabled = true;
      btn.textContent = 'Un momento…';

      try {
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, passActual);
        await user.reauthenticateWithCredential(cred);
        await user.updatePassword(passNueva);
        msgEl.textContent = '¡Contraseña cambiada correctamente!';
        msgEl.classList.add('exito');
        msgEl.style.display = 'block';
        formCambiarPass.reset();
      } catch (err) {
        const errMsg = (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
          ? 'La contraseña actual es incorrecta.'
          : traducirError(err.code);
        msgEl.textContent = errMsg;
        msgEl.classList.add('error');
        msgEl.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Cambiar contraseña';
      }
    });
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUserId = user.uid;
      const emailSpan = document.getElementById('user-email');
      if (emailSpan) emailSpan.textContent = user.email;
      const cuentaEmail = document.getElementById('cuenta-email');
      if (cuentaEmail) cuentaEmail.textContent = user.email;
      loginForm.style.display    = 'none';
      registerForm.style.display = 'none';
      if (cargando) cargando.style.display = 'flex';
      await cargarDatosUsuario(user.uid);

      // Mostrar app
      if (loginScreen) loginScreen.style.display = 'none';
      if (appContent)  appContent.style.display  = '';
      if (cargando)    cargando.style.display     = 'none';

      // Iniciar la app y aplicar tema guardado
      if (typeof window._iniciarApp === 'function') window._iniciarApp();
    } else {
      currentUserId = null;
      if (loginScreen) {
        loginScreen.style.display  = 'flex';
        loginForm.style.display    = 'flex';
        registerForm.style.display = 'none';
      }
      if (appContent) appContent.style.display = 'none';
    }
  });

})();
