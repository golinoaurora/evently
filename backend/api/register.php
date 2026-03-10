<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Content-Type: application/json");

    // Gestione preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    require_once("../config/db.php");

    $data = json_decode(file_get_contents("php://input"), true);

    $nome = $data["Nome"] ?? "";
    $email = $data["Email"] ?? "";
    $password = $data["PasswordUtente"] ?? "";
    $tipo = $data["tipo"] ?? "";


    if(!$nome || !$email || !$password || !$tipo){
        echo json_encode([
            "success" => false,
            "message" => "Dati mancanti"
        ]);
        exit;
    }


    // controllo email esistente
    $stm = $pdo->prepare("SELECT ID FROM Utente WHERE Email = :email");
    $stm->bindValue(":email", $email);
    $stm->execute();

    if($stm->rowCount() > 0){
        echo json_encode([
            "success" => false,
            "message" => "Email già registrata"
        ]);
        exit;
    }


    // hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);


    // inserimento utente
    $stm = $pdo->prepare("
    INSERT INTO Utente (Nome, Email, PasswordUtente)
    VALUES (:nome, :email, :password)
    ");

    $stm->execute([
        ":nome" => $nome,
        ":email" => $email,
        ":password" => $passwordHash
    ]);

    $userID = $pdo->lastInsertId();


    // inserimento nella tabella giusta
    if($tipo == "privato"){

        $stm = $pdo->prepare("
        INSERT INTO Privato (IDUtente)
        VALUES (:id)
        ");

        $stm->execute([":id" => $userID]);

    }

    if($tipo == "locale"){

        $stm = $pdo->prepare("
        INSERT INTO Locale (IDUtente)
        VALUES (:id)
        ");

        $stm->execute([":id" => $userID]);

    }

    if($tipo == "admin"){

        $stm = $pdo->prepare("
        INSERT INTO Admin (IDUtente)
        VALUES (:id)
        ");

        $stm->execute([":id" => $userID]);

    }


    echo json_encode([
        "success" => true,
        "message" => "Registrazione completata"
    ]);

?>
