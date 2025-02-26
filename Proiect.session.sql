SELECT * FROM cazier_judiciar
--@block

    CREATE TABLE persoane (
        ID_Persoana int NOT NULL AUTO_INCREMENT,
        Nume varchar(50) NOT NULL,
        Prenume varchar(50) NOT NULL,
        DataNasterii date DEFAULT NULL,
        CNP char(13) NOT NULL,
        NumarTelefon varchar(15) DEFAULT NULL,
        StareCivila varchar(20) DEFAULT NULL,
        Sex char(1) DEFAULT NULL,
        PRIMARY KEY (ID_Persoana),
        UNIQUE (CNP),
        CONSTRAINT check_sex CHECK (Sex IN ('M', 'F')) 
    );




--@block
        CREATE TABLE adrese (
            ID_Adresa int NOT NULL AUTO_INCREMENT,
            ID_Persoana int DEFAULT NULL,
            Strada varchar(100) DEFAULT NULL,
            Numar int DEFAULT NULL,
            Bloc varchar(10) DEFAULT NULL,
            Apartament int DEFAULT NULL,
            Oras varchar(50) DEFAULT NULL,
            Judet varchar(50) DEFAULT NULL,
            CodPostal char(6) DEFAULT NULL,
            PRIMARY KEY (ID_Adresa),
            FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
        );
--@block
CREATE TABLE utilizatori (
    ID_Utilizator int NOT NULL AUTO_INCREMENT,
    Nume_Utilizator varchar(20) NOT NULL,
    Parola varchar(500) DEFAULT NULL,
    Rol varchar(10) DEFAULT NULL,
    ID_Persoana int DEFAULT NULL,
    CNP char(13) NOT NULL,
    PRIMARY KEY (ID_Utilizator),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana),
    CONSTRAINT check_rol CHECK (Rol IN ('user', 'admin'))
);
--@block
CREATE TABLE acte_identitate (
    ID_Act int NOT NULL AUTO_INCREMENT,
    ID_Persoana int DEFAULT NULL,
    TipAct varchar(50) DEFAULT NULL,
    Serie char(2) DEFAULT NULL,
    Numar int DEFAULT NULL,
    Data_Emiterii date DEFAULT NULL,
    Data_Expirare date DEFAULT NULL,
    PRIMARY KEY (ID_Act),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana),
    CONSTRAINT check_data_expirare CHECK (Data_Expirare > Data_Emiterii)
);
--@block
CREATE TABLE cazier_judiciar (
    ID_Caz int NOT NULL AUTO_INCREMENT,
    ID_Persoana int DEFAULT NULL,
    Infractiune varchar(255) DEFAULT NULL,
    Data_Comiterii date DEFAULT NULL,
    Sentinta varchar(255) DEFAULT NULL,
    PRIMARY KEY (ID_Caz),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
);
--@block
CREATE TABLE contact_urgenta (
    ID_Contact int NOT NULL AUTO_INCREMENT,
    ID_Persoana int DEFAULT NULL,
    Nume_Contact varchar(50) DEFAULT NULL,
    Relatie varchar(50) DEFAULT NULL,
    NumarTelefon varchar(15) DEFAULT NULL,
    PRIMARY KEY (ID_Contact),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
);
--@block
CREATE TABLE evenimente_politie (
    ID_Eveniment int NOT NULL AUTO_INCREMENT,
    Tip_Eveniment varchar(255) DEFAULT NULL,
    Data_Eveniment date DEFAULT NULL,
    Locatie varchar(255) DEFAULT NULL,
    ID_Persoana int DEFAULT NULL,
    PRIMARY KEY (ID_Eveniment),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
);
--@block
CREATE TABLE masini (
    ID_Masina int NOT NULL AUTO_INCREMENT,
    ID_Persoana int DEFAULT NULL,
    Marca varchar(50) DEFAULT NULL,
    Model varchar(50) DEFAULT NULL,
    An_Fabricatie int DEFAULT NULL,
    Numar_Inmatriculare varchar(10) DEFAULT NULL,
    PRIMARY KEY (ID_Masina),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
);
--@block
CREATE TABLE persoane_adrese (
    ID_Persoana int NOT NULL,
    ID_Adresa int NOT NULL,
    Tip_Locuinta varchar(50) DEFAULT NULL,
    PRIMARY KEY (ID_Persoana, ID_Adresa),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana),
    FOREIGN KEY (ID_Adresa) REFERENCES adrese (ID_Adresa)
);
--@block
CREATE TABLE persoane_contact_urgenta (
    ID_Contact int NOT NULL,
    ID_Persoana int NOT NULL,
    PRIMARY KEY (ID_Contact, ID_Persoana),
    FOREIGN KEY (ID_Contact) REFERENCES contact_urgenta (ID_Contact),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana)
);
--@block
CREATE TABLE persoane_evenimente (
    ID_Persoana int NOT NULL,
    ID_Eveniment int NOT NULL,
    PRIMARY KEY (ID_Persoana, ID_Eveniment),
    FOREIGN KEY (ID_Persoana) REFERENCES persoane (ID_Persoana),
    FOREIGN KEY (ID_Eveniment) REFERENCES evenimente_politie (ID_Eveniment)
);
--@block
ALTER TABLE utilizatori
MODIFY ID_Persoana int DEFAULT NULL
AFTER ID_Utilizator;
--@block
ALTER TABLE utilizatori
ADD CONSTRAINT check_rol CHECK (Rol IN ('user', 'admin'));
--@block
INSERT INTO persoane (
        Nume,
        Prenume,
        DataNasterii,
        CNP,
        NumarTelefon,
        StareCivila,
        Sex
    )
