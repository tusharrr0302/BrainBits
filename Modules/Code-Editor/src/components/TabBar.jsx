import { useState } from "react";
import { Flex, Box, Text, Button, Input } from "@chakra-ui/react";
import { EXTENSION_TO_LANGUAGE } from "../constants";

export default function TabBar({
  files,
  activeFileId,
  setFiles,
  setActiveFileId,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  function newFile() {
    const id = Date.now().toString();
    const newFile = {
      id,
      name: "untitled",
      language: "javascript",
      code: "",
    };

    setFiles([...files, newFile]);
    setActiveFileId(id);

    // Auto-start renaming the new file
    setTimeout(() => {
      setEditingId(id);
      setEditingName("untitled");
    }, 100);
  }

  function closeFile(id, e) {
    e.stopPropagation();
    const filtered = files.filter((f) => f.id !== id);

    if (filtered.length === 0) return;

    setFiles(filtered);

    if (id === activeFileId) {
      const currentIndex = files.findIndex((f) => f.id === id);
      const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      setActiveFileId(filtered[newIndex].id);
    }
  }

  function startRename(file, e) {
    e.stopPropagation();
    setEditingId(file.id);
    setEditingName(file.name);
  }

  function saveRename(fileId) {
    if (!editingName.trim()) {
      cancelRename();
      return;
    }

    // Detect language from file extension
    const ext = editingName.split(".").pop().toLowerCase();
    const detectedLanguage = EXTENSION_TO_LANGUAGE[ext] || "javascript";

    setFiles(
      files.map((f) =>
        f.id === fileId
          ? { ...f, name: editingName.trim(), language: detectedLanguage }
          : f
      )
    );

    setEditingId(null);
    setEditingName("");
  }

  function cancelRename() {
    setEditingId(null);
    setEditingName("");
  }

  function handleKeyDown(e, fileId) {
    if (e.key === "Enter") {
      saveRename(fileId);
    } else if (e.key === "Escape") {
      cancelRename();
    }
  }

  return (
    <Flex
      bg="#252526"
      borderBottom="1px solid #1e1e1e"
      align="center"
      h="35px"
      overflowX="auto"
      css={{
        "&::-webkit-scrollbar": { height: "0px" },
      }}
    >
      {files.map((file) => (
        <Flex
          key={file.id}
          align="center"
          px={3}
          h="35px"
          cursor="pointer"
          bg={file.id === activeFileId ? "#1e1e1e" : "transparent"}
          color={file.id === activeFileId ? "#ffffff" : "#969696"}
          borderRight="1px solid #1e1e1e"
          _hover={{ bg: file.id === activeFileId ? "#1e1e1e" : "#2a2d2e" }}
          onClick={() => setActiveFileId(file.id)}
          fontSize="13px"
          minW="120px"
          position="relative"
        >
          {editingId === file.id ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => saveRename(file.id)}
              onKeyDown={(e) => handleKeyDown(e, file.id)}
              autoFocus
              size="xs"
              bg="#3c3c3c"
              border="1px solid #007acc"
              color="#ffffff"
              fontSize="13px"
              h="22px"
              px={1}
              _focus={{ borderColor: "#007acc", boxShadow: "none" }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Text
              flex={1}
              noOfLines={1}
              mr={2}
              onDoubleClick={(e) => startRename(file, e)}
              title="Double-click to rename"
            >
              {file.name}
            </Text>
          )}

          <Box
            as="span"
            fontSize="16px"
            opacity={0.7}
            _hover={{ opacity: 1, color: "#ffffff" }}
            onClick={(e) => closeFile(file.id, e)}
            ml={1}
          >
            ×
          </Box>
        </Flex>
      ))}

      <Button
        size="xs"
        variant="ghost"
        color="#969696"
        _hover={{ bg: "#2a2d2e", color: "#ffffff" }}
        onClick={newFile}
        h="35px"
        minW="35px"
        fontSize="18px"
        title="New File"
      >
        +
      </Button>
    </Flex>
  );
}
