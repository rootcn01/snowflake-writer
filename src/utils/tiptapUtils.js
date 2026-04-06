// Tiptap JSON to Markdown converter
// Handles conversion from Tiptap JSON format back to plain text/markdown for export

export function tiptapToMarkdown(tiptapJson) {
  if (!tiptapJson) return '';
  if (typeof tiptapJson === 'string') return tiptapJson;

  try {
    return convertNode(tiptapJson);
  } catch (error) {
    console.error('Error converting Tiptap to Markdown:', error);
    return '';
  }
}

function convertNode(node) {
  if (!node) return '';

  if (typeof node === 'string') return node;

  if (node.type === 'doc') {
    return node.content?.map(convertNode).join('\n\n') || '';
  }

  if (node.type === 'text') {
    let text = node.text || '';
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            text = `**${text}**`;
            break;
          case 'italic':
            text = `*${text}*`;
            break;
          case 'underline':
            text = `<u>${text}</u>`;
            break;
          case 'strike':
            text = `~~${text}~~`;
            break;
          case 'highlight':
            text = `==${text}==`;
            break;
          case 'code':
            text = `\`${text}\``;
            break;
          case 'link':
            text = `[${text}](${mark.attrs?.href || ''})`;
            break;
        }
      }
    }
    return text;
  }

  if (node.type === 'paragraph') {
    const content = node.content?.map(convertNode).join('') || '';
    return content + '\n';
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level || 1;
    const content = node.content?.map(convertNode).join('') || '';
    return '#'.repeat(level) + ' ' + content + '\n';
  }

  if (node.type === 'bulletList') {
    return node.content?.map(convertNode).join('') || '';
  }

  if (node.type === 'orderedList') {
    return node.content?.map((item, index) => {
      const content = item.content?.map(convertNode).join('') || '';
      return `${index + 1}. ${content}\n`;
    }).join('') || '';
  }

  if (node.type === 'listItem') {
    const content = node.content?.map(convertNode).join('') || '';
    return `- ${content}\n`;
  }

  if (node.type === 'blockquote') {
    const content = node.content?.map(convertNode).join('') || '';
    return content.split('\n').map(line => `> ${line}`).join('\n') + '\n';
  }

  if (node.type === 'codeBlock') {
    const content = node.content?.map(convertNode).join('') || '';
    return '```\n' + content + '\n```\n';
  }

  if (node.type === 'horizontalRule') {
    return '---\n';
  }

  if (node.type === 'hardBreak') {
    return '\n';
  }

  // Default: just return content
  return node.content?.map(convertNode).join('') || '';
}

// Check if content is Tiptap JSON format
export function isTiptapJson(content) {
  if (!content) return false;
  if (typeof content === 'object') {
    return content.type === 'doc' && content.content;
  }
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parsed.type === 'doc' && Array.isArray(parsed.content);
    } catch {
      return false;
    }
  }
  return false;
}

// Convert plain text to Tiptap JSON format
export function textToTiptap(text) {
  if (!text) return { type: 'doc', content: [] };
  if (typeof text === 'object') return text;

  // Try to parse as JSON first
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === 'doc') return parsed;
    } catch {
      // Not JSON, treat as plain text
    }
  }

  // Convert plain text/markdown to Tiptap JSON
  return markdownToTiptap(text);
}

