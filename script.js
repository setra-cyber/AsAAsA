
document.addEventListener("DOMContentLoaded", () => {
  // =====================================
// FIREBASE
// =====================================

if (typeof firebase === "undefined") {
  console.error("Firebase SDK tsy voaloatra.");
  alert("Erreur : Firebase tsy voaloatra. Vérifiez index.html.");
  return;
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();




  // =====================================
  // 1. ELEMENTS HTML
  // =====================================

  const page001 = document.getElementById("page001");
  const page002 = document.getElementById("page002");
  const page003 = document.getElementById("page003");
  const page004 = document.getElementById("page004");
  const page005 = document.getElementById("page005");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const loginContact = document.getElementById("loginContact");
  const loginPassword = document.getElementById("loginPassword");
  const loginMessage = document.getElementById("loginMessage");

  const fullName = document.getElementById("fullName");
  const registerContact = document.getElementById("registerContact");
  const birthDate = document.getElementById("birthDate");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const registerMessage = document.getElementById("registerMessage");

  const welcomeName = document.getElementById("welcomeName");
  const photoInput = document.getElementById("photoInput");
  const choosePhoto = document.getElementById("choosePhoto");
  const profilePhoto = document.getElementById("profilePhoto");

  const enterApp = document.getElementById("enterApp");
  const openRegister = document.getElementById("openRegister");
  const backToLogin = document.getElementById("backToLogin");


// =====================================
// MENU BURGER
// =====================================

const menuButtonRegister = document.getElementById("menuButtonRegister");
const menuButtonProfile = document.getElementById("menuButtonProfile");

const menuRegister = document.getElementById("menuRegister");
const menuProfile = document.getElementById("menuProfile");

function closeMenus() {
  menuRegister?.classList.add("hidden");
  menuProfile?.classList.add("hidden");
}

menuButtonRegister?.addEventListener("click", event => {
  event.stopPropagation();

  menuProfile?.classList.add("hidden");
  menuRegister?.classList.toggle("hidden");
});

menuButtonProfile?.addEventListener("click", event => {
  event.stopPropagation();

  menuRegister?.classList.add("hidden");
  menuProfile?.classList.toggle("hidden");
});

document.getElementById("headerProfileButton")
  ?.addEventListener("click", displayProfile);

document.getElementById("headerProfileButtonPage4")
  ?.addEventListener("click", displayProfile);

// Safidy ao amin'ny menu

document.querySelectorAll("[data-menu-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.menuAction;

    closeMenus();

    if (action === "profile") {
      if (getProfile()) {
        displayProfile();
      } else {
        showPage(page002);
      }
    }

    if (action === "salary") {
      alert("Calcul salaire brut : fonctionnalité en préparation.");
    }

    if (action === "logout") {
      saveSession(false);
      loginForm.reset();
      showMessage(loginMessage, "");
      showPage(page002);
    }
  });
});

// Manidy ny menu rehefa mikitika ivelany

document.addEventListener("click", event => {
  if (
    !event.target.closest("#menuRegister") &&
    !event.target.closest("#menuProfile") &&
    !event.target.closest("#menuButtonRegister") &&
    !event.target.closest("#menuButtonProfile")
  ) {
    closeMenus();
  }
});


  // =====================================
  // 2. LOCALSTORAGE
  // =====================================

  const PROFILE_KEY = "asa02Profile";
  const SESSION_KEY = "asa02Session";

  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
    } catch {
      return null;
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY) === "true";
  }

  function saveSession(value) {
    localStorage.setItem(SESSION_KEY, String(value));
  }

  // =====================================
// FIRESTORE : PROFIL
// =====================================

async function saveCloudProfile(profile) {
  const user = auth.currentUser;
  if (!user) return;

  const cloudProfile = {
    name: profile.fullName || "",
    birth: profile.birthDate || "",
    email: user.email || "",
    photo: profile.photo || "",
    updatedAt: new Date().toISOString()
  };

  await db.collection("users")
    .doc(user.uid)
    .set(cloudProfile, { merge: true });
}

