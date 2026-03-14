# Analysis: awesome-claude-plugins
**Source**: https://github.com/quemsah/awesome-claude-plugins
**Type**: Plugin Directory / Metrics Collection
**Analyzed**: 2026-03-12

---

## Overview

awesome-claude-plugins เป็น automated collection ของ Claude Code plugin adoption metrics จาก GitHub repositories ทั่วโลก โดยใช้ n8n workflows ในการเก็บข้อมูล

---

## Key Features

### 1. Plugin Ranking System
- เรียงลำดับ plugins ตาม GitHub metrics (stars, forks, issues)
- Top 100 plugins ที่ได้รับความนิยมสูงสุด
- Auto-update ผ่าน n8n automation

### 2. Top Plugins (ตัวอย่าง)
| Rank | Plugin | Stars | Description |
|------|--------|-------|-------------|
| 1 | prompts.chat | 150,952 | ChatGPT Prompts collection |
| 5 | claude-code | 75,368 | Official Claude Code CLI |
| 6 | superpowers | 73,980 | Agentic skills framework |
| 7 | everything-claude-code | 67,746 | Cross-platform harness |
| 12 | agents (wshobson) | 30,697 | 112 agents, 72 plugins |
| 25 | awesome-claude-code-subagents | 12,928 | 100+ subagents |

### 3. Categories Covered
- Prompts & Skills
- Agent Frameworks
- MCP Servers
- Security Tools
- Development Tools
- Cross-platform Support

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | awesome-claude-plugins |
|---------|-----------|------------------------|
| Plugin Directory | Single plugin | 100+ plugins indexed |
| Ranking System | None | GitHub metrics based |
| Marketplace Integration | No | Community-driven |
| Metrics Tracking | No | Automated via n8n |
| Plugin Discovery | Manual only | Searchable index |

---

## Gaps Identified

### Critical
1. **No Marketplace Presence** - Dev-Stack ไม่อยู่ใน index
2. **No Discovery Mechanism** - ผู้ใช้ต้องรู้จัก dev-stack โดยตรง

### Important
3. **No Metrics** - ไม่มีการ track adoption/popularity
4. **No Community Feedback** - ไม่มี stars/reviews system

---

## Recommendations for Dev-Stack

1. **Submit to Index**
   - Add dev-stack to awesome-claude-plugins repository
   - Ensure GitHub metadata is complete

2. **Improve Discoverability**
   - Add comprehensive README with badges
   - Include use case examples
   - Add contribution guidelines

3. **Add Metrics**
   - GitHub stars tracking
   - Usage statistics
   - Community feedback system

---

## Actionable Items

- [ ] Submit dev-stack to awesome-claude-plugins
- [ ] Add badges to README (stars, forks, version)
- [ ] Create comprehensive description for marketplace
- [ ] Add contribution guidelines
- [ ] Set up GitHub Actions for metrics