// Simple markdown to Tiptap converter
export function markdownToTiptap(markdown) {
  if (!markdown) return { type: 'doc', content: [] };

  const lines = markdown.split('\n');
  const content = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines but preserve paragraph breaks
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      content.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: [{ type: 'text', text: headingMatch[2] }]
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|_{3,}|\*{3,})$/)) {
      content.push({ type: 'horizontalRule' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].substring(2));
        i++;
      }
      content.push({
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: quoteLines.join(' ') }]
        }]
      });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+]\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^[-*+]\s+/)) {
        const itemText = lines[i].replace(/^[-*+]\s+/, '');
        listItems.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: itemText }]
          }]
        });
        i++;
      }
      content.push({
        type: 'bulletList',
        content: listItems
      });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const itemText = lines[i].replace(/^\d+\.\s+/, '');
        listItems.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: itemText }]
          }]
        });
        i++;
      }
      content.push({
        type: 'orderedList',
        content: listItems
      });
      continue;
    }

    // Code block
    if (line === '```') {
      const codeLines = [];
      i++; // Skip opening ```
      while (i < lines.length && lines[i] !== '```') {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      content.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: codeLines.join('\n') }]
      });
      continue;
    }

    // Paragraph - collect all lines until empty line or special line
    const paragraphLines = [line];
    i++;
    while (i < lines.length && lines[i] && !lines[i].match(/^(#{1,6})\s+|^[>*+-]\s+|^\d+\.\s+|^```/) && lines[i].trim()) {
      paragraphLines.push(lines[i]);
      i++;
    }

    // Process inline formatting
    const textContent = processInlineFormatting(paragraphLines.join(' '));
    content.push({
      type: 'paragraph',
      content: textContent
    });
  }

  return { type: 'doc', content };
}

// Process inline markdown formatting
function processInlineFormatting(text) {
  if (!text) return [{ type: 'text', text: '' }];

  const result = [];
  let remaining = text;

  // Simple regex-based inline processing
  // Order matters: links/images first, then code, then formatting

  const patterns = [
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: 'link', attrs: (match) => ({ href: match[2] }), content: (match) => match[1] },
    { regex: /`([^`]+)`/, type: 'code', content: (match) => match[1] },
    { regex: /\*\*([^*]+)\*\*/, type: 'bold', content: (match) => match[1] },
    { regex: /\*([^*]+)\*/, type: 'italic', content: (match) => match[1] },
    { regex: /__([^_]+)__/, type: 'bold', content: (match) => match[1] },
    { regex: /_([^_]+)_/, type: 'italic', content: (match) => match[1] },
    { regex: /~~([^~]+)~~/, type: 'strike', content: (match) => match[1] },
    { regex: /==([^=]+)==/, type: 'highlight', content: (match) => match[1] },
    { regex: /<u>([^<]+)<\/u>/, type: 'underline', content: (match) => match[1] },
  ];

  let currentPos = 0;

  while (remaining.length > 0) {
    let earliestMatch = null;
    let earliestPattern = null;
    let earliestIndex = Infinity;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestPattern = pattern;
        earliestIndex = match.index;
      }
    }

    if (earliestMatch && earliestIndex < Infinity) {
      // Add text before match
      if (earliestIndex > 0) {
        result.push({ type: 'text', text: remaining.substring(0, earliestIndex) });
      }

      // Add formatted text
      const marks = [];
      if (earliestPattern.type !== 'link' && earliestPattern.type !== 'code') {
        marks.push({ type: earliestPattern.type });
      } else if (earliestPattern.type === 'code') {
        marks.push({ type: 'code' });
      }

      const textNode = { type: 'text', text: earliestPattern.content(earliestMatch) };
      if (marks.length > 0) {
        textNode.marks = marks;
      }
      result.push(textNode);

      remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
    } else {
      // No more matches, add remaining text
      result.push({ type: 'text', text: remaining });
      break;
    }
  }

  return result.length > 0 ? result : [{ type: 'text', text: '' }];
}

// Get plain text from Tiptap JSON (for search/display)
export function tiptapToPlainText(tiptapJson) {
  if (!tiptapJson) return '';
  if (typeof tiptapJson === 'string') return tiptapJson;

  try {
    return extractPlainText(tiptapJson);
  } catch (error) {
    return '';
  }
}

function extractPlainText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;

  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.type === 'hardBreak') {
    return '\n';
  }

  if (node.content) {
    return node.content.map(extractPlainText).join('');
  }

  return '';
}
