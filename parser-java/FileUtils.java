import java.io.File;
import java.io.IOException;

public class FileUtils {
    public static boolean isFilenameValid(String fileName) {
        File f = new File(fileName);
        try {
            f.getCanonicalPath();
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}