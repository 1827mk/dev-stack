  https://code.claude.com/docs/
  https://code.claude.com/docs/en/overview
  https://code.claude.com/docs/en/cli-reference
  https://code.claude.com/docs/en/hooks-guide#re-inject-context-after-compaction

  และค้นหาข้อมูลอื่นๆ ในการสร้าง plugin ,marketplace 

  ความตั้งใจแรกของผมก็คือ เครื่องคอมของผมมี claude code + tool ต่างๆ '[text](tools_name.md)' ผมอยากได้ plugin ที่จัด set tools      
  เหล่านี้ให้ทำงานเป็น workflow ยกตัวอย่าง: "ผมสร้างงานให้ช่วยศึกษาข้อมูลจาก source code ปัจจุบัน แล้วเพิ่ม feature auth แล้วมีหน้าบ้านสวยๆ ตามการออกแบบของระบบเดิม "                       
  plugin จะวิเคราะห์เอา tools ต่างๆมาชุดนึง อาจจะหลายๆ tools และสร้าง prompt หรือ workflow เป็น step ว่า 1.ต้องใช้ serena ,file system อ่านโค้ดแล้วสรุป 2.จากนั้น ใช้ brainstorming   
  ออกแบบ 3.ใช้ spec kit วางแผนด้วย SDD 4.ใช้ Write แก้ไข code ต่าง พร้อมกับ security-guidance อุดช่องโหว่ sub agent ก็จะทำงานของตัวเองจนเสร็จ โดยมี agent หลัดควบคุมตลอดจนเสร็จงาน   
  พอส่งมอบ ก็จะมีหน้าจอ report ว่า agent ตัวไหนทำอะไรอย่างไร ครับ   

  และเพื่อลด tokens windows context ตลอดการทำงานจนจบงานต่างๆ ที่ผู้ใช้งานสั่งงาน


  ### Team Orchestrator

| Command | Can Spawn Team? | Description |
|---------|-----------------|-------------|
| `/dev-stack:agents` | ✅ **YES** | Multi-scope coordination |

### Scoped Commands (Single Agent)

| Command | Scope | Description |
|---------|-------|-------------|
| `/dev-stack:dev` | dev | Bug fix, feature, refactor |
| `/dev-stack:git` | git | Commit, push, PR |
| `/dev-stack:docs` | docs | README, API docs |
| `/dev-stack:quality` | quality | Tests, coverage |
| `/dev-stack:info` | - | Display capabilities |
| `/dev-stack:simplify` | - | Task breakdown |

  https://code.claude.com/docs/
  https://code.claude.com/docs/en/overview
  https://code.claude.com/docs/en/cli-reference
  https://code.claude.com/docs/en/hooks-guide#re-inject-context-after-compaction

