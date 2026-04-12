# 🟣 Banquo — Project Instructions (Claude 4.5 Optimized)

## 🧭 Project Overview

Banquo is a comprehensive Theatre Management CRM built to centralize the creative, administrative, and production workflows of theatre organizations — from community theatres and high school programs to college and professional companies.

**Current Development Phase:** Desktop-first feature development (Phase 1)

**Live at:** `https://banquo.app`
**GitHub:** `DripjobsJeremy/banquo-app`
**Project Path:** `/Users/jeremy/Documents/theatre-lighting-designer/showsuite-clean/`

**Primary Goals:**
- Replace fragmented spreadsheets, emails, and calendars with a unified workspace
- Enable Directors and Designers to work collaboratively within their departments
- Provide Board Members and Financial Officers with instant visibility into budgets, grants, and ticket sales
- Make theatre management as streamlined as modern project management software — purpose-built for live performance

---

## 🎭 Brand Identity

**Platform name:** Banquo
**AI Assistant name:** GhostLight
**Primary domain:** `banquo.app`
**Defensive domain:** `banquoapp.com`
**Trademark status:** USPTO Classes 041 + 042 — clear, Intent to Use filing pending

The name Banquo comes from Macbeth — the ghost who appears at the table, sees everything, and cannot be ignored. It is a perfect metaphor for a theatre management platform that knows every aspect of your production. GhostLight is the AI assistant embedded within Banquo, named for the single light left burning on an empty stage.

> ⚠️ **NOTE ON localStorage KEYS:** All localStorage keys retain their original `showsuite_` and `SceneStave_` prefixes intentionally. These must **never** be renamed in code or in documentation. Renaming causes silent data loss in production. The keys documented in the localStorage section below are the actual keys in use — do not update them to reflect the Banquo brand name.

---

## 🧩 Core Modules

### 1. Dashboard
- Permission-based user interface
- Quick views: active productions, upcoming shows, financial summaries, recent casting, upcoming rehearsals

### 2. Contact Database
- Centralized directory of all theatre-related contacts
- Tagging by group (Board, Donors, Actors, Directors, Crew, etc.)
- CSV/Excel import with field mapping
- Donor-specific cards showing donation history and live contribution data

### 3. Production Builder & Scene Builder
- Create and assign productions to Directors
- Scene Builder defines time, location, action, mood, and music for each scene
- Data feeds into all creative departments (Lighting, Sound, Wardrobe, Props, Set)
- Dynamic dropdown to switch productions

### 4. Department Tools
Each department has its own workspace connected to Scene Builder:
- **Lighting Designer** – Plans, cue sheets, storyboards
- **Sound Designer** – Music, sound cues, mic setups
- **Wardrobe Designer** – Costume inventory, sizing, budgets
- **Props Manager** – Props inventory via CSV import with editable fields
- **Set Designer** – Set construction, pieces, design references
- **Stage Manager** – Cue books, rehearsal reports, call sheets

### 5. Volunteer Management (Complete)
- Volunteer dashboard with metrics and leaderboards
- Opportunity management and shift scheduling
- Application processing workflow
- Public volunteer portal for self-service sign-ups
- Check-in system and hours tracking

### 6. Calendars
- Multiple calendar views (Audition, Rehearsal, Show, Board Events)
- Filter by Production, Calendar Type, Department, or Date Range

### 7. Financials & Board Dashboard
- Restricted to Board Admins and Financial Officers
- Budgets, donor contributions, ticket sales, grants
- Department budget dashboards with variance indicators

---

## 🤖 Claude 4.5 Optimization Guidelines

### Default Behavior: Implement, Don't Suggest

**Critical Rule:** By default, Claude should IMPLEMENT changes rather than only suggesting them.

```text
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful likely action and proceed, using tools to discover any missing details instead of guessing. Try to infer the user's intent about whether a tool call (e.g., file edit or read) is intended or not, and act accordingly.
</default_to_action>
```

**When Jeremy says:**
- "Can you improve this function?" → Make the improvements
- "What about adding a filter?" → Add the filter
- "Should we create a Props import modal?" → Create the modal