async function loadCloudProfile(user) {
  const doc = await db.collection("users")
    .doc(user.uid)
    .get();

  let profile;

  if (doc.exists) {
    const data = doc.data();

    profile = {
      fullName: data.name || "",
      contact: data.email || user.email || "",
      birthDate: data.birth || "",
      photo: data.photo || ""
    };
  } else {
    const localProfile = getProfile();

    profile = localProfile
      ? {
          fullName: localProfile.fullName || "",
          contact: user.email || "",
          birthDate: localProfile.birthDate || "",
          photo: localProfile.photo || ""
        }
      : {
          fullName: user.displayName || "",
          contact: user.email || "",
          birthDate: "",
          photo: ""
        };

    await saveCloudProfile(profile);
  }

  // Tsy tehirizina ao LocalStorage intsony ny mot de passe.
  saveProfile(profile);

  return profile;
}

  // =====================================
  // 3. NAVIGATION
  // =====================================

  function showPage(page) {
  [page001, page002, page003, page004, page005]
    .filter(Boolean)
    .forEach(element => element.classList.add("hidden"));

  page?.classList.remove("hidden");
}

  function showMessage(element, message, error = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = error ? "#dc3545" : "#514900";
  }

  
  // =====================================
  // 4. AFFICHAGE DU PROFIL
  // =====================================

  function displayProfile() {
    const profile = getProfile();

    if (!profile) {
      showPage(page002);
      return;
    }

    welcomeName.textContent = profile.fullName;

    const headerPhoto = document.getElementById("headerProfilePhoto");
    const headerPhotoPage4 = document.getElementById("headerProfilePhotoPage4");

    if (profile.photo) {
      profilePhoto.src = profile.photo;
      profilePhoto.style.display = "block";
      choosePhoto.classList.add("has-photo");

      if (headerPhoto) headerPhoto.src = profile.photo;
      if (headerPhotoPage4) headerPhotoPage4.src = profile.photo;

    } else {
      profilePhoto.removeAttribute("src");
      profilePhoto.style.display = "none";
      choosePhoto.classList.remove("has-photo");

      if (headerPhoto) headerPhoto.removeAttribute("src");
      if (headerPhotoPage4) headerPhotoPage4.removeAttribute("src");
    }

    showPage(page004);
  }


  // =====================================
  // 5. OUVRIR INSCRIPTION
  // =====================================

  openRegister.addEventListener("click", event => {
    event.preventDefault();
    showPage(page003);
  });

  backToLogin.addEventListener("click", event => {
    event.preventDefault();
    showPage(page002);
  });

  // =====================================
  // 6. INSCRIPTION
  // =====================================
  // =====================================
// 6. INSCRIPTION FIREBASE
// =====================================

registerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const name = fullName.value.trim();
  const contact = registerContact.value.trim().toLowerCase();
  const date = birthDate.value;
  const password = registerPassword.value;
  const confirmation = confirmPassword.value;

  if (!name || !contact || !date || !password || !confirmation) {
    showMessage(registerMessage, "Veuillez remplir tous les champs.", true);
    return;
  }

  if (!contact.includes("@")) {
    showMessage(
      registerMessage,
      "Veuillez utiliser une adresse e-mail pour cette inscription.",
      true
    );
    return;
  }

  if (password.length < 6) {
    showMessage(registerMessage, "Minimum 6 caractères pour le mot de passe.", true);
    return;
  }

  if (password !== confirmation) {
    showMessage(registerMessage, "Les mots de passe ne correspondent pas.", true);
    return;
  }

  if (auth.currentUser || getProfile()) {
    showMessage(registerMessage, "Un compte existe déjà sur cet appareil.", true);
    return;
  }

  try {
    const credential = await auth.createUserWithEmailAndPassword(
      contact,
      password
    );

    const profile = {
      fullName: name,
      contact: credential.user.email,
      birthDate: date,
      photo: ""
    };

    saveProfile(profile);

    await saveCloudProfile(profile);

    saveSession(true);

    registerForm.reset();

    displayProfile();

  } catch (error) {
    console.error("Erreur inscription Firebase :", error);

    const messages = {
      "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/weak-password": "Mot de passe trop faible.",
      "auth/network-request-failed": "Problème de connexion Internet."
    };

    showMessage(
      registerMessage,
      messages[error.code] || "Erreur lors de l'inscription.",
      true
    );
  }
});

  // =====================================
