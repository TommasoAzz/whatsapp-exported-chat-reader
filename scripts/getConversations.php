<?php
require_once "../loadClasses.php";
require_once "../connectToDB.php";

if(GlobalVar::getServer("REQUEST_METHOD")==="POST") {
    header('Content-type: text/html; charset=utf-8');

    $conversations = $db->queryDB("SELECT * FROM conversations");
    
    $result = "error_conversations";
    if($conversations) {
        $table = []; //$table because result will be shown in a table
        $stop = false; //boolean to stop for-loop to end if it encounters any error

        for($i = 0, $l=sizeof($conversations); $i<$l && !$stop; $i++) {
            $table[$i]["id_conversation"] = $conversations[$i]["id_conversation"];
            //getting info about participants
            $participants = $db->queryDB("SELECT * FROM chat_people WHERE id_chatpeople IN (".$conversations[$i]["id_participant1"].", ".$conversations[$i]["id_participant2"].")");
            if(!$participants) $stop = true;
            else {
                //participant 1
                $table[$i]["participant1"]["id"] = $participants[0]["id_chatpeople"];
                $table[$i]["participant1"]["name"] = $participants[0]["name"];
                $table[$i]["participant1"]["profile_pic"] = $participants[0]["profile_pic"];

                //participant 2
                $table[$i]["participant2"]["id"] = $participants[1]["id_chatpeople"];
                $table[$i]["participant2"]["name"] = $participants[1]["name"];
                $table[$i]["participant2"]["profile_pic"] = $participants[1]["profile_pic"];
            }            
        }

        if(!$stop) $result = $table;
    }

    if(gettype($result) == "string") echo $result;
    else {
        $jsonData = json_encode($result);
        echo $jsonData;
    }
} else {
    header("Location: ../");
}
?>
