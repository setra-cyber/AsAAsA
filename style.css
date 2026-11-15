```javascript
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(contact)) {
      setMessage(
        loginMessage,
        "Pour cette version, veuillez vous connecter avec votre adresse e-mail.",
        true
      );
      return;
    }

    try {
      setMessage(loginMessage, "Connexion...");

      await signInWithEmailAndPassword(auth, contact, password);

      // onAuthStateChanged s'occupera de charger le profil.
    } catch (error) {
      setMessage(loginMessage, firebaseErrorMessage(error), true);
    }
  });

  // ======================================
  // 7. RESTAURATION DE LA SESSION
  // ======================================

  onAuthStateChanged(auth, async user => {
    if (authCheckInProgress) return;
    authCheckInProgress = true;

    try {
      currentUser = user;

      if (!user) {
        currentProfile = null;
        periods = [];
        authReady = true;
        showInitialPage();
        return;
      }

      const profileRef = doc(db, "users", user.uid);
      const profileSnapshot = await getDoc(profileRef);

      if (profileSnapshot.exists()) {
        currentProfile = profileSnapshot.data();
      } else {
        const pendingProfile = localStorage.getItem(
          `asaPendingProfile_${user.uid}`
        );

        if (pendingProfile) {
          currentProfile = JSON.parse(pendingProfile);
          await setDoc(profileRef, currentProfile);
          localStorage.removeItem(`asaPendingProfile_${user.uid}`);
        } else {
          currentProfile = {
            name: user.displayName || "Utilisateur",
            email: user.email || "",
            birth: "",
            photo: "",
            createdAt: new Date().toISOString()
          };

          await setDoc(profileRef, currentProfile);
        }
      }

      loadPeriods();
      authReady = true;
      showInitialPage();
    } catch (error) {
      console.error("Erreur de restauration du profil :", error);
      authReady = true;

      if (currentUser) {
        const pendingProfile = localStorage.getItem(
          `asaPendingProfile_${currentUser.uid}`
        );

        if (pendingProfile) {
          try {
            currentProfile = JSON.parse(pendingProfile);
            showInitialPage();
          } catch {
            showPage("page002");
          }
        } else {
          setMessage(
            $("loginMessage"),
            "Impossible de charger votre profil. Vérifiez votre connexion Internet.",
            true
          );
          showPage("page002");
        }
      } else {
        showInitialPage();
      }
    } finally {
      authCheckInProgress = false;
    }
  });

  // ======================================
  // 8. PROFIL UTILISATEUR
  // ======================================

  function displayProfile(profile) {
    if (!profile) return;

    if ($("welcomeName")) {
      $("welcomeName").textContent = profile.name || "Utilisateur";
    }

    const photoElement = $("choosePhoto");

    if (photoElement) {
      if (profile.photo) {
        photoElement.innerHTML = "";
        const image = document.createElement("img");
        image.src = profile.photo;
        image.alt = "Photo de profil";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.borderRadius = "50%";
        photoElement.appendChild(image);
      } else {
        photoElement.textContent = "votre photo";
      }
    }
  }

  // Ouvrir le sélecteur de photo.
  $("choosePhoto")?.addEventListener("click", () => {
    $("photoInput")?.click();
  });

  $("photoInput")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];

    if (!file || !currentUser || !currentProfile) return;

    if (!file.type.startsWith("image/")) {
      setMessage($("photoMessage"), "Veuillez choisir une image.", true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        $("photoMessage"),
        "La photo ne doit pas dépasser 5 Mo.",
        true
      );
      event.target.value = "";
      return;
    }

    try {
      setMessage($("photoMessage"), "Préparation de la photo...");

      const compressedPhoto = await compressImage(file, 350, 0.65);

      const updatedProfile = {
        ...currentProfile,
        photo: compressedPhoto
      };

      await setDoc(
        doc(db, "users", currentUser.uid),
        updatedProfile,
        { merge: true }
      );

      currentProfile = updatedProfile;
      localStorage.removeItem(`asaPendingProfile_${currentUser.uid}`);

      displayProfile(currentProfile);

      setMessage($("photoMessage"), "Photo de profil enregistrée.");
    } catch (error) {
      console.error("Erreur photo :", error);
      setMessage(
        $("photoMessage"),
        "Impossible d'enregistrer la photo. Vérifiez Internet ou les règles Firestore.",
        true
      );
    } finally {
      event.target.value = "";
    }
  });

  function compressImage(file, maxSize = 350, quality = 0.65) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(
            maxSize / image.width,
            maxSize / image.height,
            1
          );

          canvas.width = Math.round(image.width * ratio);
          canvas.height = Math.round(image.height * ratio);

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Canvas indisponible."));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", quality));
        };

        image.onerror = () => reject(new Error("Image illisible."));
        image.src = reader.result;
      };

      reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
      reader.readAsDataURL(file);
    });
  }

  // ======================================
  // 9. ACCES A L'APPLICATION
  // ======================================

  $("enterApp")?.addEventListener("click", () => {
    if (!currentUser || !currentProfile) {
      setMessage(
        $("photoMessage"),
        "Veuillez vous connecter ou créer un compte.",
        true
      );
      showPage("page002");
      return;
    }

    if (!currentProfile.photo) {
      setMessage(
        $("photoMessage"),
        "Veuillez ajouter votre photo de profil avant de continuer.",
        true
      );
      return;
    }

    loadPeriods();
    showPage("page005");
    renderApplication();
  });

  // ======================================
  // 10. MENU / DECONNEXION
  // ======================================

  $("backProfile")?.addEventListener("click", () => {
    displayProfile(currentProfile);
    showPage("page004");
  });

  $("logoutButton")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      currentUser = null;
      currentProfile = null;
      periods = [];
      showPage("page002");
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
      alert("Impossible de se déconnecter. Réessayez.");
    }
  });

  // ======================================
  // 11. STOCKAGE LOCAL DES PERIODES
  // ======================================

  function getStorageKey() {
    return currentUser
      ? `${STORAGE_KEY}_${currentUser.uid}`
      : STORAGE_KEY;
  }

  function loadPeriods() {
    if (!currentUser) {
      periods = [];
      return;
    }

    const key = getStorageKey();

    try {
      const saved = localStorage.getItem(key);
      periods = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(periods)) periods = [];

      migrateLegacyPeriods();
    } catch (error) {
      console.error("Erreur lecture historique :", error);
      periods = [];
    }
  }

  function savePeriods() {
    if (!currentUser) {
      alert("Vous devez être connecté pour enregistrer les données.");
      return false;
    }

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(periods));
      return true;
    } catch (error) {
      console.error("Erreur sauvegarde locale :", error);
      alert("Impossible d'enregistrer les données sur cet appareil.");
      return false;
    }
  }

  // Importer l'ancien historique sans supprimer la clé originale.
  function migrateLegacyPeriods() {
    if (!currentUser) return;

    const decisionKey = `${LEGACY_IMPORT_PREFIX}${currentUser.uid}`;

    if (localStorage.getItem(decisionKey)) return;

    const legacyData = localStorage.getItem(STORAGE_KEY);

    if (!legacyData) {
      localStorage.setItem(decisionKey, "no-legacy-data");
      return;
    }

    let oldPeriods;

    try {
      oldPeriods = JSON.parse(legacyData);
    } catch {
      return;
    }

    if (!Array.isArray(oldPeriods) || oldPeriods.length === 0) {
      localStorage.setItem(decisionKey, "no-legacy-data");
      return;
    }

    const shouldImport = confirm(
      `Un ancien historique contenant ${oldPeriods.length} période(s) a été trouvé sur cet appareil.\n\nVoulez-vous l'ajouter à votre compte ?\n\nL'ancienne copie ne sera pas supprimée.`
    );

    if (shouldImport) {
      const knownIds = new Set(periods.map(period => period.id));

      oldPeriods.forEach(period => {
        if (!knownIds.has(period.id)) {
          periods.push(period);
        }
      });

      savePeriods();
      localStorage.setItem(decisionKey, "imported");
    } else {
      localStorage.setItem(decisionKey, "not-imported");
    }
  }


  // ======================================
  // 12. OUTILS DE CALCUL DU TEMPS
  // ======================================

  function timeToMinutes(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;

    const [hours, minutes] = time.split(":").map(Number);

    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
  }

  function minutesToTime(totalMinutes) {
    const safeMinutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function formatDuration(totalMinutes) {
    if (totalMinutes === null || totalMinutes === undefined) return "—";

    const sign = totalMinutes < 0 ? "-" : "";
    const absolute = Math.abs(Math.round(totalMinutes));
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;

    return `${sign}${hours}h${String(minutes).padStart(2, "0")}`;
  }

  function calculateWorkedMinutes(start, end) {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (startMinutes === null || endMinutes === null) return null;

    let difference = endMinutes - startMinutes;

    // Raha mihoatra ny misasakalina ny asa.
    if (difference < 0) {
      difference += 24 * 60;
    }

    return difference;
  }

  function getExpectedDailyMinutes(period) {
    const value = period?.dailyHours || "08:00";
    return timeToMinutes(value) ?? 480;
  }

  function getPeriodWorkedMinutes(period) {
    return (period.rows || []).reduce((total, row) => {
      const worked = calculateWorkedMinutes(row.start, row.end);
      return total + (worked === null ? 0 : worked);
    }, 0);
  }

  function getPeriodDifferenceMinutes(period) {
    const expected = getExpectedDailyMinutes(period);

    return (period.rows || []).reduce((total, row) => {
      const worked = calculateWorkedMinutes(row.start, row.end);

      if (worked === null) return total;

      return total + worked - expected;
    }, 0);
  }

  function getMonthName(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    });
  }

  function formatDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("fr-FR");
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ======================================
  // 13. CREATION D'UNE NOUVELLE PERIODE
  // ======================================

  const startPeriodButton = $("startPeriod");

  startPeriodButton?.addEventListener("click", () => {
    if (!currentUser) {
      alert("Veuillez vous connecter.");
      return;
    }

    const startDate = $("periodStart")?.value || getTodayString();
    const dailyHours = $("dailyHours")?.value || "08:00";
    const monthlyHours = $("monthlyHours")?.value?.trim() || "";
    const baseSalaryValue = $("baseSalary")?.value?.trim() || "";

    if (!startDate) {
      alert("Veuillez choisir la date de début.");
      return;
    }

    if (timeToMinutes(dailyHours) === null) {
      alert("Veuillez saisir une durée journalière valide.");
      return;
    }

    const existingActive = periods.find(period => !period.closed);

    if (existingActive) {
      alert(
        "Une période est déjà en cours. Veuillez la clôturer avant d'en commencer une autre."
      );
      return;
    }

    const baseSalary = baseSalaryValue === ""
      ? null
      : Number(baseSalaryValue);

    if (
      baseSalary !== null &&
      (!Number.isFinite(baseSalary) || baseSalary < 0)
    ) {
      alert("Veuillez saisir un salaire de base valide.");
      return;
    }

    const newPeriod = {
      id: createId(),
      startDate,
      dailyHours,
      monthlyHours,
      baseSalary,
      rows: [],
      closed: false,
      closedAt: null,
      createdAt: new Date().toISOString()
    };

    periods.push(newPeriod);

    if (!savePeriods()) {
      periods.pop();
      return;
    }

    renderApplication();
  });

  function createId() {
    if (crypto.randomUUID) return crypto.randomUUID();

    return `asa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // ======================================
  // 14. PERIODE ACTIVE
  // ======================================

  function getActivePeriod() {
    return periods.find(period => !period.closed) || null;
  }

  function renderApplication() {
    const activePeriod = getActivePeriod();

    const startForm = $("periodStart")?.closest("form") ||
      $("startPeriod")?.parentElement;

    const tableContainer = $("workTableContainer") ||
      $("workTable")?.parentElement;

    if (!activePeriod) {
      if (startForm) startForm.classList.remove("hidden");
      if (tableContainer) tableContainer.classList.add("hidden");

      renderHistory();
      renderSalarySummary(null);
      return;
    }

    if (startForm) startForm.classList.add("hidden");
    if (tableContainer) tableContainer.classList.remove("hidden");

    renderActivePeriod(activePeriod);
    renderHistory();
    renderSalarySummary(activePeriod);
  }

  // ======================================
  // 15. AFFICHAGE DE LA PERIODE ACTIVE
  // ======================================

  function renderActivePeriod(period) {
    if ($("activePeriodTitle")) {
      $("activePeriodTitle").textContent =
        `Période : ${getMonthName(period.startDate)}`;
    }

    if ($("activePeriodStart")) {
      $("activePeriodStart").textContent = formatDate(period.startDate);
    }

    if ($("activeDailyHours")) {
      $("activeDailyHours").textContent = period.dailyHours || "08:00";
    }

    if ($("activeMonthlyHours")) {
      $("activeMonthlyHours").textContent =
        period.monthlyHours || "Non renseigné";
    }

    if ($("activeBaseSalary")) {
      $("activeBaseSalary").textContent =
        period.baseSalary === null || period.baseSalary === undefined
          ? "Non renseigné"
          : Number(period.baseSalary).toLocaleString("fr-FR");
    }

    renderWorkTable(period);
  }

  // ======================================
  // 16. TABLEAU DES HEURES
  // ======================================

  function renderWorkTable(period) {
    const tableBody = $("workTableBody") ||
      $("workTable")?.querySelector("tbody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    (period.rows || []).forEach((row, index) => {
      const tr = document.createElement("tr");

      const dateCell = document.createElement("td");
      const startCell = document.createElement("td");
      const endCell = document.createElement("td");
      const workedCell = document.createElement("td");
      const differenceCell = document.createElement("td");

      dateCell.textContent = formatDate(row.date);

      const startInput = document.createElement("input");
      startInput.type = "time";
      startInput.value = row.start || "";
      startInput.disabled = period.closed;
      startInput.addEventListener("change", () => {
        updateRow(period.id, index, "start", startInput.value);
      });

      const endInput = document.createElement("input");
      endInput.type = "time";
      endInput.value = row.end || "";
      endInput.disabled = period.closed;
      endInput.addEventListener("change", () => {
        updateRow(period.id, index, "end", endInput.value);
      });

      startCell.appendChild(startInput);
      endCell.appendChild(endInput);

      const worked = calculateWorkedMinutes(row.start, row.end);
      workedCell.textContent = formatDuration(worked);

      const difference = worked === null
        ? null
        : worked - getExpectedDailyMinutes(period);

      differenceCell.textContent = formatDuration(difference);

      tr.append(
        dateCell,
        startCell,
        endCell,
        workedCell,
        differenceCell
      );

      tableBody.appendChild(tr);
    });
  }

  function updateRow(periodId, rowIndex, field, value) {
    const period = periods.find(item => item.id === periodId);

    if (!period || period.closed) return;

    if (field !== "start" && field !== "end") return;

    if (value && timeToMinutes(value) === null) {
      alert("Heure invalide.");
      renderApplication();
      return;
    }

    period.rows[rowIndex][field] = value;

    if (!savePeriods()) return;

    renderApplication();
  }

  // ======================================
  // 17. AJOUTER UNE LIGNE
  // ======================================

  $("addWorkRow")?.addEventListener("click", () => {
    const period = getActivePeriod();

    if (!period || period.closed) {
      alert("Aucune période active.");
      return;
    }

    const lastRow = period.rows[period.rows.length - 1];

    let nextDate;

    if (lastRow?.date) {
      const date = new Date(`${lastRow.date}T00:00:00`);
      date.setDate(date.getDate() + 1);

      nextDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
    } else {
      nextDate = period.startDate;
    }

    period.rows.push({
      date: nextDate,
      start: "",
      end: ""
    });

    if (!savePeriods()) {
      period.rows.pop();
      return;
    }

    renderApplication();
  });

  // ======================================
  // 18. CLOTURE DE LA PERIODE
  // ======================================

  $("closePeriod")?.addEventListener("click", () => {
    const period = getActivePeriod();

    if (!period) {
      alert("Aucune période active à clôturer.");
      return;
    }

    const incompleteRows = period.rows.filter(row =>
      !row.start || !row.end
    );

    if (incompleteRows.length > 0) {
      const continueClosing = confirm(
        `${incompleteRows.length} ligne(s) ne contiennent pas toutes les heures.\n\nVoulez-vous tout de même clôturer cette période ?`
      );

      if (!continueClosing) return;
    }

    const confirmed = confirm(
      "Voulez-vous clôturer cette période ?\n\nAprès clôture, les heures ne pourront plus être modifiées."
    );

    if (!confirmed) return;

    period.closed = true;
    period.closedAt = new Date().toISOString();

    if (!savePeriods()) {
      period.closed = false;
      period.closedAt = null;
      return;
    }

    alert("La période a été clôturée.");
    renderApplication();
  });

  // ======================================
  // 19. HISTORIQUE DES PERIODES
  // ======================================

  function renderHistory() {
    const historyContainer = $("historyList");

    if (!historyContainer) return;

    historyContainer.innerHTML = "";

    const closedPeriods = periods
      .filter(period => period.closed)
      .sort((a, b) =>
        String(b.startDate).localeCompare(String(a.startDate))
      );

    if (closedPeriods.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Aucun historique pour le moment.";
      historyContainer.appendChild(empty);
      return;
    }

    closedPeriods.forEach(period => {
      const card = document.createElement("div");
      card.className = "history-card";

      const title = document.createElement("h3");
      title.textContent = getMonthName(period.startDate);

      const date = document.createElement("p");
      date.textContent = `Début : ${formatDate(period.startDate)}`;

      const worked = document.createElement("p");
      worked.textContent =
        `Total travaillé : ${formatDuration(getPeriodWorkedMinutes(period))}`;

      const difference = document.createElement("p");
      difference.textContent =
        `Écart cumulé : ${formatDuration(getPeriodDifferenceMinutes(period))}`;

      const status = document.createElement("p");
      status.textContent = "Période clôturée";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Supprimer cette période";

      deleteButton.addEventListener("click", () => {
        const confirmed = confirm(
          "Voulez-vous vraiment supprimer cette période de l'historique ? Cette action est définitive."
        );

        if (!confirmed) return;

        const oldPeriods = [...periods];
        periods = periods.filter(item => item.id !== period.id);

        if (!savePeriods()) {
          periods = oldPeriods;
          return;
        }

        renderApplication();
      });

      card.append(title, date, worked, difference, status, deleteButton);
      historyContainer.appendChild(card);
    });
  }

  // ======================================
  // 20. SUPPRIMER TOUT L'HISTORIQUE
  // ======================================

  $("deleteAllHistory")?.addEventListener("click", () => {
    const closedPeriods = periods.filter(period => period.closed);

    if (closedPeriods.length === 0) {
      alert("Aucun historique à supprimer.");
      return;
    }

    const confirmed = confirm(
      `Voulez-vous supprimer définitivement les ${closedPeriods.length} période(s) clôturée(s) ?\n\nLa période active, si elle existe, sera conservée.`
    );

    if (!confirmed) return;

    const oldPeriods = [...periods];

    periods = periods.filter(period => !period.closed);

    if (!savePeriods()) {
      periods = oldPeriods;
      return;
    }

    renderApplication();
  });

  // ======================================
  // 21. RESUME DU TEMPS ET DU SALAIRE
  // ======================================

  function renderSalarySummary(period) {
    const totalHoursElement = $("totalWorkedHours");
    const totalDifferenceElement = $("totalDifference");
    const salaryElement = $("baseSalarySummary");
    const monthlyHoursElement = $("monthlyHoursSummary");
    const legalNoticeElement = $("legalCalculationNotice");

    if (!period) {
      if (totalHoursElement) totalHoursElement.textContent = "0h00";
      if (totalDifferenceElement) totalDifferenceElement.textContent = "0h00";
      if (salaryElement) salaryElement.textContent = "Non renseigné";
      if (monthlyHoursElement) monthlyHoursElement.textContent = "Non renseigné";

      if (legalNoticeElement) {
        legalNoticeElement.textContent =
          "Les majorations légales restent à déterminer selon votre secteur et votre catégorie professionnelle.";
      }

      return;
    }

    const totalWorked = getPeriodWorkedMinutes(period);
    const totalDifference = getPeriodDifferenceMinutes(period);

    if (totalHoursElement) {
      totalHoursElement.textContent = formatDuration(totalWorked);
    }

    if (totalDifferenceElement) {
      totalDifferenceElement.textContent = formatDuration(totalDifference);
    }

    if (salaryElement) {
      salaryElement.textContent =
        period.baseSalary === null || period.baseSalary === undefined
          ? "Non renseigné"
          : `${Number(period.baseSalary).toLocaleString("fr-FR")} Ar`;
    }

    if (monthlyHoursElement) {
      monthlyHoursElement.textContent =
        period.monthlyHours || "Non renseigné";
    }

    if (legalNoticeElement) {
      legalNoticeElement.textContent =
        "Ce résumé présente les heures enregistrées et le salaire de base. Les heures supplémentaires et majorations ne sont pas encore calculées automatiquement : elles dépendent des règles applicables à votre secteur, catégorie et convention collective.";
    }
  }

  // ======================================
  // 22. EXPORTER LE RAPPORT CSV
  // ======================================

  $("downloadReport")?.addEventListener("click", () => {
    const period = getActivePeriod() ||
      periods
        .filter(item => item.closed)
        .sort((a, b) =>
          String(b.startDate).localeCompare(String(a.startDate))
        )[0];

    if (!period) {
      alert("Aucune période à exporter.");
      return;
    }

    const rows = [
      [
        "Date",
        "Heure début",
        "Heure fin",
        "Heures travaillées",
        "Écart journalier"
      ]
    ];

    (period.rows || []).forEach(row => {
      const worked = calculateWorkedMinutes(row.start, row.end);
      const difference = worked === null
        ? null
        : worked - getExpectedDailyMinutes(period);

      rows.push([
        row.date || "",
        row.start || "",
        row.end || "",
        worked === null ? "" : formatDuration(worked),
        difference === null ? "" : formatDuration(difference)
      ]);
    });

    const csv = rows
      .map(row =>
        row.map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(";")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `AsA-rapport-${period.startDate}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  });

  // ======================================
  // 23. REINITIALISER LES DONNEES DE TEST
  // ======================================

  $("resetTestData")?.addEventListener("click", () => {
    if (!currentUser) {
      alert("Veuillez vous connecter.");
      return;
    }

    const confirmed = confirm(
      "Cette action supprimera les périodes enregistrées localement pour ce compte sur cet appareil.\n\nVoulez-vous continuer ?"
    );

    if (!confirmed) return;

    localStorage.removeItem(getStorageKey());
    periods = [];

    renderApplication();

    alert("Les données locales de ce compte ont été réinitialisées.");
  });

  // ======================================
  // 24. INITIALISATION DES CHAMPS
  // ======================================

  if ($("periodStart") && !$("periodStart").value) {
    $("periodStart").value = getTodayString();
  }

  if ($("dailyHours") && !$("dailyHours").value) {
    $("dailyHours").value = "08:00";
  }

  // Ne pas imposer de valeur légale universelle.
  // L'utilisateur choisit sa durée de référence.
  if ($("monthlyHours") && !$("monthlyHours").value) {
    $("monthlyHours").value = "173:20";
  }

  // ======================================
  // 25. PREMIER AFFICHAGE
  // ======================================

  if ($("page005")) {
    $("page005").classList.add("hidden");
  }

  if ($("page001")) {
    showPage("page001");
  }
});

    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(contact)) {
      setMessage(
        loginMessage,
        "La connexion par téléphone n'est pas encore activée. Utilisez votre adresse e-mail.",
        true
      );
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      setMessage(loginMessage, "Connexion en cours...");
      await signInWithEmailAndPassword(auth, contact, password);
      loginForm.reset();
    } catch (error) {
      setMessage(loginMessage, firebaseErrorMessage(error), true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  // ======================================
  // 7. RESTAURATION DE LA SESSION
  // ======================================

  onAuthStateChanged(auth, async user => {
    if (registrationInProgress || authCheckInProgress) return;

    authCheckInProgress = true;
    currentUser = user;

    try {
      if (user) {
        const profileReference = doc(db, "users", user.uid);
        let profileSnapshot = await getDoc(profileReference);

        if (!profileSnapshot.exists()) {
          // Reprendre un profil temporaire si la création Auth avait réussi
          // mais que l'enregistrement Firestore avait échoué.
          const pendingRaw = localStorage.getItem(
            `asaPendingProfile_${user.uid}`
          );

          if (pendingRaw) {
            try {
              const pendingProfile = JSON.parse(pendingRaw);
              await setDoc(profileReference, pendingProfile);
              localStorage.removeItem(`asaPendingProfile_${user.uid}`);
              profileSnapshot = await getDoc(profileReference);
            } catch (pendingError) {
              console.error("Nouvelle tentative du profil échouée :", pendingError);
            }
          }
        }

        if (!profileSnapshot.exists()) {
          currentProfile = null;
          periods = [];
          authReady = true;

          setMessage(
            loginMessage,
            "Profil introuvable dans la base de données. Veuillez contacter l'administrateur.",
            true
          );
          showPage("page002");
          return;
        }

        currentProfile = profileSnapshot.data();
        loadPeriods();
        displayProfile(currentProfile);
      } else {
        currentProfile = null;
        periods = [];
      }

      authReady = true;
      showInitialPage();
    } catch (error) {
      console.error("Erreur de restauration de session :", error);
      currentProfile = null;
      authReady = true;

      setMessage(
        loginMessage,
        "Impossible de charger votre profil. Vérifiez votre connexion Internet puis rechargez la page.",
        true
      );

      if (splashFinished) showPage("page002");
    } finally {
      authCheckInProgress = false;
    }
  });

  // ======================================
  // 8. PROFIL
  // ======================================

  function displayProfile(profile) {
    $("welcomeName").textContent = `"${profile?.name || ""}"`;

    const photo = $("profilePhoto");
    const photoButton = $("choosePhoto");

    if (profile?.photo) {
      photo.src = profile.photo;
      photoButton.classList.add("has-photo");
    } else {
      photo.removeAttribute("src");
      photoButton.classList.remove("has-photo");
    }
  }

  // ======================================
  // 9. PHOTO DE PROFIL
  // ======================================

  $("choosePhoto")?.addEventListener("click", () => {
    if (!currentUser) return;
    $("photoInput").click();
  });

  $("photoInput")?.addEventListener("change", async () => {
    const file = $("photoInput").files?.[0];
    const photoMessage = $("photoMessage");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(photoMessage, "Veuillez choisir une image valide.", true);
      $("photoInput").value = "";
      return;
    }

    // Limite d'entrée pour éviter de traiter des fichiers énormes.
    if (file.size > 8 * 1024 * 1024) {
      setMessage(
        photoMessage,
        "La photo est trop volumineuse. Choisissez une image de moins de 8 Mo.",
        true
      );
      $("photoInput").value = "";
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      setMessage(photoMessage, "Impossible de lire cette image.", true);
    };

    reader.onload = event => {
      const image = new Image();

      image.onerror = () => {
        setMessage(photoMessage, "Impossible de lire cette image.", true);
      };

      image.onload = async () => {
        try {
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
          if (!context) throw new Error("Canvas indisponible.");

          context.drawImage(image, 0, 0, width, height);

          const compressedPhoto = canvas.toDataURL("image/jpeg", 0.65);

          // Une photo encodée en base64 dans Firestore peut dépasser
          // la limite de taille d'un document. On limite donc sa taille.
          if (compressedPhoto.length > 700000) {
            setMessage(
              photoMessage,
              "Cette photo reste trop volumineuse après compression. Choisissez une autre image.",
              true
            );
            return;
          }

          setMessage(photoMessage, "Enregistrement de la photo...");

          const updatedProfile = {
            ...currentProfile,
            photo: compressedPhoto
          };

          await setDoc(doc(db, "users", currentUser.uid), updatedProfile);

          currentProfile = updatedProfile;
          displayProfile(currentProfile);

          setMessage(photoMessage, "Photo de profil mise à jour.");
        } catch (error) {
          console.error("Erreur photo :", error);
          setMessage(
            photoMessage,
            "Impossible d'enregistrer la photo. Vérifiez votre connexion.",
            true
          );
        } finally {
          $("photoInput").value = "";
        }
      };

      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });

  // ======================================
  // 10. NAVIGATION VERS LA PAGE DE TRAVAIL
  // ======================================

  $("enterApp")?.addEventListener("click", () => {
    if (!currentUser) return;

    if (!currentProfile?.photo) {
      setMessage(
        $("photoMessage"),
        "Veuillez ajouter votre photo de profil avant de continuer.",
        true
      );
      return;
    }

    showPage("page005");
    initializeWorkPage();
  });

  $("backProfile")?.addEventListener("click", () => {
    showPage("page004");
  });

  // ======================================
  // 11. MENU PROFIL ET DECONNEXION
  // ======================================

  document.querySelectorAll(".menu-container").forEach(container => {
    const menuButton = container.querySelector(".menu-button");
    const menuDropdown = container.querySelector(".menu-dropdown");

    if (!menuButton || !menuDropdown) return;

    menuButton.addEventListener("click", () => {
      const isOpen = !menuDropdown.classList.contains("hidden");
      menuDropdown.classList.toggle("hidden");
      menuButton.setAttribute("aria-expanded", String(!isOpen));
    });

    container.querySelector(".menu-profile")?.addEventListener("click", () => {
      menuDropdown.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
      if (currentUser) showPage("page004");
    });

    container.querySelector(".menu-logout")?.addEventListener("click", async () => {
      if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;

      try {
        await signOut(auth);
        currentUser = null;
        currentProfile = null;
        periods = [];

        menuDropdown.classList.add("hidden");
        menuButton.setAttribute("aria-expanded", "false");
        showPage("page002");
      } catch (error) {
        console.error("Erreur de déconnexion :", error);
        alert("Impossible de se déconnecter. Veuillez réessayer.");
      }
    });
  });

  // ======================================
  // 12. STOCKAGE LOCAL DES PERIODES
  // ======================================

  function getStorageKey() {
    return currentUser ? `${STORAGE_KEY}_${currentUser.uid}` : null;
  }

  function loadPeriods() {
    if (!currentUser) {
      periods = [];
      return;
    }

    const userKey = getStorageKey();

    try {
      const userSaved = localStorage.getItem(userKey);

      if (userSaved !== null) {
        const parsed = JSON.parse(userSaved);
        periods = Array.isArray(parsed) ? parsed : [];
        return;
      }

      // Ancien historique non associé à un compte.
      // On ne le supprime jamais automatiquement.
      const legacySaved = localStorage.getItem(STORAGE_KEY);
      const decisionKey = LEGACY_IMPORT_PREFIX + currentUser.uid;
      const previousDecision = localStorage.getItem(decisionKey);

      if (legacySaved !== null && previousDecision === null) {
        const shouldImport = confirm(
          "Un ancien historique AsA a été trouvé sur cet appareil. Voulez-vous le copier dans ce compte ? L'ancien historique sera conservé."
        );

        if (shouldImport) {
          const legacyPeriods = JSON.parse(legacySaved);

          if (Array.isArray(legacyPeriods)) {
            periods = legacyPeriods;
            localStorage.setItem(userKey, JSON.stringify(periods));
            localStorage.setItem(decisionKey, "imported");
          } else {
            periods = [];
            localStorage.setItem(decisionKey, "invalid");
          }
        } else {
          periods = [];
          localStorage.setItem(decisionKey, "skipped");
        }
      } else {
        periods = [];
      }
    } catch (error) {
      console.error("Erreur de lecture du stockage local :", error);
      periods = [];
      alert(
        "Impossible de lire certaines données locales. Elles n'ont pas été supprimées. Évitez de vider les données du navigateur."
      );
    }
  }

  function savePeriods() {
    if (!currentUser) return false;

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(periods));
      return true;
    } catch (error) {
      console.error("Erreur de sauvegarde locale :", error);
      alert(
        "La sauvegarde locale a échoué. L'espace de stockage du navigateur est peut-être plein. Vos données en mémoire ne sont pas volontairement supprimées."
      );
      return false;
    }
  }

  // ======================================
  // 13. OUTILS DATE / HEURE / MONNAIE
  // ======================================

  function formatDate(dateString) {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function dateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function minutesToTime(minutes) {
    const safeMinutes = Number(minutes) || 0;
    const sign = safeMinutes < 0 ? "-" : "";
    const absolute = Math.abs(safeMinutes);
    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;

    return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  function timeToMinutes(time) {
    if (!time || typeof time !== "string") return null;

    const match = time.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  function parseMonthlyHours(value) {
    const match = String(value || "").trim().match(/^(\d{1,3}):(\d{2})$/);

    if (!match || Number(match[2]) > 59) return null;

    const total = Number(match[1]) * 60 + Number(match[2]);
    return total > 0 ? total : null;
  }

  function formatAr(value) {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2
    }).format(Number(value) || 0) + " Ar";
  }

  // ======================================
  // 14. PERIODE ACTIVE
  // ======================================

  function getActivePeriod() {
    return periods.find(period => !period.closed) || null;
  }

  function calculateRow(row, dailyHours) {
    if (!row?.start || !row?.end) {
      return { worked: null, difference: null, invalid: false };
    }

    const start = timeToMinutes(row.start);
    let end = timeToMinutes(row.end);
    const expected = timeToMinutes(dailyHours);

    if (start === null || end === null || expected === null) {
      return { worked: null, difference: null, invalid: true };
    }

    // Autoriser un service qui se termine après minuit.
    if (end < start) end += 24 * 60;

    const worked = end - start;

    if (worked > 24 * 60) {
      return { worked: null, difference: null, invalid: true };
    }

    return {
      worked,
      difference: worked - expected,
      invalid: false
    };
  }

  function calculatePeriodTotals(period) {
    let totalWorked = 0;
    let totalDifference = 0;
    let incompleteRows = 0;
    let invalidRows = 0;

    (period.rows || []).forEach(row => {
      const result = calculateRow(row, period.dailyHours);

      if (result.invalid) {
        invalidRows++;
      } else if (result.worked === null) {
        incompleteRows++;
      } else {
        totalWorked += result.worked;
        totalDifference += result.difference;
      }
    });

    return {
      totalWorked,
      totalDifference,
      incompleteRows,
      invalidRows
    };
  }

  // ======================================
  // 15. CALCUL SALARIAL PROVISOIRE
  // ======================================
  // IMPORTANT :
  // L'horaire mensuel saisi par l'utilisateur sert de référence
  // et de base indicative au taux horaire.
  // Il ne devient PAS automatiquement le seuil légal des heures
  // supplémentaires. Les majorations restent à configurer selon
  // le régime légal, le secteur, la catégorie et les accords applicables.

  function calculateSalary(period) {
    const totals = calculatePeriodTotals(period);

    const monthlyMinutes = Number(
      period.monthlyHoursMinutes ??
      parseMonthlyHours(period.monthlyHours)
    );

    const baseSalary = Number(period.baseSalary);

    if (
      !Number.isFinite(monthlyMinutes) ||
      monthlyMinutes <= 0 ||
      !Number.isFinite(baseSalary) ||
      baseSalary <= 0
    ) {
      return null;
    }

    const hourlyRate = baseSalary / (monthlyMinutes / 60);

    return {
      totalWorkedMinutes: totals.totalWorked,
      referenceMonthlyMinutes: monthlyMinutes,
      hourlyRate,
      baseSalary,
      overtimeMinutes: null,
      overtimeAmount: null,
      grossSalary: null,
      legalMajorationsConfigured: false
    };
  }

  // ======================================
  // 16. INITIALISER LA PAGE 005
  // ======================================

  function initializeWorkPage() {
    if (!currentUser) return;

    const active = getActivePeriod();
    const newPeriodForm = $("newPeriodForm");
    const activePeriod = $("activePeriod");

    const needsSalaryInfo = Boolean(
      active && (
        !active.monthlyHoursMinutes ||
        !active.baseSalary
      )
    );

    newPeriodForm.classList.toggle(
      "hidden",
      Boolean(active) && !needsSalaryInfo
    );

    activePeriod.classList.toggle("hidden", !active);
    $("salarySummary").classList.add("hidden");

    const periodStartInput = $("periodStart");
    const dailyHoursInput = $("dailyHours");
    const monthlyHoursInput = $("monthlyHours");
    const baseSalaryInput = $("baseSalary");
    const startButton = $("startPeriod");

    if (active) {
      periodStartInput.value = active.startDate || "";
      dailyHoursInput.value = active.dailyHours || "08:00";

      periodStartInput.disabled = true;
      dailyHoursInput.disabled = true;

      monthlyHoursInput.value = active.monthlyHours || "";
      baseSalaryInput.value = active.baseSalary || "";

      startButton.textContent = "Enregistrer les informations";

      $("periodStartDisplay").textContent =
        formatDate(active.startDate);

      $("dailyHoursDisplay").textContent =
        active.dailyHours || "--:--";

      $("monthlyHoursDisplay").textContent =
        active.monthlyHours || "Non renseigné";

      $("baseSalaryDisplay").textContent =
        active.baseSalary ? formatAr(active.baseSalary) : "Non renseigné";

      renderWorkTable(active);
    } else {
      periodStartInput.disabled = false;
      dailyHoursInput.disabled = false;
      startButton.textContent = "Commencer la période";
      periodStartInput.value = periodStartInput.value || dateToString(new Date());
      dailyHoursInput.value = dailyHoursInput.value || "08:00";
    }

    renderHistory();
  }

  // ======================================
  // 17. CREER / COMPLETER UNE PERIODE
  // ======================================

  $("startPeriod")?.addEventListener("click", () => {
    if (!currentUser) return;

    const active = getActivePeriod();

    const monthlyHours = $("monthlyHours").value.trim();
    const monthlyHoursMinutes = parseMonthlyHours(monthlyHours);
    const baseSalary = Number($("baseSalary").value);

    if (!monthlyHours || !baseSalary) {
      alert("Veuillez remplir les heures mensuelles et le salaire de base.");
      return;
    }

    if (monthlyHoursMinutes === null) {
      alert("Format invalide. Exemple : 173:20 ou 180:00.");
      return;
    }

    if (!Number.isFinite(baseSalary) || baseSalary <= 0) {
      alert("Veuillez saisir un salaire de base valide.");
      return;
    }

    if (active) {
      active.monthlyHours = monthlyHours;
      active.monthlyHoursMinutes = monthlyHoursMinutes;
      active.baseSalary = baseSalary;

      if (savePeriods()) {
        initializeWorkPage();
        alert("Informations enregistrées avec succès.");
      }
      return;
    }

    const startDate = $("periodStart").value;
    const dailyHours = $("dailyHours").value;
    const dailyMinutes = timeToMinutes(dailyHours);

    if (!startDate || dailyMinutes === null || dailyMinutes <= 0) {
      alert("Veuillez vérifier la date de début et l'horaire journalier.");
      return;
    }

    const period = {
      id: Date.now(),
      startDate,
      dailyHours,
      monthlyHours,
      monthlyHoursMinutes,
      baseSalary,
      rows: [],
      closed: false,
      endDate: null,
      salary: null
    };

    periods.push(period);

    if (savePeriods()) {
      initializeWorkPage();
    } else {
      periods = periods.filter(item => item.id !== period.id);
    }
  });

  // ======================================
  // 18. AJOUTER UNE LIGNE DE TRAVAIL
  // ======================================

  $("addWorkLine")?.addEventListener("click", () => {
    const active = getActivePeriod();

    if (!active || active.closed) return;

    let nextDate;

    if (!active.rows || active.rows.length === 0) {
      nextDate = active.startDate;
    } else {
      const lastDate = active.rows[active.rows.length - 1].date;
      const date = new Date(`${lastDate}T12:00:00`);

      if (Number.isNaN(date.getTime())) {
        alert("La date de la dernière ligne est invalide.");
        return;
      }

      date.setDate(date.getDate() + 1);
      nextDate = dateToString(date);
    }

    active.rows = active.rows || [];
    active.rows.push({
      date: nextDate,
      start: "",
      end: ""
    });

    if (savePeriods()) {
      renderWorkTable(active);
    } else {
      active.rows.pop();
    }
  });

  // ======================================
  // 19. AFFICHER LE TABLEAU DES HEURES
  // ======================================

  function renderWorkTable(period) {
    const tbody = $("workTableBody");
    tbody.innerHTML = "";

    let totalWorked = 0;
    let totalDifference = 0;

    (period.rows || []).forEach(row => {
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
      startInput.value = row.start || "";
      startInput.disabled = Boolean(period.closed);
      startInput.setAttribute("aria-label", "Heure de début");

      startInput.addEventListener("change", () => {
        const previousValue = row.start;
        row.start = startInput.value;

        if (savePeriods()) {
          renderWorkTable(period);
        } else {
          row.start = previousValue || "";
          startInput.value = row.start;
        }
      });

      startCell.appendChild(startInput);

      const endCell = document.createElement("td");
      const endInput = document.createElement("input");
      endInput.type = "time";
      endInput.value = row.end || "";
      endInput.disabled = Boolean(period.closed);
      endInput.setAttribute("aria-label", "Heure de fin");

      endInput.addEventListener("change", () => {
        const previousValue = row.end;
        row.end = endInput.value;

        if (savePeriods()) {
          renderWorkTable(period);
        } else {
          row.end = previousValue || "";
          endInput.value = row.end;
        }
      });

      endCell.appendChild(endInput);

      const workedCell = document.createElement("td");
      workedCell.textContent = result.invalid
        ? "Erreur"
        : result.worked === null
          ? "--:--"
          : minutesToTime(result.worked);

      const differenceCell = document.createElement("td");
      differenceCell.textContent = result.invalid
        ? "Erreur"
        : result.difference === null
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

    $("totalHours").textContent = minutesToTime(totalWorked);
    $("totalDifference").textContent = minutesToTime(totalDifference);
  }
                  
  // ======================================
  // 20. RAPPORT CSV
  // ======================================

  function downloadPeriod(period) {
    const lines = [
      ["Date", "H. début", "H. fin", "H/J", "Écart par rapport à l'horaire journalier"]
    ];

    (period.rows || []).forEach(row => {
      const result = calculateRow(row, period.dailyHours);

      lines.push([
        formatDate(row.date),
        row.start || "",
        row.end || "",
        result.worked === null ? "" : minutesToTime(result.worked),
        result.difference === null ? "" : minutesToTime(result.difference)
      ]);
    });

    const salary = period.salary || calculateSalary(period);

    if (salary) {
      lines.push([]);
      lines.push(["RÉCAPITULATIF"]);
      lines.push(["Salaire de base saisi", period.baseSalary]);
      lines.push(["Horaire mensuel de référence", period.monthlyHours]);
      lines.push(["Total heures travaillées", minutesToTime(salary.totalWorkedMinutes)]);
      lines.push(["Taux horaire indicatif", salary.hourlyRate.toFixed(2)]);
      lines.push(["Heures supplémentaires légales", "À déterminer selon le régime applicable"]);
      lines.push(["Majorations légales", "Non calculées dans cette version"]);
      lines.push(["Salaire de base hors majorations", salary.baseSalary.toFixed(2)]);
    }

    const csv = lines.map(line =>
      line.map(value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`
      ).join(";")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `AsA-rapport-${period.startDate || "periode"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $("downloadReport")?.addEventListener("click", () => {
    const active = getActivePeriod();
    if (active) downloadPeriod(active);
  });

  // ======================================
  // 21. RECAPITULATIF DU SALAIRE
  // ======================================

  function displaySalarySummary(period, salary) {
    $("summaryBaseSalary").textContent = formatAr(period.baseSalary);
    $("summaryNormalHours").textContent =
      minutesToTime(salary.totalWorkedMinutes);

    $("summaryOvertimeHours").textContent =
      "À déterminer selon le régime applicable";

    $("summaryHourlyRate").textContent =
      `${formatAr(salary.hourlyRate)} (indicatif)`;

    $("summaryOvertimeAmount").textContent =
      "Non calculé";

    $("summaryGrossSalary").textContent =
      `${formatAr(salary.baseSalary)} (hors majorations)`;

    // On corrige les libellés de l'ancien HTML sans changer son design.
    const summary = $("salarySummary");
    const paragraphs = summary.querySelectorAll(".salary-summary-content p");

    paragraphs.forEach(paragraph => {
      const text = paragraph.textContent || "";

      if (text.includes("Total heures normales")) {
        paragraph.firstChild.textContent = "Total heures travaillées : ";
      }

      if (text.includes("Total heures supplémentaires")) {
        paragraph.firstChild.textContent = "Heures supplémentaires légales : ";
      }

      if (text.includes("Majoration des heures supplémentaires")) {
        paragraph.firstChild.textContent = "Majorations légales : ";
      }
    });

    const resultLabel = summary.querySelector(".salary-result p");
    if (resultLabel) {
      resultLabel.textContent = "SALAIRE DE BASE HORS MAJORATIONS";
    }
  }

  // ======================================
  // 22. DEMANDER LA FERMETURE DE PERIODE
  // ======================================

  $("closePeriod")?.addEventListener("click", () => {
    const active = getActivePeriod();

    if (!active) return;

    if (!active.rows || active.rows.length === 0) {
      alert("Veuillez ajouter au moins une ligne de travail.");
      return;
    }

    const incomplete = active.rows.some(row => !row.start || !row.end);

    if (incomplete) {
      alert("Veuillez compléter toutes les heures avant de fermer la période.");
      return;
    }

    const invalid = active.rows.some(
      row => calculateRow(row, active.dailyHours).invalid
    );

    if (invalid) {
      alert("Une ou plusieurs lignes contiennent des heures invalides.");
      return;
    }

    const salary = calculateSalary(active);

    if (!salary) {
      alert("Les informations du salaire sont incomplètes. Vérifiez les heures mensuelles et le salaire de base.");
      return;
    }

    displaySalarySummary(active, salary);

    $("activePeriod").classList.add("hidden");
    $("salarySummary").classList.remove("hidden");
  });

  $("cancelClosePeriod")?.addEventListener("click", () => {
    $("salarySummary").classList.add("hidden");
    $("activePeriod").classList.remove("hidden");
  });

  // ======================================
  // 23. CONFIRMER LA FERMETURE
  // ======================================

  $("confirmClosePeriod")?.addEventListener("click", () => {
    const active = getActivePeriod();
    if (!active) return;

    const salary = calculateSalary(active);

    if (!salary) {
      alert("Impossible de préparer le récapitulatif. Vérifiez les informations.");
      return;
    }

    const previousState = {
      salary: active.salary,
      closed: active.closed,
      endDate: active.endDate
    };

    active.salary = salary;
    active.closed = true;
    active.endDate = active.rows[active.rows.length - 1].date;

    if (!savePeriods()) {
      active.salary = previousState.salary;
      active.closed = previousState.closed;
      active.endDate = previousState.endDate;
      return;
    }

    $("salarySummary").classList.add("hidden");
    initializeWorkPage();

    alert(
      "Période fermée. Le salaire affiché est hors majorations légales, qui restent à déterminer selon le régime applicable."
    );
  });

  // ======================================
  // 24. HISTORIQUE
  // ======================================

  function renderHistory() {
    const history = $("periodHistory");
    history.innerHTML = "";

    const closedPeriods = periods
      .filter(period => period.closed)
      .sort((a, b) => Number(b.id) - Number(a.id));

    if (closedPeriods.length === 0) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "Aucune période terminée.";
      history.appendChild(empty);
      return;
    }

    closedPeriods.forEach(period => {
      const item = document.createElement("div");
      item.className = "history-item";

      const title = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent =
        `${formatDate(period.startDate)} → ${formatDate(period.endDate)}`;
      title.appendChild(strong);

      const daily = document.createElement("p");
      daily.textContent = `Heure journalière : ${period.dailyHours || "--:--"}`;

      const monthly = document.createElement("p");
      monthly.textContent =
        `Horaire mensuel de référence : ${period.monthlyHours || "--:--"}`;

      const base = document.createElement("p");
      base.textContent =
        `Salaire de base : ${formatAr(period.baseSalary || 0)}`;

      const status = document.createElement("p");
      status.className = "history-status";
      status.textContent = "Période fermée";

      const totals = calculatePeriodTotals(period);
      const summaryTable = document.createElement("table");
      summaryTable.className = "history-summary";

      const summaryRows = [
        ["TOTAL HEURES", minutesToTime(totals.totalWorked)],
        ["TOTAL ÉCART", minutesToTime(totals.totalDifference)]
      ];

      const salary = period.salary;

      if (salary) {
        summaryRows.push(
          ["TAUX HORAIRE INDICATIF", formatAr(salary.hourlyRate)],
          ["HEURES SUPPLÉMENTAIRES LÉGALES", "À déterminer"],
          ["MAJORATIONS", "Non calculées"],
          ["SALAIRE DE BASE HORS MAJORATIONS", formatAr(salary.baseSalary)]
        );
      }

      summaryRows.forEach(data => {
        const tr = document.createElement("tr");
        const label = document.createElement("td");
        const value = document.createElement("td");

        label.textContent = data[0];
        value.textContent = data[1];

        tr.append(label, value);
        summaryTable.appendChild(tr);
      });

      const downloadButton = document.createElement("button");
      downloadButton.className = "blue-button";
      downloadButton.type = "button";
      downloadButton.textContent = "Télécharger le rapport";
      downloadButton.addEventListener("click", () => downloadPeriod(period));

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-period-button";
      deleteButton.type = "button";
      deleteButton.textContent = "Supprimer";
      deleteButton.addEventListener("click", () => deletePeriod(period.id));

      item.append(
        title,
        daily,
        monthly,
        base,
        status,
        summaryTable,
        downloadButton,
        deleteButton
      );

      history.appendChild(item);
    });
  }

  // ======================================
  // 25. SUPPRIMER UNE PERIODE
  // ======================================

  function deletePeriod(periodId) {
    const confirmation = confirm(
      "Voulez-vous vraiment supprimer cette période de l'historique ? Cette action est irréversible."
    );

    if (!confirmation) return;

    const previousPeriods = periods;
    periods = periods.filter(
      period => String(period.id) !== String(periodId)
    );

    if (savePeriods()) {
      renderHistory();
      alert("Période supprimée.");
    } else {
      periods = previousPeriods;
    }
  }

  // ======================================
  // 26. SUPPRIMER TOUT L'HISTORIQUE
  // ======================================

  $("deleteAllHistory")?.addEventListener("click", () => {
    const closedPeriods = periods.filter(period => period.closed);

    if (closedPeriods.length === 0) {
      alert("Aucun historique à supprimer.");
      return;
    }

    const confirmation = confirm(
      "Voulez-vous vraiment supprimer tout l'historique des périodes terminées ? La période en cours sera conservée. Cette action est irréversible."
    );

    if (!confirmation) return;

    const previousPeriods = periods;
    periods = periods.filter(period => !period.closed);

    if (savePeriods()) {
      renderHistory();
      alert("L'historique des périodes terminées a été supprimé.");
    } else {
      periods = previousPeriods;
    }
  });

  // ======================================
  // 27. FIN DU SCRIPT
  // ======================================
});
                           
    
