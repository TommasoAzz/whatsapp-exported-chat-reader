<?php
/**
    Classe per la gestione della Sessione, per gestire l'apertura e chiusura 
    di essa, il settaggio e il reperimento dei dati di sessione
    N.B: Non deve essere allocato, di conseguenza,
    nella classe: self::$attributo
                    self::metodo()
    fuori classe: NomeClasse::$attributo
                    NomeClasse::metodo()
*/

class Session {
    //ATTRIBUTES
    //--to check initialization
    private static $initialized=false;
    
    //--to secure the session
    private static $nomeSessione='wa-exported-chat-reader-session';
    private static $secure=false; //true per HTTPS, false per HTTP
    private static $httponly=true;

    //METHODS
    //--constructor (empty)
    private function __construct() {}

    //--to initialize the class
    private static function init() {
        if(!self::$initialized) {
            self::$initialized=true;
        }
    }

    //--to open/close the session
    public static function open() {
        self::init();

        if(!isset($_SESSION)) {
            ini_set('session.use_only_cookies',1);

            $c_param=session_get_cookie_params();
            session_set_cookie_params($c_param["lifetime"],$c_param["path"],$c_param["domain"],self::$secure,self::$httponly);

            session_name(self::$nomeSessione);
            session_start();
            session_regenerate_id();
        }
    }

    public static function close() {
        self::init();

        unset($_SESSION);

        $c_param=session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $c_param["path"], $c_param["domain"], $c_param["secure"], $c_param["httponly"]);

        session_unset();
        session_destroy();
    }

    //--to check if connection is HTTPS or HTTP
    public static function is_secure() {
        self::init();
        
        return self::$secure;
    }
    
    //--to check if a certain session variable is set
    public static function is_set($key) {
        self::init();
        
        $iss=isset($_SESSION[$key]);
        return $iss;
    }
    
    //--to set/get session variables
    public static function set($key,$value) {
        self::init();
        
        $_SESSION[$key]=$value;
    }

    public static function get($key) {
        self::init();
        
        $iss=self::is_set($key);

        if($iss)
            return $_SESSION[$key];
        else
            return NULL;
    }
}
?>