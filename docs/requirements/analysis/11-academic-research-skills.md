# Analysis: Academic Research Skills
**Source**: https://github.com/Imbad0202/academic-research-skills
**Type**: Academic Research Skills Suite
**Analyzed**: 2026-03-12

---

## Overview

Academic Research Skills เป็น comprehensive suite สำหรับงานวิจัยทางวิชาการครบวงจร ตั้งแต่ research → write → review → revise → finalize โดยใช้ multi-agent pipeline ที่มีการตรวจสอบ integrity อย่างเข้มงวด

**Version**: v4.0.3
**License**: CC BY-NC 4.0
**Author**: Cheng-I Wu (吳政宜)

---

## Key Features

### 1. Skills Overview

| Skill | Agents | Modes | Purpose |
|-------|--------|-------|---------|
| deep-research | 13 | 7 | Research pipeline with Socratic guidance |
| academic-paper | 12 | 9 | Paper writing with LaTeX hardening |
| academic-paper-reviewer | 7 | 5 | Multi-perspective peer review |
| academic-pipeline | orchestrator | 10 stages | Full pipeline coordinator |

### 2. Full Pipeline Architecture

```
Research → Write → Integrity Check → Review (5-person) → Socratic Coaching
  → Revise → Re-Review → Re-Revise → Final Integrity Check → Finalize
  → Process Summary (with Collaboration Quality Evaluation)
```

### 3. Deep Research Agents (13 agents)

| Agent | Role |
|-------|------|
| Research Question Agent | FINER-scored RQ formulation |
| Research Architect | Methodology design |
| Bibliography Agent | Systematic literature search |
| Source Verification Agent | Evidence grading, predatory journal detection |
| Synthesis Agent | Cross-source integration |
| Report Compiler | APA 7.0 report drafting |
| Editor-in-Chief | Q1 journal editorial review |
| Devil's Advocate | Assumption challenging (3 checkpoints) |
| Ethics Review Agent | AI disclosure, attribution integrity |
| Socratic Mentor | Guided research dialogue |
| Risk of Bias Agent | RoB 2 + ROBINS-I assessment |
| Meta-Analysis Agent | Effect sizes, heterogeneity, GRADE |
| Monitoring Agent | Post-pipeline literature monitoring |

**Modes**: full, quick, systematic-review (PRISMA), socratic, fact-check, lit-review, review

### 4. Academic Paper Agents (12 agents)

| Agent | Role |
|-------|------|
| Intake Agent | Configuration interview + handoff detection |
| Literature Strategist | Search strategy + annotated bibliography |
| Structure Architect | Paper outline + word allocation |
| Argument Builder | Thesis + claim-evidence chains |
| Draft Writer | Section-by-section writing |
| Citation Compliance | Multi-format citation audit |
| Abstract Bilingual | EN + Chinese abstracts |
| Peer Reviewer | 5-dimension review |
| Formatter | LaTeX/DOCX/PDF output |
| Socratic Mentor | Chapter-by-chapter guided planning |
| Visualization Agent | 9 chart types, matplotlib/ggplot2 |
| Revision Coach Agent | Parses reviewer comments → Revision Roadmap |

**Modes**: full, plan, revision, revision-coach, citation-check, format-convert, bilingual-abstract, writing-polish, full-auto

### 5. Academic Paper Reviewer Agents (7 agents)

| Agent | Role |
|-------|------|
| Field Analyst | Domain identification, reviewer personas |
| Editor-in-Chief | Journal fit, novelty, significance |
| Methodology Reviewer | Research design, statistics |
| Domain Reviewer | Literature coverage, theoretical framework |
| Perspective Reviewer | Cross-disciplinary, practical impact |
| Devil's Advocate Reviewer | Core thesis challenge, logical fallacies |
| Editorial Synthesizer | Consensus analysis, rubric-based scoring |

**Decision Mapping**: ≥80 Accept, 65-79 Minor Revision, 50-64 Major Revision, <50 Reject

### 6. Academic Pipeline Stages (10 stages)

| Stage | Skill | Purpose |
|-------|-------|---------|
| 1. RESEARCH | deep-research | Clarify RQ, find literature |
| 2. WRITE | academic-paper | Draft the paper |
| **2.5. INTEGRITY** | integrity_verification_agent | 100% reference & data verification |
| 3. REVIEW | academic-paper-reviewer | 5-person review |
| → | Socratic Revision Coaching | Guide through review feedback |
| 4. REVISE | academic-paper | Address review comments |
| 3'. RE-REVIEW | academic-paper-reviewer | Verification review |
| 4'. RE-REVISE | academic-paper | Final revision (if needed) |
| **4.5. FINAL INTEGRITY** | integrity_verification_agent | 100% final verification |
| 5. FINALIZE | academic-paper | MD + DOCX + LaTeX → PDF |
| **6. PROCESS SUMMARY** | pipeline | Collaboration Quality Evaluation |

### 7. Integrity Verification v2.0

**Anti-Hallucination Mandate**:
- No AI memory verification
- Only 3 classifications: VERIFIED / NOT_FOUND / MISMATCH
- Mandatory WebSearch audit trail for every reference
- Stage 4.5 fresh independent verification