// 7. CONNEXION FIREBASE
// =====================================

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const contact = loginContact.value.trim().toLowerCase();
  const password = loginPassword.value;

  if (!contact || !password) {
    showMessage(loginMessage, "Veuillez remplir tous les champs.", true);
    return;
  }

  if (!contact.includes("@")) {
    showMessage(
      loginMessage,
      "Veuillez utiliser votre adresse e-mail pour vous connecter.",
      true
    );
    return;
  }

  try {
    const credential = await auth.signInWithEmailAndPassword(
      contact,
      password
    );

    await loadCloudProfile(credential.user);

    saveSession(true);

    loginForm.reset();

    displayProfile();

  } catch (error) {
    console.error("Erreur connexion Firebase :", error);

    const messages = {
      "auth/user-not-found": "Aucun compte trouvé.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
      "auth/invalid-email": "Adresse e-mail invalide.",
      "auth/network-request-failed": "Problème de connexion Internet."
    };

    showMessage(
      loginMessage,
      messages[error.code] || "Connexion impossible.",
      true
    );
  }
});

  
 // =====================================
 // 8. PHOTO DE PROFIL AVEC COMPRESSION
 // =====================================

choosePhoto.addEventListener("click", () => {
  photoInput.click();
});

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Veuillez choisir une image valide.");
    photoInput.value = "";
    return;
  }

  try {
    const compressedPhoto = await compressImage(file);

    const profile = getProfile();

    if (!profile) return;

    profile.photo = compressedPhoto;
    saveProfile(profile);

    displayProfile();

    showMessage(
      document.getElementById("profileMessage"),
      "Photo mise à jour avec succès."
    );

  } catch (error) {
    console.error(error);
    alert("Impossible de traiter cette image.");
  }

  photoInput.value = "";
});

// Compression automatique de l'image

function compressImage(file) {
  return new Promise((resolve, reject) => {

    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.src = reader.result;
    };

    reader.onerror = reject;

    image.onload = () => {

      const canvas = document.createElement("canvas");

      const maxSize = 500;

      let width = image.width;
      let height = image.height;

      if (width > height && width > maxSize) {
        height = Math.round(height * maxSize / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round(width * maxSize / height);
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      context.drawImage(image, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.75);

      resolve(compressed);
    };

    image.onerror = reject;

    reader.readAsDataURL(file);

  });
}


  // =====================================
  // 9. BOUTON ENTRER
  // =====================================

  
enterApp?.addEventListener("click", async () => {
  if (!getSession()) {
    showPage(page002);
    return;
  }

  try {
    if (auth.currentUser) {
      await syncPeriodsWithCloud();
    }
  } catch (error) {
    console.error("Erreur synchronisation :", error);

    alert(
      "Synchronisation cloud impossible pour le moment. " +
      "Vos données locales sont conservées."
    );
  }

  showWorkPage();
});







  // RÉINITIALISER LE COMPTE DE TEST

  const resetTestAccount = document.getElementById("resetTestAccount");

  resetTestAccount?.addEventListener("click", () => {
    const confirmation = confirm(
      "Voulez-vous vraiment supprimer le compte de test sur cet appareil ?"
    );

    if (!confirmation) return;

    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SESSION_KEY);

    loginForm.reset();
    registerForm.reset();

    showMessage(loginMessage, "");
    showMessage(registerMessage, "");

    showPage(page003);

    alert("Le compte de test a été réinitialisé.");
  });




  // =====================================
  // 10. ETAT INITIAL
  // =====================================

 console.log("AsA 02 JavaScript chargé");

showPage(page001);

setTimeout(() => {
  console.log("Fin du splash screen");

  if (getSession() && getProfile()) {
    displayProfile();
  } else {
    saveSession(false);
    showPage(page002);
  }
}, 3000);


// ============================================
// ASA 02 - PAGE 005 : GESTION DU TRAVAIL
// ============================================

const PERIODS_KEY = "asa02WorkPeriods";

const workSector = document.getElementById("workSector");
const workCategory = document.getElementById("workCategory");
const baseSalary = document.getElementById("baseSalary");
const monthlyHours = document.getElementById("monthlyHours");
const weeklyHours = document.getElementById("weeklyHours");
const dailyHours = document.getElementById("dailyHours");
const periodStart = document.getElementById("periodStart");

const nightWorkType = document.getElementById("nightWorkType");
const majorationMode = document.getElementById("majorationMode");

const overtimeRateFirst = document.getElementById("overtimeRateFirst");
const overtimeRateNext = document.getElementById("overtimeRateNext");
const nightRate = document.getElementById("nightRate");

