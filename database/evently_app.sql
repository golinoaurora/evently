DROP DATABASE IF EXISTS evently;
CREATE DATABASE evently CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE evently;

CREATE TABLE Utente (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Nome varchar(255) NOT NULL,
  Email varchar(255) NOT NULL,
  PasswordUtente varchar(255) NOT NULL,
  avatar_config varchar(50) DEFAULT 'beam',
  bio varchar(200) NULL,
  Username varchar(50) NULL
);

CREATE TABLE Privato (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Locale (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  RagioneSociale varchar(255) NULL,
  PartitaIVA varchar(11) NULL,
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Admin (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Luogo (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Nome varchar(255) NOT NULL,
  Via varchar(255) NOT NULL,
  NumeroCivico varchar(10) NOT NULL,
  Citta varchar(255) NOT NULL,
  CAP varchar(5) NOT NULL,
  Descrizione varchar(255) NOT NULL,
  IDLocale int(10),
  FOREIGN KEY (IDLocale) REFERENCES Locale(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Evento (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Titolo varchar(255) NOT NULL,
  Descrizione varchar(255) NOT NULL,
  DataEvento date NOT NULL,
  Ora time NOT NULL,
  Prezzo decimal(10,0) NOT NULL,
  MaxPartecipanti int(10) NOT NULL,
  Categoria varchar(50) DEFAULT 'ALTRO' NULL,
  ImageUrl varchar(500) NULL,
  IDPrivato int(10),
  IDLuogo int(10),
  IDLocale int(10),
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (IDLuogo) REFERENCES Luogo(ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDLocale) REFERENCES Locale(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE RichiestaEvento (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Titolo varchar(255) NOT NULL,
  DataEvento date NOT NULL,
  Ora time NULL,
  NumeroPartecipanti int(10) NOT NULL,
  Messaggio varchar(255),
  Stato enum('in_attesa','approvato_admin','approvato','rifiutato') DEFAULT 'in_attesa' NOT NULL,
  Categoria varchar(50) DEFAULT 'ALTRO' NULL,
  IDLuogo int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDLuogo) REFERENCES Luogo(ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Partecipare (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  DataIscrizione date NOT NULL,
  IDEvento int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDEvento) REFERENCES Evento(ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Preferiti (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDEvento int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDEvento) REFERENCES Evento(ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Notifica (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10) NOT NULL,
  tipo varchar(50) NOT NULL,
  messaggio varchar(255) NOT NULL,
  letta tinyint(1) DEFAULT 0 NOT NULL,
  DataCreazione timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

