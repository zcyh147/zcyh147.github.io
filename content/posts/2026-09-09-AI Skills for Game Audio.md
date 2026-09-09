---
title: "From Clarifying Questions to Implementation: AI Skills in Game Audio Practice"
date: 2026-09-09T00:00:00+08:00
tags:
  - "Audio Programming"
description: "Practical examples of Matt Pocock’s Skills for game audio, from sound design and Wwise API selection to a playable footstep prototype."
---
Hi, I'm Thomas.

AI-assisted coding has lowered the barrier to development. For many simple tasks, describing what you want to an agent is enough to get a result. As requirements grow more complex, however, it is easy to get stuck in repeated cycles of adding constraints and revising the design. Even writing a design document in advance does not eliminate the problem.

Over the past few months, I have been trying Matt Pocock's Skills across several projects. They introduce a counterintuitive workflow: once you describe a requirement, the agent starts asking you questions, clarifying the goals and boundaries before development proceeds.

The most noticeable difference for me is that many issues I used to discover during implementation now surface during those questions, while there is still time to make the relevant decisions. The quality of the agent's output has improved substantially.

These Skills were originally designed for software development, but I have also found them effective for technical evaluation, product design, and development in game audio. This article uses several practical examples to show how the workflow helps.

## Why Requirements Need to Be Clear
### Why AI Gets Things Wrong
A common way to work with AI is to describe a requirement in a few sentences and ask for a solution. If the result misses the mark, you provide feedback and ask the agent to try again. A simple problem may take only a few iterations; complex requirements can take many more.

The problem arises when the background, constraints, and criteria that shape the design have not been made explicit. This is what I mean by “context” in this article. When information is missing, the agent fills the gaps with assumptions and proposes a seemingly reasonable approach. If subsequent decisions build on the wrong assumptions, the errors can compound and the work can drift further from what you intended.

Constantly revising requirements is like changing the blueprints while construction is underway. As the conversation grows, old and new designs become mixed together with their constraints, creating two further problems:
- Models do not necessarily make effective use of every detail in a long context window, so earlier constraints may be overlooked
- Context compaction summarizes the conversation to reduce context-window usage; if that summary omits a critical condition, subsequent work may diverge from the requirements

### Vague Requirements
“Give me a colorful black” is a familiar joke about vague design requests in China. Game audio has its own equivalents:
- Make the sound louder, even though there is little headroom left in the mix
- Make the musical theme more prominent, but do not draw the player's attention to it
- Make the city sound busy, but keep the number of simultaneous sounds low

These requests describe an impression, which can be difficult to translate into specific changes. “More powerful,” for example, could mean more low end, a faster attack, or greater dynamic contrast. Sometimes the right change is to the hit-reaction animation, so that sound and visuals work together to sell the impact. Without specific criteria, the agent can only guess what “power” means in this context.

In my earlier article, *Building an Efficient Game Audio Q&A Knowledge Base*, I made the point that **more detailed context leads to more precise answers**. In requirements discussions, this means giving the agent the conditions that will affect its design choices.

The difficulty is that these conditions are hard to list exhaustively at the outset. Often, the missing details only come to mind when you see a counterexample or start comparing approaches.

### Let the AI Ask the Questions
If it is difficult to think of every detail in advance, why not use the model's existing knowledge and let it ask first? What is the actual goal? Which conditions are non-negotiable? Where can you compromise? What counts as finished?

Matt Pocock calls this questioning process **Grilling**. You provide a goal, and the agent asks questions until it has enough information to propose a solution. This is an example of the **Flipped Interaction Pattern**, in which the AI actively asks for the information it needs to complete the task.

The role of Grilling becomes easier to understand if we organize the information in a requirements discussion into four categories:

| Knowledge category | How it appears in requirements | What Grilling can do |
| --- | --- | --- |
| Known knowns | You have thought it through and already stated it | Confirm whether it is a hard constraint |
| Known unknowns | You know a decision is needed, but have not made it | Present options, trade-offs, evaluation criteria, and recommendations |
| Unknown knowns | You already have a judgment in mind, but have not articulated it | Use edge cases and counterexamples to draw out tacit knowledge |
| Unknown unknowns | You have not yet realized that the issue exists | Identify potential issues from the available context and help explore them |

