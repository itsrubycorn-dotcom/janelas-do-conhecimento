/* Integração opcional com Firebase. Sem credenciais, o site permanece utilizável em modo demonstrativo.
   Os dados de nascimento NUNCA são enviados por esta integração. */
(function () {
  const cfg = window.JANELAS_CONFIG || {};
  let sdkPromise = null;
  let firebaseApp, auth, db, authApi, storeApi;
  const firebaseVersion = '10.13.2';
  function configured() {
    const f = cfg.firebase || {};
    return !!(f.apiKey && f.authDomain && f.projectId && f.appId && cfg.adminEmail);
  }
  async function initialize() {
    if (!configured()) return false;
    if (!sdkPromise) {
      sdkPromise = (async () => {
        const base = `https://www.gstatic.com/firebasejs/${firebaseVersion}/`;
        const [appApi, a, s] = await Promise.all([
          import(base + 'firebase-app.js'),
          import(base + 'firebase-auth.js'),
          import(base + 'firebase-firestore.js')
        ]);
        firebaseApp = appApi.getApps().length ? appApi.getApp() : appApi.initializeApp(cfg.firebase);
        authApi = a;
        storeApi = s;
        auth = a.getAuth(firebaseApp);
        db = s.getFirestore(firebaseApp);
        if (auth.authStateReady) await auth.authStateReady();
        return true;
      })().catch(err => { sdkPromise = null; throw err; });
    }
    return sdkPromise;
  }
  async function learnerAuth() {
    await initialize();
    if (auth.currentUser && !auth.currentUser.isAnonymous) await authApi.signOut(auth);
    if (!auth.currentUser) await authApi.signInAnonymously(auth);
    return auth.currentUser;
  }
  async function recordVisit(name) {
    if (!configured()) return null;
    const user = await learnerAuth();
    await storeApi.addDoc(storeApi.collection(db, 'visits'), {
      name: String(name).trim().slice(0,60), uid: user.uid, visitedAt: storeApi.serverTimestamp()
    });
    return true;
  }
  async function recordFeedback(name, rating, ease, comment) {
    if (!configured()) throw new Error('Ative o Firebase para registrar feedbacks reais.');
    const user = await learnerAuth();
    await storeApi.addDoc(storeApi.collection(db, 'feedbacks'), {
      name: String(name).trim().slice(0,60), uid: user.uid,
      rating: Number(rating), ease: String(ease), comment: String(comment).trim().slice(0,600),
      submittedAt: storeApi.serverTimestamp()
    });
    return true;
  }
  async function signInAdmin(email, password) {
    await initialize();
    if (String(email).trim().toLowerCase() !== String(cfg.adminEmail).trim().toLowerCase()) {
      throw new Error('Este e-mail não foi configurado como administrador.');
    }
    const result = await authApi.signInWithEmailAndPassword(auth, email, password);
    if (result.user.email.toLowerCase() !== String(cfg.adminEmail).trim().toLowerCase()) {
      await authApi.signOut(auth);
      throw new Error('Acesso administrativo não autorizado.');
    }
    return true;
  }
  async function getDashboard() {
    await initialize();
    if (!auth.currentUser || auth.currentUser.isAnonymous || auth.currentUser.email.toLowerCase() !== String(cfg.adminEmail).trim().toLowerCase()) {
      throw new Error('Faça login na conta de administração.');
    }
    const [v, f] = await Promise.all([
      storeApi.getDocs(storeApi.query(storeApi.collection(db,'visits'),storeApi.orderBy('visitedAt','desc'))),
      storeApi.getDocs(storeApi.query(storeApi.collection(db,'feedbacks'),storeApi.orderBy('submittedAt','desc')))
    ]);
    return {visits:v.docs.map(d=>({id:d.id,...d.data()})), feedbacks:f.docs.map(d=>({id:d.id,...d.data()}))};
  }
  async function signOutAdmin() {
    if (auth) await authApi.signOut(auth);
  }
  window.JANELAS_CLOUD = {configured, initialize, recordVisit, recordFeedback, signInAdmin, getDashboard, signOutAdmin};
})();
