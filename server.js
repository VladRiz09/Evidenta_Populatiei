require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'vlad',
    password: process.env.DB_PASS || '0906',
    database: process.env.DB_NAME || 'mybd',
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to MySQL database');
});
// Ruta simplă de test

app.post('/api/signup', (req, res) => {
     const { name, password, cnp } = req.body;
     // Pasul 1: Verificăm dacă CNP-ul există în tabela persoane
     const checkCnpQuery = 'SELECT ID_Persoana FROM persoane WHERE CNP = ?';
     db.query(checkCnpQuery, [cnp], (err, results) => {
         if (err) {
             console.error('Database error:', err);
             return res.status(500).json({ message: 'Eroare la verificarea CNP-ului' });
         }

         if (results.length === 0) {
             // Dacă CNP-ul nu există în tabela persoane, returnăm un mesaj de eroare
             return res.status(400).json({ message: 'CNP-ul nu există în baza de date. Nu puteți crea cont.' });
         }

         const idPersoana = results[0].ID_Persoana;

         // Pasul 2: Verificăm dacă CNP-ul este deja în tabela utilizatori
         const checkUserQuery = 'SELECT * FROM utilizatori WHERE CNP = ?';
         db.query(checkUserQuery, [cnp], (err, userResults) => {
             if (err) {
                 console.error('Database error:', err);
                 return res.status(500).json({ message: 'Eroare la verificarea utilizatorului' });
             }

             if (userResults.length > 0) {
                 // Dacă CNP-ul este deja în tabela utilizatori, returnăm un mesaj de eroare
                 return res.status(400).json({ message: 'Utilizatorul există deja. Nu puteți crea cont duplicat.' });
             }

             // Pasul 3: Stocăm parola în text clar (fără hashing) și creăm un cont nou în tabela utilizatori
             const insertUserQuery = 'INSERT INTO utilizatori (Nume_Utilizator, Parola, Rol, ID_Persoana, CNP) VALUES (?, ?, ?, ?, ?)';
             db.query(insertUserQuery, [name, password, 'user', idPersoana, cnp], (err, results) => {
                 if (err) {
                     console.error('Database error:', err);
                     return res.status(500).json({ message: 'Eroare la salvarea utilizatorului' });
                 }
                 res.json({ message: 'Contul a fost creat cu succes' });
             });
         });
     });
 });

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM utilizatori WHERE Nume_Utilizator = ?';

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        if (password === user.Parola) {
            // Returnăm și rolul utilizatorului
            res.json({ message: 'Login successful', role: user.Rol });
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    });
});


// Ruta pentru obținerea unui utilizator pe baza username-ului
app.get('/api/utilizatori', (req, res) => {
    const { username } = req.query; // Preia parametrul 'username' din query string

    if (!username) {
        return res.status(400).json({ message: "Parametrul 'username' lipsește." });
    }

    const query = `
        SELECT p.*
        FROM persoane p
        JOIN utilizatori u ON u.ID_Persoana = p.ID_Persoana
        WHERE u.Nume_Utilizator = ?`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
        }

        res.json(results[0]); // Trimite primul rezultat (utilizatorul)
    });
});

// Ruta pentru căutarea persoanelor
app.get('/api/search', (req, res) => {
    const { name } = req.query;  // Preia numele din query string

    if (!name) {
        return res.status(400).json({ message: "Numele este necesar pentru căutare." });
    }

    const query = `
        SELECT p.ID_Persoana, p.Nume, p.Prenume, p.DataNasterii, p.NumarTelefon
        FROM persoane p
        WHERE p.Nume LIKE ? OR p.Prenume LIKE ?`;

    db.query(query, [`%${name}%`, `%${name}%`], (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la căutare." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Nu au fost găsite persoane." });
        }

        res.json(results);  // Returnează rezultatele găsite
    });
});




