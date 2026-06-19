import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            line = line.replace('：', ':').trim();
            if ("end".equals(line)) {
                break;
            }
            if (!line.isEmpty()) {
                lines.add(line);
            }
        }
        new CircuitSimulator().run(lines);
    }
}

class CircuitSimulator {
    private final Map<String, SubCircuit> subCircuits = new LinkedHashMap<>();
    private final List<String[]> mainConnections = new ArrayList<>();
    private final Map<String, Integer> topInputValues = new HashMap<>();
    private final Set<String> topInputs = new LinkedHashSet<>();

    private final List<String[]> expandedConnections = new ArrayList<>();
    private final Map<String, String> destToSrc = new HashMap<>();
    private final Map<String, Integer> signals = new HashMap<>();
    private final Map<String, Gate> gates = new LinkedHashMap<>();

    public void run(List<String> lines) {
        parse(lines);
        String error = validateAll();
        if (error != null) {
            System.out.println(error);
            return;
        }
        expandUsedSubCircuits();
        buildCircuit();
        calculateOutputs();
        printOutputs();
    }

    private void parse(List<String> lines) {
        int idx = 0;
        while (idx < lines.size()) {
            String line = lines.get(idx);
            if (!line.matches("C\\d+:")) {
                break;
            }
            String subId = line.substring(0, line.length() - 1);
            SubCircuit sub = new SubCircuit(subId);
            idx++;
            while (idx < lines.size() && !"endc".equals(lines.get(idx))) {
                sub.parseLine(lines.get(idx));
                idx++;
            }
            subCircuits.put(subId, sub);
            idx++;
        }

        while (idx < lines.size()) {
            String line = lines.get(idx);
            if (line.startsWith("INPUT:")) {
                String content = line.substring(6).trim();
                if (!content.isEmpty()) {
                    for (String pair : content.split("\\s+")) {
                        String[] parts = pair.split("-");
                        if (parts.length == 2) {
                            topInputs.add(parts[0]);
                            topInputValues.put(parts[0], Integer.parseInt(parts[1]));
                        }
                    }
                }
            } else if (isConnectionLine(line)) {
                mainConnections.add(parseConnection(line));
            }
            idx++;
        }
    }

    private String validateAll() {
        for (SubCircuit sub : subCircuits.values()) {
            Context context = new Context(sub.inputs, sub.outputs, Collections.emptyMap());
            Map<String, String> localDestMap = new HashMap<>();
            for (String[] connection : sub.connections) {
                String error = validateConnection(connection, context, localDestMap);
                if (error != null) {
                    return error;
                }
            }
        }

        Context mainContext = new Context(topInputs, new LinkedHashSet<>(Arrays.asList("OUT")), subCircuits);
        Map<String, String> mainDestMap = new HashMap<>();
        for (String[] connection : mainConnections) {
            String error = validateConnection(connection, mainContext, mainDestMap);
            if (error != null) {
                return error;
            }
        }
        return null;
    }

    private String validateConnection(String[] connection, Context context, Map<String, String> currentDestMap) {
        int sourceCount = 0;
        int destCount = 0;
        int firstSourceIndex = -1;

        for (int i = 0; i < connection.length; i++) {
            String token = connection[i];
            if (context.isSource(token)) {
                sourceCount++;
                if (firstSourceIndex == -1) {
                    firstSourceIndex = i;
                }
            } else if (context.isDestination(token)) {
                destCount++;
            }
        }

        String desc = "[" + String.join(" ", connection) + "]";
        if (sourceCount > 1) {
            return "ERROR: " + desc + " include more than one input";
        }
        if (sourceCount == 0) {
            return "ERROR: " + desc + " include none input";
        }
        if (destCount == 0) {
            return "ERROR: " + desc + " include none output";
        }
        if (firstSourceIndex != 0) {
            return "ERROR: " + desc + " input and output sequence error";
        }

        String source = connection[0];
        for (int i = 1; i < connection.length; i++) {
            String token = connection[i];
            if (!context.isDestination(token)) {
                continue;
            }
            String existing = currentDestMap.get(token);
            if (existing != null && !existing.equals(source)) {
                return "ERROR: " + token + " input signal conflict";
            }
            currentDestMap.put(token, source);
        }
        return null;
    }

    private void expandUsedSubCircuits() {
        expandedConnections.addAll(mainConnections);
        Set<String> usedSubCircuits = new LinkedHashSet<>();
        for (String[] connection : mainConnections) {
            for (String token : connection) {
                String subId = extractSubCircuitId(token);
                if (subId != null) {
                    usedSubCircuits.add(subId);
                }
            }
        }

        for (String subId : usedSubCircuits) {
            SubCircuit sub = subCircuits.get(subId);
            if (sub == null) {
                continue;
            }
            for (String[] connection : sub.connections) {
                String[] expanded = new String[connection.length];
                for (int i = 0; i < connection.length; i++) {
                    expanded[i] = subId + "-" + connection[i];
                }
                expandedConnections.add(expanded);
            }
        }
    }

