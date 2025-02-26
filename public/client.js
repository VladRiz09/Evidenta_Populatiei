// Funcția pentru afișarea unui loader
function showLoader() {
    document.getElementById("loader").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

// Funcția pentru afișarea notificărilor
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Eliminarea notificării după 5 secunde
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Funcția pentru încărcarea datelor utilizatorului și mesajul de bun venit
async function fetchUserDataAndWelcome() {
    const username = localStorage.getItem("username");

    if (!username) {
        alert("Nu sunteți autentificat. Veți fi redirecționat la pagina de login.");
        window.location.href = "/index.html";
        return;
    }

    showLoader(); // Arată loader
    try {
        const response = await fetch(`/api/utilizatori?username=${username}`);
        hideLoader(); // Ascunde loader
        if (!response.ok) {
            throw new Error("Eroare la obținerea datelor utilizatorului.");
        }

        const userData = await response.json();
        document.getElementById("welcome-message").textContent = `Bună ziua, ${userData.Nume} ${userData.Prenume}!`;

        // Populăm tabelul cu datele utilizatorului
        populateMyDataTable(userData);
        showToast("Datele utilizatorului încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la încărcarea datelor utilizatorului:", error);
        showToast("Eroare la încărcarea datelor utilizatorului.", "error");
    }
}

// Funcția pentru a popula tabelul „Datele Mele”
function populateMyDataTable(userData) {
    const tableBody = document.querySelector("#my-data-table tbody");
    tableBody.innerHTML = ""; // Curăță tabelul existent

    const tr = document.createElement("tr");

    // Formatarea datei pentru Data Nașterii (zi-lună-an)
    const formattedBirthDate = formatDate(userData.DataNasterii);

    tr.innerHTML = `
        <td>${userData.Nume}</td>
        <td>${userData.Prenume}</td>
        <td>${formattedBirthDate || "N/A"}</td>
        <td>${userData.CNP || "N/A"}</td>
        <td>${userData.NumarTelefon || "N/A"}</td>
        <td>${userData.StareCivila || "N/A"}</td>
        <td>${userData.Sex || "N/A"}</td>
    `;
    tableBody.appendChild(tr);
}

// Funcția pentru a formata data (zi-lună-an)
function formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

// Funcția pentru a popula tabelul „Rezultatele Căutării”
function populateSearchResultsTable(searchResults) {
    const tableBody = document.querySelector("#search-results-table tbody");
    tableBody.innerHTML = "";

    if (searchResults.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4">Nu s-au găsit rezultate.</td>`;
        tableBody.appendChild(tr);
    } else {
        searchResults.forEach((row) => {
            const tr = document.createElement("tr");

            // Formatarea datei pentru Data Nașterii (zi-lună-an)
            const formattedBirthDate = formatDate(row.DataNasterii);

            tr.innerHTML = `
                <td>${row.Nume}</td>
                <td>${row.Prenume}</td>
                <td>${formattedBirthDate || "N/A"}</td>
                <td>${row.NumarTelefon || "N/A"}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

// Funcția pentru căutarea persoanelor
async function searchPersons() {
    const name = document.getElementById("search-name-input").value.trim();

    if (!name) {
        alert("Introduceți un nume pentru căutare.");
        return;
    }

    showLoader();
    try {
        const response = await fetch(`/api/search?name=${name}`);
        hideLoader();
        if (!response.ok) {
            throw new Error("Eroare la căutarea persoanelor.");
        }

        const searchResults = await response.json();
        populateSearchResultsTable(searchResults);
        showToast("Căutarea a fost efectuată cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la căutarea persoanelor:", error);
        showToast("Eroare la căutarea persoanelor.", "error");
    }
}


// Funcția pentru a popula tabelul „Actele Mele”
async function fetchAndPopulateDocs() {
    const username = localStorage.getItem("username"); // Preluăm username-ul din localStorage
    if (!username) {
        alert("Nu sunteți autentificat. Veți fi redirecționat la pagina de login.");
        window.location.href = "/index.html";
        return;
    }

    showLoader();
    try {
        const response = await fetch(`/api/acte?username=${username}`); // Adăugăm username în URL
        hideLoader();
        if (!response.ok) throw new Error("Eroare la obținerea actelor.");
        const docs = await response.json();

        const tableBody = document.querySelector("#my-docs-table tbody");
        tableBody.innerHTML = "";

        docs.forEach(doc => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${doc.TipAct || "N/A"}</td>
                <td>${formatDate(doc.Data_Expirare) || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Actele au fost încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea actelor:", error);
        showToast("Eroare la încărcarea actelor.", "error");
    }
}


// Funcția pentru a popula tabelul „Mașinile Mele”
async function fetchAndPopulateCars() {
    const username = localStorage.getItem("username"); 
    console.log("Username trimis pentru mașini:", username);
    if (!username) {
        alert("Nu sunteți autentificat. Veți fi redirecționat la pagina de login.");
        window.location.href = "/index.html";
        return;
    }

    showLoader();
    try {
        const response = await fetch(`/api/masini?username=${username}`); 
        hideLoader();
        if (!response.ok) throw new Error(`Eroare la obținerea mașinilor: ${response.status}`);
        const cars = await response.json();
        console.log("Date mașini:", cars);

        const tableBody = document.querySelector("#my-cars-table tbody");
        tableBody.innerHTML = ""; 

        cars.forEach(car => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${car.Marca || "N/A"}</td>
                <td>${car.Model || "N/A"}</td>
                <td>${car.An_Fabricatie || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Mașinile au fost încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea mașinilor:", error);
        showToast("Eroare la încărcarea mașinilor.", "error");
    }
}


// Funcția pentru a popula tabelul „Locuințele Mele”
async function fetchAndPopulateHomes() {
    showLoader();
    try {
        const username = localStorage.getItem("username"); // Sau sursa de unde iei username-ul
        if (!username) {
            hideLoader();
            showToast("Nu există un utilizator autentificat.", "error");
            return;
        }

        const response = await fetch(`/api/adrese?username=${encodeURIComponent(username)}`);
        hideLoader();

        if (!response.ok) throw new Error("Eroare la obținerea locuințelor.");
        const homes = await response.json();

        const tableBody = document.querySelector("#my-homes-table tbody");
        tableBody.innerHTML = ""; // Curăță tabelul

        homes.forEach(home => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${home.Judet || "N/A"}</td>
                <td>${home.Oras || "N/A"}</td>
                <td>${home.Strada || "N/A"}</td>
                <td>${home.Numar || "N/A"}</td>
                <td>${home.Bloc || "N/A"}</td>
                <td>${home.Apartament || "N/A"}</td>
                <td>${home.CodPostal || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Locuințele au fost încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea locuințelor:", error);
        showToast("Eroare la încărcarea locuințelor.", "error");
    }
}

async function fetchAndPopulateCazier() {
    const username = localStorage.getItem("username");
    if (!username) {
        alert("Nu sunteți autentificat. Veți fi redirecționat la pagina de login.");
        window.location.href = "/index.html";
        return;
    }

    showLoader();
    try {
        const response = await fetch(`/api/cazier?username=${encodeURIComponent(username)}`);
        hideLoader();

        if (!response.ok) throw new Error("Eroare la obținerea cazierului.");
        const cazier = await response.json();

        const tableBody = document.querySelector("#my-cazier-table tbody");
        tableBody.innerHTML = ""; // Curăță tabelul

        cazier.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.Infractiune || "N/A"}</td>
                 <td>${formatDate(entry.Data_Comiterii) || "N/A"}</td>
                <td>${entry.Sentinta || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Cazierul a fost încărcat cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea cazierului:", error);
        showToast("Eroare la încărcarea cazierului.", "error");
    }
}
// Evenimente pentru butoanele respective
document.getElementById("view-my-docs-btn").addEventListener("click", () => {
    showSection("my-docs-section");
    fetchAndPopulateDocs();
});
document.getElementById("view-my-cazier-btn").addEventListener("click", () => {
    showSection("my-cazier-section");
    fetchAndPopulateCazier();
});

document.getElementById("view-my-cars-btn").addEventListener("click", () => {
    showSection("my-cars-section");
    fetchAndPopulateCars();
});

document.getElementById("view-my-homes-btn").addEventListener("click", () => {
    showSection("my-homes-section");
    fetchAndPopulateHomes();
});


// Eveniment pentru butonul „Vizualizează Datele Mele”
document.getElementById("view-my-data-btn").addEventListener("click", () => {
    showSection("my-data-section");
});

// Eveniment pentru butonul „Caută Detalii despre o Persoană”
document.getElementById("search-person-btn").addEventListener("click", () => {
    showSection("search-person-section");
});

// Funcția pentru a schimba secțiunile vizibile
function showSection(sectionToShow) {
    document.getElementById("my-data-section").style.display = "none";
    document.getElementById("search-person-section").style.display = "none";
    document.getElementById("my-docs-section").style.display = "none";
    document.getElementById("my-homes-section").style.display = "none";
    document.getElementById("my-cars-section").style.display = "none";
    document.getElementById("my-cazier-section").style.display = "none";

    document.getElementById("popular-docs-section").style.display = "none";
    document.getElementById("events-by-county-section").style.display = "none";


    document.getElementById(sectionToShow).style.display = "block";
}
async function fetchAndPopulateEventsByCounty() {
    showLoader();
    try {
        const response = await fetch(`/api/events-by-county`);
        hideLoader();

        if (!response.ok) throw new Error("Eroare la obținerea evenimentelor pe județe.");
        const eventsByCounty = await response.json();

        const tableBody = document.querySelector("#events-by-county-table tbody");
        tableBody.innerHTML = "";

        eventsByCounty.forEach(event => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${event.Judet || "N/A"}</td>
                <td>${event.TotalEvenimente || 0}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Evenimentele pe județe au fost încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea evenimentelor pe județe:", error);
        showToast("Eroare la încărcarea evenimentelor pe județe.", "error");
    }
}

document.getElementById("view-events-by-county-btn").addEventListener("click", () => {
    showSection("events-by-county-section");
    fetchAndPopulateEventsByCounty();
});



async function fetchAndPopulatePopularDocs() {
    showLoader();
    try {
        const response = await fetch(`/api/popular-doc-types`);
        hideLoader();

        if (!response.ok) throw new Error("Eroare la obținerea tipurilor populare de documente.");
        const popularDocs = await response.json();

        const tableBody = document.querySelector("#popular-docs-table tbody");
        tableBody.innerHTML = "";

        popularDocs.forEach(doc => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${doc.Judet || "N/A"}</td>
                <td>${doc.TipAct || "N/A"}</td>
                <td>${doc.TotalDocumente || 0}</td>
            `;
            tableBody.appendChild(row);
        });

        showToast("Tipurile populare de documente au fost încărcate cu succes!");
    } catch (error) {
        hideLoader();
        console.error("Eroare la popularea tipurilor populare de documente:", error);
        showToast("Eroare la încărcarea datelor.", "error");
    }
}

document.getElementById("view-popular-docs-btn").addEventListener("click", () => {
    showSection("popular-docs-section");
    fetchAndPopulatePopularDocs();
});

// Evenimentul pentru butonul de căutare
document.getElementById("search-btn").addEventListener("click", searchPersons);

// Apelăm funcția la încărcarea paginii
window.onload = () => {
    fetchUserDataAndWelcome();
};
