export async function runCode(language, code) {
  const langMap = {
    javascript: { lang: 'javascript', version: '18.15.0' },
    python: { lang: 'python', version: '3.10.0' },
    java: { lang: 'java', version: '15.0.2' },
    c: { lang: 'c', version: '10.2.0' },
    cpp: { lang: 'c++', version: '10.2.0' }
  };

  if (!langMap[language]) {
    return { run: { output: 'This language cannot be executed via Piston API' } };
  }

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langMap[language].lang,
        version: langMap[language].version,
        files: [{ content: code }]
      })
    });
    return await response.json();
  } catch (error) {
    return { run: { output: `Error: ${error.message}` } };
  }
}