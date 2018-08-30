<?php
require_once "../loadClasses.php";
require_once "../connectToDB.php";

if(GlobalVar::getServer("REQUEST_METHOD")==="POST") {
    $id_sender = GlobalVar::getPost("id_sender");
    $id_receiver = GlobalVar::getPost("id_receiver");

    $receiver = $db->queryDB("SELECT name, profile_pic FROM chat_people WHERE id_chatpeople=$id_receiver");

    if(!$receiver) echo "error_receiver_data";
    else {
        $jsonData=json_encode($receiver[0]);
        header('Content-type: text/html; charset=utf-8');
        echo $jsonData;
    }
} else {
    header("Location: ../");
}
?>
