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

if(!$IDEvento) {
    echo json_encode(["success" => false, "message" => "IDEvento mancante"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        SELECT u.Nome, u.Email, p.DataIscrizione
        FROM Partecipare p
        JOIN Privato priv ON priv.ID = p.IDPrivato
        JOIN Utente u ON u.ID = priv.IDUtente
        WHERE p.IDEvento = :IDEvento
        ORDER BY p.DataIscrizione ASC
    ");
    $stm->bindValue(":IDEvento", $IDEvento);
    $stm->execute();
    $partecipanti = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "partecipanti" => $partecipanti,
        "totale" => count($partecipanti)
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}