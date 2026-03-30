import java.util.*;
public class Main {
    // {{USER_CODE}}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";
        String t = sc.hasNext() ? sc.next() : "";
        boolean res = isAnagram(s, t);
        System.out.println(res ? "true" : "false");
    }
}