VALUES (
        'Popescu',
        'Ion',
        '1985-04-12',
        '1850412123456',
        '0721234567',
        'Necasatorit',
        'M'
    ),
    (
        'Ionescu',
        'Maria',
        '1990-08-23',
        '2900823123456',
        '0731234567',
        'Casatorit',
        'F'
    ),
    (
        'Georgescu',
        'Andrei',
        '1978-01-15',
        '1780115123456',
        '0741234567',
        'Necasatorit',
        'M'
    ),
    (
        'Dumitru',
        'Elena',
        '1982-12-05',
        '2821205123456',
        '0751234567',
        'Casatorit',
        'F'
    ),
    (
        'Stan',
        'Cristian',
        '1995-06-20',
        '1950620123456',
        '0761234567',
        'Necasatorit',
        'M'
    );
--@block
INSERT INTO adrese (
        ID_Persoana,
        Strada,
        Numar,
        Bloc,
        Apartament,
        Oras,
        Judet,
        CodPostal
    )
VALUES (
        1,
        'Strada Libertatii',
        10,
        'A',
        12,
        'Bucuresti',
        'Bucuresti',
        '010101'
    ),
    (
        2,
        'Strada Independentei',
        15,
        'B',
        8,
        'Cluj-Napoca',
        'Cluj',
        '400123'
    ),
    (
        3,
        'Strada Pacii',
        5,
        'C',
        3,
        'Iasi',
        'Iasi',
        '700789'
    ),
    (
        4,
        'Strada Primaverii',
        7,
        'D',
        6,
        'Constanta',
        'Constanta',
        '900123'
    ),
    (
        5,
        'Strada Mihai Eminescu',
        12,
        'E',
        4,
        'Oradea',
        'Bihor',
        '410001'
    ),
    (
        1,
        'Strada Independentei',
        8,
        '3',
        12,
        'Bucuresti',
        'Bucuresti',
        '010121'
    );