const newPeriodForm = document.getElementById("newPeriodForm");
const activePeriod = document.getElementById("activePeriod");
const workTableBody = document.getElementById("workTableBody");
const periodHistory = document.getElementById("periodHistory");

const startPeriodButton = document.getElementById("startPeriod");
const addWorkLineButton = document.getElementById("addWorkLine");
const closePeriodButton = document.getElementById("closePeriod");
const downloadReportButton = document.getElementById("downloadReport");
const deleteAllHistoryButton = document.getElementById("deleteAllHistory");
const backProfileButton = document.getElementById("backProfile");

let currentPeriod = null;

// --------------------------------------------
// OUTILS
// --------------------------------------------


function readPeriods() {
  try {
    const data = JSON.parse(localStorage.getItem(PERIODS_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function savePeriods(periods) {
  localStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
}

// Mitahiry période ao amin'ny Firestore
async function savePeriodToCloud(period) {
  const user = auth.currentUser;

  if (!user || !period || !period.id) return;

  await db.collection("users")
    .doc(user.uid)
    .collection("periods")
    .doc(period.id)
    .set(period, { merge: true });
}

// Mitahiry période ao amin'ny LocalStorage sy Firestore
function saveCurrentPeriod() {
  if (!currentPeriod) return;

  currentPeriod.updatedAt = new Date().toISOString();

  const periods = readPeriods();
  const index = periods.findIndex(p => p.id === currentPeriod.id);

  if (index === -1) {
    periods.push(currentPeriod);
  } else {
    periods[index] = currentPeriod;
  }

  // Tehirizina aloha eto an-toerana
  savePeriods(periods);

  // Alefa any amin'ny Firestore raha misy connexion
  if (auth.currentUser) {
    savePeriodToCloud(currentPeriod).catch(error => {
      console.error("Erreur sauvegarde cloud :", error);
    });
  }
}

// Synchronisation LocalStorage <-> Firestore
async function syncPeriodsWithCloud() {
  const user = auth.currentUser;

  if (!user) {
    console.warn("Aucun utilisateur Firebase connecté.");
    return;
  }

  const periodsRef = db.collection("users")
    .doc(user.uid)
    .collection("periods");

  // Maka ny données ao amin'ny cloud
  const snapshot = await periodsRef.get();

  const localPeriods = readPeriods();
  const cloudPeriods = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));

  const merged = new Map();
  const uploadToCloud = [];

  // Ampidirina aloha ny périodes ao amin'ny cloud
  cloudPeriods.forEach(period => {
    merged.set(period.id, period);
  });

  // Ampitahaina amin'ny périodes ao amin'ny navigateur
  localPeriods.forEach(localPeriod => {
    const cloudPeriod = merged.get(localPeriod.id);

    // Raha tsy mbola misy ao amin'ny cloud
    if (!cloudPeriod) {
      merged.set(localPeriod.id, localPeriod);
      uploadToCloud.push(localPeriod);
      return;
    }

    const localTime = Date.parse(
      localPeriod.updatedAt || localPeriod.createdAt || 0
    );

    const cloudTime = Date.parse(
      cloudPeriod.updatedAt || cloudPeriod.createdAt || 0
    );

    // Raha vaovao kokoa ny version locale
    if (localTime > cloudTime) {
      merged.set(localPeriod.id, localPeriod);
      uploadToCloud.push(localPeriod);
    }
    // Raha tsy izany dia tazonina ny version cloud
  });

  const finalPeriods = Array.from(merged.values());

  // Averina tehirizina ao amin'ny LocalStorage
  savePeriods(finalPeriods);

  // Alefa any amin'ny cloud ireo périodes tsy hita
  // na vaovao kokoa ao amin'ny navigateur
  for (const period of uploadToCloud) {
    await savePeriodToCloud(period);
  }

  console.log(
    "Synchronisation terminée :",
    finalPeriods.length,
    "périodes."
  );

  return finalPeriods;
}


function makeId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

function parseDuration(value) {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^(\d{1,4}):([0-5]\d)$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatDuration(minutes) {
  const safe = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  return String(hours).padStart(2, "0") + ":" +
    String(mins).padStart(2, "0");
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0
  }).format(Math.round(value || 0)) + " Ar";
}

function dateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, number) {
  const date = new Date(dateString + "T12:00:00");
  date.setDate(date.getDate() + number);
  return dateToISO(date);
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("fr-FR");
}

// --------------------------------------------
// CALCUL DES HEURES
// --------------------------------------------

