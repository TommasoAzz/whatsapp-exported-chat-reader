<?php
/**
    Class for Database management, to manage the connections to it,
    the queries and result management
    ATTENTION: Requires to create an object, therefore
    inside the class:   $this->attribute >> to access class attributes
                        $this->method()  >> to access class methods
    outside the class:  $object_name->attribute >> to access class attributes
                        $object_name->method() >> to access class methods
 */
 
class Database {
    //ATTRIBUTES
    //--to connect to mySQL
    private $hostname; //address where mysql is located
    private $username; //username for db connection
    private $password; //password for db connection with user $this->username
    private $db_name; //database name

    //--to manage the connection (execute queries, check queries, manage query results)
    private $conn; //database object - object of class mysqli - (inside the class)

    //--to manage queries
    private $lastQuery; //object of the last sent query
    private $lastQueryRes; //array of results obtained with the last sent query


    //METHODS
    //--constructor
    public function __construct($host, $un, $psw, $db) {
        $this->hostname = $host;
        $this->username = $un;
        $this->password = $psw;
        $this->db_name = $db;
        $this->lastQueryRes = array();
    }

    //--for checking purposes
    private function checkConnection() {
        if($this->conn->connect_errno > 0) {
            $error_msg="<p>There was an error trying to establish a connection [" . $this->conn->connect_error . "].</p>";
            die($error_msg);
            return false;
        } else {
            return true;
        }
    }

    public function checkQuery() {
        if($this->lastQuery) {
            return true;
        } else {
            return false;
        }
    }

    //--to connect to mysql
    public function connect() {
        if($this->conn == null) {
            $this->conn = new mysqli($this->hostname, $this->username, $this->password, $this->db_name);
            $this->conn->set_charset('utf8mb4');
            if($this->checkConnection()) {
                $this->conn->autocommit(TRUE);
            }
        }
    }

    public function disconnect() {
        $this->conn->close();
    }

    public function getConn() {
        return $this->conn;
    }

    public function getAffectedRows() {
        return $this->conn->affected_rows; //returns the number of affected rows by the last query
    }

    //--to send/cancel the last sent queries (only if autocommit is set to FALSE)
    public function commitQueries() {
        $this->conn->commit();
    }

    public function rollbackQueries() {
        $this->conn->rollback();
    }

    //--to manage queries (send and view the results)
    public function sendQuery($string) {
        $this->lastQuery = $this->conn->query($string);
        if($this->lastQuery && $this->getAffectedRows() > 0) {
            while($row = $this->lastQuery->fetch_assoc()) {
                $this->lastQueryRes = $row;
            }
        } else {
            return false;
        }
    }

    public function getResult($needed_field) {
        if($this->lastQuery !== false) {
            return $this->lastQueryRes[$needed_field];
        }
    }

    public function freeResult() {
        $this->lastQuery->free();
    } //empties lastQuery
	
    public function queryDB($string) {
        $this->lastQuery = $this->conn->query($string);
        if(gettype($this->lastQuery) === "boolean") {
            return $this->lastQuery;
        } elseif($this->getAffectedRows() > 0) {
            $result=array();
            $i=0;
            while($row = $this->lastQuery->fetch_assoc()) {
                $result[$i] = $row;
                $i++;
            }
            $this->freeResult();
            return $result;  
        }
        
        return false;
    }
}
?>