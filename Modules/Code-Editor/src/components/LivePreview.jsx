import { Flex } from "@chakra-ui/react";

export default function LivePreview({ files, activeFile }) {
  if (activeFile.language !== "html") {
    return (
      <Flex
        w="100%"
        h="100%"
        bg="#1e1e1e"
        align="center"
        justify="center"
        color="#6a9955"
        fontSize="14px"
        fontStyle="italic"
      >
        Live preview only available for HTML files
      </Flex>
    );
  }

  const cssFile = files.find((f) => f.language === "css");

  const srcDoc = `
    ${activeFile.code}
    <style>${cssFile?.code || ""}</style>
  `;

  return (
    <iframe
      title="preview"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        backgroundColor: "white",
      }}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
    />
  );
}
