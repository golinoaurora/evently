-- Active: 1768374861142@@127.0.0.1@3306@evently
-- ========================================
-- DATABASE EVENTLY
-- ========================================

CREATE DATABASE IF NOT EXISTS Evently;
USE Evently;

-- ========================================
-- CREAZIONE TABELLE
-- ========================================

-- Tabella UTENTE
CREATE TABLE IF NOT EXISTS Utente (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Nome varchar(255) NOT NULL,
  Email varchar(255) NOT NULL,
  PasswordUtente varchar(255) NOT NULL
);

-- Tabella PRIVATO
CREATE TABLE IF NOT EXISTS Privato (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Tabella LOCALE
CREATE TABLE IF NOT EXISTS Locale (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Tabella ADMIN
CREATE TABLE IF NOT EXISTS Admin (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDUtente int(10),
  FOREIGN KEY (IDUtente) REFERENCES Utente(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Tabella LUOGO
CREATE TABLE IF NOT EXISTS Luogo (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Nome varchar(255) NOT NULL,
  Indirizzo varchar(255) NOT NULL,
  Descrizione varchar(255) NOT NULL,
  IDLocale int(10),
  FOREIGN KEY (IDLocale) REFERENCES Locale(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Tabella EVENTO
CREATE TABLE IF NOT EXISTS Evento (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Titolo varchar(255) NOT NULL,
  Descrizione varchar(255) NOT NULL,
  DataEvento date NOT NULL,
  Ora time NOT NULL,
  Prezzo decimal(10,0) NOT NULL,
  MaxPartecipanti int(10) NOT NULL,
  IDPrivato int(10),
  IDLuogo int(10),
  IDLocale int(10),
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID)
    ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (IDLuogo) REFERENCES Luogo(ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDLocale) REFERENCES Locale(ID)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabella RICHIESTA_EVENTO
CREATE TABLE IF NOT EXISTS RichiestaEvento (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  Titolo varchar(255) NOT NULL,
  DataEvento date NOT NULL,
  NumeroPartecipanti int(10) NOT NULL,
  Messaggio varchar(255),
  Stato enum('in_attesa','approvato_admin','approvato','rifiutato') DEFAULT 'in_attesa' NOT NULL,
  IDLuogo int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDLuogo) REFERENCES Luogo(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Tabella PARTECIPARE
CREATE TABLE IF NOT EXISTS Partecipare (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  DataIscrizione date NOT NULL,
  IDEvento int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDEvento) REFERENCES Evento(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Preferiti (
  ID int(10) PRIMARY KEY AUTO_INCREMENT,
  IDEvento int(10),
  IDPrivato int(10),
  FOREIGN KEY (IDEvento) REFERENCES Evento(ID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (IDPrivato) REFERENCES Privato(ID) ON DELETE CASCADE ON UPDATE CASCADE
);