    private void buildCircuit() {
        signals.putAll(topInputValues);
        for (String[] connection : expandedConnections) {
            String source = connection[0];
            for (int i = 1; i < connection.length; i++) {
                destToSrc.put(connection[i], source);
            }
        }

        for (String[] connection : expandedConnections) {
            for (String token : connection) {
                Gate gate = createGateFromToken(token);
                if (gate != null) {
                    gates.putIfAbsent(gate.fullName, gate);
                }
            }
        }
    }

    private Gate createGateFromToken(String token) {
        int dash = token.lastIndexOf('-');
        if (dash == -1) {
            return null;
        }
        String suffix = token.substring(dash + 1);
        if (!isNumber(suffix)) {
            return null;
        }

        String gateName = token.substring(0, dash);
        String prefix = "";
        String baseName = gateName;
        int firstDash = gateName.indexOf('-');
        if (firstDash > 0) {
            String maybePrefix = gateName.substring(0, firstDash);
            if (maybePrefix.matches("C\\d+")) {
                prefix = maybePrefix;
                baseName = gateName.substring(firstDash + 1);
            }
        }

        char type = baseName.charAt(0);
        if (type == 'A' || type == 'O') {
            int left = baseName.indexOf('(');
            int right = baseName.indexOf(')');
            if (left == -1 || right == -1 || right < left) {
                return null;
            }
            int inputCount = Integer.parseInt(baseName.substring(left + 1, right));
            int id = Integer.parseInt(baseName.substring(right + 1));
            return new Gate(gateName, prefix, type, id, inputCount);
        }
        if (type == 'N' || type == 'X' || type == 'Y') {
            int id = Integer.parseInt(baseName.substring(1));
            int inputCount = type == 'N' ? 1 : 2;
            return new Gate(gateName, prefix, type, id, inputCount);
        }
        return null;
    }

    private void calculateOutputs() {
        boolean changed = true;
        while (changed) {
            changed = false;
            for (Gate gate : gates.values()) {
                if (gate.outputValue != -1 && gate.outputKnown) {
                    continue;
                }
                if (gate.tryCalculate(destToSrc, signals)) {
                    changed = true;
                }
            }
        }
    }

    private void printOutputs() {
        List<Gate> outputList = new ArrayList<>();
        for (Gate gate : gates.values()) {
            if (gate.outputKnown) {
                outputList.add(gate);
            }
        }

        outputList.sort(new Comparator<Gate>() {
            @Override
            public int compare(Gate a, Gate b) {
                int typeCompare = Integer.compare(typeOrder(a.type), typeOrder(b.type));
                if (typeCompare != 0) {
                    return typeCompare;
                }
                int idCompare = Integer.compare(a.id, b.id);
                if (idCompare != 0) {
                    return idCompare;
                }
                int prefixCompare = Integer.compare(prefixOrder(a.prefix), prefixOrder(b.prefix));
                if (prefixCompare != 0) {
                    return prefixCompare;
                }
                return a.fullName.compareTo(b.fullName);
            }
        });

        StringBuilder sb = new StringBuilder();
        for (Gate gate : outputList) {
            sb.append(gate.fullName).append("-0:").append(gate.outputValue).append('\n');
        }
        if (sb.length() > 0) {
            System.out.print(sb);
        }
    }

    private int typeOrder(char type) {
        switch (type) {
            case 'A':
                return 0;
            case 'O':
                return 1;
            case 'N':
                return 2;
            case 'X':
                return 3;
            case 'Y':
                return 4;
            default:
                return 5;
        }
    }

    private int prefixOrder(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            return -1;
        }
        return Integer.parseInt(prefix.substring(1));
    }

    private String extractSubCircuitId(String token) {
        int dash = token.lastIndexOf('-');
        if (dash == -1) {
            return null;
        }
        String suffix = token.substring(dash + 1);
        if (isNumber(suffix)) {
            return null;
        }
        String prefix = token.substring(0, dash);
        if (subCircuits.containsKey(prefix)) {
            return prefix;
        }
        return null;
    }

    private boolean isConnectionLine(String line) {
        return line.startsWith("[") && line.endsWith("]");
    }

    private String[] parseConnection(String line) {
        String content = line.substring(1, line.length() - 1).trim();
        return content.isEmpty() ? new String[0] : content.split("\\s+");
    }

    private boolean isNumber(String s) {
        if (s == null || s.isEmpty()) {
            return false;
        }
        for (int i = 0; i < s.length(); i++) {
            if (!Character.isDigit(s.charAt(i))) {
                return false;
            }
        }
        return true;
    }
}

