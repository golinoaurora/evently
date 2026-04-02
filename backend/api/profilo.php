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
        SELECT ID, Nome, Email FROM Utente WHERE ID = :id
    ");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $utente = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$utente) {
        echo json_encode(["success" => false, "message" => "Utente non trovato"]);
        exit;
    }

    echo json_encode(["success" => true, "utente" => $utente]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}