<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once("../config/db.php");
require_once("crea_notifica.php");

$data = json_decode(file_get_contents("php://input"), true);
$IDRichiesta = $data["IDRichiesta"] ?? null;
$stato = $data["Stato"] ?? null;

if(!$IDRichiesta || !$stato) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    // Recupera IDUtente e Titolo prima di aggiornare
    $stm = $pdo->prepare("
        SELECT r.Titolo, u.ID as IDUtente
        FROM RichiestaEvento r
        JOIN Privato p ON p.ID = r.IDPrivato
        JOIN Utente u ON u.ID = p.IDUtente
        WHERE r.ID = :id
    ");
    $stm->bindValue(":id", $IDRichiesta);
    $stm->execute();
    $richiesta = $stm->fetch(PDO::FETCH_ASSOC);

    // Aggiorna stato
    $stm = $pdo->prepare("UPDATE RichiestaEvento SET Stato = :stato WHERE ID = :id");
    $stm->execute([":stato" => $stato, ":id" => $IDRichiesta]);

    // Notifica in base alla decisione dell'admin
    if ($richiesta) {
        if ($stato === "approvato_admin") {
            creaNotifica(
                $pdo,
                $richiesta["IDUtente"],
                "richiesta_accettata",
                "La tua richiesta \"" . $richiesta["Titolo"] . "\" è stata approvata dall'admin. Ora è in attesa del locale!"
            );
        } else if ($stato === "rifiutato") {
            creaNotifica(
                $pdo,
                $richiesta["IDUtente"],
                "richiesta_rifiutata",
                "La tua richiesta \"" . $richiesta["Titolo"] . "\" è stata rifiutata dall'admin."
            );
        }
    }

    echo json_encode(["success" => true, "message" => "Richiesta aggiornata"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}