function calculateWork(start, end) {
  if (!start || !end) {
    return { worked: 0, night: 0 };
  }

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  let startValue = startHour * 60 + startMinute;
  let endValue = endHour * 60 + endMinute;

  // Travail pouvant traverser minuit
  if (endValue <= startValue) {
    endValue += 1440;
  }

  const worked = endValue - startValue;
  let night = 0;

  // Fenêtre de nuit technique utilisée provisoirement :
  // 22h00 à 05h00.
  // À confirmer selon les textes applicables.
  for (let minute = startValue; minute < endValue; minute++) {
    const hour = Math.floor((minute % 1440) / 60);

    if (hour >= 22 || hour < 5) {
      night++;
    }
  }

  return { worked, night };
}

// --------------------------------------------
// CALCUL DES HEURES SUPPLEMENTAIRES
// --------------------------------------------

function getWeeklyOvertime(rows, weeklyTarget) {
  const weekTotals = {};

  rows.forEach(row => {
    if (!row.start || !row.end) return;

    const worked = calculateWork(row.start, row.end).worked;

    const date = new Date(row.date + "T12:00:00");
    const day = (date.getDay() + 6) % 7;

    date.setDate(date.getDate() - day);

    const weekKey = dateToISO(date);

    if (!weekTotals[weekKey]) {
      weekTotals[weekKey] = 0;
    }

    weekTotals[weekKey] += worked;
  });

  const overtimeByDate = {};
  const usedByWeek = {};

  rows.forEach(row => {
    if (!row.start || !row.end) {
      overtimeByDate[row.id] = 0;
      return;
    }

    const date = new Date(row.date + "T12:00:00");
    const day = (date.getDay() + 6) % 7;

    date.setDate(date.getDate() - day);

    const weekKey = dateToISO(date);
    const worked = calculateWork(row.start, row.end).worked;

    const before = usedByWeek[weekKey] || 0;
    const after = before + worked;

    const overtimeBefore = Math.max(0, before - weeklyTarget);
    const overtimeAfter = Math.max(0, after - weeklyTarget);

    overtimeByDate[row.id] = overtimeAfter - overtimeBefore;
    usedByWeek[weekKey] = after;
  });

  return overtimeByDate;
}

// --------------------------------------------
// AFFICHAGE DU TABLEAU
// --------------------------------------------

function renderWorkRows() {
  if (!currentPeriod || !workTableBody) return;

  workTableBody.innerHTML = "";

  const weeklyTarget = parseDuration(currentPeriod.weeklyHours) || 0;
  const overtimeMap = getWeeklyOvertime(
    currentPeriod.rows,
    weeklyTarget
  );

  currentPeriod.rows.forEach(row => {
    const result = calculateWork(row.start, row.end);
    const expected = parseDuration(currentPeriod.dailyHours) || 0;
    const difference = result.worked - expected;

    const tr = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(row.date);
    dateCell.className = "table-date";

    const startCell = document.createElement("td");
    const startInput = document.createElement("input");
    startInput.type = "time";
    startInput.value = row.start || "";
    startInput.dataset.rowId = row.id;
    startInput.dataset.field = "start";
    startInput.disabled = currentPeriod.status === "closed";
    startCell.appendChild(startInput);

    const endCell = document.createElement("td");
    const endInput = document.createElement("input");
    endInput.type = "time";
    endInput.value = row.end || "";
    endInput.dataset.rowId = row.id;
    endInput.dataset.field = "end";
    endInput.disabled = currentPeriod.status === "closed";
    endCell.appendChild(endInput);

    const hoursCell = document.createElement("td");
    hoursCell.textContent = formatDuration(result.worked);

    const differenceCell = document.createElement("td");
    differenceCell.textContent =
      (difference > 0 ? "+" : "") +
      formatDuration(Math.abs(difference));

    if (difference < 0) {
      differenceCell.textContent = "-" +
        formatDuration(Math.abs(difference));
    }

    const nightCell = document.createElement("td");
    nightCell.textContent = formatDuration(result.night);

    tr.append(
      dateCell,
      startCell,
      endCell,
      hoursCell,
      differenceCell,
      nightCell
    );

    workTableBody.appendChild(tr);
  });

  updateWorkSummary();
}

// --------------------------------------------
// RECAPITULATION
// --------------------------------------------

// --------------------------------------------
// CALCUL COMPLET DU SALAIRE
// --------------------------------------------