The middle two categories are particularly useful in requirements discussions. In one, you know a choice must be made but have not decided; in the other, you have already formed a judgment without stating it. Grilling helps you compare options in the first case and articulate your reasoning in the second.

Without context, the model must first guess what you are trying to achieve. Grilling replaces those guesses with questions. It does not raise the model's capability ceiling, but it can help you make better use of the capabilities already available.

## Grilling in Practice
The following three examples cover sound design, technical evaluation, and planning a complex audio system. Each compares a direct request with a workflow that gathers more information before proposing a solution.

For each example, I include the initial prompt, representative questions, and the differences in the results. The tests were run in Codex with memory disabled to reduce the influence of prior conversations.

These are comparisons between two ways of working: a direct request produces an initial proposal, while Grilling gathers additional constraints before generating one. The purpose is to observe how the questions change the design.

### Example 1: Breaking Down the Sound Design for a Fire Spell
A fire spell is a common sound design brief. It is a useful way to examine what information is missing between a broad description and a plan you can start producing.

This example focuses on a sound design discussion, making it a good fit for the `grill-me` Skill.

#### Initial Prompt
> Design the sound for a fire spell that the player can use frequently in a third-person open-world game combining realism and fantasy. Give me the sound design proposal directly, including ability phases and layering, sound-library material types and search keywords, recording or synthesis approaches, mixing strategy, spatialization and distance behavior, variations, and validation methods.

#### Result from a Direct Request
The agent immediately produced a complete proposal, covering startup, ignition, flight, impact, and embers, along with library search terms, recording techniques, frequency allocation, and variation counts.

The answer looked comprehensive, but many details came from assumptions the model had added itself. Flight duration, flyby events, material-dependent responses, critical hits, charging, and the number of variations for each material category had never been confirmed.

These ideas were not necessarily unreasonable; the project simply might not need them. Each would still have to be reviewed, revised, or removed before the proposal could serve as a production brief.

#### Result with Grilling
Grilling first clarified the ability type, combat role, art direction, animation timing, implementation scope, and expected concurrency. Here are some representative questions:
```text
Q1: Is this a fireball projectile, a short-range flame jet, an instant burst, a sustained channeled ability, or a hybrid that supports charging?
Q2: Is it a low-cost basic attack, a primary damage ability, a crowd-control tool, or an opener that applies a burning status effect?
Q3: Should it lean toward realistic combustion, elemental fantasy, ancient arcane magic, industrial alchemy, or dangerous instability?
Q4: How much time does the animation allow between gathering fire in the palm and releasing the fireball? Is the windup almost instantaneous, or is there a perceptible 100–200 ms buildup?
Q5: Should the fireball itself communicate critical hits, kills, resistance, and immunity, or should those be handled by a separate combat-feedback system?
Q6: Should the proposal cover only sound production, or also Wwise/FMOD events, random containers, RTPCs, concurrency controls, and distance attenuation?
Q7: Should every enemy fireball carry a warning cue, or should that cue play only when the projectile actually threatens the local player?
Q8: In a large battle, how many player, allied, and enemy fireballs are expected to be on screen at once?
```

I answered each question based on the actual requirements, establishing the ability timing, combat role, sonic identity, system boundaries, and concurrency demands. The resulting proposal became much more specific:

| Phase | Layers | Function | Sound-library keywords |
| --- | --- | --- | --- |
| Input response and preparation | `Local_Input`, `Palm_Fire`, `Palm_Magic` | Respond immediately to input and establish the fire buildup | `tiny gas click`, `torch flare short`, `glass harmonic` |
| Release | `Release_Air`, `Release_Flame` | Convey the hand thrust, displaced air, and flame leaving the hand | `short air push`, `tight whoosh`, `flame burst short` |
| Flight | `Flight_Fire`, `Flight_Magic` | Carry the fireball's in-flight sound | `flame whoosh loop`, `fire pass by`, `crystal shimmer subtle` |
| Impact | `Impact_Pressure`, `Impact_Fracture`, `Impact_Magic` | Provide hit feedback | `small air thump`, `dry crack`, `glass ping bright` |
| Status and failure responses | `Burn_Status`, `Blocked`, `Dissipate` | Convey light burning, blocking or immunity, and in-flight dissipation | `ember sizzle`, `shield impact dry`, `flame extinguish` |
| Enemy threat cue | `Threat` | Play only when an enemy fireball threatens the local player | `dissonant glass sting`, `projectile close pass` |

