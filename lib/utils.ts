export function normalizeXmlIndentation(code: string): string {
  const lines = code.split('\n');
  
  // Find the base indentation from the SECOND non-empty line
  // (first line in XML is right after '>' with no indentation)
  let baseIndent = 0;
  let foundFirstLine = false;
  
  for (const line of lines) {
    if (line.trim().length > 0) {
      if (!foundFirstLine) {
        foundFirstLine = true;
        continue; // Skip first line
      }
      const match = line.match(/^(\s*)/);
      baseIndent = match ? match[1].length : 0;
      break;
    }
  }
  
  // Remove the base indentation from all lines except the first
  if (baseIndent > 0) {
    return lines
      .map((line, index) => {
        // Keep first non-empty line as-is (or first line period)
        if (index === 0) return line;
        
        // Remove base indent from subsequent lines
        if (line.length >= baseIndent) {
          return line.substring(baseIndent);
        }
        return line;
      })
      .join('\n');
  }
  
  return code;
}