app.get('/api/acte', (req, res) => {
    const { username } = req.query;

    if (!username) {
        console.error("Parametrul 'username' lipsește.");
        return res.status(400).json({ message: "Parametrul 'username' lipsește." });
    }

    const query = `
        SELECT a.TipAct, a.Data_Expirare
        FROM acte_identitate a
        JOIN persoane p ON a.ID_Persoana = p.ID_Persoana
        JOIN utilizatori u ON p.ID_Persoana = u.ID_Persoana
        WHERE u.Nume_Utilizator = ?`;

    console.log("Execut query pentru acte:", query, "cu parametru:", username);

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Eroare MySQL la acte:", err);
            return res.status(500).json({ message: "Eroare la server în timpul obținerii actelor." });
        }

        console.log("Rezultate query acte:", results);
        res.json(results);
    });
});


// Ruta pentru obținerea mașinilor utilizatorului
app.get('/api/masini', (req, res) => {
    const { username } = req.query;

    if (!username) {
        console.error("Parametrul 'username' lipsește.");
        return res.status(400).json({ message: "Parametrul 'username' lipsește." });
    }

    const query = `
        SELECT m.Marca, m.Model, m.An_Fabricatie
        FROM masini m
        JOIN persoane p ON m.ID_Persoana = p.ID_Persoana
        JOIN utilizatori u ON p.ID_Persoana = u.ID_Persoana
        WHERE u.Nume_Utilizator = ?`;

    console.log("Execut query pentru masini:", query, "cu parametru:", username);

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Eroare MySQL la masini:", err);
            return res.status(500).json({ message: "Eroare la server în timpul obținerii mașinilor." });
        }

        console.log("Rezultate query masini:", results);
        res.json(results);
    });
});


// Ruta pentru obținerea locuințelor utilizatorului
app.get('/api/adrese', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: "Parametrul 'username' lipsește." });
    }

    const query = `
        SELECT l.Strada, l.Numar, l.Bloc, l.Judet, l.Oras, l.CodPostal, l.Apartament
        FROM adrese l
        JOIN persoane_adrese pa ON l.ID_Adresa = pa.ID_Adresa
        JOIN persoane p ON pa.ID_Persoana = p.ID_Persoana
        JOIN utilizatori u ON p.ID_Persoana = u.ID_Persoana
        WHERE u.Nume_Utilizator = ?`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        res.json(results);
    });
});


app.get('/api/cazier', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: "Parametrul 'username' lipsește." });
    }

    const query = `
        SELECT c.Infractiune, c.Data_Comiterii, c.Sentinta
        FROM cazier_judiciar c
        JOIN persoane p ON c.ID_Persoana = p.ID_Persoana
        JOIN utilizatori u ON p.ID_Persoana = u.ID_Persoana
        WHERE u.Nume_Utilizator = ?`;

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        res.json(results);
    });
});


app.get('/api/events-by-county', (req, res) => {
    const query = `
        SELECT 
            a.Judet,
            COUNT(pe.ID_Eveniment) AS TotalEvenimente
        FROM persoane_evenimente pe
        JOIN persoane p ON pe.ID_Persoana = p.ID_Persoana
        JOIN persoane_adrese pa ON p.ID_Persoana = pa.ID_Persoana
        JOIN adrese a ON pa.ID_Adresa = a.ID_Adresa
        GROUP BY a.Judet
        ORDER BY TotalEvenimente DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL la obținerea evenimentelor pe județe:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        res.json(results);
    });
});


app.get('/api/popular-doc-types', (req, res) => {
    const query = `
        SELECT 
            a.Judet,
            ai.TipAct,
            COUNT(ai.ID_Act) AS TotalDocumente
        FROM acte_identitate ai
        JOIN persoane p ON ai.ID_Persoana = p.ID_Persoana
        JOIN persoane_adrese pa ON p.ID_Persoana = pa.ID_Persoana
        JOIN adrese a ON pa.ID_Adresa = a.ID_Adresa
        GROUP BY a.Judet, ai.TipAct
        ORDER BY a.Judet, TotalDocumente DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL la obținerea tipurilor de documente populare pe județe:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        res.json(results);
    });
});




