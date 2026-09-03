# Keeping Lumicamp content evergreen

Beta feedback (Allie, Aug 2026): "Since AI tools change fast, is there a plan to
keep this evergreen?" Two examples had already dated — ChatGPT described as
"the most popular" and the "You are a professional email writer" ROLE tip.

## Principles (apply when writing or editing any lesson)

1. **Teach skills, not rankings.** Never say "most popular", "best", "newest".
   Describe what a tool is *known for* and *where it lives* (inside Gmail, inside
   Word). Those change slowly; leaderboards change monthly.
2. **Name the shift.** Where a list of products is unavoidable, add one line
   telling the learner the list moves ("this changes every few months — the
   skill transfers").
3. **Prompting advice must match current research.** Persona/role prompts
   ("You are an expert…") no longer measurably help and can hurt accuracy.
   Our formula is **GOAL → CONTEXT → TONE**. Spend words on facts, not costumes.
4. **Prefer built-in features over product names** ("the image tool inside the
   chatbot you already use" ages better than "DALL-E").
5. **Prices as "typically ~$20/month"**, never exact plan names.

## Review cadence

- Every **quarter**: skim all `LESSONS` in `src/App.jsx` for product names,
  superlatives, and prompting claims. Update `CONTENT_REVIEWED` (shown on every
  location page) when done.
- Whenever a major model launch / rename happens: grep for the old name.
- The Daily Challenges (`DAILY_CHALLENGES`) and Tools (`TOOLS`) system prompts
  follow the same rules.

## Grep checklist

```
grep -n -i "most popular\|the best\|newest\|DALL-E\|You are a professional\|ROLE" src/App.jsx
```

## Last review

- 2026-09-03 — Base Camp L3 (tool landscape), Forest Lodge L1 (Goal/Context/Tone,
  added worked example), Artist's Outlook L2 (image tools), Daily Challenge dc5.

## Fixing content without a deploy (added 2026-09-03)

`public.lesson_overrides` rows are merged over the built-in lessons when the
app starts (and cached on-device). To patch one section:

```sql
insert into public.lesson_overrides (path_id, lesson_index, lesson)
values ('basics', 2, '{"sections":[{"h":"The big players","body":"..."},{"h":"Free vs paid","body":"..."},{"h":"When to use which tool","body":"..."}]}')
on conflict (path_id, lesson_index) do update set lesson = excluded.lesson, updated_at = now();
```

Keys you can override: `title`, `sections`, `questions`, `practice`. A partial
object replaces only the keys it contains. Delete the row to revert. Once a
change has been proven, fold it into `LESSONS` in the next release.
