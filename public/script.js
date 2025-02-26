// Funcție pentru obținerea datelor din tabela `persoane` și afișarea lor
async function fetchPersoaneData() {
    try {
        console.log("Fetching persoane data...");
        const response = await fetch('/api/persoane');
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const persoane = await response.json();
        console.log("Persoane data:", persoane);

        const tableBody = document.querySelector('#persoane-table tbody');
        tableBody.innerHTML = ''; // Golim tabelul înainte de a adăuga date noi

        persoane.forEach((persoana) => {
            const row = document.createElement('tr');
            
            // Formatarea datei de naștere
            const dataNasterii = persoana.DataNasterii
                ? new Date(persoana.DataNasterii).toLocaleDateString('ro-RO')
                : 'N/A';
            row.innerHTML = `
                <td>${persoana.ID_Persoana}</td>
                <td>${persoana.Nume}</td>
                <td>${persoana.Prenume}</td>
                <td>${dataNasterii}</td>
                <td>${persoana.CNP}</td>
                <td>${persoana.NumarTelefon || 'N/A'}</td>
                <td>${persoana.StareCivila || 'N/A'}</td>
                <td>${persoana.Sex || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching persoane data:', error);
    }
}

// Chemăm funcția pentru a încărca datele după ce pagina este încărcată
window.onload = fetchPersoaneData;

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const cnp = e.target.cnp.value;
    const password = e.target.password.value;

    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, cnp, password })
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Signup error:", error);
    }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    if (!username || !password) {
        alert("Toate câmpurile sunt obligatorii.");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("username", username); // Salvează username în localStorage
            if (result.role === "user") {
                window.location.href = "/ClientPage.html";
            } else if (result.role === "admin") {
                window.location.href = "/AdminPage.html";
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Eroare la autentificare. Încercați din nou.");
    }
});









//Test//