///AICI INCEPE ADMINISTRATORUL////




app.get('/api/Asearch', (req, res) => {
    const { name, id } = req.query;

    // Verificăm dacă avem cel puțin unul dintre parametrii necesari
    if (!name && !id) {
        return res.status(400).json({ message: "Numele sau ID-ul este necesar pentru căutare." });
    }

    // Determinăm condiția WHERE
    const whereClause = id
        ? 'p.ID_Persoana = ?'
        : '(p.Nume LIKE ? OR p.Prenume LIKE ?)';
    const queryParams = id
        ? [id]
        : [`%${name}%`, `%${name}%`];

    const query = `
        SELECT 
            p.ID_Persoana,
            p.Nume,
            p.Prenume,
            p.DataNasterii,
            p.CNP,
            p.NumarTelefon,
            p.StareCivila,
            p.Sex,
            (
                SELECT GROUP_CONCAT(DISTINCT 
                    CONCAT_WS(', ', 
                        a.Strada, 
                        a.Numar, 
                        a.Bloc, 
                        a.Apartament, 
                        a.Oras, 
                        a.Judet, 
                        a.CodPostal
                    ) SEPARATOR '; ')
                FROM adrese a 
                WHERE a.ID_Persoana = p.ID_Persoana
            ) AS Adrese,
            (
                SELECT GROUP_CONCAT(DISTINCT 
                    CONCAT_WS(', ', 
                        ai.TipAct, 
                        ai.Serie, 
                        ai.Numar, 
                        DATE_FORMAT(ai.Data_Emiterii, '%Y-%m-%d'), 
                        DATE_FORMAT(ai.Data_Expirare, '%Y-%m-%d')
                    ) SEPARATOR '; ')
                FROM acte_identitate ai 
                WHERE ai.ID_Persoana = p.ID_Persoana
            ) AS Acte,
            (
                SELECT GROUP_CONCAT(DISTINCT 
                    CONCAT_WS(', ', 
                        m.Marca, 
                        m.Model, 
                        m.An_Fabricatie, 
                        m.Numar_Inmatriculare
                    ) SEPARATOR '; ')
                FROM masini m 
                WHERE m.ID_Persoana = p.ID_Persoana
            ) AS Masini,
            (
                SELECT GROUP_CONCAT(DISTINCT 
                    CONCAT_WS(', ', 
                        cj.Infractiune, 
                        DATE_FORMAT(cj.Data_Comiterii, '%Y-%m-%d'), 
                        cj.Sentinta
                    ) SEPARATOR '; ')
                FROM cazier_judiciar cj 
                WHERE cj.ID_Persoana = p.ID_Persoana
            ) AS Cazier,
            (
                SELECT GROUP_CONCAT(DISTINCT 
                    CONCAT_WS(', ', 
                        cu.Nume_Contact, 
                        cu.Relatie, 
                        cu.NumarTelefon
                    ) SEPARATOR '; ')
                FROM contact_urgenta cu 
                WHERE cu.ID_Persoana = p.ID_Persoana
            ) AS ContacteUrgenta
            FROM persoane p
            WHERE ${whereClause};
    `;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la căutare." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Nu au fost găsite persoane." });
        }

        // Returnăm primul rezultat dacă este căutat după ID
        if (id) {
            return res.json(results[0]);
        }

        res.json(results); // Returnează toate rezultatele dacă este căutare după nume
    });
});
   