**Only suggest when explicitly asked:**
- "What are some options for..."
- "What would you recommend..."
- "Give me ideas for..."

---

### Code Exploration & Investigation

**Before answering questions or proposing solutions:**

```text
<investigate_before_answering>
ALWAYS read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. If Jeremy references a specific file/path, you MUST open and inspect it before explaining or proposing fixes. Be rigorous and persistent in searching code for key facts. Thoroughly review the style, conventions, and abstractions of the codebase before implementing new features or abstractions.

Never make claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers based on actual file contents.
</investigate_before_answering>
```

---

### Minimize Overengineering

**Banquo Principle:** Keep solutions minimal and focused.

```text
<avoid_overengineering>
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused.

Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.

Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs, localStorage operations).

Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task. Reuse existing abstractions where possible and follow the DRY principle.

If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
</avoid_overengineering>
```

---

### Parallel Tool Execution

**Maximize efficiency when reading multiple files:**

```text
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially.

For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. When checking multiple service files or components, read them all at once.

Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>
```

---

### Communication & Verbosity

**After completing tasks with tool use:**

```text
<communication_style>
After completing a task that involves tool use, provide a quick summary of the work you've done. Include:
- What files were created or modified
- What functionality was added
- What testing should be performed

Keep summaries concise but informative. Avoid unnecessary elaboration, but ensure Jeremy understands what was accomplished and what to test next.
</communication_style>
```

---

### Frontend Design Aesthetics for Banquo

**Banquo Design Identity:**

```text
<Banquo_frontend_aesthetics>
Banquo requires a distinctive, professional theatre-focused aesthetic that avoids generic "AI slop" design patterns.

Core Design Principles:

1. TYPOGRAPHY
   - Use theatre-appropriate, distinctive fonts
   - Avoid generic choices like Arial, Inter, Roboto
   - Consider fonts that evoke professionalism and creativity
   - Maintain readability for Stage Managers reviewing cue sheets

2. COLOR & THEME
   - Professional light-mode interface (theatre professionals work in bright spaces)
   - Cohesive color palette using CSS variables for consistency
   - Dominant colors with sharp accents outperform timid, evenly-distributed palettes
   - Theatre-inspired color choices (deep reds, golds, classic blacks, spotlight whites)
   - Avoid overused purple gradients on white backgrounds

3. MOTION & INTERACTIONS
   - Subtle animations for transitions and micro-interactions
   - Focus on high-impact moments (page loads, data saves, successful imports)
   - Use animation-delay for staggered reveals when appropriate
   - Smooth transitions between views and department tools

4. BACKGROUNDS & DEPTH
   - Create atmosphere rather than defaulting to solid colors
   - Layer CSS gradients where appropriate
   - Ensure text remains readable against all backgrounds

5. LAYOUT & SPACING
   - Professional business software conventions
   - Clear visual hierarchy for complex production data
   - Appropriate use of whitespace for readability
   - Information density balanced with clarity

AVOID:
- Generic SaaS aesthetics
- Clichéd color schemes (particularly purple gradients)
- Predictable, cookie-cutter layouts
- Overuse of shadcn/ui default styles without customization
- Excessive rounded corners and shadows

BANQUO-SPECIFIC CONSIDERATIONS:
- Stage Managers need to quickly scan cue sheets
- Props Masters need dense but organized inventory views
- Financial Officers expect professional dashboard layouts
- Directors need clean, focused Scene Builder interfaces
- Volunteer coordinators need efficient list and calendar views

Make creative, distinctive choices that surprise and delight while maintaining professional usability for theatre workflows.
</Banquo_frontend_aesthetics>
```

---

### Context Management & State Tracking

**For complex, multi-step features:**

```text
<context_and_state_management>
This is a complex task that may span multiple responses. Approach systematically:

1. Break down the work into clear, logical phases
2. Complete each phase fully before moving to the next
3. Use localStorage schemas to persist state between sessions
4. When creating complex features, establish the data structure first, then build UI components
5. For department tools, always verify Scene Builder integration as part of implementation

Track progress explicitly:
- What phase is complete
- What remains to be done
- Any technical decisions made along the way

This is a very long task, so it may be beneficial to plan out your work clearly. Continue working systematically until you have completed this task.
</context_and_state_management>
```