**Known Hallucination Patterns (5 types)**:
| Type | Description |
|------|-------------|
| TF (Title Fabrication) | Fake paper titles |
| PAC (Premature Author Credit) | Wrong author order |
| IH (Invented Hallucination) | Completely fabricated |
| PH (Partial Hallucination) | Real paper, wrong details |
| SH (Semantic Hallucination) | Misrepresented findings |

### 8. Key Features

| Feature | Description |
|---------|-------------|
| Adaptive Checkpoints | FULL / SLIM / MANDATORY after every stage |
| Material Passport | Mid-entry provenance tracking |
| Cross-Skill Mode Advisor | 14 scenarios + user archetypes |
| Collaboration Quality Evaluation | 6 dimensions (1-100 scoring) |
| Bilingual Support | Traditional Chinese + English |
| Citation Formats | APA 7.0, Chicago, MLA, IEEE, Vancouver |
| Output Formats | MD + DOCX + LaTeX → PDF (tectonic) |

### 9. Performance Requirements

| Requirement | Recommendation |
|-------------|----------------|
| Model | Claude Opus 4.6 with Max plan |
| Token Budget | 200K input + 100K output per pipeline |
| Agent Team | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| Ralph Loop | Use `/ralph-loop` for long-running stages |
| Skip Permissions | `claude --dangerously-skip-permissions` |

---

## Comparison with Dev-Stack

| Feature | Dev-Stack | Academic Research Skills |
|---------|-----------|-------------------------|
| Total Agents | 7 | 32 (13+12+7) |
| Skills | 2 | 4 |
| Pipeline Stages | THINK→BUILD→VERIFY | 10 stages with integrity gates |
| Integrity Verification | No | Yes (anti-hallucination mandate) |
| Peer Review System | No | Yes (5-person + Devil's Advocate) |
| Socratic Coaching | No | Yes (guided mode) |
| Citation Support | No | 5 formats |
| Bilingual Output | No | Yes (EN + ZH) |
| Quality Rubrics | No | 0-100 scoring |
| Collaboration Evaluation | No | 6 dimensions (1-100) |
| Material Passport | No | Yes (provenance tracking) |
| LaTeX Hardening | No | Yes (apa7 class + tectonic) |

---

## Gaps Identified

### Critical
1. **No Integrity Verification** - Dev-Stack ไม่มี anti-hallucination system
2. **No Quality Rubrics** - Dev-Stack ไม่มี 0-100 scoring
3. **No Socratic Coaching** - Dev-Stack ไม่มี guided mode

### Important
4. **No Peer Review System** - Dev-Stack ไม่มี multi-perspective review
5. **No Material Passport** - Dev-Stack ไม่มี provenance tracking
6. **No Collaboration Evaluation** - Dev-Stack ไม่มี quality scoring

### Nice-to-Have
7. **No Citation Support** - Dev-Stack ไม่รองรับ citation formats
8. **No Bilingual Output** - Dev-Stack ไม่รองรับหลายภาษา
9. **No LaTeX Hardening** - Dev-Stack ไม่มี document formatting

---

## Unique Features

### Intent-Based Mode Activation
```
Layer 1 (skill activation): Bilingual keywords for matching
Layer 2 (mode routing): Language-agnostic intent signals
Default rule: When ambiguous → prefer guided mode
```

### Collaboration Quality Evaluation (6 dimensions)
| Dimension | Score Range |
|-----------|-------------|
| Direction Setting | 1-100 |
| Intellectual Contribution | 1-100 |
| Quality Gatekeeping | 1-100 |
| Iteration Discipline | 1-100 |
| Delegation Efficiency | 1-100 |
| Meta-Learning | 1-100 |

### Adaptive Checkpoint System
| Type | Description |
|------|-------------|
| FULL | Complete checkpoint with all details |
| SLIM | Abbreviated checkpoint |
| MANDATORY | Cannot skip (integrity gates) |

---

## Recommendations for Dev-Stack

### High Priority
1. **Add Integrity Verification Agent**
   - Anti-hallucination mandate
   - WebSearch audit trail
   - VERIFIED/NOT_FOUND/MISMATCH classification

2. **Add Quality Rubrics**
   - 0-100 scoring system
   - Decision thresholds
   - Behavioral indicators

3. **Add Socratic Coaching Mode**
   - Intent-based activation
   - Convergence criteria
   - Auto-end conditions

### Medium Priority
4. **Add Peer Review System**
   - Multi-perspective reviewers
   - Devil's Advocate role
   - Consensus analysis

5. **Add Material Passport**
   - Provenance tracking
   - Mid-entry support
   - Version control

6. **Add Collaboration Evaluation**
   - 6-dimension scoring
   - Evidence-based feedback
   - Improvement recommendations

### Low Priority
7. **Add Citation Support**
   - Multiple formats
   - Format conversion
   - Citation checking

8. **Add Bilingual Support**
   - Multi-language output
   - Language detection

---

## Actionable Items

- [ ] Implement integrity verification agent with anti-hallucination mandate
- [ ] Add 0-100 quality rubrics with decision thresholds
- [ ] Add Socratic coaching mode with convergence criteria
- [ ] Implement peer review system with Devil's Advocate
- [ ] Add material passport for provenance tracking
- [ ] Implement collaboration quality evaluation
- [ ] Add adaptive checkpoint system (FULL/SLIM/MANDATORY)
- [ ] Add intent-based mode activation