function updateWorkSummary() {
  if (!currentPeriod) return;

  const rows = currentPeriod.rows || [];

  const monthlyMinutes = parseDuration(currentPeriod.monthlyHours);
  const weeklyTarget = parseDuration(currentPeriod.weeklyHours) || 0;

  const baseSalary = Number(currentPeriod.baseSalary) || 0;

  let totalWork = 0;
  let totalNight = 0;
  let days = 0;

  rows.forEach(row => {
    if (!row.start || !row.end) return;

    const result = calculateWork(row.start, row.end);

    if (result.worked > 0) {
      days++;
      totalWork += result.worked;
      totalNight += result.night;
    }
  });

  // Taux horaire normal
  const hourlyRate = monthlyMinutes > 0
    ? baseSalary / (monthlyMinutes / 60)
    : 0;

  // Taux de majoration
  const firstRate = Number(currentPeriod.overtimeRateFirst ?? 30);
  const nextRate = Number(currentPeriod.overtimeRateNext ?? 50);
  const nightRateValue = Number(currentPeriod.nightRate ?? 30);

  // Répartition des heures supplémentaires par semaine
  const weeks = {};

  rows.forEach(row => {
    if (!row.start || !row.end) return;

    const date = new Date(row.date + "T12:00:00");
    const day = (date.getDay() + 6) % 7;

    date.setDate(date.getDate() - day);

    const weekKey = dateToISO(date);

    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }

    weeks[weekKey].push({
      row,
      worked: calculateWork(row.start, row.end).worked
    });
  });

  let totalOvertime = 0;
  let overtimePayment = 0;
  let overtimePremium = 0;

  Object.values(weeks).forEach(weekRows => {
    let cumulativeWork = 0;
    let cumulativeOvertime = 0;

    weekRows.forEach(item => {
      const before = cumulativeWork;
      const after = before + item.worked;

      const overtimeBefore = Math.max(0, before - weeklyTarget);
      const overtimeAfter = Math.max(0, after - weeklyTarget);

      const overtimeMinutes = overtimeAfter - overtimeBefore;

      if (overtimeMinutes > 0) {
        const firstMinutes = Math.min(
          overtimeMinutes,
          Math.max(0, 480 - cumulativeOvertime)
        );

        const nextMinutes = overtimeMinutes - firstMinutes;

        const firstPay =
          hourlyRate * (firstMinutes / 60) * (1 + firstRate / 100);

        const nextPay =
          hourlyRate * (nextMinutes / 60) * (1 + nextRate / 100);

        const normalOvertimeValue =
          hourlyRate * (overtimeMinutes / 60);

        overtimePayment += firstPay + nextPay;

        overtimePremium +=
          firstPay + nextPay - normalOvertimeValue;

        totalOvertime += overtimeMinutes;
        cumulativeOvertime += overtimeMinutes;
      }

      cumulativeWork = after;
    });
  });

  // Majoration des heures de nuit
  const nightBonus =
    hourlyRate * (totalNight / 60) * (nightRateValue / 100);

  // Total des majorations
  const totalMajoration = overtimePremium + nightBonus;

  // Salaire brut calculé
  const grossSalary =
    baseSalary + overtimePayment + nightBonus;

  // Sauvegarde des résultats dans la période
  currentPeriod.totalWorkMinutes = totalWork;
  currentPeriod.totalNightMinutes = totalNight;
  currentPeriod.totalOvertimeMinutes = totalOvertime;

  currentPeriod.overtimePayment = overtimePayment;
  currentPeriod.overtimePremium = overtimePremium;
  currentPeriod.nightBonus = nightBonus;

  currentPeriod.majorationTotal = totalMajoration;
  currentPeriod.grossSalary = grossSalary;

  // Affichage
  const values = {
    summaryDays: days,
    summaryWorkHours: formatDuration(totalWork),
    summaryOvertime: formatDuration(totalOvertime),
    summaryNightHours: formatDuration(totalNight),
    summaryNormalHours: formatDuration(
      Math.max(0, totalWork - totalOvertime)
    ),

    summaryBaseSalary: formatMoney(baseSalary),
    summaryOvertimeSalary: formatMoney(overtimePayment),
    summaryNightBonus: formatMoney(nightBonus),
    summaryGrossSalary: formatMoney(grossSalary)
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  // Sauvegarde pour l'historique
  saveCurrentPeriod();
}