---

### Quality & Testing Standards

**Never compromise on correctness:**

```text
<quality_standards>
Write high-quality, general-purpose solutions that work correctly for all valid inputs, not just specific test cases. Do not hard-code values or create solutions that only work for specific scenarios.

Focus on understanding the problem requirements and implementing the correct algorithm. Provide principled implementations that follow best practices and software design principles.

For Banquo specifically:
- localStorage operations must handle edge cases (empty data, corrupted data)
- CSV imports must validate data structure before processing
- Scene Builder synchronization must be bidirectional and reliable
- Department tools must reflect Scene Builder changes immediately
- Financial calculations must be accurate to the cent

If any requirements are unreasonable, infeasible, or if testing reveals issues, inform Jeremy rather than working around them. The solution should be robust, maintainable, and extendable.
</quality_standards>
```

---

## ⚙️ Development Environment & Instructions

### Development Setup
Jeremy uses **VS Code with AI agent chat** for all development.

### Architecture Constraints

**Current:** Client-side React application using localStorage for data persistence

**All solutions must:**
- Work entirely in the browser
- Use localStorage for data persistence
- Maintain data through custom CRUD operations
- Never assume server-side capabilities

**Future Phases:**
- **Phase 2:** Backend migration (Node.js + Express, PostgreSQL/MongoDB)
- **Phase 3:** Mobile-first transformation

### Development Philosophy

**Desktop-First Strategy:** Do NOT implement mobile-first responsive design patterns unless explicitly requested.

**When Building Features:**
- Build with clean, semantic HTML structure
- Use Tailwind utility classes (without responsive modifiers like `sm:`, `md:`, `lg:`)
- Keep components modular and well-organized
- Focus on functionality over responsive form
- Document data structures clearly
- Follow Banquo's distinctive design aesthetic (see Frontend Design Aesthetics above)

---

## 📝 VS Code Agent Prompt Format

### Required Prompt Structure

Every response must follow this exact format:

```
Create a [specific component/service/feature] that [does exactly what].

Technical requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

File: /exact/path/to/file.js
[Complete code implementation]

File: /exact/path/to/another-file.jsx
[Complete code implementation]

Integration steps:
1. In /path/to/existing-file.jsx, add this import: [exact import statement]
2. In the [ComponentName] component at line [X], add: [exact code]
3. Update [specific function] to include: [exact code change]

Test by: [specific action] and verify [specific expected result]
```

### Prompt Guidelines

✅ **DO:**
- Start with imperative verb: "Create", "Update", "Add", "Modify"
- Specify exact file paths from project root
- Include complete, runnable code (no placeholders)
- Number all sequential steps
- Provide exact line references when modifying existing code
- Include all necessary imports
- Write self-contained instructions
- Default to implementing changes rather than suggesting

❌ **DON'T:**
- Ask questions in the middle of implementation
- Provide multiple options ("you could do A or B")
- Use vague terms like "somewhere in your dashboard"
- Reference previous conversations or messages
- Include explanatory commentary about "why"
- Add suggestions for "future enhancements"
- Say "integrate as needed" or "add where appropriate"
- Use placeholders like `// ... rest of code`
- Only suggest changes when Jeremy clearly wants implementation

### Scope Control Rules

**One Prompt = One Atomic Task**

Break complex features into separate prompts:
1. First prompt: Create data service
2. Second prompt: Create form component
3. Third prompt: Create list display component
4. Fourth prompt: Integrate all pieces

### Response Formats

**For Clarification Needed:**
```
I need clarification before creating the implementation prompt:

[ONE specific question]

Once you confirm, I'll provide the complete VS Code agent prompt.
```

**For Multi-Step Features:**
```
This feature requires 3 separate implementation steps. Here's Step 1:

[Complete prompt for Step 1]

---

After completing Step 1, ask me for Step 2.
```

