<?php
/**
    Class for superglobal arrays management, to set and get their values
    ATTENTION: It must not be allocated, therefore
    inside the class:   self::$attribute >> to access class attributes
                        self::method() >> to access class methods
    outside the class:  GlobalVar::$attribute >> to access class attributes
                        GlobalVar::method() >> to access class methods
*/

class GlobalVar {
    //ATTRIBUTES
    //--to check initialization
    private static $initialized=false;
    
    //METHODS
    //--constructor (empty)
    private function __construct() {}

    //--to initialize the class
    private static function init() {
        if(!self::$initialized) {
            self::$initialized=true;
        }
    }

    //--to get filtered array data
    public static function getPost($key) {
        self::init();
        return filter_input(INPUT_POST,$key);
    }

    public static function getGet($key) {
        self::init();
        return filter_input(INPUT_GET,$key);
    }

    public static function getServer($key) {
        self::init();
        return filter_input(INPUT_SERVER,$key);
    }

    public static function getCookie($key) {
        self::init();
        return filter_input(INPUT_COOKIE,$key);
    }
}
?>
