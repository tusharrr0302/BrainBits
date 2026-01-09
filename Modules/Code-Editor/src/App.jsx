import { ChakraProvider } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import { theme } from "./theme";

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <CodeEditor />
    </ChakraProvider>
  );
}
