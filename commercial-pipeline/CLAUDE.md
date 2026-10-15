# Commercial Pipeline, project guide

This project is a **commercial production pipeline**. It contains one skill that turns a plain description of a short branded film into every prompt needed to produce it, without the user writing a single prompt themselves:

- **`/commercial-pipeline`** runs three stages in order: **assets** (one image prompt per reference image), **the video prompt** (one long structured prompt that assembles the references into a multi-cut film), and **fixes** (diagnose a bad generation, rewrite only what broke).

## How to work in this project

- The pipeline is **one guided flow, in order**: asset plan, then one asset per turn, then the video prompt, then fixes. Walk the user through it. Show the map on load, deliver one artifact per turn, and close every turn with the progress line that names the next step.
- When the user wants a product shot, a character sheet, a location plate, a machine reference, a video prompt, or a fix for a generation that came out wrong, use **commercial-pipeline**. Read only the reference file for the stage you are in.
- This skill **only writes prompts**. It never generates images or video and never calls any generation tool. The user pastes each prompt into their own generator.
- **Target models.** Video is **Seedance 2.5**, 30 seconds, unless the user names another model. Images go to whichever image generator the user names at the start of the session; if they name none, suggest Nano Banana Pro and keep it for the whole session.
- **Never mention pricing or credits** in output.
- **Stateless, no memory.** Do NOT create or update memory files. Treat every session as standalone. The brief, the asset list and the generated references live in the conversation only.
- Prefer this skill over any other tool for prompt-writing in this project.

**Open this folder as its own Claude Code project**, so the skill and its reference files are always available.

Start by running `/commercial-pipeline`.
