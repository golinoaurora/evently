<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/db.php");

$IDUtente = $_GET["IDUtente"] ?? null;

if(!$IDUtente) {
    echo json_encode(["success" => false, "message" => "IDUtente mancante"]);
    exit;
}

try {
    $stm = $pdo->prepare("SELECT ID FROM Locale WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $locale = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$locale) {
        echo json_encode(["success" => false, "message" => "Locale non trovato"]);
        exit;
    }

    $stm = $pdo->prepare("
        SELECT e.ID, e.Titolo, e.Descrizione, e.DataEvento,
               e.Ora, e.Prezzo, e.MaxPartecipanti,
               l.Nome AS NomeLuogo, l.Indirizzo
        FROM Evento e
        JOIN Luogo l ON l.ID = e.IDLuogo
        WHERE e.IDLocale = :IDLocale
        ORDER BY e.DataEvento ASC
    ");
    $stm->bindValue(":IDLocale", $locale["ID"]);
    $stm->execute();
    $eventi = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "eventi" => $eventi]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}