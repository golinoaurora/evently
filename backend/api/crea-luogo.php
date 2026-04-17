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

$nome = $data["Nome"] ?? "";
$via = $data["Via"] ?? "";
$numeroCivico = $data["NumeroCivico"] ?? "";
$citta = $data["Citta"] ?? "";
$cap = $data["CAP"] ?? "";
$descrizione = $data["Descrizione"] ?? "";
$IDUtente = $data["IDUtente"] ?? null;

if(!$nome || !$via || !$numeroCivico || !$citta || !$cap || !$descrizione || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    $stm = $pdo->prepare("SELECT ID FROM Locale WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $locale = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$locale) {
        echo json_encode(["success" => false, "message" => "Locale non trovato"]);
        exit;
    }

    $stm = $pdo->prepare("
        INSERT INTO Luogo (Nome, Via, NumeroCivico, Citta, CAP, Descrizione, IDLocale)
        VALUES (:nome, :via, :numeroCivico, :citta, :cap, :descrizione, :IDLocale)
    ");
    $stm->execute([
        ":nome" => $nome,
        ":via" => $via,
        ":numeroCivico" => $numeroCivico,
        ":citta" => $citta,
        ":cap" => $cap,
        ":descrizione" => $descrizione,
        ":IDLocale" => $locale["ID"],
    ]);

    echo json_encode(["success" => true, "message" => "Luogo creato!"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}