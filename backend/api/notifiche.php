<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once("../config/db.php");

$IDUtente = $_GET["IDUtente"] ?? null;
if (!$IDUtente) {
    echo json_encode(["success" => false, "message" => "IDUtente mancante"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        SELECT ID, tipo, messaggio, letta, created_at
        FROM Notifica
        WHERE IDUtente = :id
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $notifiche = $stm->fetchAll(PDO::FETCH_ASSOC);

    $nonLette = array_filter($notifiche, fn($n) => $n['letta'] == 0);

    echo json_encode([
        "success" => true,
        "notifiche" => $notifiche,
        "nonLette" => count($nonLette)
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}