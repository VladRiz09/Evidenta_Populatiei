document.addEventListener("DOMContentLoaded", () => {
    let currentPerson = null; // Variabilă globală pentru persoana curentă
    let currentSearchName = ""; // Variabilă globală pentru a reține numele căutat
    
    //test
    const recentCaseButton = document.getElementById("recent"); // Noul ID al butonului

    if (recentCaseButton) {
      console.log("Butonul 'recent' a fost găsit."); // Debugging: confirmăm existența butonului
  
      recentCaseButton.addEventListener("click", () => {
        console.log("Butonul 'recent' a fost apăsat."); // Debugging: confirmăm apăsarea butonului
  
        // Cod pentru gestionarea acțiunii butonului
        fetchMostRecentCase();
      });
    } else {
      console.error("Butonul 'recent' nu a fost găsit."); // Debugging: eroare în cazul în care butonul lipsește
    }

    //test



    // Funcția pentru afișarea notificărilor (toast)
    function showToast(message, type = "success") {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
    
        // Adăugăm iconița în funcție de tipul notificării
        const icon = document.createElement("span");
        icon.className = "toast-icon";
        if (type === "success") {
            icon.textContent = "✔️"; // Icon pentru succes
        } else if (type === "error") {
            icon.textContent = "❌"; // Icon pentru eroare
        } else if (type === "warning") {
            icon.textContent = "⚠️"; // Icon pentru avertizare
        } else if (type === "info") {
            icon.textContent = "ℹ️"; // Icon pentru informare
        }
    
        // Adăugăm mesajul notificării
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
    
        // Adăugăm iconița și mesajul în notificare
        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        toastContainer.appendChild(toast);
    
        // Eliminăm notificarea după 5 secunde
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
  function populateSearchResultsTable(searchResults) {
    const tableBody = document.querySelector("#search-results-table tbody");
    tableBody.innerHTML = ""; // Clear existing table

    if (searchResults.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="10">Nu s-au găsit rezultate.</td>`;
        tableBody.appendChild(tr);
    } else {
        searchResults.forEach((row) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.ID_Persoana}</td>
                <td>${row.Nume}</td>
                <td>${row.Prenume}</td>
                <td>${row.DataNasterii || "N/A"}</td>
                <td>${row.CNP || "N/A"}</td>
                <td>${row.NumarTelefon || "N/A"}</td>
                <td>${row.StareCivila || "N/A"}</td>
                <td>${row.Sex || "N/A"}</td>
                <td>
                    <p><strong>Adrese:</strong> ${row.Adrese || "N/A"}</p>
                    <p><strong>Acte:</strong> ${row.Acte || "N/A"}</p>
                    <p><strong>Mașini:</strong> ${row.Masini || "N/A"}</p>
                    <p><strong>Cazier:</strong> ${row.Cazier || "N/A"}</p>
                    <p><strong>Contacte Urgență:</strong> ${row.ContacteUrgenta || "N/A"}</p>
                </td>
                <td><button class="edit-btn" data-id="${row.ID_Persoana}">Editează</button></td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

    // Funcția pentru căutarea persoanelor
	async function searchPersons() {
    const name = document.getElementById("search-name-input").value.trim();

    if (!name) {
        showToast("Introduceți un nume pentru căutare.", "error");
        return;
    }

    currentSearchName = name; // Salvăm numele căutat

    try {
        const response = await fetch(`/api/Asearch?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la căutarea persoanelor.");
        }

        const searchResults = await response.json();
        populateSearchResultsTable(searchResults);
        showToast("Căutarea a fost efectuată cu succes!");
    } catch (error) {
        console.error("Eroare la căutare:", error);
        showToast(error.message, "error");
    }
}

    // Eveniment pentru butonul de căutare
    const searchButton = document.getElementById("search-btn");
    if (searchButton) {
        searchButton.addEventListener("click", searchPersons);
    }

    // Restul evenimentelor și funcțiilor (populare, editare, salvare) sunt deja implementate.
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
        const id = event.target.dataset.id;

        try {
            const response = await fetch(`/api/Asearch?id=${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Eroare la obținerea detaliilor.");
            }

            const details = await response.json();
            console.log("Detalii primite:", details); // Debugging

            // Populează câmpurile principale
            document.getElementById("edit-id").value = details.ID_Persoana || "";
            document.getElementById("edit-nume").value = details.Nume || "";
            document.getElementById("edit-prenume").value = details.Prenume || "";
            document.getElementById("edit-data-nasterii").value = details.DataNasterii || "";
            document.getElementById("edit-cnp").value = details.CNP || "";
            document.getElementById("edit-telefon").value = details.NumarTelefon || "";
            document.getElementById("edit-stare-civila").value = details.StareCivila || "";
            document.getElementById("edit-sex").value = details.Sex || "";

            // Populează câmpurile dinamice
            populateSection("addresses-section", details.Adrese, [
                { label: "Stradă", name: "strada" },
                { label: "Număr", name: "numar" },
                { label: "Bloc", name: "bloc" },
                { label: "Apartament", name: "apartament" },
                { label: "Oraș", name: "oras" },
                { label: "Județ", name: "judet" },
                { label: "Cod Poștal", name: "codpostal" },
            ]);

            populateSection("documents-section", details.Acte, [
                { label: "Tip Act", name: "tip" },
                { label: "Serie", name: "serie" },
                { label: "Număr", name: "numar" },
                { label: "Data Emiterii", name: "dataEmitere" },
                { label: "Data Expirării", name: "dataExpirare" },
            ]);

            populateSection("cars-section", details.Masini, [
                { label: "Marcă", name: "marca" },
                { label: "Model", name: "model" },
                { label: "An fabricație", name: "anFabricatie" },
                { label: "Număr Înmatriculare", name: "numarInmatriculare" },
            ]);

            populateSection("criminal-records-section", details.Cazier, [
                { label: "Infracțiune", name: "infractiune" },
                { label: "Data Comiterii", name: "dataComitere" },
                { label: "Sentință", name: "sentinta" },
            ]);

            populateSection("emergency-contacts-section", details.ContacteUrgenta, [
                { label: "Nume Contact", name: "numeContact" },
                { label: "Relație", name: "relatie" },
                { label: "Telefon", name: "telefon" },
            ]);

            // Afișăm modalul pentru editare
            document.getElementById("edit-modal").style.display = "block";
        } catch (error) {
            console.error("Eroare la obținerea detaliilor:", error);
            showToast(error.message, "error");
        }
    }
});

// Funcția generală pentru popularea secțiunilor dinamice
function populateSection(sectionId, data, fields) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error(`Elementul cu ID-ul "${sectionId}" nu există în DOM.`);
        return; // Oprește execuția dacă elementul nu există
    }

    section.innerHTML = ""; // Curăță secțiunea

    data?.split("; ").forEach((item) => {
        const values = item.split(", ");
        const div = document.createElement("div");
        div.className = `${sectionId}-row`;

        fields.forEach((field, index) => {
            const label = document.createElement("label");
            label.textContent = field.label;
            const input = document.createElement("input");
            input.type = field.name.includes("data") ? "date" : "text"; // Input de tip "date" pentru date
            input.value = values[index] || "";
            input.className = `${sectionId}-${field.name}`;
            div.appendChild(label);
            div.appendChild(input);
        });

        section.appendChild(div);
    });
}




// Funcția pentru trimiterea formularului de editare
document.getElementById("edit-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Previne reîncărcarea paginii

    // Preluare date din formular
    const id = document.getElementById("edit-id").value;
    const nume = document.getElementById("edit-nume").value;
    const prenume = document.getElementById("edit-prenume").value;
    const dataNasterii = document.getElementById("edit-data-nasterii").value;
    const cnp = document.getElementById("edit-cnp").value;
    const telefon = document.getElementById("edit-telefon").value;
    const stareCivila = document.getElementById("edit-stare-civila").value;
    const sex = document.getElementById("edit-sex").value;

    // Preluare date din secțiunea Adrese
    const adrese = Array.from(document.querySelectorAll("#addresses-section .addresses-section-row")).map((row) => ({
        strada: row.querySelector(".addresses-section-strada").value,
        numar: row.querySelector(".addresses-section-numar").value,
        bloc: row.querySelector(".addresses-section-bloc").value,
        apartament: row.querySelector(".addresses-section-apartament").value,
        oras: row.querySelector(".addresses-section-oras").value,
        judet: row.querySelector(".addresses-section-judet").value,
        codPostal: row.querySelector(".addresses-section-codpostal").value,
    }));

    // Preluare date din secțiunea Acte
    const acte = Array.from(document.querySelectorAll("#documents-section .documents-section-row")).map((row) => ({
        tip: row.querySelector(".documents-section-tip").value,
        serie: row.querySelector(".documents-section-serie").value,
        numar: row.querySelector(".documents-section-numar").value,
        dataEmitere: row.querySelector(".documents-section-dataEmitere").value,
        dataExpirare: row.querySelector(".documents-section-dataExpirare").value,
    }));

    // Preluare date din secțiunea Mașini
    const masini = Array.from(document.querySelectorAll("#cars-section .cars-section-row")).map((row) => ({
        marca: row.querySelector(".cars-section-marca").value,
        model: row.querySelector(".cars-section-model").value,
        anFabricatie: row.querySelector(".cars-section-anFabricatie").value,
        numarInmatriculare: row.querySelector(".cars-section-numarInmatriculare").value,
    }));

    // Preluare date din secțiunea Cazier
    const cazier = Array.from(document.querySelectorAll("#criminal-records-section .criminal-records-section-row")).map((row) => ({
        infractiune: row.querySelector(".criminal-records-section-infractiune").value,
        dataComitere: row.querySelector(".criminal-records-section-dataComitere").value,
        sentinta: row.querySelector(".criminal-records-section-sentinta").value,
    }));

    // Preluare date din secțiunea Contacte Urgență
    const contacteUrgenta = Array.from(document.querySelectorAll("#emergency-contacts-section .emergency-contacts-section-row")).map((row) => ({
        numeContact: row.querySelector(".emergency-contacts-section-numeContact").value,
        relatie: row.querySelector(".emergency-contacts-section-relatie").value,
        telefon: row.querySelector(".emergency-contacts-section-telefon").value,
    }));

    // Construim payload-ul
    const payload = {
        id,
        nume,
        prenume,
        dataNasterii,
        cnp,
        telefon,
        stareCivila,
        sex,
        adrese,
        acte,
        masini,
        cazier,
        contacteUrgenta,
    };

    console.log("Payload complet trimis:", payload); // Debugging

    try {
        const response = await fetch('/api/update-user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la actualizarea datelor.");
        }

        const result = await response.json();
        showToast(result.message, "success");

        // Închide modalul și reîncarcă tabelul
        document.getElementById("edit-modal").style.display = "none";
        searchPersons(); // Reîncarcă datele actualizate
    } catch (error) {
        console.error("Eroare la actualizare:", error);
        showToast(error.message, "error");
    }
});


    const cancelButton = document.getElementById("cancel-btn");
    const editModal = document.getElementById("edit-modal");
    const editForm = document.getElementById("edit-form");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            // Ascundem modalul
            editModal.style.display = "none";

            // Resetăm formularul
            if (editForm) {
                editForm.reset();
            }

            console.log("Modalul de editare a fost închis."); // Debugging
        });
    } else {
        console.error("Butonul 'Anulează' nu a fost găsit în DOM."); // Debugging
    }



document.getElementById("search-contact-btn").addEventListener("click", async () => {
    const numarInmatriculare = document.getElementById("search-plate-input").value.trim();

    if (!numarInmatriculare) {
        showToast("Introduceți un număr de înmatriculare.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/contact-by-car?numarInmatriculare=${encodeURIComponent(numarInmatriculare)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la căutarea contactului.");
        }

        const results = await response.json();
        populateContactResultsTable(results);
        showToast("Contactul a fost găsit cu succes!");
    } catch (error) {
        console.error("Eroare la căutarea contactului:", error);
        showToast(error.message, "error");
    }

});

function populateContactResultsTable(results) {
    const tableBody = document.querySelector("#contact-results-table tbody");

    tableBody.innerHTML = ""; // Curăță tabelul

    if (results.length === 0) {
        // Dacă nu există rezultate
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">Nu s-au găsit contacte.</td>`;
        tableBody.appendChild(tr);
    } else {
        // Populează tabelul cu contactele de urgență
        results.forEach((contact) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${contact.NumePersoana || "-"}</td>
                <td>${contact.PrenumePersoana || "-"}</td>
                <td>${contact.Nume_Contact || "-"}</td>
                <td>${contact.Relatie || "-"}</td>
                <td>${contact.NumarTelefon || "-"}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}



document.getElementById("load-expired-docs-btn").addEventListener("click", async () => {
    try {
        const response = await fetch('/api/expired-docs');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la încărcarea raportului.");
        }

        const results = await response.json();
        populateExpiredDocsTable(results);
        showToast("Raportul actelor expirate a fost încărcat cu succes!");
    } catch (error) {
        console.error("Eroare la încărcarea raportului:", error);
        showToast(error.message, "error");
    }
});

function populateExpiredDocsTable(results) {
    const tableBody = document.querySelector("#expired-docs-table tbody");
    tableBody.innerHTML = ""; // Curăță tabelul existent

    if (results.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">Nu s-au găsit acte expirate.</td>`;
        tableBody.appendChild(tr);
    } else {
        results.forEach((doc) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${doc.ID_Persoana}</td>
                <td>${doc.Nume}</td>
                <td>${doc.Prenume}</td>
                <td>${doc.TipAct}</td>
                <td>${doc.NumarActeExpirate}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

document.getElementById("load-top-users-btn").addEventListener("click", async () => {
    try {
        const response = await fetch('/api/top-users-by-county');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la încărcarea raportului utilizatorilor pe județ.");
        }

        const results = await response.json();
        populateTopUsersTable(results);
        showToast("Raportul utilizatorilor pe județ a fost încărcat cu succes!");
    } catch (error) {
        console.error("Eroare la încărcarea raportului:", error);
        showToast(error.message, "error");
    }
});

function populateTopUsersTable(results) {
    const tableBody = document.querySelector("#top-users-by-county-table tbody");
    tableBody.innerHTML = ""; // Curăță tabelul existent

    if (results.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5">Nu s-au găsit date pentru raport.</td>`;
        tableBody.appendChild(tr);
    } else {
        results.forEach((user) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.ID_Persoana}</td>
                <td>${user.Nume}</td>
                <td>${user.Prenume}</td>
                <td>${user.TotalEvenimente}</td>
                <td>${user.Judet}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}


// Funcția pentru obținerea evenimentelor recente

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}


async function fetchMostRecentCase() {
    console.log("Funcția fetchMostRecentCase a fost apelată."); // Debugging

    const tableBody = document.querySelector("#most-recent-case-table tbody");
    const table = document.getElementById("most-recent-case-table");

    tableBody.innerHTML = ""; // Curățăm tabelul înainte de a-l popula
    table.style.display = "none"; // Ascundem tabelul până sunt disponibile datele

    try {
        console.log("Trimiterea cererii către /api/most-recent-case.");
        const response = await fetch("/api/most-recent-case");
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Eroare la obținerea celui mai recent caz.");
        }

        const caseData = await response.json();
        console.log("Datele cazului:", caseData); // Debugging

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseData.Nume || "N/A"}</td>
            <td>${caseData.Prenume || "N/A"}</td>
            <td>${caseData.Infractiune}</td>
            <td>${formatDate(caseData.Data_Comiterii)}</td>
            <td>${caseData.Sentinta}</td>
        `;
        tableBody.appendChild(row);

        table.style.display = "table"; // Afișăm tabelul după populare
        showToast("Cel mai recent caz a fost încărcat cu succes!");
    } catch (error) {
        console.error("Eroare în funcția fetchMostRecentCase:", error); // Debugging
        alert("A apărut o problemă: " + error.message);
    }
}


    // Funcția pentru a încărca mașinile
    const loadCarsButton = document.getElementById("load-cars-btn");
  
    // Funcția pentru a popula tabelul
    async function loadCars() {
      try {
        const response = await fetch("/api/Acars");
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Eroare la încărcarea listei de mașini.");
        }
  
        const cars = await response.json();
        populateCarsTable(cars);
      } catch (error) {
        console.error("Eroare:", error);
        alert("Eroare la încărcarea datelor: " + error.message);
      }
    }
  
    // Funcția pentru a popula tabelul cu date
    function populateCarsTable(cars) {
      const tableBody = document.querySelector("#cars-table tbody");
      tableBody.innerHTML = ""; // Curăță tabelul înainte de populare
  
      if (cars.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6">Nu s-au găsit mașini.</td>`;
        tableBody.appendChild(tr);
        return;
      }
  
      cars.forEach((car) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${car.Marca}</td>
          <td>${car.Model}</td>
          <td>${car.An_Fabricatie}</td>
          <td>${car.Numar_Inmatriculare}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  
    // Adaugăm eveniment pentru butonul de încărcare
    loadCarsButton.addEventListener("click", loadCars);

    const addPersonForm = document.getElementById("add-person-form");

    if (addPersonForm) {
        addPersonForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const Nume = document.getElementById("add-nume").value.trim();
            const Prenume = document.getElementById("add-prenume").value.trim();
            const DataNasterii = document.getElementById("add-data-nasterii").value;
            const CNP = document.getElementById("add-cnp").value.trim();
            const NumarTelefon = document.getElementById("add-telefon").value.trim();
            const StareCivila = document.getElementById("add-stare-civila").value;
            const Sex = document.getElementById("add-sex").value;

            console.log("Date trimise:", {
                Nume,
                Prenume,
                DataNasterii,
                CNP,
                NumarTelefon,
                StareCivila,
                Sex,
            }); // Log pentru debugging

            try {
                const response = await fetch("/api/add-person", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Nume,
                        Prenume,
                        DataNasterii,
                        CNP,
                        NumarTelefon,
                        StareCivila,
                        Sex,
                    }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Eroare la adăugarea persoanei.");
                }

                console.log("Răspuns server:", result); // Log pentru debugging
                alert(result.message);
                addPersonForm.reset(); // Golește formularul
            } catch (error) {
                console.error("Eroare la trimiterea datelor:", error);
                alert("Eroare: " + error.message);
            }
        });
    }
    

    
    
        // Function to show notifications (reuse if already present)
        function showToast(message, type = "success") {
            const toastContainer = document.getElementById("toast-container");
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            toast.textContent = message;
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }
    
        // Function to handle deleting cars
        const deleteCarForm = document.getElementById("delete-car-form");
        deleteCarForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const NumarInmatriculare = document.getElementById("delete-numar-inmatriculare").value.trim();

        if (!NumarInmatriculare) {
            showToast("Introduceți un număr de înmatriculare.", "error");
            return;
        }

        try {
            const response = await fetch("/api/delete-car", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ NumarInmatriculare }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            showToast(result.message, "success");
            deleteCarForm.reset(); // Reset form after successful deletion
        } catch (error) {
            console.error("Eroare:", error);
            showToast(error.message, "error");
        }
    });
    
        // Function to handle deleting judicial records
        document.getElementById("delete-cazier-form").addEventListener("submit", async (event) => {
            event.preventDefault();
    
            const Nume = document.getElementById("delete-cazier-nume").value.trim();
            const Prenume = document.getElementById("delete-cazier-prenume").value.trim();
            const CNP = document.getElementById("delete-cazier-cnp").value.trim();
    
            if (!Nume || !Prenume || !CNP) {
                showToast("Toate câmpurile sunt obligatorii.", "error");
                return;
            }
    
            try {
                const response = await fetch("/api/delete-cazier", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ Nume, Prenume, CNP }),
                });
    
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
    
                showToast(result.message, "success");
            } catch (error) {
                console.error("Eroare:", error);
                showToast(error.message, "error");
            }
        });


    document.getElementById("show-add-person-form").addEventListener("click", () => {
        document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
        document.getElementById("add-person-section").style.display = "block";
    });    
// Inițializarea tabelului
window.onload = () => {
    const tableBody = document.querySelector("#search-results-table tbody");
    tableBody.innerHTML = `<tr><td colspan="10">Introduceți un nume pentru a începe căutarea.</td></tr>`;
};
});