--@block
INSERT INTO utilizatori (Nume_Utilizator, Parola, Rol, ID_Persoana, CNP)
VALUES (
        'IonPopescu',
        'parola123',
        'admin',
        1,
        '1850412123456'
    ),
    (
        'MariaIonescu',
        'parola456',
        'user',
        2,
        '2900823123456'
    ),
    (
        'AndreiG',
        'parola789',
        'user',
        3,
        '1780115123456'
    ),
    (
        'ElenaD',
        'parola012',
        'user',
        4,
        '2821205123456'
    ),
    (
        'CristianS',
        'parola345',
        'admin',
        5,
        '1950620123456'
    );
--@block
INSERT INTO acte_identitate (
        ID_Persoana,
        TipAct,
        Serie,
        Numar,
        Data_Emiterii,
        Data_Expirare
    )
VALUES (
        1,
        'Carte de Identitate',
        'AB',
        123456,
        '2020-01-15',
        '2030-01-15'
    ),
    (
        2,
        'Pasaport',
        'CD',
        654321,
        '2018-05-20',
        '2028-05-20'
    ),
    (
        3,
        'Carte de Identitate',
        'EF',
        789012,
        '2021-09-10',
        '2031-09-10'
    ),
    (
        4,
        'Permis de Conducere',
        'GH',
        345678,
        '2019-11-25',
        '2029-11-25'
    ),
    (
        5,
        'Carte de Identitate',
        'IJ',
        567890,
        '2022-07-01',
        '2032-07-01'
    );
--@block
INSERT INTO cazier_judiciar (
        ID_Persoana,
        Infractiune,
        Data_Comiterii,
        Sentinta
    )
VALUES (1, 'Furt', '2015-06-10', '3 ani cu suspendare'),
    (2, 'Frauda', '2017-11-15', '5 ani cu executare'),
    (
        3,
        'Conducere fara permis',
        '2020-02-20',
        '1 an cu suspendare'
    ),
    (
        4,
        'Violenta domestica',
        '2018-08-25',
        '2 ani cu suspendare'
    ),
    (
        5,
        'Evaziune fiscala',
        '2019-03-12',
        '4 ani cu executare'
    );
--@block
INSERT INTO contact_urgenta (ID_Persoana, Nume_Contact, Relatie, NumarTelefon)
VALUES (1, 'Popescu Vasile', 'Tata', '0729991234'),
    (2, 'Ionescu Elena', 'Mama', '0739995678'),
    (3, 'Georgescu Mihai', 'Frate', '0749999012'),
    (4, 'Dumitru Alexandru', 'Sot', '0759993456'),
    (5, 'Stan Diana', 'Sora', '0769997890');
--@block
INSERT INTO evenimente_politie (
        Tip_Eveniment,
        Data_Eveniment,
        Locatie,
        ID_Persoana
    )
VALUES ('Accident auto', '2021-01-15', 'Bucuresti', 1),
    ('Frauda bancara', '2020-03-10', 'Cluj-Napoca', 2),
    ('Conducere fara permis', '2020-02-20', 'Iasi', 3),
    (
        'Violenta domestica',
        '2019-11-25',
        'Constanta',
        4
    ),
    ('Furt calificat', '2022-07-01', 'Oradea', 5);
--@block
INSERT INTO masini (
        ID_Persoana,
        Marca,
        Model,
        An_Fabricatie,
        Numar_Inmatriculare
    )
VALUES (1, 'Dacia', 'Logan', 2015, 'B123XYZ'),
    (2, 'BMW', 'X5', 2018, 'CJ567ABC'),
    (3, 'Audi', 'A4', 2020, 'IS901DEF'),
    (4, 'Volkswagen', 'Passat', 2019, 'CT345GHI'),
    (5, 'Toyota', 'Corolla', 2021, 'BH789JKL');
--@block
INSERT INTO persoane (
        Nume,
        Prenume,
        DataNasterii,
        CNP,
        NumarTelefon,
        StareCivila,
        Sex
    )
