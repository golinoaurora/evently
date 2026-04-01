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
        SELECT l.ID, l.Nome, l.Indirizzo, l.Descrizione
        FROM Luogo l
        ORDER BY l.Nome ASC
    ");
    $stm->execute();
    $luoghi = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "luoghi" => $luoghi
    ]);

} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore server"
    ]);
}