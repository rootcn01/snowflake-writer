/**
 * Markdown 分区工具 - 用于 Step 2/4 双向同步
 *
 * Step 4 Markdown 结构：
 * - 故事概要（同步区）：基于 Step 2 自动生成
 * - 扩展说明（用户区）：用户编辑，Step 2 修改不覆盖
 */

/**
 * 从 Step 2 数据生成故事概要内容
 * @param {Array} paragraphs - Step 2 的一幕幕数据
 * @returns {string} 生成的 markdown 内容
 */
export function generateSynopsisFromParagraphs(paragraphs) {
  if (!paragraphs || paragraphs.length === 0) {
    return '';
  }

  let content = '# 故事概要\n\n基于"一段式概括"扩展的详细故事摘要。\n\n';
  paragraphs.forEach((p, index) => {
    if (p.content) {
      content += `## ${p.label || `第${index + 1}幕`}\n\n${p.content}\n\n`;
    }
  });

  return content.trim() + '\n';
}

/**
 * 解析 Step 4 markdown，提取同步区和用户区内容
 * @param {string} markdown - Step 4 的 markdown 内容
 * @returns {{ synopsis: string, extension: string }}
 */
export function parseSynopsisMarkdown(markdown) {
  if (!markdown) {
    return { synopsis: '', extension: '' };
  }

  // 查找扩展说明区域的起始位置
  const extensionMarker = '## 扩展说明';
  const extensionIndex = markdown.indexOf(extensionMarker);

  if (extensionIndex === -1) {
    // 没有扩展说明区域，整个内容都是同步区
    return { synopsis: markdown, extension: '' };
  }

  const synopsis = markdown.substring(0, extensionIndex).trim();
  const extension = markdown.substring(extensionIndex).trim();

  return { synopsis, extension };
}

/**
 * 合并故事概要和扩展说明
 * @param {string} newSynopsis - 新的故事概要内容
 * @param {string} currentMarkdown - 当前 Step 4 的完整 markdown
 * @returns {string} 合并后的完整 markdown
 */
export function mergeSynopsisAndExtension(newSynopsis, currentMarkdown) {
  // 解析当前 markdown，提取扩展说明
  const { extension } = parseSynopsisMarkdown(currentMarkdown);

  if (!newSynopsis) {
    return extension || '';
  }

  if (extension) {
    return `${newSynopsis}\n\n---\n\n${extension}`;
  }

  // 如果没有扩展说明但有新内容，添加分隔符
  return `${newSynopsis}\n\n---\n\n## 扩展说明\n\n请在此处扩展为4-5页的详细故事描述，包括：\n- 故事的起承转合\n- 主要情节点的细节\n- 角色在每个阶段的变化\n- 伏笔与呼应`;
}

/**
 * 将 Step 2 数据同步到 Step 4，保持扩展说明不变
 * @param {Array} paragraphs - Step 2 的一幕幕数据
 * @param {string} currentSynopsis - Step 4 当前内容
 * @returns {string} 合并后的 Step 4 内容
 */
export function syncStep2ToStep4(paragraphs, currentSynopsis) {
  const newSynopsisContent = generateSynopsisFromParagraphs(paragraphs);
  return mergeSynopsisAndExtension(newSynopsisContent, currentSynopsis);
}
