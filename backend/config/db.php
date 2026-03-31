<?php
    //file per connettersi al database
    $host = "localhost";
    $dbname = "evently"; // <-- il nome del tuo database
    $user = "root";
    $pass = "";

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8",$user,$pass);

        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);  //eccezioni

    } catch(PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Errore connessione database"
        ]);
        exit;
    }

