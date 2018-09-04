<?php
require_once "dataDB.php"; //data to connect to mysql
require_once "loadClasses.php"; //loading classes

$db=new Database(dbHost,dbUser,dbPwd,dbName); //creating new Database object

$db->connect(); //connessione a database

$utf8_set=$db->queryDB("SET NAMES 'utf8mb4'");
?>