The core sound conveys combustion, air movement, and heat-driven pressure, with brief glass resonances providing the magical identity. Flight and impact sounds play from their respective world positions, while the local player receives an additional, very short palm cue.

In multiplayer combat, the design sheds NPC burning and decorative layers first, then simplifies distant flight sounds. Player input feedback, basic impacts, and enemy threat cues are always retained.

#### Comparison
Both workflows can produce a complete proposal. The difference is that a direct request generates many unconfirmed design choices for a person to filter afterward. Grilling establishes the ability's role and production boundaries first, then uses them to organize layers, source material, and mixing.

In this example, the most useful outcome was deciding in advance which sounds needed to be made, what each sound was for, and which elements could be dropped first when concurrency became too high.

### Example 2: Synchronizing Spatialized Music Stems
This example was inspired by an *Infinity Nikki* technical article on the Audiokinetic Blog. Several puppet enemies move freely through a level, each associated with a vocal stem. Each stem is spatialized while remaining sample-accurately synchronized with the 2D stereo backing music.

I wanted to test whether the agent could reach the same Wwise API choice by asking about the requirements, without being told how to implement it.

This test used GPT-5.5, whose knowledge cutoff predates the blog post, and the agent was instructed not to search for the case-study blog post.

This is another technical design discussion that can be handled with `grill-me`.

#### Initial Prompt
> How can I use Wwise to synchronize multiple music stems played from separate point sources in a game?

#### Result from a Direct Request
The agent proposed the following:
- Put each music stem in a separate Music Segment, expose them through separate Events, and start them simultaneously on different Wwise Game Objects
- When a part should become inaudible, switch to a silent Segment on a Bar or Grid boundary

The answer continued to assume that each stem needed its own playback instance. It did not reconsider how the source assets and playback instances could be organized.

The approach has similarities to the music-synchronization technique described in the Audiokinetic Blog article about *She Diao* (射雕). However, the agent did not mention the relevant implementation requirements, such as matching streaming, virtualization, and seek-table settings. It was therefore not yet a complete, implementable solution.

#### Result with Grilling
Grilling first established the musical structure, spatial behavior, synchronization requirements, asset organization, and engine integration constraints. Representative questions included:
```text
Q1: Are these stems from the same piece of music, such as drums, bass, melody, and ambience? Or are they separate music loops attached to different scene objects that need to share a BPM, bar, and beat?
Q2: Can the actors' or enemies' 3D parts become difficult to hear because of distance, the listener turning away, or obstruction—even temporarily dropping out of the musical arrangement?
Q3: Can enemy instances be decoupled from the playback instances of their musical parts?
Q4: Does “perfect synchronization” mean sample-accurate synchronization, or is musically tight timing sufficient?
Q5: Can the 3D actor parts be exported as a multichannel carrier, with each enemy's part occupying one mono channel, instead of remaining separate Music Tracks in Wwise?
Q6: Are the 2D backing music and the enemy carrier part of one audio file, or are they two synchronized audio objects within the same Music Segment?
Q7: Can the engine treat the four enemy parts as belonging to one Wwise emitter Game Object, rather than four independent emitters?
Q8: Can the prototype include a small amount of engine-side code that calls the Wwise SDK's SetMultiplePositions / channel-emitter interface directly?
```

After answering the questions, the requirements were clear. The backing music would remain in 2D, while four puppet-enemy parts—the music stems—would follow their respective enemies. Enemies could leave and be replaced by new instances, but the musical timeline must not restart. The four parts had to remain sample-accurately synchronized with the backing music.

The resulting structure was:

```text
One Music Segment
├─ Backing track: stereo, kept in 2D
└─ Puppet-enemy track: parts combined into one multichannel asset
   ├─ Four parts occupy separate input channels
   └─ AkChannelEmitter assigns a separate spatial position to each part
```

