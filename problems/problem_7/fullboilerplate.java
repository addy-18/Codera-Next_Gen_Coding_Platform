import java.util.*;
public class Main {
    // {{USER_CODE}}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String haystack = sc.hasNext() ? sc.next() : "";
        String needle = sc.hasNext() ? sc.next() : "";
        System.out.println(strStr(haystack, needle));
    }
}