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
require_once("crea_notifica.php"); // ← AGGIUNTO

$data = json_decode(file_get_contents("php://input"), true);

$IDRichiesta = $data["IDRichiesta"] ?? null;
$stato = $data["Stato"] ?? null;
$IDUtente = $data["IDUtente"] ?? null;

if(!$IDRichiesta || !$stato || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    // Aggiorna stato richiesta
    $stm = $pdo->prepare("UPDATE RichiestaEvento SET Stato = :stato WHERE ID = :id");
    $stm->execute([":stato" => $stato, ":id" => $IDRichiesta]);

    // Se approvato dal locale, crea l'evento vero!
    if($stato === "approvato") {
        $stm = $pdo->prepare("
            SELECT r.*, l.IDLocale 
            FROM RichiestaEvento r
            JOIN Luogo l ON l.ID = r.IDLuogo
            WHERE r.ID = :id
        ");
        $stm->bindValue(":id", $IDRichiesta);
        $stm->execute();
        $richiesta = $stm->fetch(PDO::FETCH_ASSOC);

        $stm = $pdo->prepare("
            INSERT INTO Evento (Titolo, Descrizione, DataEvento, Ora, Prezzo, MaxPartecipanti, IDLuogo, IDLocale, IDPrivato)
            VALUES (:titolo, :desc, :data, '20:00:00', 0, :maxP, :luogo, :locale, :privato)
        ");
        $stm->execute([
            ":titolo" => $richiesta["Titolo"],
            ":desc" => $richiesta["Messaggio"] ?? "Evento privato",
            ":data" => $richiesta["DataEvento"],
            ":maxP" => $richiesta["NumeroPartecipanti"],
            ":luogo" => $richiesta["IDLuogo"],
            ":locale" => $richiesta["IDLocale"],
            ":privato" => $richiesta["IDPrivato"],
        ]);

        // ← AGGIUNTO: notifica approvazione
        creaNotifica(
            $pdo,
            $IDUtente,
            "richiesta_accettata",
            "Il locale ha approvato la tua richiesta \"" . $richiesta["Titolo"] . "\"! L'evento è stato creato."
        );

    } else if($stato === "rifiutato") {
        // ← AGGIUNTO: recupera il titolo per il messaggio
        $stm = $pdo->prepare("SELECT Titolo FROM RichiestaEvento WHERE ID = :id");
        $stm->bindValue(":id", $IDRichiesta);
        $stm->execute();
        $richiesta = $stm->fetch(PDO::FETCH_ASSOC);

        creaNotifica(
            $pdo,
            $IDUtente,
            "richiesta_rifiutata",
            "Il locale ha rifiutato la tua richiesta \"" . $richiesta["Titolo"] . "\"."
        );
    }

    echo json_encode(["success" => true, "message" => "Richiesta aggiornata"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}