The four parts come from one playback instance, with sample alignment maintained within the asset. The enemies provide positions; they no longer start or stop their musical parts individually.

To update the positions of the enemy parts, the design uses the `AkChannelEmitter` overload of `AK::SoundEngine::SetMultiplePositions`. Each `AkChannelEmitter` specifies an input-channel mask and a position, allowing the four parts' spatial positions to be updated independently.

When an enemy leaves, its channel continues playing. Its position is simply moved to a predefined offstage anchor outside the attenuation range.

#### Comparison
| Aspect | Direct request | Grilling |
| --- | --- | --- |
| Playback structure | Each stem uses a separate Music Segment; multiple Events must be posted in the same frame | One Music Segment contains the stereo backing music and the multichannel enemy asset |
| Synchronization | Sample-accurate synchronization across multiple Game Objects requires separate verification | The channels come from one playback instance and are inherently sample-aligned within the asset |
| Making parts audible or inaudible at runtime | All stems continue playing; silent Segments are selected on Bar or Grid boundaries | The music instance continues playing; enemies update only the positions of their respective channels |
| API selection | Explicitly rules out `SetMultiplePositions` | Selects the `AkChannelEmitter` overload of `SetMultiplePositions` |

The direct answer recognized the synchronization problem between independent playback instances, but continued designing within the original structure.

Grilling established that a different organization was acceptable: combine the parts into one multichannel asset, then assign separate spatial positions. This led the agent to the `AkChannelEmitter` overload and input-channel mapping, resolving the most important technical choice in this example.

### Example 3: Crowd Audio for an Open-World City
An open-world crowd system is a complex problem involving target platforms, performance, dialogue, localization, and world streaming.

This is a better fit for the `wayfinder` Skill. It organizes a large problem into a decision map, recording which questions have been resolved, which require research or further discussion, and how the decisions depend on one another. Each resolved question makes it possible to move on to the next.

Each decision ticket addresses one unresolved issue. Some require Grilling, while others need research or a prototype before a decision can be made.

#### Initial Prompt
> I want to build an open-world city using UE and Wwise, with large numbers of NPCs present at once. Up close, players should hear identifiable individuals; farther away, the sound should become natural crowd walla that conveys the size of the crowd. Voice counts and CPU usage must remain under control. Please propose a technical design suitable for production at scale.

#### Result from a Direct Request
The direct answer quickly proposed a layered design: individual voices nearby, crowd clusters at medium distance, and regional ambience beds farther away. It also recommended controlling cost through distance, Priority, Playback Limit, and Virtual Voice settings. This was a useful first architectural sketch.

However, the target platforms, peak NPC counts, dialogue-intelligibility priorities, and third-person listening reference had not been confirmed. Language packaging, event-driven changes in stadium and market areas, and performance validation still needed discussion. The answer offered a technical direction, but not enough detail for programmers, sound designers, and localization teams to begin their respective production work.

#### Result with Wayfinder
Wayfinder first clarified the platforms, NPC counts, listening goals, engine versions, number of languages, and listener setup. After researching the relevant mechanisms, it returned to production trade-offs. Representative questions included:
```text
Q1: What are the target platforms and minimum hardware specifications? How many NPCs are near the listener in typical and worst-case situations?
Q2: Which content must remain intelligible? Should distant crowds sound restrained and realistic, or noticeably large and expansive?
Q3: Which UE/Wwise versions are in use? Does the project use Mass, StateTree, and World Partition? Are budgets already defined for voices, CPU, memory, and streaming?
Q4: Is the game single-player or multiplayer? How many languages must it support? Is the primary listening reference the camera or the character?
Q5: Do nearby small-group conversations need animation synchronization and stateful interactions that can be interrupted and resumed?
Q6: Should all six voice-over languages ship with the base installation, or be delivered as optional language packs?
Q7: Should crowd audio have a strictly reserved budget, or a soft target with a hard cap, with protected content allowed to reclaim resources whenever necessary?
```