class SubCircuit {
    final String id;
    final Set<String> inputs = new LinkedHashSet<>();
    final Set<String> outputs = new LinkedHashSet<>();
    final List<String[]> connections = new ArrayList<>();

    SubCircuit(String id) {
        this.id = id;
    }

    void parseLine(String line) {
        if (line.startsWith("INPUT:")) {
            String content = line.substring(6).trim();
            if (!content.isEmpty()) {
                for (String token : content.split("\\s+")) {
                    inputs.add(token);
                }
            }
            return;
        }
        if (line.startsWith("OUT:")) {
            String content = line.substring(4).trim();
            if (!content.isEmpty()) {
                for (String token : content.split("\\s+")) {
                    outputs.add(token);
                }
            }
            return;
        }
        if (line.startsWith("[") && line.endsWith("]")) {
            String content = line.substring(1, line.length() - 1).trim();
            connections.add(content.isEmpty() ? new String[0] : content.split("\\s+"));
        }
    }
}

class Context {
    private final Set<String> inputPorts;
    private final Set<String> outputPorts;
    private final Map<String, SubCircuit> subCircuits;

    Context(Set<String> inputPorts, Set<String> outputPorts, Map<String, SubCircuit> subCircuits) {
        this.inputPorts = inputPorts;
        this.outputPorts = outputPorts;
        this.subCircuits = subCircuits;
    }

    boolean isSource(String token) {
        if (!token.contains("-")) {
            return inputPorts.contains(token);
        }

        int dash = token.lastIndexOf('-');
        String prefix = token.substring(0, dash);
        String suffix = token.substring(dash + 1);
        if (isNumber(suffix)) {
            return "0".equals(suffix);
        }
        SubCircuit sub = subCircuits.get(prefix);
        return sub != null && sub.outputs.contains(suffix);
    }

    boolean isDestination(String token) {
        if (!token.contains("-")) {
            return outputPorts.contains(token);
        }

        int dash = token.lastIndexOf('-');
        String prefix = token.substring(0, dash);
        String suffix = token.substring(dash + 1);
        if (isNumber(suffix)) {
            return !"0".equals(suffix);
        }
        SubCircuit sub = subCircuits.get(prefix);
        return sub != null && sub.inputs.contains(suffix);
    }

    private boolean isNumber(String s) {
        if (s == null || s.isEmpty()) {
            return false;
        }
        for (int i = 0; i < s.length(); i++) {
            if (!Character.isDigit(s.charAt(i))) {
                return false;
            }
        }
        return true;
    }
}

class Gate {
    final String fullName;
    final String prefix;
    final char type;
    final int id;
    final int inputCount;
    int outputValue = -1;
    boolean outputKnown = false;

    Gate(String fullName, String prefix, char type, int id, int inputCount) {
        this.fullName = fullName;
        this.prefix = prefix;
        this.type = type;
        this.id = id;
        this.inputCount = inputCount;
    }

    boolean tryCalculate(Map<String, String> destToSrc, Map<String, Integer> signals) {
        int[] inputs = new int[inputCount];
        for (int i = 1; i <= inputCount; i++) {
            String inputPin = fullName + "-" + i;
            String source = destToSrc.get(inputPin);
            if (source == null) {
                return false;
            }
            Integer value = resolveValue(source, destToSrc, signals);
            if (value == null) {
                return false;
            }
            inputs[i - 1] = value;
        }
        outputValue = calculate(inputs);
        outputKnown = true;
        signals.put(fullName + "-0", outputValue);
        return true;
    }

    private Integer resolveValue(String start, Map<String, String> destToSrc, Map<String, Integer> signals) {
        Set<String> visited = new HashSet<>();
        String current = start;
        while (current != null && !visited.contains(current)) {
            if (signals.containsKey(current)) {
                return signals.get(current);
            }
            visited.add(current);
            current = destToSrc.get(current);
        }
        return null;
    }

    private int calculate(int[] inputs) {
        switch (type) {
            case 'A':
                for (int v : inputs) {
                    if (v == 0) {
                        return 0;
                    }
                }
                return 1;
            case 'O':
                for (int v : inputs) {
                    if (v == 1) {
                        return 1;
                    }
                }
                return 0;
            case 'N':
                return inputs[0] == 0 ? 1 : 0;
            case 'X':
                return inputs[0] == inputs[1] ? 0 : 1;
            case 'Y':
                return inputs[0] == inputs[1] ? 1 : 0;
            default:
                return 0;
        }
    }
}
