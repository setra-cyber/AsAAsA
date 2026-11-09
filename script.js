// ======================================
// ASA - FIREBASE + GESTION DU TRAVAIL
// ======================================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // VARIABLES GENERALES
  // ======================================

  let currentUser = null;
  let currentProfile = null;
  let periods = [];

  let splashFinished = false;
  let authReady = false;

  const pages = {
    page001: document.getElementById("page001"),
    page002: document.getElementById("page002"),
    page003: document.getElementById("page003"),
    page004: document.getElementById("page004"),
    page005: document.getElementById("page005")
  };

  const STORAGE_KEY = "asaWorkPeriods";

  function showPage(pageId) {
    Object.values(pages).forEach(page => {
      if (page) page.classList.add("hidden");
    });

    if (pages[pageId]) {
      pages[pageId].classList.remove("hidden");
    }
  }

  function showInitialPage() {
    if (!splashFinished || !authReady) return;

    if (currentUser) {
      showPage("page004");
    } else {
      showPage("page002");
    }
  }

  // ======================================
  // PAGE 001 : LOGO PENDANT 3 SECONDES
  // ======================================

  showPage("page001");

  setTimeout(() => {
    splashFinished = true;
    showInitialPage();
  }, 3000);


  // ======================================
  // GESTION DES ERREURS FIREBASE
  // ======================================

  function firebaseErrorMessage(error) {

    console.error("Erreur Firebase :", error);

    const messages = {
      "auth/email-already-in-use":
        "Cette adresse e-mail possède déjà un compte.",

      "auth/invalid-email":
        "Adresse e-mail invalide.",

      "auth/weak-password":
        "Le mot de passe est trop faible.",

      "auth/user-not-found":
        "Aucun compte trouvé avec cette adresse e-mail.",

      "auth/wrong-password":
        "Mot de passe incorrect.",

      "auth/invalid-credential":
        "Adresse e-mail ou mot de passe incorrect.",

      "auth/too-many-requests":
        "Trop de tentatives. Réessayez plus tard.",

      "auth/network-request-failed":
        "Problème de connexion Internet."
    };

    return messages[error.code] ||
      "Une erreur est survenue. Veuillez réessayer.";
  }


  // ======================================
  // PAGE 002 : ALLER À L'INSCRIPTION
  // ======================================

  document.getElementById("openRegister")
    .addEventListener("click", event => {

      event.preventDefault();

      document.getElementById("registerMessage").textContent = "";

      showPage("page003");
    });

  document.getElementById("backToLogin")
    .addEventListener("click", event => {

      event.preventDefault();

      document.getElementById("loginMessage").textContent = "";

      showPage("page002");
    });


  // ======================================
  // FIREBASE : INSCRIPTION
  // ======================================

  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");

  registerForm.addEventListener("submit", async event => {

    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("registerContact").value.trim();
    const birth = document.getElementById("birthDate").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword =
      document.getElementById("confirmPassword").value;

    registerMessage.textContent = "";

    if (!name || !email || !birth || !password || !confirmPassword) {
      registerMessage.textContent =
        "Veuillez remplir tous les champs.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      registerMessage.textContent =
        "Veuillez saisir une adresse e-mail valide.";
      return;
    }

    if (password !== confirmPassword) {
      registerMessage.textContent =
        "Les deux mots de passe ne correspondent pas.";
      return;
    }

    if (password.length < 6) {
      registerMessage.textContent =
        "Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }

    const birthDate = new Date(birth + "T00:00:00");

    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      registerMessage.textContent =
        "Veuillez vérifier votre date de naissance.";
      return;
    }

    try {

      registerMessage.textContent = "Création du compte...";

      // Créer le compte Firebase
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = credential.user;

      // Informations du profil
      const profile = {
        name: name,
        email: email,
        birth: birth,
        photo: "",
        createdAt: new Date().toISOString()
      };

      // Enregistrer le profil dans Firestore
      await setDoc(
        doc(db, "users", user.uid),
        profile
      );

      // Déconnexion après inscription
      await signOut(auth);

      registerForm.reset();

      registerMessage.textContent = "";

      document.getElementById("loginMessage").textContent =
        "Compte créé avec succès ! Vous pouvez maintenant vous connecter.";

      showPage("page002");

    } catch (error) {

      registerMessage.textContent = firebaseErrorMessage(error);

    }

  });


  // ======================================
  // FIREBASE : CONNEXION
  // ======================================

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    const email = document.getElementById("loginContact").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginMessage.textContent = "";

    if (!email || !password) {
      loginMessage.textContent =
        "Veuillez remplir tous les champs.";
      return;
    }

    try {

      loginMessage.textContent = "Connexion en cours...";

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      loginForm.reset();

    } catch (error) {

      loginMessage.textContent = firebaseErrorMessage(error);

    }

  });


  // ======================================
  // FIREBASE : RESTAURER LA SESSION
  // ======================================

  onAuthStateChanged(auth, async user => {

    currentUser = user;

    if (user) {

      try {

        const profileReference = doc(db, "users", user.uid);

        const profileSnapshot = await getDoc(profileReference);

        if (!profileSnapshot.exists()) {

          await signOut(auth);

          loginMessage.textContent =
            "Profil introuvable. Veuillez contacter l'administrateur.";

          return;
        }

        currentProfile = profileSnapshot.data();

        displayProfile(currentProfile);

        loadPeriods();

      } catch (error) {

        console.error("Erreur de chargement du profil :", error);

        loginMessage.textContent =
          "Impossible de charger votre profil.";

      }

    } else {

      currentProfile = null;
      periods = [];

    }

    authReady = true;

    showInitialPage();

  });


  // ======================================
  // PAGE 004 : AFFICHER LE PROFIL
  // ======================================

  function displayProfile(profile) {

    document.getElementById("welcomeName").textContent =
      '"' + (profile.name || "") + '"';

    const photo = document.getElementById("profilePhoto");
    const photoButton = document.getElementById("choosePhoto");

    if (profile.photo) {

      photo.src = profile.photo;
      photoButton.classList.add("has-photo");

    } else {

      photo.removeAttribute("src");
      photoButton.classList.remove("has-photo");

    }

  }


  // ======================================
  // STOCKAGE DES PERIODES PAR UTILISATEUR
  // ======================================

  function getStorageKey() {

    if (!currentUser) return null;

    return STORAGE_KEY + "_" + currentUser.uid;

  }

  function loadPeriods() {

    if (!currentUser) {
      periods = [];
      return;
    }

    const userKey = getStorageKey();

    let saved = localStorage.getItem(userKey);

    // Récupérer les anciennes périodes lors de la première connexion
    if (saved === null) {

      const oldPeriods = localStorage.getItem(STORAGE_KEY);

      if (oldPeriods !== null) {

        saved = oldPeriods;

        localStorage.setItem(userKey, oldPeriods);

      }

    }

    try {

      periods = JSON.parse(saved || "[]");

      if (!Array.isArray(periods)) {
        periods = [];
      }

    } catch (error) {

      console.error("Historique invalide :", error);
      periods = [];

    }

  }

  function savePeriods() {

    if (!currentUser) return;

    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(periods)
    );

  }


  // ======================================
  // PAGE 004 : CHOISIR UNE PHOTO
  // ======================================

  const choosePhoto = document.getElementById("choosePhoto");
  const photoInput = document.getElementById("photoInput");
  const photoMessage = document.getElementById("photoMessage");

  choosePhoto.addEventListener("click", () => {

    if (!currentUser) return;

    photoInput.click();

  });

  photoInput.addEventListener("change", async () => {

    const file = photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      photoMessage.textContent =
        "Veuillez choisir une image.";

      return;
    }

    const reader = new FileReader();

    reader.onload = event => {

      const image = new Image();

      image.onload = async () => {

        const canvas = document.createElement("canvas");
        const maxSize = 350;

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

        const compressedPhoto =
          canvas.toDataURL("image/jpeg", 0.7);

        try {

          photoMessage.textContent = "Enregistrement de la photo...";

          const updatedProfile = {
            ...currentProfile,
            photo: compressedPhoto
          };

          await setDoc(
            doc(db, "users", currentUser.uid),
            updatedProfile
          );

          currentProfile = updatedProfile;

          displayProfile(currentProfile);

          photoMessage.textContent =
            "Photo de profil mise à jour.";

        } catch (error) {

          console.error(error);

          photoMessage.textContent =
            "Impossible d'enregistrer la photo.";

        }

      };

      image.onerror = () => {

        photoMessage.textContent =
          "Impossible de lire cette image.";

      };

      image.src = event.target.result;

    };

    reader.readAsDataURL(file);

  });


  // ======================================
  // BOUTON ENTRER : PAGE 005
  // ======================================

  document.getElementById("enterApp").addEventListener("click", () => {

    if (!currentUser) return;

    showPage("page005");

    initializeWorkPage();

  });

  document.getElementById("backProfile").addEventListener("click", () => {

    showPage("page004");

  });


  // ======================================
  // ICÔNES DU MENU
  // ======================================

  document.querySelectorAll(".menu-button").forEach(button => {

    button.addEventListener("click", () => {

      alert("Le menu sera configuré dans une prochaine étape.");

    });

  });


  // ======================================
  // PAGE 005 : GESTION DES PERIODES
  // ======================================

  function getActivePeriod() {

    return periods.find(period => !period.closed);

  }

  function formatDate(dateString) {

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;

  }

  function minutesToTime(minutes) {

    const sign = minutes < 0 ? "-" : "";
    const absolute = Math.abs(minutes);

    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;

    return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  }

  function timeToMinutes(time) {

    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

  }


  // ======================================
  // INITIALISER LA PAGE 005
  // ======================================

  function initializeWorkPage() {

    if (!currentUser) return;

    const active = getActivePeriod();

    document.getElementById("newPeriodForm")
      .classList.toggle("hidden", !!active);

    document.getElementById("activePeriod")
      .classList.toggle("hidden", !active);

    if (active) {

      document.getElementById("periodStartDisplay").textContent =
        formatDate(active.startDate);

      document.getElementById("dailyHoursDisplay").textContent =
        active.dailyHours;

      renderWorkTable(active);

    }

    renderHistory();

  }


  // ======================================
  // COMMENCER UNE NOUVELLE PERIODE
  // ======================================

  document.getElementById("startPeriod").addEventListener("click", () => {

    if (!currentUser) return;

    const startDate =
      document.getElementById("periodStart").value;

    const dailyHours =
      document.getElementById("dailyHours").value;

    if (!startDate || !dailyHours) {

      alert("Veuillez remplir les deux informations.");
      return;

    }

    if (getActivePeriod()) {

      alert("Une période est déjà en cours.");
      return;

    }

    const period = {
      id: Date.now(),
      startDate: startDate,
      dailyHours: dailyHours,
      rows: [],
      closed: false,
      endDate: null
    };

    periods.push(period);

    savePeriods();

    initializeWorkPage();

  });


  // ======================================
  // AJOUTER UNE LIGNE
  // ======================================

  document.getElementById("addWorkLine").addEventListener("click", () => {

    const active = getActivePeriod();

    if (!active || active.closed) return;

    let nextDate;

    if (active.rows.length === 0) {

      nextDate = active.startDate;

    } else {

      const lastDate = active.rows[active.rows.length - 1].date;

      const date = new Date(lastDate + "T12:00:00");

      date.setDate(date.getDate() + 1);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      nextDate = `${year}-${month}-${day}`;

    }

    active.rows.push({
      date: nextDate,
      start: "",
      end: ""
    });

    savePeriods();

    renderWorkTable(active);

  });


  // ======================================
  // CALCUL DES HEURES ET DES ECARTS
  // ======================================

  function calculateRow(row, dailyHours) {

    if (!row.start || !row.end) {

      return {
        worked: null,
        difference: null
      };

    }

    const start = timeToMinutes(row.start);

    let end = timeToMinutes(row.end);

    // Autoriser une fin de travail après minuit
    if (end < start) {
      end += 24 * 60;
    }

    const worked = end - start;

    const expected = timeToMinutes(dailyHours);

    return {
      worked: worked,
      difference: worked - expected
    };

  }


  // ======================================
  // AFFICHER LE TABLEAU
  // ======================================

  function renderWorkTable(period) {

    const tbody = document.getElementById("workTableBody");

    tbody.innerHTML = "";

    let totalWorked = 0;
    let totalDifference = 0;

    period.rows.forEach(row => {

      const result = calculateRow(row, period.dailyHours);

      if (result.worked !== null) {

        totalWorked += result.worked;
        totalDifference += result.difference;

      }

      const tr = document.createElement("tr");

      const dateCell = document.createElement("td");

      dateCell.className = "table-date";
      dateCell.textContent = formatDate(row.date);

      const startCell = document.createElement("td");

      const startInput = document.createElement("input");

      startInput.type = "time";
      startInput.value = row.start;
      startInput.disabled = period.closed;

      startInput.addEventListener("change", () => {

        row.start = startInput.value;

        savePeriods();

        renderWorkTable(period);

      });

      startCell.appendChild(startInput);

      const endCell = document.createElement("td");

      const endInput = document.createElement("input");

      endInput.type = "time";
      endInput.value = row.end;
      endInput.disabled = period.closed;

      endInput.addEventListener("change", () => {

        row.end = endInput.value;

        savePeriods();

        renderWorkTable(period);

      });

      endCell.appendChild(endInput);

      const workedCell = document.createElement("td");

      workedCell.textContent =
        result.worked === null
          ? "--:--"
          : minutesToTime(result.worked);

      const differenceCell = document.createElement("td");

      differenceCell.textContent =
        result.difference === null
          ? "--:--"
          : minutesToTime(result.difference);

      tr.append(
        dateCell,
        startCell,
        endCell,
        workedCell,
        differenceCell
      );

      tbody.appendChild(tr);

    });

    document.getElementById("totalHours").textContent =
      minutesToTime(totalWorked);

    document.getElementById("totalDifference").textContent =
      minutesToTime(totalDifference);

  }


  // ======================================
  // TELECHARGER UN RAPPORT CSV
  // ======================================

  function downloadPeriod(period) {

    const lines = [
      ["Date", "H. début", "H. fin", "H/J", "Écart"]
    ];

    period.rows.forEach(row => {

      const result = calculateRow(row, period.dailyHours);

      lines.push([
        formatDate(row.date),
        row.start || "",
        row.end || "",
        result.worked === null ? "" : minutesToTime(result.worked),
        result.difference === null ? "" : minutesToTime(result.difference)
      ]);

    });

    const csv = lines.map(line =>
      line.map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(";")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `AsA-rapport-${period.startDate}.csv`;

    link.click();

    URL.revokeObjectURL(url);

  }

  document.getElementById("downloadReport").addEventListener("click", () => {

    const active = getActivePeriod();

    if (active) downloadPeriod(active);

  });


  // ======================================
  // FERMETURE DE LA PERIODE
  // ======================================

  document.getElementById("closePeriod").addEventListener("click", () => {

    const active = getActivePeriod();

    if (!active) return;

    const incomplete = active.rows.some(
      row => !row.start || !row.end
    );

    if (incomplete) {

      alert("Veuillez compléter toutes les heures avant de fermer la période.");

      return;

    }

    const confirmation = confirm(
      "Voulez-vous vraiment fermer cette période ? " +
      "Les heures ne pourront plus être modifiées."
    );

    if (!confirmation) return;

    active.closed = true;

    if (active.rows.length > 0) {

      active.endDate = active.rows[active.rows.length - 1].date;

    } else {

      active.endDate = active.startDate;

    }

    savePeriods();

    initializeWorkPage();

    alert("Période fermée. Vous pouvez commencer une nouvelle période.");

  });


  // ======================================
  // HISTORIQUE DE TOUTES LES PERIODES
  // ======================================

  function renderHistory() {

    const history = document.getElementById("periodHistory");

    history.innerHTML = "";

    const closedPeriods = periods.filter(period => period.closed);

    if (closedPeriods.length === 0) {

      history.innerHTML =
        '<p class="history-empty">Aucune période terminée.</p>';

      return;

    }

    closedPeriods.forEach(period => {

      const item = document.createElement("div");

      item.className = "history-item";

      const title = document.createElement("p");

      const strong = document.createElement("strong");

      strong.textContent =
        formatDate(period.startDate) + " → " +
        formatDate(period.endDate);

      title.appendChild(strong);

      const hours = document.createElement("p");

      hours.textContent =
        "Heure journalière : " + period.dailyHours;

      const status = document.createElement("p");

      status.className = "history-status";

      status.textContent = "Période fermée";

      // Calcul des totaux
      let totalWorked = 0;
      let totalDifference = 0;

      period.rows.forEach(row => {

        const result = calculateRow(row, period.dailyHours);

        if (result.worked !== null) {

          totalWorked += result.worked;
          totalDifference += result.difference;

        }

      });

      // Tableau récapitulatif
      const summaryTable = document.createElement("table");

      summaryTable.className = "history-summary";

      const rows = [
        ["TOTAL HEURE", minutesToTime(totalWorked)],
        ["TOTAL HEURE SUPPLÉMENTAIRE", minutesToTime(totalDifference)]
      ];

      rows.forEach(data => {

        const tr = document.createElement("tr");

        const label = document.createElement("td");

        label.textContent = data[0];

        const value = document.createElement("td");

        value.textContent = data[1];

        tr.append(label, value);

        summaryTable.appendChild(tr);

      });

      // Télécharger
      const downloadButton = document.createElement("button");

      downloadButton.className = "blue-button";
      downloadButton.type = "button";
      downloadButton.textContent = "Télécharger le rapport";

      downloadButton.addEventListener("click", () => {

        downloadPeriod(period);

      });

      // Supprimer
      const deleteButton = document.createElement("button");

      deleteButton.className = "delete-period-button";
      deleteButton.type = "button";
      deleteButton.textContent = "Supprimer";

      deleteButton.addEventListener("click", () => {

        deletePeriod(period.id);

      });

      item.append(
        title,
        hours,
        status,
        summaryTable,
        downloadButton,
        deleteButton
      );

      history.appendChild(item);

    });

  }


  // ======================================
  // SUPPRIMER UNE PERIODE
  // ======================================

  function deletePeriod(periodId) {

    const confirmation = confirm(
      "Voulez-vous vraiment supprimer cette période ?"
    );

    if (!confirmation) return;

    periods = periods.filter(
      period => String(period.id) !== String(periodId)
    );

    savePeriods();

    renderHistory();

    alert("Période supprimée avec succès !");

  }


  // ======================================
  // SUPPRIMER TOUT L'HISTORIQUE
  // ======================================

  document.getElementById("deleteAllHistory")
    .addEventListener("click", () => {

      const closedPeriods = periods.filter(
        period => period.closed
      );

      if (closedPeriods.length === 0) {

        alert("Aucun historique à supprimer.");

        return;

      }

      const confirmation = confirm(
        "Voulez-vous vraiment supprimer tout l'historique ?"
      );

      if (!confirmation) return;

      // Tsy fafana ny période mbola mandeha
      periods = periods.filter(
        period => !period.closed
      );

      savePeriods();

      renderHistory();

      alert("Tout l'historique a été supprimé !");

    });

});