I answered according to the project's requirements. Wayfinder then created a decision map with six areas: listening goals and budgets, research into official engine and middleware behavior, Crowd Audio LOD, the content production pipeline, Xbox Series S validation, and the final design.

The proposed system can be summarized as follows: **a small number of identifiable individuals nearby; directional crowd clusters at medium distance; regional ambience beds that preserve a sense of scale farther away; and separate protection for quest and combat content.**

| Layer | What the player hears | Implementation |
| --- | --- | --- |
| Protected content | Quest, companion, and close-range combat audio remains clear | Separate signal paths and reserved capacity, outside the crowd cap |
| Nearby individuals | Recognizable speakers with clear directionality | UE selects a small number of NPCs and assigns pooled `AkGameObject` instances |
| Small-group conversations | Two or three people briefly discussing the same topic | Dialogue scheduling based on roles, turns, response relationships, and cooldowns |
| Mid-distance crowds | Crowd walla from several directions, conveying local density | A small number of aggregate emitters with representative positions set through `SetMultiplePositions` |
| Distant areas | A persistent sense of city scale, with distinct locations and events | Ambience beds and event layers for points of interest (POIs), such as business districts, markets, and stadiums |

UE handles NPC selection and ranking, crowd statistics, reusable emitter pools, and hysteresis to prevent rapid switching. Wwise handles content variation, spatialization, mixing, and the final voice limits.

The third-person setup uses a camera-based Listener and a character-based Distance Probe, providing the listening position and distance-attenuation reference respectively. Mass handles batch NPC selection; Wwise's playback limits, priorities, and virtual voices provide an additional layer of protection.

The content pipeline also has corresponding templates: regional configuration (`POI Profile`), small-group conversational VO (`Call/Response Scene`), featured performances (`Featured Performance`), cluster-based crowd walla (`Cluster Walla`), and optional language packs for six languages.

The Xbox Series S validation plan covers voice counts, CPU, memory, streaming, dialogue intelligibility, perceived crowd scale, and audible transitions. Figures such as 24/32 voices are starting budgets for the prototype, to be adjusted through measurement.

#### Comparison
| Aspect | Direct request | Wayfinder |
| --- | --- | --- |
| Requirements | The agent supplies its own platform, scale, and listening assumptions | Platforms, NPC counts, content priorities, listener setup, and production trade-offs are confirmed first |
| Runtime architecture | Generic layering of individuals, groups, and ambience beds | Explicit NPC selection, emitter reuse, camera/character listening responsibilities, and Wwise playback limits |
| Content production | Primarily describes runtime playback | Also develops templates for POIs, group conversations, featured performances, and six languages |
| Validation | Mainly recommendations for voices, CPU, and Profiler usage | Plans Series S performance and listening checks, teleportation, events, and extended repeat testing |
| Later revisions | Requires revisiting the full answer to identify affected areas | Related decisions, research, and validation plans can be found through the decision map |

Wayfinder took this discussion from an architectural sketch to production guidelines and a validation plan, while retaining the reasoning behind each choice.

## A Complete Workflow: From Questions to Implementation
The first three examples showed how questioning changes a proposal. The next example uses a footstep MVP—a minimal technical prototype—to demonstrate how several of Matt Pocock's Skills can be combined, from research and prototyping through specifications, task breakdown, and implementation.

This example was inspired by Brennan Anderson's article, [*Has AI Replaced Technical Sound Designers?*](https://www.asoundeffect.com/has-ai-replaced-technical-sound-designers/). He used a basic footstep-triggering requirement to test AI's technical sound design capabilities:
- With a large animation library to support, he wanted to avoid manually placing footstep markers and instead trigger sounds automatically from the distance between each foot and the ground
- The AI quickly produced a version that worked on flat ground, including logic requiring the foot to lift before another step could trigger; on slopes, however, sounds still triggered too early, and several rounds of compensation and parameter tuning remained unsatisfactory
- Brennan eventually worked through the problem with sketches and moved the probe approximately 6–12 inches behind the foot, producing a result he considered acceptable

Brennan's article does not mention using Matt Pocock's Skills. I wanted to take a similar problem and see whether this workflow could help me establish the trade-offs earlier and build validation into the development process, allowing the agent to keep progressing through implementation and automated checks.

