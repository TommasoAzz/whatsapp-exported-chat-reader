public class WAmessage {
    public String date,time,sender,content;
    public int id_message,id_conversation,contentType;
    
    public WAmessage() {
        this.id_message = 0;
        this.date = "";
        this.time = "";
        this.sender = "";
        this.contentType = 0; //1: text, 2: image, 3: video, 4: audio, 5: file
        this.content = "";
        this.id_conversation = 0;
    }
    
    public void setContentType(String mediaType) {
        switch(mediaType) {
            case ".jpg": //extension
            case "PHOTO": //iOS
            case "IMG": //Android
                contentType = 2;
                break;
            case ".mp4": //extension
            case "VIDEO": //iOS
            case "VID": //Android
            case "GIF": //iOS and Android
                contentType = 3;
                break;
            case ".opus": //extension
            case "AUDIO": //iOS
            case "PTT": //Android
                contentType = 4;
                break;
            default:
                contentType = 1;
                break;
        }
    }

    public String createInsert() {
        String q = "";

        q = "INSERT INTO `messages`(`id_message`,`date`,`time`,`sender`,`content_type`,`content`,`id_conversation`) VALUES (";
        q +=  id_message + ", '" + date + "', '" + time + "', '" + sender + "', " + contentType + ", '" + content + "', " + id_conversation + ")";
        
        return q; 
    }
}