// --------------------------------------------
// AFFICHAGE DE LA PERIODE ACTIVE
// --------------------------------------------

function showWorkPage() {
  showPage(page005);

  const periods = readPeriods();

  currentPeriod = periods.find(p => p.status === "active") || null;

  if (currentPeriod) {
    newPeriodForm?.classList.add("hidden");
    activePeriod?.classList.remove("hidden");

    displayPeriodDetails();
    renderWorkRows();
  } else {
    newPeriodForm?.classList.remove("hidden");
    activePeriod?.classList.add("hidden");
  }

  renderHistory();
}

function displayPeriodDetails() {
  if (!currentPeriod) return;

  const values = {
    sectorDisplay: currentPeriod.sector,
    categoryDisplay: currentPeriod.category,
    baseSalaryDisplay: formatMoney(currentPeriod.baseSalary),
    periodStartDisplay: formatDate(currentPeriod.startDate),
    dailyHoursDisplay: currentPeriod.dailyHours,
    monthlyHoursDisplay: currentPeriod.monthlyHours,
    weeklyHoursDisplay: currentPeriod.weeklyHours
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
  });

  const locked = currentPeriod.status === "closed";

  if (addWorkLineButton) addWorkLineButton.disabled = locked;
  if (closePeriodButton) closePeriodButton.disabled = locked;
}

// --------------------------------------------
// CREATION D'UNE PERIODE
// --------------------------------------------

startPeriodButton?.addEventListener("click", () => {
  const sector = workSector?.value;
  const category = workCategory?.value;
  const nightType = nightWorkType?.value || "habituel";
  const mode = majorationMode?.value || "automatic";

  const rateFirst = Number(overtimeRateFirst?.value ?? 30);
  const rateNext = Number(overtimeRateNext?.value ?? 50);
  const rateNight = Number(nightRate?.value ?? 30);
  const salary = Number(baseSalary?.value);
  const monthly = monthlyHours?.value.trim();
  const weekly = weeklyHours?.value.trim();
  const daily = dailyHours?.value;
  const start = periodStart?.value;

  if (!sector || !category || !salary || salary <= 0 ||
      !monthly || !weekly || !daily || !start) {
    alert("Veuillez remplir tous les champs correctement.");
    return;
  }

  if (parseDuration(monthly) === null ||
      parseDuration(weekly) === null) {
    alert("Entrez les durées au format HH:MM. Exemple : 173:20.");
    return;
  }

  if (readPeriods().some(p => p.status === "active")) {
    alert("Une période est déjà en cours.");
    return;
  }

  currentPeriod = {
    id: makeId(),
    sector,
    category,
    baseSalary: salary,
    monthlyHours: monthly,
    weeklyHours: weekly,
    dailyHours: daily,

    nightWorkType: nightType,
    majorationMode: mode,

    overtimeRateFirst: mode === "automatic" ? 30 : rateFirst,
    overtimeRateNext: mode === "automatic" ? 50 : rateNext,

    nightRate: mode === "automatic"
      ? (nightType === "habituel" ? 30 : 50)
      : rateNight,
    
    startDate: start,
    status: "active",
    createdAt: new Date().toISOString(),
    closedAt: null,
    rows: [
      {
        id: makeId(),
        date: start,
        start: "",
        end: ""
      }
    ]
  };

  saveCurrentPeriod();
  showWorkPage();
});

// --------------------------------------------
// MODIFICATION DES HEURES
// --------------------------------------------

workTableBody?.addEventListener("change", event => {
  const input = event.target;

  if (!input.dataset.rowId || !input.dataset.field) return;
  if (!currentPeriod || currentPeriod.status !== "active") return;

  const row = currentPeriod.rows.find(
    item => item.id === input.dataset.rowId
  );

  if (!row) return;

  row[input.dataset.field] = input.value;

  saveCurrentPeriod();
  renderWorkRows();
});

// --------------------------------------------
// AJOUT D'UNE LIGNE
// --------------------------------------------

addWorkLineButton?.addEventListener("click", () => {
  if (!currentPeriod || currentPeriod.status !== "active") return;

  const lastRow = currentPeriod.rows[currentPeriod.rows.length - 1];

  currentPeriod.rows.push({
    id: makeId(),
    date: addDays(lastRow.date, 1),
    start: "",
    end: ""
  });

  saveCurrentPeriod();
  renderWorkRows();
});

