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
    // Troviamo l'ID locale dall'IDUtente
    $stm = $pdo->prepare("SELECT ID FROM Locale WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $locale = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$locale) {
        echo json_encode(["success" => false, "message" => "Locale non trovato"]);
        exit;
    }

    // Richieste approvate dall'admin per i luoghi di questo locale
    $stm = $pdo->prepare("
        SELECT r.ID, r.Titolo, r.DataEvento, r.NumeroPartecipanti, r.Messaggio,
               u.Nome AS NomeUtente,
               l.Nome AS NomeLuogo
        FROM RichiestaEvento r
        JOIN Privato p ON p.ID = r.IDPrivato
        JOIN Utente u ON u.ID = p.IDUtente
        JOIN Luogo l ON l.ID = r.IDLuogo
        WHERE r.Stato = 'approvato_admin'
        AND l.IDLocale = :IDLocale
        ORDER BY r.DataEvento ASC
    ");
    $stm->bindValue(":IDLocale", $locale["ID"]);
    $stm->execute();
    $richieste = $stm->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "richieste" => $richieste]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}