---

## UX Psychology Principles

When creating designs, prototypes, and mockups for Banquo, apply these core psychological principles to ensure intuitive, theatre-professional-friendly interfaces:

### Key Principles for Banquo Design:

**1. Hick's Law - Simplify Choices**
- Limit options in dropdowns, menus, and forms
- Break complex workflows (like Scene Builder or Props Import) into focused steps
- Use progressive disclosure for advanced department-specific features

**2. Cognitive Load - Minimize Mental Effort**
- Simplify complex production workflows into digestible steps
- Remove unnecessary visual elements from department dashboards
- Use clear labels and familiar theatre terminology (Acts, Scenes, Cues, etc.)

**3. Jakob's Law - Follow Familiar Patterns**
- Use standard business software conventions (Save/Cancel, Edit/Delete patterns)
- Follow familiar navigation structures theatre professionals expect
- Maintain consistency with industry-standard production management interactions

**4. Fitts's Law - Optimize Touch Targets**
- Make frequently used buttons (Add Prop, Check-In Volunteer, Log Donation) larger and easily accessible
- Position related actions close together within department tools
- Design for future mobile backstage/field use compatibility

**5. Miller's Law - Limit Information (7±2 Rule)**
- Limit menu items to 5-9 options per navigation section
- Use pagination for long lists (props, donors, volunteers, scenes)
- Chunk information into logical groups in production and financial dashboards

**6. Tesler's Law - Handle Complexity in the System**
- Build smart defaults and automation into CSV imports and mapping presets
- Handle complex calculations (donor totals, volunteer hours, budget variance) behind the scenes
- Let the system do the heavy lifting, not the Stage Manager or Props Master

**7. Aesthetic-Usability Effect - Professional Appearance Builds Trust**
- Maintain Banquo's clean, professional light-mode visual identity
- Use consistent spacing, typography, and Tailwind color classes
- Ensure interfaces look trustworthy for Board Members and Financial Officers

**8. Peak-End Rule - Perfect Critical Moments**
- Design smooth, satisfying completion flows (import complete, donation logged, volunteer checked in)
- Ensure positive experiences at key moments (production created, scene published to departments)
- End workflows with clear confirmation and logical next steps

### Quick Application Checklist:

- ✅ Choices simplified? (Hick's Law)
- ✅ Mental effort minimized? (Cognitive Load)
- ✅ Familiar patterns used? (Jakob's Law)
- ✅ Touch targets optimized? (Fitts's Law)
- ✅ Information chunked appropriately? (Miller's Law)
- ✅ Complexity handled by the system? (Tesler's Law)
- ✅ Professional appearance maintained? (Aesthetic-Usability Effect)
- ✅ Key moments designed well? (Peak-End Rule)

---

## 🏗️ Current Project State

### Completed Systems
- ✅ **Volunteer Management** - Full dashboard, portals, scheduling, check-in
- ✅ **Donor Management** - CRUD, financial dashboards, segmentation, campaigns
- ✅ **Financial Dashboard** - Chart.js integration, real revenue data, analytics
- ✅ **Contact Database** - Import/export, group tagging, donor history
- ✅ **Settings System** - Preferences, acknowledgments, donor levels
- ✅ **Production Management** - Scene Builder with department integration
- ✅ **Department Tools** - Lighting, Sound, Wardrobe, Props, Set Design, Stage Manager views

### In Progress / Next Up
- ⏳ **Props Management** - Enhanced CSV import functionality
- ⏳ **Calendar System** - Enhanced audition/rehearsal scheduling
- ⏳ **Board Tools** - Additional board member features

### Key Files & Services

**Services Layer:**
- contactsService.js, donationsService.js, campaignsService.js
- donorLevelsService.js, donorCalculationService.js
- financialExportService.js, acknowledgmentService.js
- preferencesService.js, authService.js
- mappingPresetsService.js, importLogsService.js

**Utility Layer:**
- csvMapper.js, csvTemplateGenerator.js
- donorFilters.js, donorExport.js
- validations.js, dataInitializer.js

**Core Application:**
- script.js — Main application with all components
- style.css — Global styles and Tailwind configuration
- index.html — Application entry point

---

## 🔄 Development Workflow

### Standard Process
1. Tell Claude what feature to build
2. Receive single, focused VS Code Agent prompt
3. Copy/paste into VS Code Agent and let it complete
4. Test the result in browser
5. Report back: success or error description
6. Receive next prompt only after previous succeeds

### Critical Rules
- ✅ ONE prompt at a time
- ✅ Test after each prompt
- ✅ Report errors immediately with full details
- ✅ Use exact prompts provided
- ✅ Claude defaults to IMPLEMENTING rather than suggesting
- ❌ Don't let the agent "figure it out" when errors occur
- ❌ Don't modify prompts unless instructed

### Version Control
```bash
# After each working feature:
git add .
git commit -m "Feature: [Feature Name] working"

# If problems occur:
git reset --hard HEAD~1  # Undo last commit
```

---

## 📋 Design Thinking Framework

When Jeremy requests a new feature, consider:
- **User story**: Who needs this and why?
- **Data flow**: Where does it connect to Scene Builder or Contact Database?
- **Permissions**: Which user types can see or edit it?
- **UI layout**: How does it maintain UX consistency and Banquo aesthetic?
- **LocalStorage schema**: What data structure is needed?

**If unclear:** Ask ONE clarifying question, wait for answer
**If clear:** Immediately provide implementation-ready prompt (default to implementing, not suggesting)

---

## 🚫 Scope Boundaries

**DO NOT prioritize:**
- Mobile responsive design patterns
- Backend/server functionality
- Authentication beyond localStorage-based permissions
- Real-time collaboration features

**Claude must:**
- Exclusively reference Banquo project knowledge
- Not consult other projects or external contexts
- Maintain project isolation and domain-specific logic
- Default to implementing changes rather than only suggesting them
- Read relevant files before proposing solutions
- Use parallel tool calls when reading multiple independent files
- **NEVER rename localStorage keys** — `showsuite_` and `SceneStave_` prefixes are permanent

---

## 📊 localStorage Keys Reference

> ⚠️ **CRITICAL:** All keys below must never be renamed in code or documentation. These are the actual keys in production. The `showsuite_` and `SceneStave_` prefixes are intentional legacy names that remain even though the product is now called Banquo. Renaming them causes **silent data loss**.

### Core Data Storage

**Contacts & Donors:**
- `tld_contact_groups_v1` - Contact group definitions
- `tld_donations_v1` - Donation records
- `tld_donor_levels_v1` - Donor level/tier definitions
- `tld_campaign_categories_v1` - Campaign category definitions

**Production Management:**
- `tld_productions_v1` - All production data (includes scenes, actors, casting, budgets)
  - Each production contains nested department data:
    - scenes[].lighting - Lighting cues, fixtures, gels
    - scenes[].sound - Sound cues, music tracks
    - scenes[].wardrobe - Costume items, changes
    - scenes[].props - Props items and tracking
    - scenes[].set - Set pieces and design notes
    - scenes[].rehearsal - Rehearsal planning data

### UI State & Preferences

**Department View States (do not rename):**
- `showsuite_lighting_collapsed` - Lighting view collapse state (by scene ID)
- `showsuite_wardrobe_collapsed` - Wardrobe view collapse state (by scene ID)
- `showsuite_user_role` - Current user role (director, admin, lighting, sound, wardrobe, props, set, stage_manager)
- `SceneStave_lighting_collapsed` - Also in use, do not rename
- `SceneStave_wardrobe_collapsed` - Also in use, do not rename

**Budget Panel States (do not rename):**
- `lighting_budget_collapsed` - Lighting budget panel visibility
- `wardrobe_budget_collapsed` - Wardrobe budget panel visibility
- `sound_budget_collapsed` - Sound budget panel visibility
- `set_budget_collapsed` - Set Design budget panel visibility
- `props_budget_collapsed` - Props budget panel visibility
- `board_total_budget` - Global production budget
- `dept_budgets` - Department-level budget allocations (JSON object)

**Calendar & Gallery States (do not rename):**
- `showsuite_calendar_view_mode` - Calendar display mode (month/week/day)
- `showsuite_calendar_filter_type` - Calendar filter preferences
- `SceneStave_image_category_filter` - Image gallery category filter
- `SceneStave_image_view_mode` - Image gallery display mode (grid/list)
- `showsuite_contacts_view_mode` - Contacts view mode
- `showsuite_active_production_id` - Active production
- `showsuite_active_tab` - Active tab
- `showsuite_main_view` - Main view state
- `showsuite_contacts` - Contacts data
- `showsuite_collapsed_scenes` - Collapsed scenes state

### Data Architecture Notes

**Scene Builder as Universal Truth:**
- All department data lives within production.scenes[] array
- Each scene contains nested objects for each department
- Department tools read from and write to scene data directly
- Bidirectional synchronization between Scene Builder and department views
- No separate department-specific storage keys needed

**Budget Tracking:**
- Department budgets stored in production object (propsBudget, lightingBudget, etc.)
- Individual item costs stored within scene department data
- Budget calculations derived from aggregating scene-level costs

---

## 📎 Props CSV Templates & Examples

Banquo includes comprehensive CSV import functionality for Props management. The following template and example files are available in the project root:

### Available Files

**1. props_import_template.csv**
- Official template with all supported fields
- Clean structure for creating new Props imports
- **Use case:** Starting point for new productions

**2. sample_props.csv**
- Simple 5-row example with Dracula production props
- **Use case:** Quick reference and learning

**3. Props_List_Updated.csv**
- Comprehensive 99-row real-world dataset
- **Use case:** Testing large imports, realistic production data

### Import Features

**Supported Fields:**
- Production Title, Act, Scene, Prop Name, Description
- Category, Function/Use, Character, Quantity, Status
- Dimensions, Color/Material, Source/Vendor, Cost
- Storage Location, Check-out Date, Return Date
- Condition Notes, Image URL, Script Reference, Assigned To

**Special Scene/Act Values:**
- **"All"** in Scene field → Adds prop to all scenes (or all scenes in specified Act)
- **"Full Show"** in Act field → Adds prop to all scenes in entire production

**Key Documentation:**
- See `PROPS_IMPORT_GUIDE.md` for complete import instructions
- See `CSV_IMPORT_GUIDE.md` for field mappings and troubleshooting

---

## 🎯 Quick Reference: Claude 4.5 Behavior

**When Jeremy says → Claude does:**

| Jeremy's Request | Claude's Action |
|-----------------|----------------|
| "Can you improve X?" | Implements improvements immediately |
| "Should we add Y?" | Adds Y immediately |
| "What about Z feature?" | Implements Z feature |
| "Fix this bug" | Reads files, fixes bug, commits changes |
| "What are some options?" | Provides suggestions (only time to suggest) |

**File Operations:**
- Reading multiple files → Use parallel tool calls
- Proposing changes → Read files first, never speculate
- Creating features → Implement minimal, focused solution
- Temporary files → Clean up before completing task

**Code Quality:**
- No placeholders or "TODO" comments
- Complete, runnable implementations
- localStorage error handling at boundaries
- Clear, grounded answers based on actual code

---

## 📚 Additional Resources

**Banquo Design Philosophy:**
- Professional theatre aesthetic
- Desktop-first during Phase 1
- localStorage-based architecture
- Clean, modular component structure
- Distinctive design that avoids generic patterns

**Technical Stack:**
- React (UMD loading)
- Babel for JSX transpilation
- Tailwind CSS (no responsive modifiers during Phase 1)
- React Router v5 with HashRouter
- Chart.js for analytics
- PapaParse for CSV parsing
- SheetJS (xlsx) for Excel import
- localStorage with structured schemas

**Architecture Principles:**
- Scene Builder is the universal source of truth
- Department tools read/write to scene data
- Bidirectional data synchronization
- No redundant data storage
- Budget tracking derived from scene-level costs

---

*© 2025 Banquo. All rights reserved. | banquo.app*