// --------------------------------------------
// FERMETURE DE LA PERIODE
// --------------------------------------------

closePeriodButton?.addEventListener("click", () => {
  if (!currentPeriod || currentPeriod.status !== "active") return;

  const confirmed = confirm(
    "Voulez-vous vraiment clôturer cette période ? " +
    "Les horaires ne pourront plus être modifiés."
  );

  if (!confirmed) return;

  currentPeriod.status = "closed";
  currentPeriod.closedAt = new Date().toISOString();

  saveCurrentPeriod();

  displayPeriodDetails();
  renderWorkRows();
  renderHistory();

  alert("La période a été clôturée.");
});

// --------------------------------------------
// HISTORIQUE
// --------------------------------------------

// --------------------------------------------
// HISTORIQUE DES PERIODES
// --------------------------------------------

function renderHistory() {
  if (!periodHistory) return;

  const periods = readPeriods();

  periodHistory.innerHTML = "";

  if (periods.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "Aucune période enregistrée.";
    periodHistory.appendChild(empty);
    return;
  }

  periods.slice().reverse().forEach(period => {

    // Total des heures réellement travaillées
    let totalWork = 0;

    (period.rows || []).forEach(row => {
      if (!row.start || !row.end) return;

      totalWork += calculateWork(row.start, row.end).worked;
    });

    // Total des heures supplémentaires
    const weeklyTarget = parseDuration(period.weeklyHours) || 0;

    const overtimeMap = getWeeklyOvertime(
      period.rows || [],
      weeklyTarget
    );

    const totalOvertime = Object.values(overtimeMap)
      .reduce((sum, value) => sum + value, 0);

    // Date de fin
    const endDate = period.status === "closed" && period.closedAt
      ? dateToISO(new Date(period.closedAt))
      : null;

    // Carte historique
    const item = document.createElement("div");
    item.className = "history-item";

    const title = document.createElement("h3");
    title.textContent =
      `${formatDate(period.startDate)} – ${
        endDate ? formatDate(endDate) : "En cours"
      }`;

    item.appendChild(title);

    const details = [
      ["Heure hebdomadaire", period.weeklyHours || "—"],
      ["Heure mensuelle", period.monthlyHours || "—"],
      ["Total heures travaillées", formatDuration(totalWork)],
      ["Total heures supplémentaires", formatDuration(totalOvertime)],
      [
        "Majoration totale",
        period.majorationTotal != null
          ? formatMoney(period.majorationTotal)
          : "À configurer"
      ],
      [
        "Salaire brut",
        period.grossSalary != null
          ? formatMoney(period.grossSalary)
          : "À configurer"
      ]
    ];

    details.forEach(([label, value]) => {
      const line = document.createElement("p");

      const labelElement = document.createElement("span");
      labelElement.textContent = label + " : ";

      const valueElement = document.createElement("strong");
      valueElement.textContent = value;

      line.append(labelElement, valueElement);
      item.appendChild(line);
    });

    // Statut
    const status = document.createElement("span");
    status.className = "history-status";
    status.textContent =
      period.status === "closed" ? "Clôturée" : "En cours";

    item.appendChild(status);

    periodHistory.appendChild(item);
  });
}

// --------------------------------------------
// SUPPRESSION DE TOUT L'HISTORIQUE
// --------------------------------------------

deleteAllHistoryButton?.addEventListener("click", () => {
  const confirmed = confirm(
    "Attention : voulez-vous vraiment supprimer toutes les périodes " +
    "de travail enregistrées ? Cette action est irréversible."
  );

  if (!confirmed) return;

  localStorage.removeItem(PERIODS_KEY);
  currentPeriod = null;

  if (activePeriod) activePeriod.classList.add("hidden");
  if (newPeriodForm) newPeriodForm.classList.remove("hidden");

  renderHistory();
});

// --------------------------------------------
// RAPPORT : IMPRESSION / ENREGISTREMENT PDF
// --------------------------------------------

downloadReportButton?.addEventListener("click", () => {
  if (!currentPeriod) {
    alert("Aucune période à exporter.");
    return;
  }

  window.print();
});

// --------------------------------------------
// RETOUR AU PROFIL
// --------------------------------------------

backProfileButton?.addEventListener("click", () => {
  displayProfile();
});

// --------------------------------------------
// INITIALISATION
// --------------------------------------------

renderHistory();

})