### The Requirement: Trigger Footsteps at the Right Time
> Foot IK: foot inverse kinematics adjusts the leg and foot pose to the ground, helping the foot land on the intended surface.

My requirement was to trigger footsteps accurately on stairs and slopes from foot-to-ground contact, without adding Animation Notifies or using bone acceleration to determine footstep timing.

I added another constraint: the project's Foot IK was imperfect. A foot could clip into a stair riser before reaching the tread. Treating the first collision as a foot plant would cause footsteps to play too early, or even trigger repeatedly.

The question to resolve was therefore what kind of contact should qualify as a footstep.

### /grill-with-docs: Define the Problem
This calls for `grill-with-docs`. Unlike `grill-me`, it records the discussion in documents that subsequent stages can use.

Once invoked, the Skill asked about the collision-query method, acceptable failure modes, walkable surfaces, penetration, jumping, stationary actions, release distance, consecutive-frame confirmation, and initialization behavior.

After I answered the questions, the trigger rules were clear:
- Confirm that the foot has left the ground, then confirm a valid landing before playing a footstep
- Each foot's state machine only needs to track whether it is planted (`Planted`) or has lifted and is ready to register the next landing (`Armed`)

```text
Planted
→ Confirm Air over consecutive frames
→ Armed
→ Confirm Contact over consecutive frames
→ Trigger a footstep and return to Planted
```

Each frame's observation falls into one of four categories:
- `Contact`: the query hits a walkable surface, with a sole-to-surface gap of `0 ≤ gap ≤ 3 cm`
- `Air`: the query returns no hit, or the gap is `gap ≥ 7 cm`
- `Hold`: the gap is `3 cm < gap < 7 cm`; retain the current state
- `Invalid`: the trace starts in penetration, hits a non-walkable surface, or the sole is below the surface

The design established at this stage takes the left and right sole positions as inputs and casts a short line trace downward along world `-Z`, starting above each sole. On a hit, it uses `CharacterMovementComponent::IsWalkable(Hit)` to check whether the surface is walkable, then calculates the vertical gap between the sole and the hit point. The gap and penetration checks determine which of the four observations applies.

Each foot tracks its state independently. Consecutive `Air` observations transition it to `Armed`; subsequent consecutive `Contact` observations trigger one footstep and return it to `Planted`. Neither `Hold` nor `Invalid` emits a sound. Both preserve the state while breaking any incomplete consecutive-frame confirmation sequence.

The distance thresholds are starting values for the prototype. They need to be tuned to the project's characters, animations, and detection setup.

### /research: Check the Premise
`grill-with-docs` clarified the requirements for this approach, but its suitability for routine production use still needed investigation.

I used `research` to consult official documentation and public technical presentations on third-person games. Among the sources collected, the more common pipeline was:

```text
A Notify or Marker determines footstep timing
→ Trace downward from the corresponding foot
→ Query the Surface and Physical Material
→ Pass speed, footwear, and surface-material information to Wwise
```

Research also identified several common approaches:

| Approach | Typical uses and limitations |
| --- | --- |
| Manually placed Animation Notifies / Events | The most common approach for standard walking and running; provides explicit timing, but large animation libraries require substantial tagging and maintenance |
| Offline Notify / Marker generation from bone height or velocity | Suitable for batch processing mocap, retargeted animations, and Motion Matching data, while retaining the established animation-event pipeline at runtime |
| Runtime bone position, velocity, or acceleration | Can support procedural motion and systemic Foley, but is affected by IK, animation blending, LOD, sampling rate, and jitter; requires additional state management and filtering |
| Foot phase and Notify deduplication in Motion Matching | Frequent pose reselection can trigger adjacent footsteps more than once, so markers, foot-phase information, or a recency filter are still needed |
| Hit / Overlap callbacks from foot-mounted colliders | Better suited to ragdolls, body impacts, mechanical legs, and physically driven objects; standard walking and running are susceptible to mesh penetration, collision jitter, and animation culling |

This investigation positioned the proposed approach as a technical MVP with explicit constraints: determine what contact detection can achieve without Notifies or bone acceleration, and identify the conditions that cause false or missed triggers.

