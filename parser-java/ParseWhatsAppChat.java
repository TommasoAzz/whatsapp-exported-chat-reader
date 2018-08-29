import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.ArrayList;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class ParseWhatsAppChat {
    //variables containing I/O file names
    private static String inputFileName = "";
    private static int inputFileType = 0;
    private static String outputFileName = "filename.fn";

    //objects for working with strings
    public static InputStreamReader fi;
    public static BufferedReader fIN;
    public static OutputStreamWriter fo;
    public static BufferedWriter fOUT;

    //keyboard reading
    public static BufferedReader kb;

    //constants
    private static final String MEDIA_FILE_KEYWORDS[] = {
        //photo related
        ".jpg", //extension
        "PHOTO", //iOS
        "IMG", //Android

        //video and gif related
        ".mp4", //extension
        "VIDEO", //iOS
        "VID", //Android
        "GIF", //iOS and Android

        //audio related
        ".opus", //extension
        "AUDIO", //iOS
        "PTT", //Android
    };

    private static final String MEDIA_WHATSAPP_KEYWORDS[] = {
        //italiano
        "<allegato>", //iOS - old
        "<allegato:", //iOS - new
        "(file allegato)" //Android
    };

    private static final String IGNORE_STRINGS[] = {
        "I messaggi inviati a questa chat e le chiamate sono ora protetti con la crittografia end-to-end.", //italiano
        "I messaggi che invii in questa chat e le chiamate sono ora protetti con la crittografia end-to-end.", //italiano
        "Messages you send to this group are now secured with end-to-end encryption." //english
    };
    
    private static void printHeader() {
        System.out.println("------------------------\n------- WhatsApp -------\n- Exported Chat Parser -\n------------------------");
        System.err.println();
    } //prints the program header

    private static void printError(String errorType) {
        switch(errorType) {
            case "startupSyntax":
                System.err.println("ATTENTION\nStart the program using the following syntax:");
                System.err.println("java ParseWhatsAppChat [filename.txt].\nThe program will now halt.");
                System.exit(0);
                break;
            case "extension":
                System.err.println("ERROR\nThis file extension is not valid. ParseWhatsAppChat can only analize TXT files (.txt extension). The program will now exit.");
                System.exit(0);
                break;
            case "inputFileType":
                System.err.println("ERROR\nThere was a problem understanding which format is your file made. The program will now exit.");
                System.exit(0);
                break;
            case "prohibitedCharacters":
                System.err.print("ATTENTION\nThe output file name cannot be left empty or have characters prohibited by Windows, Mac OS or Linux.\nType a valid name: ");
                break;
            case "keyboardReading":
                System.err.println("ERROR\nThere was an error while reading the keyboard input. The program will now halt.");
                System.exit(0);
                break;
            case "fileIO":
                System.err.println("ERROR\nThere was an error while opening/closing the files. The program will now halt.");
                System.exit(0);
                break;
            case "fileSyntax":
                System.out.print("ERROR\n"+inputFileName+" contains syntax errors. The program will now halt.");
                System.exit(0);
                break;
        }
        
    } //prints errors when called by other functions (used mostly for exceptions)
    
    private static WAmessage parseFileRow(int inputFileType, String row) {
        WAmessage singleMsg = new WAmessage();
        row = row.trim(); //removing trailing spaces (if there are any)
        String splitString[] = null;
        String dateFormat = (inputFileType == 3) ? "dd/MM/yy, HH:mm" : "dd/MM/yy, HH:mm:ss";

        switch(inputFileType) {
            case 1: // 1. [dd/MM/yyyy, HH:mm:ss] sender_name: message_content
                /* getting the string ready to work on */
                int beginPoint = row.indexOf('[') + 1; //index of the first square bracket + 1
                /* ATTENTION: this is necessary as files have some hidden characters before the first square bracket! */
                row = row.substring(beginPoint); //removing the first square bracket
                /* end of this part */

                splitString = row.split("]",2);
            break;
            case 2: // 2. dd/MM/yy, HH:mm:ss: sender_name: message_content
                splitString = row.split(": ",2);
            break;
            case 3: // 3. dd/MM/yy, HH:mm - sender_name: message_content
                splitString = row.split("-",2);
            break;
        }

        if(splitString.length < 2) return null;

        //management of date and time
        SimpleDateFormat formatter = new SimpleDateFormat(dateFormat);
        Date objDateTime = null;
        try {
            objDateTime = formatter.parse(splitString[0].trim());
        } catch(ParseException e) {
            e.printStackTrace();
        }
        if(objDateTime != null) {
            singleMsg.date = "20" + new SimpleDateFormat("yy-MM-dd").format(objDateTime);
            singleMsg.time = new SimpleDateFormat("HH:mm:ss").format(objDateTime);
        } else {
            singleMsg.date = "ERROR: Incorrect date format.";
            singleMsg.time = "ERROR: Incorrect time format.";
        }

        //management of profile name and message content
        String name_message[] = splitString[1].trim().split(":",2); //string will divided in two parts before and after the first occurence of ':'
        if(name_message.length < 2) return null;

        // MESSAGE CONTENT
        singleMsg.content = name_message[1].trim().replace("'","\\'");
        if(singleMsg.content.length() > 65536) singleMsg.content = singleMsg.content.substring(0,65535); //max length is 65536 characters
        else if(singleMsg.content.length() == 0) singleMsg.content = "ERROR: Content not found.";
        else {
            //checking if the message content is a string contained in IGNORE_STRINGS[] (then null is returned because the message is not important)
            for(String ignore: IGNORE_STRINGS) if(singleMsg.content.contains(ignore)) return null;
            
            //checking if the message content is a file name (at least two to try and see if it is a file and not just plain text)
            for(String keyword: MEDIA_WHATSAPP_KEYWORDS) {
                //checking for "attachment"-like string
                if(singleMsg.content.contains(keyword)) {
                    //checking for "IMAGE"/"VIDEO"/"AUDIO"-like string and file extensions
                    for(String keyword2: MEDIA_FILE_KEYWORDS) {
                        if(singleMsg.content.contains(keyword2)) {
                            singleMsg.setContentType(keyword2);
                        }
                    }

                    //if the control returns true then the message content may be a link to a file
                    if(singleMsg.contentType == 0) singleMsg.contentType = 5;
                }
            }

            //if the control returns true then the message content is plain text
            if(singleMsg.contentType == 0) singleMsg.contentType = 1;
        }

        // SENDER
        singleMsg.sender = name_message[0].trim().replace("'","\\'");
        if(singleMsg.sender.length() > 25) singleMsg.sender = singleMsg.sender.substring(0,24); //max length is 25 characters
        else if(singleMsg.sender.length() == 0) singleMsg.sender = "ERROR: Sender not found.";

        return singleMsg;
    } //returns a single object of class: WAmessage

    private static ArrayList<WAmessage> parseChatFile(int inputFileType) {
        //file row
        String row;

        ArrayList<WAmessage> messages = new ArrayList<>();
        WAmessage singleMsg;

        try {
            row = fIN.readLine();

            while(row != null) {
                singleMsg = parseFileRow(inputFileType,row);
                
                if(singleMsg != null) {
                    messages.add(singleMsg);
                } else {
                    //parseFileRow returned null either because:
                    //1. this time "row" wasn't a normal row (i.e. to be parsed), but still the previous message of the previous row (i.e. not to be parsed)
                    //2. this time "row" was one of IGNORE_STRINGS
                    //3. this time "row" was actually an error (1 occurs only if messages.size() is greater than 0)
                    
                    boolean contains_ignore = false;
                    //checking 2. if "row" contains a string contained in IGNORE_STRINGS[]
                    for(String ignore: IGNORE_STRINGS) if(row.contains(ignore)) contains_ignore = true;

                    //checking 2. and if false then checking 3. and if false then it's 1.
                    if(!contains_ignore && messages.size() > 0) {
                        WAmessage lastMsg = messages.remove(messages.size()-1); //popping the last added element

                        
                        lastMsg.content += "<br />" + row.trim().replace("'","\\'"); // lastMsg.content + "new line HTML (final goal)" + row.trim() (adding this row to the previous row)
                        messages.add(lastMsg); //adding this modified lastMsg
                    }
                }
                
                row = fIN.readLine();
            }
        } catch(IOException e) {
            printError("keyboardReading");
        }
        
        return messages;
    } //returns an ArrayList of objects of class: WAmessage

    private static ArrayList<String> createQueries(ArrayList<WAmessage> messages) {
        ArrayList<String> queries = new ArrayList<>();
        int i = 1;

        for(WAmessage singleMsg: messages) {
            singleMsg.id_conversation = 1;
            singleMsg.id_message = i;

            queries.add(singleMsg.createInsert());

            i++;
        }

        return queries;
    }

    public static void main(String args[]) throws UnsupportedEncodingException {
        //---- VARIABLES ----//

        //for the output file
        ArrayList<WAmessage> parsedChat = null;
        ArrayList<String> msgQueries = null;
        
        //--------------------------------------------------------------------//
        try {
            kb = new BufferedReader(new InputStreamReader(System.in, "UTF-8"));
        } catch(IOException e) {
            printError("keyboardReading");
        }
        

        //---- MAIN ----//
        printHeader();

        //checking arguments on program launch 
        try {
            inputFileName = args[0];
            //checking the file extension (must be .txt)
            int l = inputFileName.length();
            String inFileExt = inputFileName.substring(l-4,l);
            if(!inFileExt.equals(".txt")) printError("extension");

            System.out.println("There are many kinds of file formats exported by WhatsApp. Choose yours:");
            System.out.print(
                "1. [dd/MM/yyyy, HH:mm:ss] sender_name: message_content\n" + 
                "2. dd/MM/yy, HH:mm:ss: sender_name: message_content\n" +
                "3. dd/MM/yy, HH:mm - sender_name: message_content\n"
            );
            System.out.print("Which one is it (type the number here): ");
            inputFileType = Integer.parseInt(kb.readLine());
            if(inputFileType == 0 || inputFileType > 3) /*there are only 2 possibilities for now*/ throw new NumberFormatException();

            if(!inFileExt.equals(".txt")) printError("extension");

        } catch(ArrayIndexOutOfBoundsException e) {
            printError("startupSyntax");   
        } catch(IOException e) {
            printError("keyboardReading");
        } catch(NumberFormatException e) {
            printError("inputFileType");
        }
        
        //requesting output file name
        System.out.println("ParseWhatsAppChat will now process the file \"" + inputFileName + "\" to create the data to send to the database.");
        System.out.print("Insert the name of the file you want to save this data in (only the file name, and JUST ALPHANUMERIC CHARACTERS, the extension will be .sql by default): ");
        do {
            //checking if output file name is valid 
            if(!FileUtils.isFilenameValid(outputFileName)) printError("prohibitedCharacters");

            try {
                outputFileName = kb.readLine();
            } catch(IOException e) {
                printError("keyboardReading");
            }
        } while(!FileUtils.isFilenameValid(outputFileName));

        outputFileName+=".sql"; //adding file extension

        //opening I/O with files
        try {
            fi = new InputStreamReader(new FileInputStream(inputFileName), "UTF-8");
            fIN = new BufferedReader(fi);
            fo = new OutputStreamWriter(new FileOutputStream(outputFileName), "UTF-8");
            fOUT = new BufferedWriter(fo);
        } catch(IOException e) {
            printError("fileIO");
        }
		

        //beginning file processing
        System.out.println();
        System.out.println("Data will be written into: \"" + outputFileName + "\"");
        System.out.println("Starting the process...");

        // STEP 1
        System.out.print("1. PARSING INPUT FILE \"" + inputFileName + "\"");
        //parsing the input file
        parsedChat = parseChatFile(inputFileType);
        System.out.println(" >>> DONE!");

        // STEP 2
        System.out.print("2. CREATING QUERIES FOR MYSQL : ");
        //creating queries for MySQL, they will be then printed in the output file on step 3)
        msgQueries = createQueries(parsedChat);
        System.out.println(" >>> DONE!");

        // STEP 3
        System.out.print("3. PRINTING QUERIES IN \"" + outputFileName + "\"");
        //printing queries created on step 2 in the output file
        try {
            fOUT.write("--TABLE: messages");
            fOUT.newLine();
            for(String row: msgQueries) {
                fOUT.write(row);
                fOUT.newLine();;
            }
            fOUT.flush();
        } catch(IOException e) {
            printError("fileIO");
        }
        System.out.println(" >>> DONE!\n");

        System.out.println("Data processing has just finished.");
        System.out.println("The program will now halt. Goodbye!");            
    }
}
