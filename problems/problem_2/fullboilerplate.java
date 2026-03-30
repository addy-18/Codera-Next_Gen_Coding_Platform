import java.util.*;
public class Main {
    // {{USER_CODE}}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            boolean res = isPalindrome(s);
            System.out.println(res ? "true" : "false");
        }
    }
}