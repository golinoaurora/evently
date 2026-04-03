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

$IDEvento = $_GET["IDEvento"] ?? null;
$IDUtente = $_GET["IDUtente"] ?? null;

if(!$IDEvento || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        SELECT pref.ID FROM Preferiti pref
        JOIN Privato p ON p.ID = pref.IDPrivato
        WHERE pref.IDEvento = :e AND p.IDUtente = :u
    ");
    $stm->execute([":e" => $IDEvento, ":u" => $IDUtente]);

    echo json_encode([
        "success" => true,
        "preferito" => $stm->rowCount() > 0
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}