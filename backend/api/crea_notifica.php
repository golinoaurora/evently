<?php
// Non ha header perché viene incluso dagli altri file, non chiamato direttamente

require_once("../config/db.php");

function creaNotifica($pdo, $IDUtente, $tipo, $messaggio) {
    try {
        $stm = $pdo->prepare("
            INSERT INTO Notifica (IDUtente, tipo, messaggio)
            VALUES (:IDUtente, :tipo, :messaggio)
        ");
        $stm->bindValue(":IDUtente", $IDUtente);
        $stm->bindValue(":tipo", $tipo);
        $stm->bindValue(":messaggio", $messaggio);
        $stm->execute();
        return true;
    } catch (PDOException $e) {
        return false;
    }
}