VALUES (
        'Rizea',
        'Vlad',
        '2003-06-20',
        '040709045281',
        '0744226438',
        'Necasatorit',
        'M'
    );
--@block
INSERT INTO utilizatori (Nume_Utilizator, Parola, Rol, ID_Persoana, CNP)
VALUES ('vlad', 'vlad', 'admin', 6, '040709045281');
--@block
INSERT INTO persoane (
        Nume,
        Prenume,
        DataNasterii,
        CNP,
        NumarTelefon,
        StareCivila,
        Sex
    )
VALUES (
        'Dumitrescu',
        'Alaric',
        '1988-11-25',
        '1881125123456',
        '0745123456',
        'Necasatorit',
        'M'
    );
INSERT INTO adrese (
        ID_Persoana,
        Strada,
        Numar,
        Bloc,
        Apartament,
        Oras,
        Judet,
        CodPostal
    )
VALUES (
        7,
        'Strada Unirii',
        15,
        'B',
        8,
        'Brasov',
        'Brasov',
        '500123'
    );
INSERT INTO utilizatori (
        Nume_Utilizator,
        Parola,
        Rol,
        ID_Persoana,
        CNP
    )
VALUES (
        'AlaricD',
        'parola321',
        'admin',
        1,
        '1881125123456'
    );
INSERT INTO acte_identitate (
        ID_Persoana,
        TipAct,
        Serie,
        Numar,
        Data_Emiterii,
        Data_Expirare
    )
VALUES (
        7,
        'Pasaport',
        'XZ',
        456789,
        '2018-03-10',
        '2028-03-10'
    );
INSERT INTO cazier_judiciar (
        ID_Persoana,
        Infractiune,
        Data_Comiterii,
        Sentinta
    )
VALUES (
        7,
        'Evaziune fiscala',
        '2019-06-20',
        '4 ani cu suspendare'
    );
INSERT INTO contact_urgenta (
        ID_Persoana,
        Nume_Contact,
        Relatie,
        NumarTelefon
    )
VALUES (
        7,
        'Dumitrescu Valeria',
        'Mama',
        '0733456789'
    );
INSERT INTO evenimente_politie (
        Tip_Eveniment,
        Data_Eveniment,
        Locatie,
        ID_Persoana
    )
VALUES (
        'Accident auto',
        '2021-08-15',
        'Brasov',
        1
    );
INSERT INTO masini (
        ID_Persoana,
        Marca,
        Model,
        An_Fabricatie,
        Numar_Inmatriculare
    )
VALUES (
        7,
        'Mercedes',
        'E-Class',
        2020,
        'BV123ABC'
    );
--@block

INSERT INTO persoane_adrese (ID_Persoana, ID_Adresa, Tip_Locuinta)
VALUES (1, 1, 'Locuinta principala'),
    (2, 2, 'Locuinta principala'),
    (3, 3, 'Locuinta principala'),
    (4, 4, 'Locuinta principala'),
    (5, 5, 'Locuinta principala'),
    (1, 6, 'Locuinta secundara')
--@block
INSERT INTO persoane_contact_urgenta (ID_Contact, ID_Persoana)
VALUES (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5);
--@block
INSERT INTO persoane_evenimente (ID_Persoana, ID_Eveniment)
VALUES (1, 1),
    -- Popescu Ion
    (2, 2),
    -- Ionescu Maria
    (3, 3),
    -- Georgescu Andrei
    (4, 4),
    -- Dumitru Elena
    (5, 5)
    -- Stan Cristian
--@block
UPDATE utilizatori
SET Rol = 'user'
WHERE Nume_Utilizator = 'IonPopescu';

--@block
UPDATE adrese
SET Strada = 'Test', Numar = '10', Bloc = 'A', Apartament = '1', Oras = 'București', Judet = 'Ilfov', CodPostal = '077190'
WHERE ID_Adresa = 1 AND ID_Persoana = 1;



