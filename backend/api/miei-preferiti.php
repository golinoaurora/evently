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
        SELECT e.ID, e.Titolo, e.Descrizione, e.DataEvento,
            e.Ora, e.Prezzo, e.MaxPartecipanti,
            l.Nome AS NomeLuogo, l.Via, l.NumeroCivico, l.Citta, l.CAP
        FROM Preferiti pref
        JOIN Evento e ON e.ID = pref.IDEvento
        JOIN Luogo l ON l.ID = e.IDLuogo
        JOIN Privato p ON p.ID = pref.IDPrivato
        WHERE p.IDUtente = :IDUtente
        ORDER BY e.DataEvento ASC
    ");
    $stm->bindValue(":IDUtente", $IDUtente);
    $stm->execute();
    $preferiti = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "preferiti" => $preferiti]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}