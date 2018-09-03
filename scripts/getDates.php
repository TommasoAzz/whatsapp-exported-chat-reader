<?php
require_once "../loadClasses.php";
require_once "../connectToDB.php";

if(GlobalVar::getServer("REQUEST_METHOD")==="POST") {
    $id_conversation = GlobalVar::getPost("id_conversation");
    header('Content-type: text/html; charset=utf-8');

    $dates = $db->queryDB("SELECT MAX(date) AS max_date, MIN(date) AS min_date FROM messages WHERE id_conversation=$id_conversation");

    if(!$dates) echo "error_dates";
    else {
        $jsonData=json_encode($dates[0]);
        echo $jsonData;
    }
} else {
    header("Location: ../");
}
?>