app.put('/api/update-user', (req, res) => {
    const {
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
    } = req.body;

    console.log("Payload primit:", req.body);

    if (!id || !nume || !prenume || !dataNasterii || !cnp || !telefon || !stareCivila || !sex) {
        return res.status(400).json({ message: "Toate câmpurile principale sunt obligatorii pentru actualizare." });
    }

    // Actualizare date principale pentru utilizator
    const updateUserQuery = `
        UPDATE persoane
        SET Nume = ?, Prenume = ?, DataNasterii = ?, CNP = ?, NumarTelefon = ?, StareCivila = ?, Sex = ?
        WHERE ID_Persoana = ?
    `;

    db.query(updateUserQuery, [nume, prenume, dataNasterii, cnp, telefon, stareCivila, sex, id], (err, result) => {
        if (err) {
            console.error("Eroare MySQL la actualizarea persoanei:", err);
            return res.status(500).json({ message: "Eroare la actualizarea persoanei." });
        }

        console.log("Date principale actualizate cu succes.");

        // Promisiuni pentru alte categorii
        const promises = [];

        // Actualizare adrese
        if (adrese && adrese.length > 0) {
            adrese.forEach((adresa) => {
                const updateAddressQuery = `
                    UPDATE adrese
                    SET Strada = ?, Numar = ?, Bloc = ?, Apartament = ?, Oras = ?, Judet = ?, CodPostal = ?
                    WHERE ID_Persoana = ?
                `;
                promises.push(
                    new Promise((resolve, reject) => {
                        db.query(updateAddressQuery, [
                            adresa.strada,
                            adresa.numar,
                            adresa.bloc,
                            adresa.apartament,
                            adresa.oras,
                            adresa.judet,
                            adresa.codPostal,
                            id,
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    })
                );
            });
        }

        // Actualizare acte
        if (acte && acte.length > 0) {
            acte.forEach((act) => {
                const updateActQuery = `
                    UPDATE acte_identitate
                    SET TipAct = ?, Serie = ?, Numar = ?, Data_Emiterii = ?, Data_Expirare = ?
                    WHERE ID_Persoana = ?
                `;
                promises.push(
                    new Promise((resolve, reject) => {
                        db.query(updateActQuery, [
                            act.tip,
                            act.serie,
                            act.numar,
                            act.dataEmitere,
                            act.dataExpirare,
                            id,
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    })
                );
            });
        }

        // Actualizare mașini
        if (masini && masini.length > 0) {
            masini.forEach((masina) => {
                const updateCarQuery = `
                    UPDATE masini
                    SET Marca = ?, Model = ?, An_Fabricatie = ?, Numar_Inmatriculare = ?
                    WHERE ID_Persoana = ?
                `;
                promises.push(
                    new Promise((resolve, reject) => {
                        db.query(updateCarQuery, [
                            masina.marca,
                            masina.model,
                            masina.anFabricatie,
                            masina.numarInmatriculare,
                            id,
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    })
                );
            });
        }

        // Actualizare cazier
        if (cazier && cazier.length > 0) {
            cazier.forEach((record) => {
                const updateCriminalRecordQuery = `
                    UPDATE cazier_judiciar
                    SET Infractiune = ?, Data_Comiterii = ?, Sentinta = ?
                    WHERE ID_Persoana = ?
                `;
                promises.push(
                    new Promise((resolve, reject) => {
                        db.query(updateCriminalRecordQuery, [
                            record.infractiune,
                            record.dataComitere,
                            record.sentinta,
                            id,
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    })
                );
            });
        }

        // Actualizare contacte de urgență
        if (contacteUrgenta && contacteUrgenta.length > 0) {
            contacteUrgenta.forEach((contact) => {
                const updateEmergencyContactQuery = `
                    UPDATE contact_urgenta
                    SET Nume_Contact = ?, Relatie = ?, NumarTelefon = ?
                    WHERE ID_Persoana = ?
                `;
                promises.push(
                    new Promise((resolve, reject) => {
                        db.query(updateEmergencyContactQuery, [
                            contact.numeContact,
                            contact.relatie,
                            contact.telefon,
                            id,
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    })
                );
            });
        }

        // Execută toate promisiunile
        Promise.allSettled(promises)
            .then((results) => {
                const rejectedPromises = results.filter((result) => result.status === "rejected");
                if (rejectedPromises.length > 0) {
                    console.error("Erori la actualizarea categoriilor asociate:", rejectedPromises);
                    return res.status(500).json({
                        message: "Eroare la actualizarea categoriilor asociate.",
                        errors: rejectedPromises.map((r) => r.reason),
                    });
                }

                res.json({ message: "Toate datele au fost actualizate cu succes." });
            })
            .catch((err) => {
                console.error("Eroare generală la actualizarea datelor:", err);
                res.status(500).json({ message: "Eroare generală la actualizarea datelor.", error: err.message });
            });
    });
});

app.get('/api/contact-by-car', (req, res) => {
    const { numarInmatriculare } = req.query;

    if (!numarInmatriculare) {
        return res.status(400).json({ message: "Numărul de înmatriculare este necesar." });
    }

    const query = `
        SELECT 
            (SELECT p.Nume FROM persoane p WHERE p.ID_Persoana = 
                (SELECT m.ID_Persoana FROM masini m WHERE m.Numar_Inmatriculare = ?)
            ) AS NumePersoana,
            (SELECT p.Prenume FROM persoane p WHERE p.ID_Persoana = 
                (SELECT m.ID_Persoana FROM masini m WHERE m.Numar_Inmatriculare = ?)
            ) AS PrenumePersoana,
            cu.Nume_Contact,
            cu.Relatie,
            cu.NumarTelefon
        FROM contact_urgenta cu
        WHERE cu.ID_Contact = (
            SELECT pcu.ID_Contact
            FROM persoane_contact_urgenta pcu
            WHERE pcu.ID_Persoana = (
                SELECT m.ID_Persoana
                FROM masini m
                WHERE m.Numar_Inmatriculare = ?
            )
        );
    `;

    db.query(query, [numarInmatriculare, numarInmatriculare, numarInmatriculare], (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Nu s-a găsit niciun contact sau persoană pentru acest număr de înmatriculare." });
        }

        res.json(results);
    });
});


app.get('/api/expired-docs', (req, res) => {
    const query = `
       SELECT 
            p.ID_Persoana,
            p.Nume,
            p.Prenume,
            ai.TipAct,
            COUNT(ai.ID_Act) AS NumarActeExpirate
        FROM persoane p
        JOIN acte_identitate ai ON p.ID_Persoana = ai.ID_Persoana
        WHERE ai.ID_Act IN (
            SELECT ID_Act
            FROM acte_identitate
            WHERE Data_Expirare < CURDATE()
        )
        GROUP BY p.ID_Persoana, p.Nume, p.Prenume, ai.TipAct;

    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la obținerea actelor expirate." });
        }

        res.json(results);
    });
});



app.get('/api/top-users-by-county', (req, res) => {
    const query = `
        SELECT 
            p.ID_Persoana,
            p.Nume,
            p.Prenume,
            COUNT(pe.ID_Eveniment) AS TotalEvenimente,
            a.Judet
        FROM persoane p
        JOIN persoane_evenimente pe ON p.ID_Persoana = pe.ID_Persoana
        JOIN persoane_adrese pa ON p.ID_Persoana = pa.ID_Persoana
        JOIN adrese a ON pa.ID_Adresa = a.ID_Adresa
        WHERE a.Judet IS NOT NULL
        GROUP BY p.ID_Persoana, p.Nume, p.Prenume, a.Judet
        HAVING TotalEvenimente = (
            SELECT MAX(NumarEvenimente)
            FROM (
                SELECT COUNT(pe2.ID_Eveniment) AS NumarEvenimente
                FROM persoane_evenimente pe2
                JOIN persoane_adrese pa2 ON pe2.ID_Persoana = pa2.ID_Persoana
                JOIN adrese a2 ON pa2.ID_Adresa = a2.ID_Adresa
                WHERE a2.Judet = a.Judet
                GROUP BY pe2.ID_Persoana
            ) SubQuery
        )
        ORDER BY a.Judet, TotalEvenimente DESC;

    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la obținerea raportului." });
        }

        res.json(results);
    });
});


app.get('/api/most-recent-case', (req, res) => {
    const query = `
      SELECT 
        p.Nume, 
        p.Prenume, 
        cj.Infractiune, 
        cj.Data_Comiterii, 
        cj.Sentinta
    FROM cazier_judiciar cj
    JOIN persoane p ON cj.ID_Persoana = p.ID_Persoana
    WHERE cj.Data_Comiterii = (
        SELECT MAX(cj1.Data_Comiterii)
        FROM cazier_judiciar cj1
);

    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL la obținerea celui mai recent caz:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Nu există cazuri în baza de date." });
        }

        res.json(results[0]); // Returnăm doar primul rând
    });
});

app.get('/api/Acars', (req, res) => {
    const query = `
        SELECT 
            Marca,
            Model,
            An_Fabricatie,
            Numar_Inmatriculare
        FROM masini
        ORDER BY Marca ASC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare MySQL:", err);
            return res.status(500).json({ message: "Eroare la obținerea listelor de mașini." });
        }

        res.json(results); // Returnează lista de mașini ordonată
    });
});



app.post('/api/add-person', (req, res) => {
    const { Nume, Prenume, DataNasterii, CNP, NumarTelefon, StareCivila, Sex } = req.body;

    // Validare simplă a datelor primite
    if (!Nume || !Prenume || !DataNasterii || !CNP || !Sex) {
        return res.status(400).json({ message: "Toate câmpurile obligatorii trebuie completate." });
    }

    const query = `
        INSERT INTO persoane (Nume, Prenume, DataNasterii, CNP, NumarTelefon, StareCivila, Sex)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(query, [Nume, Prenume, DataNasterii, CNP, NumarTelefon, StareCivila, Sex], (err, results) => {
        if (err) {
            console.error("Eroare MySQL la adăugarea unei persoane:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        res.json({ message: "Persoana a fost adăugată cu succes!" });
    });
});




// Route to delete a car for a specific person
app.delete('/api/delete-car', (req, res) => {
    const { NumarInmatriculare } = req.body;

    if (!NumarInmatriculare) {
        return res.status(400).json({ message: "Numărul de înmatriculare este obligatoriu." });
    }

    const query = `
        DELETE FROM masini
        WHERE Numar_Inmatriculare = ?;
    `;

    console.log("Query:", query);
    console.log("Parameter:", NumarInmatriculare);

    db.query(query, [NumarInmatriculare], (err, result) => {
        if (err) {
            console.error("Eroare MySQL la ștergerea mașinii:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Mașina cu acest număr de înmatriculare nu a fost găsită." });
        }

        res.json({ message: "Mașina a fost ștearsă cu succes." });
    });
});


// Route to delete a judicial record for a specific person
app.delete('/api/delete-cazier', (req, res) => {
    const { Nume, Prenume, CNP } = req.body;

    if (!Nume || !Prenume || !CNP) {
        return res.status(400).json({ message: "Nume, Prenume, și CNP sunt obligatorii." });
    }

    const query = `
        DELETE cj FROM cazier_judiciar cj
        JOIN persoane p ON cj.ID_Persoana = p.ID_Persoana
        WHERE p.Nume = ? AND p.Prenume = ? AND p.CNP = ?;
    `;

    db.query(query, [Nume, Prenume, CNP], (err, result) => {
        if (err) {
            console.error("Eroare MySQL la ștergerea cazierului:", err);
            return res.status(500).json({ message: "Eroare la server." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Persoana nu are cazier înregistrat." });
        }

        res.json({ message: "Cazierul persoanei a fost șters cu succes." });
    });
});

// Ruta generală pentru cereri invalide
app.all('*', (req, res) => {
    console.log(`Metodă: ${req.method}, URL: ${req.originalUrl}`);
    res.status(404).send('Ruta nu este definită!');
});



app.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
});