import { useState } from "react";
import { Box, Flex, Button, Text, HStack, VStack } from "@chakra-ui/react";
import TabBar from "./TabBar";
import EditorPanel from "./EditorPanel";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import LivePreview from "./LivePreview";
import { runCode } from "../api";
import { DEFAULT_CODE } from "../constants";

export default function CodeEditor() {
  const [files, setFiles] = useState([
    {
      id: "1",
      name: "index.html",
      language: "html",
      code: DEFAULT_CODE.html,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState("1");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  function updateCode(newCode) {
    setFiles(
      files.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f))
    );
  }

  function changeLanguage(lang) {
    setFiles(
      files.map((f) => (f.id === activeFileId ? { ...f, language: lang } : f))
    );
  }

  async function handleRun() {
    setIsRunning(true);
    setOutput("Running...");

    const result = await runCode(activeFile.language, activeFile.code);
    const finalOutput =
      result.run?.stdout ||
      result.run?.stderr ||
      result.run?.output ||
      "No output";

    setOutput(finalOutput);
    setIsRunning(false);
  }

  return (
    <Flex direction="column" h="100vh" bg="#1e1e1e">
      {/* Top Toolbar */}
      <Flex
        bg="#3c3c3c"
        h="35px"
        align="center"
        px={3}
        borderBottom="1px solid #1e1e1e"
        justify="space-between"
      >
        <HStack spacing={3}>
          <Text fontSize="14px" fontWeight="semibold" color="#cccccc">
            Code Editor
          </Text>
        </HStack>

        <HStack spacing={2}>
          <LanguageSelector
            language={activeFile?.language}
            onChange={changeLanguage}
          />

          <Button
            size="sm"
            colorScheme="green"
            onClick={handleRun}
            isLoading={isRunning}
            loadingText="Running"
            h="28px"
            fontSize="13px"
          >
            ▶ Run
          </Button>
        </HStack>
      </Flex>

      {/* Tab Bar */}
      <TabBar
        files={files}
        activeFileId={activeFileId}
        setFiles={setFiles}
        setActiveFileId={setActiveFileId}
      />

      {/* Main Content Area */}
      <Flex flex={1} overflow="hidden">
        {/* Left Side - Editor */}
        <Box flex={1} borderRight="1px solid #1e1e1e" bg="#1e1e1e">
          <EditorPanel
            language={activeFile?.language}
            code={activeFile?.code}
            onChange={updateCode}
          />
        </Box>

        {/* Right Side - Output & Preview */}
        <VStack w="40%" spacing={0} bg="#252526">
          {/* Output Section */}
          <Box w="100%" h="50%" borderBottom="1px solid #1e1e1e">
            <Flex
              bg="#252526"
              h="35px"
              align="center"
              px={3}
              borderBottom="1px solid #1e1e1e"
            >
              <Text fontSize="13px" fontWeight="semibold" color="#cccccc">
                OUTPUT
              </Text>
            </Flex>
            <Box h="calc(100% - 35px)">
              <Output output={output} />
            </Box>
          </Box>

          {/* Live Preview Section */}
          <Box w="100%" h="50%">
            <Flex
              bg="#252526"
              h="35px"
              align="center"
              px={3}
              borderBottom="1px solid #1e1e1e"
            >
              <Text fontSize="13px" fontWeight="semibold" color="#cccccc">
                LIVE PREVIEW
              </Text>
            </Flex>
            <Box h="calc(100% - 35px)">
              <LivePreview files={files} activeFile={activeFile} />
            </Box>
          </Box>
        </VStack>
      </Flex>
    </Flex>
  );
}
