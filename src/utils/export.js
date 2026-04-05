export function generateMarkdown(project) {
  const { title, steps } = project;
  const labels = ['吸引点', '第一幕', '第二幕', '第三幕', '结局'];

  let md = `# ${title || '未命名'}\n\n`;
  md += `> 雪花写作法项目 - ${new Date().toLocaleDateString('zh-CN')}\n\n`;
  md += `---\n\n`;

  // Step 1: One Sentence
  md += `## 一步总结\n\n`;
  md += `${steps.oneSentence || '_待填写_'}\n\n`;

  // Step 2: One Paragraph
  md += `## 二段式总结\n\n`;
  if (steps.oneParagraph && steps.oneParagraph.length > 0) {
    steps.oneParagraph.forEach((paragraph, i) => {
      const label = paragraph.label || labels[i] || `第${i + 1}幕`;
      md += `### ${label}\n\n${paragraph.content || '_待填写_'}\n\n`;
    });
  } else {
    md += `_待填写_\n\n`;
  }

  // Step 3: Characters
  md += `## 人物概括\n\n`;
  if (steps.characters && steps.characters.length > 0) {
    steps.characters.forEach(character => {
      const typeLabels = {
        protagonist: '主角',
        antagonist: '反派',
        mentor: '导师',
        supporting: '配角'
      };
      md += `### ${character.name || '_待填写_'}\n\n`;
      md += `- **类型**: ${typeLabels[character.type] || character.type || '_待填写_'}\n`;
      md += `- **目标**: ${character.goal || '_待填写_'}\n`;
      md += `- **冲突**: ${character.conflict || '_待填写_'}\n`;
      md += `- **感悟**: ${character.epiphany || '_待填写_'}\n\n`;
    });
  } else {
    md += `_暂无角色_\n\n`;
  }

  // Step 4: Story Synopsis
  md += `## 初步大纲\n\n`;
  md += `${steps.storySynopsis || '_待填写_'}\n\n`;

  // Step 5: Character Details
  md += `## 角色宝典\n\n`;
  if (steps.characterDetails && steps.characterDetails.length > 0) {
    md += `| 姓名 | 年龄 | 外貌 | 背景 | 欲望 | 恐惧 | 价值观 | 关键时刻 |\n`;
    md += `|------|------|------|------|------|------|--------|----------|\n`;
    steps.characterDetails.forEach(c => {
      md += `| ${c.name || '_'} | ${c.age || '_'} | ${c.appearance || '_'} | ${c.background || '_'} | ${c.desire || '_'} | ${c.fear || '_'} | ${c.values || '_'} | ${c.keyMoment || '_'} |\n`;
    });
    md += `\n`;
  } else {
    md += `_暂无角色详情_\n\n`;
  }

  // Step 6: Scene Outlines
  md += `## 完成大纲\n\n`;
  if (steps.sceneOutlines && steps.sceneOutlines.length > 0) {
    steps.sceneOutlines.forEach((outline, i) => {
      md += `### 场景 ${i + 1}\n\n`;
      md += `- **时间**: ${outline.time || '_待填写_'}\n`;
      md += `- **地点**: ${outline.location || '_待填写_'}\n`;
      md += `- **目标**: ${outline.goal || '_待填写_'}\n`;
      md += `- **结局**: ${outline.outcome || '_待填写_'}\n\n`;
    });
  } else {
    md += `_待填写_\n\n`;
  }

  // Step 7: Scenes
  md += `## 场景清单\n\n`;
  if (steps.scenes && steps.scenes.length > 0) {
    md += `| 场景名 | POV角色 | 摘要 |\n`;
    md += `|--------|---------|------|\n`;
    steps.scenes.forEach(scene => {
      md += `| ${scene.name || '_待填写_'} | ${scene.povCharacter || '_待填写_'} | ${scene.summary || '_待填写_'} |\n`;
    });
    md += `\n`;
  } else {
    md += `_暂无场景_\n\n`;
  }

  // Step 8: Character Backstories
  md += `## 人物小传\n\n`;
  if (steps.characterBackstories && steps.characterBackstories.length > 0) {
    steps.characterBackstories.forEach(backstory => {
      md += `### ${backstory.characterId || '_待填写_'}\n\n`;
      md += `${backstory.content || '_待填写_'}\n\n`;
    });
  } else {
    md += `_待填写_\n\n`;
  }

  // Step 9: Scene Descriptions
  md += `## 规划场景\n\n`;
  if (steps.sceneDescriptions && steps.sceneDescriptions.length > 0) {
    steps.sceneDescriptions.forEach(desc => {
      md += `### ${desc.sceneId || '_待填写_'}\n\n`;
      md += `${desc.content || '_待填写_'}\n\n`;
    });
  } else {
    md += `_待填写_\n\n`;
  }

  // Step 10: Chapters
  md += `## 初稿\n\n`;
  if (steps.chapters && steps.chapters.length > 0) {
    steps.chapters.forEach(chapter => {
      md += `### ${chapter.title || `第${chapter.order + 1}章`}\n\n`;
      md += `${chapter.content || '_待填写_'}\n\n`;
    });
  } else {
    md += `_待填写_\n\n`;
  }

  md += `\n---\n\n`;
  md += `*由雪花写作法工具生成*\n`;

  return md;
}