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
        SELECT r.ID, r.Titolo, r.DataEvento, r.NumeroPartecipanti, r.Messaggio,
               u.Nome AS NomeUtente,
               l.Nome AS NomeLuogo
        FROM RichiestaEvento r
        JOIN Privato p ON p.ID = r.IDPrivato
        JOIN Utente u ON u.ID = p.IDUtente
        JOIN Luogo l ON l.ID = r.IDLuogo
        WHERE r.Stato = 'in_attesa'
        ORDER BY r.DataEvento ASC
    ");
    $stm->execute();
    $richieste = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "richieste" => $richieste]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}