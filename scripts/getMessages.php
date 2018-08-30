<?php
require_once "../loadClasses.php";
require_once "../connectToDB.php";

if(GlobalVar::getServer("REQUEST_METHOD")==="POST") {
    $id_conversation = GlobalVar::getPost("id_conversation");
    $beginDate = GlobalVar::getPost("beginDate");
    $endDate = GlobalVar::getPost("endDate");
    $id_sender = GlobalVar::getPost("id_sender");
    $id_receiver = GlobalVar::getPost("id_receiver");

    $q_messages = "SELECT time, id_sender, content_type, content FROM messages WHERE id_conversation=$id_conversation AND date BETWEEN '".$beginDate."' AND '".$endDate."'";
    $r_messages = $db->queryDB($q_messages);

    if(!$r_messages) echo "error_messages";
    else {
        $jsonData = json_encode($r_messages);
        header('Content-type: text/html; charset=utf-8');
        echo $jsonData;
    }
} else {
    header("Location: ../");
}
?>
