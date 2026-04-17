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
        SELECT l.ID FROM Luogo l
        JOIN Locale loc ON loc.ID = l.IDLocale
        WHERE loc.IDUtente = :IDUtente
    ");
    $stm->bindValue(":IDUtente", $IDUtente);
    $stm->execute();

    echo json_encode([
        "success" => true,
        "haLuogo" => $stm->rowCount() > 0
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}