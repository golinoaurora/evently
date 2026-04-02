<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$IDRichiesta = $data["IDRichiesta"] ?? null;
$stato = $data["Stato"] ?? null;

if(!$IDRichiesta || !$stato) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        UPDATE RichiestaEvento SET Stato = :stato WHERE ID = :id
    ");
    $stm->execute([":stato" => $stato, ":id" => $IDRichiesta]);

    echo json_encode(["success" => true, "message" => "Richiesta aggiornata"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}