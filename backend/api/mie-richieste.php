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
    $stm = $pdo->prepare("
        SELECT r.ID, r.Titolo, r.DataEvento, r.NumeroPartecipanti, 
               r.Messaggio, r.Stato,
               l.Nome AS NomeLuogo
        FROM RichiestaEvento r
        JOIN Privato p ON p.ID = r.IDPrivato
        JOIN Luogo l ON l.ID = r.IDLuogo
        WHERE p.IDUtente = :IDUtente
        ORDER BY r.DataEvento DESC
    ");
    $stm->bindValue(":IDUtente", $IDUtente);
    $stm->execute();
    $richieste = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "richieste" => $richieste]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}