`grill-with-docs` established what needed to be tested. `research` provided a basis for comparing the approach with other production techniques.

### /prototype: Test the Idea at Minimal Cost
A state diagram alone makes it difficult to judge how the algorithm will behave, so a prototype is useful here.

I used `prototype` to build a browser-based prototype with HTML and Three.js. This made it easy to adjust parameters and inspect edge cases without setting up and compiling a UE project.

The prototype was intended to examine the footstep-triggering rules in isolation. Testing their interaction with actual character animation, collision, and `CharacterMovement` still requires a UE implementation.

Before building it, I added three switchable IK stress-test modes to produce repeatable foot conditions as inputs to the algorithm:

| Test mode | Simulated problem | Expected behavior |
| --- | --- | --- |
| Normal foot lift | The foot leaves the ground normally, then lands on the tread | Complete `Air → Contact` and trigger once per landing |
| Low lift / riser penetration | Insufficient foot clearance causes the foot to pass through a stair riser during the swing phase | A hit on the riser is `Invalid` and produces no sound; on reaching the tread, triggering follows the state-machine rules |
| Tread penetration | The sole briefly drops below the horizontal tread, then is corrected by IK | No sound while the sole is below the tread (`GroundGap < 0`); after valid `Contact` resumes, triggering depends on whether the foot previously entered `Armed` |

The video below demonstrates movement across flat ground, slopes, and stairs, switching among the three IK modes to test the prototype's behavior. A small ring appears on the ground whenever a footstep event triggers.
{{< video src="/videos/2026-09-09-ai-skills/footstep_prototype.mp4" caption="Browser prototype: footstep triggering under three simulated IK stress modes" >}}

### /to-spec: Write the Specification
The browser prototype helped me identify state rules worth testing further. I then used `to-spec` to turn the decisions into a requirements document defining what to implement next and how to validate it.

The specification first established the delivery scope: this stage would produce an interactive, audible technical MVP. Fixing Foot IK and building a production footstep system were out of scope.

It also defined two types of validation:
- Automated tests: some check observations and state transitions; others exercise walking, running, forward movement, and backward movement in the test scene, checking event timing and counts
- Human acceptance testing: traverse the full route in PIE (Play In Editor), checking the sound alongside the on-screen debug HUD, traces, and trigger rings

### /to-tickets: Break the Work into Tasks
I then used `to-tickets` to break the specification into task tickets:

| Task | Deliverable | Validation |
| --- | --- | --- |
| Build a repeatable test route | One continuous route containing flat ground, eight ascending steps, a landing, eight descending steps, and a slope | The character can traverse the entire route in both directions in PIE; stairs retain collision geometry for their individual treads |
| Add three IK stress-test modes | Switchable normal lift, low lift with riser penetration, and tread penetration | Modes change only the test inputs, not the footstep state machine, and do not interfere with character control |
| Integrate audible detection for both feet | Independent left/right state machines, debug sounds, HUD, traces, and trigger rings | Automated tests pass, followed by a listening check while walking and running on flat ground |
| Validate the complete route | A test matrix covering three modes, walking/running, and three playback-speed settings | Check stairs, slopes, backward movement, switching, and extended runs, followed by audible and visual acceptance testing |

The four tickets proceed in dependency order: establish the test scene, add repeatable failure inputs, integrate detection, then run the complete test matrix.

### /implement: Execute the Tasks
Finally, I used `implement` to work through the tickets in sequence. With the task context, design decisions, and validation methods established, the agent could carry out a long-running AFK (Away From Keyboard) task and complete the implementation automatically.

The agent used UE 5.8's MCP tools to operate the editor, build the test scene, write the C++ logic, and run automated tests, then asked me to listen and validate the result.

After the agent finished, I made a few rounds of small adjustments, mainly to scene proportions and mode switching. The core algorithm remained unchanged.

The video below shows the triggering behavior under three simulated IK stress-test modes. The timing broadly matches the design intent. This demo tests the rules and has fulfilled the intended purpose of a low-cost MVP.
{{< video src="/videos/2026-09-09-ai-skills/footstep_mvp_ue.mp4" caption="UE technical MVP: footstep triggering under three simulated IK stress modes" >}}

