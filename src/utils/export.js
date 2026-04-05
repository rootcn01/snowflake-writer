export function generateMarkdown(project) {
  const { title, steps } = project;
  const labels = ['Hook', '第一幕', '第二幕', '第三幕', 'Resolution'];

  let md = `# ${title || '未命名'}\n\n`;
  md += `> 雪花写作法项目 - ${new Date().toLocaleDateString('zh-CN')}\n\n`;
  md += `---\n\n`;

  // Step 1: One Sentence
  md += `## 一步总结\n\n`;
  md += `${steps.oneSentence || '_待填写_'}\n\n`;

  // Step 2: One Paragraph
  md += `## 二段式总结\n\n`;
  steps.oneParagraph.forEach((text, i) => {
    md += `### ${labels[i]}\n\n${text || '_待填写_'}\n\n`;
  });

  // Step 3: Scenes
  md += `## 场景列表\n\n`;
  if (steps.scenes && steps.scenes.length > 0) {
    md += `| 场景名 | POV角色 | 摘要 |\n`;
    md += `|--------|---------|------|\n`;
    steps.scenes.forEach(scene => {
      md += `| ${scene.name || '_待填写_'} | ${scene.povCharacter || '_待填写_'} | ${scene.summary || '_待填写_'} |\n`;
    });
  } else {
    md += `_暂无场景_\n`;
  }

  md += `\n---\n\n`;
  md += `*由雪花写作法工具生成*\n`;

  return md;
}
