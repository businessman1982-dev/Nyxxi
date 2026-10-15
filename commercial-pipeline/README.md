# Commercial Pipeline

Go from a product and an idea to a finished 30-second AI commercial, **without writing a single prompt yourself.**
You describe the film. Claude writes every prompt: the reference images, the one long video prompt that assembles them, and the fixes when a generation comes out wrong. One skill, three stages, one guided flow.

## Setup

1. **Open this folder in Claude Code as its own project.**
2. Type `/commercial-pipeline` to start.

Nothing to install.

The skill writes **prompts**, and you paste them into your image generator and into Seedance 2.5. It never generates anything itself.

## The flow

**Stage 1, assets** *(build the references)*

1. Describe the film in plain language. You get an asset plan: the five to eight reference images the film needs.
2. One image prompt per asset, one per turn: hero product on white, a second product state if there is a transformation, a character sheet per character, the empty location plate, the hero machine or prop. Generate each in a batch of four and keep the best.
3. Your logo is never generated. You use the client file.

**Stage 2, the video prompt** *(assemble the film)*

4. Tell Claude what actually generated. It writes one long structured video prompt for Seedance 2.5 that assembles all the references into a 30-second multi-cut film, with every reference handle already assigned.
5. Attach the references in the order shown, paste the prompt, generate four, keep the best.

**Stage 3, fixes** *(when something breaks)*

6. Report what went wrong in plain words. Claude names the failure, rewrites only the sections that caused it, and tells you what to re-batch. Expect around ten generations for a finished film, of which only three or four are real prompt changes.

Every step, you just describe what you want. Below every prompt there is a settings table that tells you the model, the aspect, the duration, the batch size, and which references to attach in which order. After every step, a progress line tells you where you are and what comes next.
