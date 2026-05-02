<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);
$IDUtente = $data["IDUtente"] ?? null;

if (!$IDUtente) {
    echo json_encode(["success" => false, "message" => "IDUtente mancante"]);
    exit;
}

try {
    $stm = $pdo->prepare("UPDATE Notifica SET letta = 1 WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}