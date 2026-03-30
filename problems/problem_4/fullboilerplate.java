import java.util.*;
public class Main {
    // {{USER_CODE}}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next() : "";
        if (!s.isEmpty()) {
            List<Character> res = separateCharacters(s);
            for (char c : res) {
                System.out.println(c);
            }
        }
    }
}