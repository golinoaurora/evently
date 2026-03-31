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

try {
    $stm = $pdo->prepare("
        SELECT e.ID, e.Titolo, e.Descrizione, e.DataEvento, 
               e.Ora, e.Prezzo, e.MaxPartecipanti,
               l.Nome AS NomeLuogo, l.Indirizzo
        FROM Evento e
        JOIN Luogo l ON l.ID = e.IDLuogo
        ORDER BY e.DataEvento ASC
    ");

    $stm->execute();
    $eventi = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "eventi" => $eventi
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel caricamento eventi"
    ]);
}