## Getting Started with Matt Pocock's Skills
### Installation
> The examples in this article use Matt Pocock Skills v1.2.3.

To install the Skills:
- The simplest option is to give your agent the repository link, [mattpocock/skills](https://github.com/mattpocock/skills), and ask it to install them
- If you are familiar with `npx skills`, run `npx skills@latest add mattpocock/skills` manually

During installation, select `Mattpocock Skills`. You do not need `Other`, which contains Matt's exploratory Skills.

### Choosing a Skill
The collection offers several Grilling-related Skills for different situations:
1. For a one-off design discussion or brainstorming session, use `grill-me`
2. If the discussion will feed into documentation, a prototype, or development work, use `grill-with-docs` to retain terminology and decisions
3. For a large effort with an unclear path and interdependent decisions, use `wayfinder` to progress through a decision map

If you do not want to remember the distinctions, simply use `ask-matt` and let it recommend an approach for the problem at hand.

### Other Useful Skills
Several other Skills are well suited to audio work:
- When the agent uses jargon you do not understand, use `wait-what` to ask for the missing background and a clearer explanation
- When you need information from programmers, designers, writers, a recording studio, or a localization team, use `to-questionnaire` to organize the outstanding questions. Review it before sending, though—do not let the agent overwhelm your colleagues with dozens of questions at once
- For sustained learning on a topic, use `teach`. It organizes references, lessons, and exercises around a learning goal and keeps the records needed to resume from where you left off

### When to Use Grilling
For a clearly defined question, such as looking up a parameter or explaining a piece of code, a direct request is usually enough.

Use Grilling when a design involves multiple trade-offs, mistakes would be expensive to correct, or you have not yet worked out exactly what you want.

## What This Means for Audio Work
### Beyond Programming
The sound design example explored how to break down a creative brief, while the technical audio examples covered technical evaluation and system development. The same Skills can also support other audio disciplines.

Whether a composer is asked to make combat music more intense, a sound designer is asked to give a weapon more impact, or a recording team needs to clarify character delivery and pickup criteria, an agent can help identify the conditions behind those judgments.

### Keeping Tasks Moving Automatically
With a complete specification and task tickets, an agent can select work in sequence, execute it, check the results, and move on to the next task. This continuing cycle is what is referred to here as Loop Engineering.

For example, you could establish the direction during the day, have the agent research and explore several approaches in parallel overnight, then listen to and review the results the next day.

To make this kind of overnight workflow practical, defining requirements and execution order through an engineering framework such as Matt Pocock's is only part of the preparation. It is even more important to configure the external tools in advance, through Skills or MCP, so that the agent can check its own work during long-running tasks instead of repeatedly figuring out how to test things or asking for human confirmation.

### What People Still Need to Do
Agents can research, compare technical approaches, and implement solutions quickly. People still need to define the requirements, make trade-offs, and assess the result in terms of narrative function, listening experience, and aesthetics: does it convey the intended meaning, and does it belong in the game?

Grilling is not a cure-all. It can help clarify vague requirements, but an overly broad goal or insufficient background information can still lead the questions away from the actual needs of the project.

**What we can expect is that implementation costs will continue to fall, while decision-making and design skills become increasingly important. The ability to articulate a problem, make trade-offs, and evaluate the result determines the quality of what an AI user ultimately produces.**

## Conclusion
These examples illustrate how I use Matt Pocock's Skills:
- Use Grilling to surface the conditions that affect a design and establish goals and trade-offs early
- Use `research` to check assumptions and `prototype` to turn key rules into behavior that can be observed directly
- Use `to-spec` and `to-tickets` to preserve decisions and break down the work, then use `implement` to carry it forward

For me, the greatest value of these Skills is that they surface conditions during design that I would otherwise discover only during rework, giving subsequent decisions a stronger foundation.

As foundation models become more capable, I am increasingly drawn to Skills like Matt Pocock's: concise workflows that help people think through the problem first, then put the model's capabilities to work.

I hope this workflow helps you clarify what you need and get better results from AI.
