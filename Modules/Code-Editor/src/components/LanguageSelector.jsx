import { Select } from '@chakra-ui/react';

export default function LanguageSelector({ language, onChange }) {
  return (
    <Select
      value={language}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      w="140px"
      bg="#3c3c3c"
      border="1px solid #3c3c3c"
      color="#cccccc"
      _hover={{ bg: '#4e4e4e' }}
      _focus={{ borderColor: '#007acc', boxShadow: 'none' }}
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="c">C</option>
      <option value="cpp">C++</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
    </Select>
  );
}