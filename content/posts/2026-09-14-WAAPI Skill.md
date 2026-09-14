---
title: "WAAPI is for Everyone | Part 4 waapi-skill"
date: 2026-09-14T00:00:00+08:00
tags:
  - "Audio Programming"
  - "Wwise"
  - "AI"
---
Hi, I'm Thomas.

It has been six years since the previous article in this series. Back then, using WAAPI to improve a Wwise workflow meant looking up documentation, writing code, and testing it repeatedly. Today, AI can help with all of that.

But asking AI to write WAAPI scripts directly often leads to repeated trial and error with API parameters and version differences. Even the same kind of task does not reliably produce working code every time.

To reduce that repeated trial and error, I developed `waapi-skill`. It wraps WAAPI's version differences and calling conventions so an agent can query and modify a project from natural-language requests, then check the results.

This article covers its capabilities, installation, and practical examples, along with the testing and thinking behind its development.

## What Is waapi-skill?
`waapi-skill` is a free, open-source Agent Skill that lets an agent read and modify Wwise projects and subscribe to events within them.

It supports both Windows and macOS and five Wwise versions, from 2021.1 through 2025.1, covering the versions used by most games currently in live operation. All WAAPI interfaces in 2021.1–2023.1 are wrapped, with approximately 88% coverage for 2024.1 and 2025.1.

Project: [https://github.com/zcyh147/waapi-skill](https://github.com/zcyh147/waapi-skill)

It provides the following support when an agent works with Wwise:
- **Version compatibility**: Version-specific API wrappers reduce the agent's trial and error
- **On-demand loading**: Only the information needed for the task is loaded, reducing context usage
- **Change previews**: Target objects and proposed changes are shown before execution so you can check them against your expectations
- **Result verification**: For operations that support readback, the project is queried again after the change to verify the result

## What the Skill Can Do
### Reading a Project
The Skill wraps project queries covering:
- The current Wwise version, connection endpoint, and project path
- Currently selected objects, buses, and default Work Units
- Object searches by exact path, GUID, name, type, and hierarchy relationships
- Object properties, references, AudioSource, OutputBus, and other associated information
- Profiler data for Game Objects and Voice Contributions, along with selected Debug data

### Modifying a Project
It also wraps project modification operations, including:
- Creating, deleting, and renaming Wwise objects
- Editing properties, references, platform linking, and RTPCs
- Importing audio files and creating hierarchies and Events
- Configuring Switch Container assignments
- Managing SoundBank inclusions, generating SoundBanks, and related conversion tasks
- Selected plug-in and Authoring UI command operations, and even Lua and Debug operations

By default, changes are previewed and require confirmation before execution. You can also switch to read-only mode or allow requested changes without a separate confirmation. See "Installation and Configuration" below for details.

### Subscribing to Events
The Skill also wraps WAAPI subscriptions for events such as object creation, changes to the selected objects, and SoundBank generation. When an event occurs, the agent can carry out a task you have specified. You can ask the agent which events are available to subscribe to.

Two listening modes are supported:
- Timed listening: A standard subscription waits for 10 seconds by default, then unsubscribes automatically
- Long-running listening: For continuous monitoring, a long-running mode keeps the subscription active while the connection remains open

### API Coverage and Limits
The Skill cannot provide capabilities that WAAPI does not expose, so requests beyond WAAPI's capabilities are explicitly rejected.

The table below shows the interfaces wrapped by the Skill. The unwrapped interfaces in 2024.1 and 2025.1 mainly concern custom layout development and certain UI-side Lua scripting entry points, which have limited relevance to everyday users.

| Wwise Version | Total WAAPI Interfaces | Wrapped | Unwrapped |
| --- | ---: | ---: | ---: |
| 2021.1 | 126 | 126 | 0 |
| 2022.1 | 144 | 144 | 0 |
| 2023.1 | 181 | 181 | 0 |
| 2024.1 | 204 | 179 | 25 |
| 2025.1 | 214 | 187 | 27 |

## Installation and Configuration
### Installation
To install `waapi-skill`:
- The easiest option is to send `https://github.com/zcyh147/waapi-skill` to your agent and ask it to install the Skill
- If you are familiar with `npx skills`, run `npx skills add zcyh147/waapi-skill --skill waapi-skill` yourself. Add `--global` for a global installation

Python requirement: The Skill uses its own isolated Python virtual environment. Python `3.11` through `3.13` must be installed on your system.

### First Run
Open the target project in Wwise and enable WAAPI:
- Go to `Project > User Preferences` and check `Enable Wwise Authoring API` in the `Wwise Authoring API (WAAPI)` section
- Check the `WAMP port`. Local WAMP connections use port 8080 by default; if you change it, the Skill must use the same port

On first use, the Skill automatically sets up its dedicated Python virtual environment. When loaded in a new conversation, the agent reports the configured WAAPI port, Wwise compatibility version, and project modification policy. You can request a different connection address or port in natural language.

The Skill supports three project modification policies. The default is `ask_before_changes`, and you can switch as needed:
- `read_only`: Read-only mode. The agent can query the project and discuss proposed changes, but cannot modify it
- `ask_before_changes`: Confirmation mode. The agent previews which objects will be affected and what will change, then waits for your confirmation before executing
- `allow_changes`: Allowed-changes mode. For changes you have explicitly requested, the agent still generates and reports a preview, but can proceed with execution and verification without another confirmation message

Here is an example of loading the Skill, changing its configuration, and checking the connection to the current Wwise project:

```text
User:
/waapi-skill

Agent:
waapi-skill is loaded. The configured WAAPI port is 8080, and the Wwise compatibility version is 2021.1.
The current project modification policy is ask_before_changes. Available modes are read_only, ask_before_changes, and allow_changes.
What would you like to query or modify in Wwise?
```

```text
User:
Set the Wwise compatibility version to 2024.

Agent:
The Wwise compatibility version is now 2024.1. All other settings are unchanged.
```

```text
User:
Please check the running Wwise version and project name to confirm that the connection is working.

Agent:
The connection is working.
- Running version: Wwise 2024.1.13, Build 9056
- Current project: SampleProject
- Project path: D:\Sample_Project\SampleProject.wproj
- Project status: Saved, with no pending changes
The running version matches the configured 2024.1 compatibility version.
```

## Practical Examples
The following four examples show how the Skill handles different tasks: Snow demonstrates a targeted update to an existing footstep system, Weather shows a complex request executed in stages, Alarm covers diagnosis and repair, and Subscribe demonstrates event monitoring.

These examples were tested in Codex with GPT-5.6 Sol at High reasoning effort, using a Wwise 2024.1 project.

### Snow: Adding Snow Footsteps to an Existing System
The project contains a `Player_Footsteps` Switch Container that plays footsteps according to surface material. The task is to add four snow samples, create a Random Container and assign it to the `Snow` Switch, then remove the old `Mud` Switch assignment from the Switch Container.

This example uses `allow_changes`. Once the changes are explicitly requested, the agent generates a preview and proceeds with execution.

```text
User:
Use Wwise 2024.1 and keep allow_changes mode enabled.

I have a set of snow footstep sounds in Assets/Snow. Under \Actor-Mixer Hierarchy\Default Work Unit\WAAPI Skill Integration V2\PlayerFootstepsMaintenance\Player_Footsteps, create a Snow Random Container. Import the four files in order as Snow_Step_01 through Snow_Step_04, then assign Snow to the Snow Switch in \Switches\Default Work Unit\WAAPI_V2_Surface.

Then remove the Mud container's current Surface/Mud assignment.

Agent:
The Wwise 2024.1 project changes are complete:

- Created a Snow Random Container under Player_Footsteps.
- Imported and named the files Snow_Step_01 through Snow_Step_04 in order.
- The import request included the Snow → WAAPI_V2_Surface/Snow assignment. Object and media readback checks all passed, but this native import interface only supports verification of the resulting structure.
- Removed the Mud container's WAAPI_V2_Surface/Mud assignment and verified the resulting assignment state through readback.
- Neither the Mud container nor the Mud Switch was deleted.
```

The screenshot shows the snow assets added to the footstep system and assigned to the Switch. The Mud assignment has been removed, while Metal and Wood remain unchanged.

![Snow footstep assets and Switch assignments](/images/2026-09-14-waapi-skill/snow-switch-assignments.png)

### Weather: Building a Weather System from Five Audio Files
This example builds a simple weather system from five rain, wind, and thunder samples. The request specifies the hierarchy, volume, looping, playback limits, Events, Action parameters, and an RTPC curve.

This example uses `ask_before_changes`, so each batch of changes requires confirmation before execution.

**Describe the Task and Review the Overall Preview**

```text
User:
Help me create a weather system in Wwise. Assets/Weather contains five rain, wind, and thunder audio files. Create a Weather_Interactive Actor-Mixer under \Actor-Mixer Hierarchy\Default Work Unit\IntegrationLab. Inside it, create Rain and Wind Actor-Mixers and a Thunder Random Container. Import the five files as Sound SFX objects into the corresponding containers, then create a Play Event for each sound under \Events\Default Work Unit\Integration_Weather.

Set all sounds to loop indefinitely, override the parent playback limits, and route them to \Master-Mixer Hierarchy\Default Work Unit\Master Audio Bus\Weather_Bus. Set Rain_Bed and Wind_Bed to -4 dB and -6 dB respectively, with a maximum of 2 playback instances each. Set the three thunder sounds to -2 dB, -8 dB, and -14 dB respectively, with a maximum of 1 instance each.

Set Fade Time / Delay for the five Play Actions as follows: Rain 0.25 / 0 seconds, Wind 0.4 / 0.1 seconds, Thunder Near 0.05 / 0 seconds, Mid 0.12 / 0.08 seconds, and Far 0.25 / 0.16 seconds.

Finally, bind \Game Parameters\Ambience\Rain_Intensity to Rain_Bed's Volume using curve points (0,-48), (50,-12), and (100,0).

Agent:
The executable preview for the first stage is ready. The Wwise project has not been modified. This stage will:

- Create Weather_Interactive and the Rain, Wind, and Thunder containers.
- Import five Sound SFX objects and configure infinite looping, playback limits, volume, and Weather_Bus routing.
- Create the five Events: Play_Rain_Bed, Play_Wind_Bed, and Play_Thunder_Near/Mid/Far.

After you confirm this stage and it has been executed and verified, I will prepare the subsequent previews for the Play Action Fade/Delay settings and the Rain_Intensity → Rain_Bed Volume RTPC curve.

Do you confirm execution of the first stage?
```

The agent splits the request into three batches: build the hierarchy, import the assets, and create Events; configure the Play Action Fade/Delay values; then bind the RTPC. It executes the first batch after confirmation before presenting the next preview.

**Confirm Hierarchy Creation, Audio Import, and Event Creation**

```text
User:
Looks good. Go ahead.

Agent:
The first stage has been executed and verified successfully.

The second-stage preview is ready. The following Play Action parameters have not yet been written:

- Rain: Fade 0.25 seconds, Delay 0 seconds
- Wind: Fade 0.4 seconds, Delay 0.1 seconds
- Thunder Near: Fade 0.05 seconds, Delay 0 seconds
- Thunder Mid: Fade 0.12 seconds, Delay 0.08 seconds
- Thunder Far: Fade 0.25 seconds, Delay 0.16 seconds

After you confirm this stage, I will prepare the Rain_Intensity → Rain_Bed Volume curve preview. Shall I proceed?
```

**Confirm the Play Action Parameters**

```text
User:
Looks good. Go ahead.

Agent:
The Play Action parameters have been applied and verified successfully.

The final RTPC preview is ready. The following changes have not yet been written:

- Control parameter: Rain_Intensity
- Target: Rain_Bed → Volume
- Curve points: (0,-48), (50,-12), (100,0)
- Interpolation between points: Linear
- Update the same RTPC if it exists; otherwise, create it

Do you confirm execution and final verification?
```

**Confirm the RTPC Curve and Complete the Weather System**

```text
User:
Looks good. Go ahead.

Agent:
The weather system is complete in the current Wwise 2024.1 project, and all readback checks passed:

- Created the Weather_Interactive / Rain / Wind / Thunder hierarchy.
- Imported five Sound SFX objects.
- Configured looping, volume, playback limits, and Weather_Bus routing.
- Created and configured five Play Events and their Fade/Delay values.
- Set up the Rain_Intensity → Rain_Bed Volume RTPC with a three-point Linear curve: (0,-48), (50,-12), (100,0).
```

The screenshot shows the Rain, Wind, and Thunder hierarchy and the volume settings for the five sounds.

![Weather hierarchy and volume settings](/images/2026-09-14-waapi-skill/weather-hierarchy.png)

### Alarm: Finding Out Why an Alarm Makes No Sound
This example diagnoses a silent Event, `Play_Generator_Alarm`. The initial request describes only the symptom and leaves the agent to investigate the cause.

It uses `allow_changes`: diagnose first, then change the output bus when explicitly requested.

**Diagnose the Cause**

```text
User:
Please investigate why \Events\Default Work Unit\IntegrationLab\Alarm\Play_Generator_Alarm makes no sound in Wwise.

Agent:
The cause has been identified: Generator_Alarm has an output override enabled and is routed to:
\Master-Mixer Hierarchy\Default Work Unit\Master Audio Bus\Diagnostic_Dead_Bus

That bus is set to -96 dB, effectively muting it, so nothing is audible when the Event plays.
The Event, Play Action, target Sound, and generator_alarm.wav audio source all exist and are linked correctly. This was a diagnostic pass only; no changes were made to the Wwise project. The allow_changes setting has been saved.
```

**Fix the Output Bus**

```text
User:
Okay, change its bus to SFX_Machinery, the bus for machinery sound effects.

Agent:
The change has been applied and verified successfully:
Generator_Alarm's Output Bus has been changed from Diagnostic_Dead_Bus to SFX_Machinery.

The Wwise project has unsaved changes. Remember to save it.
```

### Subscribe: Monitoring Selection Changes
This is a simple demonstration: monitor changes to the selected objects, report each object's name and type, and stop after 10 changes.

After monitoring started, I changed the selection in Wwise. The agent reported results as events arrived and provided this final summary:

```text
User:
Monitor 10 changes to the selected objects in the Wwise project. Each time the selection changes, stream the names and types of the currently selected objects.

Agent:
Monitoring of 10 selection changes is complete:

1. Ex 1 - Ambisonic City 3D Ambiance — Sound
2. Ex 2 - Helico PassBy Overhead — Sound
3. Car Engine — WorkUnit
4. Porsche 911 - Blend Container — BlendContainer
5. Camaro SS - CrankcaseAudio REV — Sound
6. Dialogues — WorkUnit
7. Captain_A — ActorMixer
8. Captain_B — ActorMixer
9. UNB-OB-CP — RandomSequenceContainer
10. UNB-OB-OS — RandomSequenceContainer

The target count has been reached, and the subscription has been cancelled successfully.
```

This demonstration only records selection changes. In practice, subscriptions could also help check manual edits. For example, while organizing a project, you could ask the agent to monitor changes to object references within a specified scope.

If you change bus settings in the Wwise UI, the Skill could use those changes to check the new bus and its playback signal path, flagging muted buses or unexpected routing. That would let you receive feedback while organizing the project, without returning to the conversation after every edit.

## Best Practices
### Be Specific About the Task
When using the Skill, be as specific as you can:
- **Which objects to work on**: Provide full paths, asset directories, or a clear object scope rather than just "change those footsteps"
- **What the result should be**: Describe the hierarchy, naming, parameters, and mappings. Give target values for volume changes, or specify the destination and object types for an import
- **What must be preserved**: For example, remove only the Mud assignment while keeping the container and other material settings, so a small update does not become a full rebuild
- **Whether to investigate or modify**: For troubleshooting, start with a read-only diagnosis and request a fix once the cause is clear. For changes with several steps, review the previews and confirm them in stages

You do not need every detail for every request, but it helps to provide the relevant conditions together.

### Try It on a Small Set First
For a new batch task, start with a few representative objects. Let the agent complete one pass, then check the naming, hierarchy, parameters, and references before expanding the scope.

For a dialogue import, for example, try a few files covering different languages and characters, and check the resulting folders, objects, and Events. If the changes affect playback, audition the results first to confirm that they sound as intended.

### Package Repeated Work into Reusable Tools
Natural language works well for one-off queries and tasks whose requirements are still changing. But repeatedly describing a complex task can turn into "programming in prose." Restating the rules and waiting for the agent to break down the work also takes time.

**For recurring work, start with a workflow-specific Skill.** `waapi-skill` primarily wraps API-level capabilities. It knows how to query and modify Wwise objects, but it does not know your production rules. I suggest packaging recurring requirements into Skills such as:
- **Dialogue import Skill**: Define file naming, language and character folders, object and Event creation rules, and post-import checks
- **Footstep iteration Skill**: Define how assets map to surface materials, which objects to replace or preserve, and what to check after each update

The workflow-specific Skill records the production rules, while `waapi-skill` performs the individual operations. Each time you use it, you only need to provide the assets, objects, or parameters that have changed, reducing the amount of background you have to repeat.

**Once the workflow is stable, consider turning it into a script or app.** The version references, parameter constraints, and operation workflows in `waapi-skill` can also guide that development. A fixed tool means the model does not need to work out the execution steps again on every run. Generated tools still need to be checked against real tasks.

## How It Has Been Tested
To verify both the correctness of `waapi-skill`'s operations and an agent's ability to use it for real work, I designed three types of automated tests:
- **Core functionality tests**: Check version compatibility, parameter validation, change previews, error handling, and other program rules without starting Wwise. Then run operations against real Wwise test projects and query objects, properties, references, and output files to verify the results
- **Agent single-task tests**: Give a fresh agent with memory disabled a specific natural-language request, check whether it selects and uses the relevant capabilities correctly, and verify the result with a test program
- **Agent end-to-end workflow tests**: A test agent uses predefined tasks and prompts to conduct a multi-turn conversation with a fresh agent under test, with memory disabled. The agent under test uses the Skill to complete complex operations spanning multiple APIs. The test agent organizes the conversation, runs tests, and checks the execution process and final project against the requirements

I place the most weight on the third category because it closely resembles how users work with a Skill: describe a task, then complete it through a conversation. Acceptance checks also cover the full request. When adding snow assets to a footstep system, for example, that means verifying both the import and Switch assignments, as well as checking that the other surface materials retain their original settings.

`waapi-skill` has passed the full test suite on both Windows and macOS. During development and testing, Codex ran `waapi-skill` nearly 12,000 times in total.

![Codex usage statistics for waapi-skill](/images/2026-09-14-waapi-skill/codex-skill-runs.png)

## Why Build It as a Skill?
I chose a Skill rather than MCP because I liked the way Skills load reference material into context on demand, and wanted to see whether this format could support the tool I had in mind.

There are already community Wwise MCP projects, but they generally do not support older Wwise versions. For example, BilkentAudio/Wwise-MCP ([https://github.com/BilkentAudio/Wwise-MCP](https://github.com/BilkentAudio/Wwise-MCP)) and dcc-mcp-wwise ([https://github.com/dcc-mcp/dcc-mcp-wwise](https://github.com/dcc-mcp/dcc-mcp-wwise)) only support Wwise 2024.1+, while mcp_wwise ([https://github.com/john-tennant-sjs/mcp_wwise](https://github.com/john-tennant-sjs/mcp_wwise)) only supports 2023.1.17 and 2025.1.3. I wanted to include projects still using Wwise 2021.1 and 2022.1, so I built broader version coverage.

While I was writing this article, Wwise also introduced official MCP support. If your project moves to Wwise 2026, the official MCP is worth considering first. Official documentation: [https://www.audiokinetic.com/en/public-library/2026.1.3_9276/?source=Help&id=wwise_mcp](https://www.audiokinetic.com/en/public-library/2026.1.3_9276/?source=Help&id=wwise_mcp)

## Conclusion
**Returning to this series six years later, my focus has changed. Back then, I wanted to help people understand WAAPI and learn to write scripts. Now, I am more interested in whether describing a task is enough for an agent to carry it out automatically and reliably.**

For users, what matters most is whether the agent achieves the goal. Which interface it called or how parameters differ between versions are implementation details. `waapi-skill` aims to wrap those details into a capability an agent can use.

If you run into any problems, please open an issue on GitHub ([https://github.com/zcyh147/waapi-skill/issues](https://github.com/zcyh147/waapi-skill/issues)). For errors, include your Wwise version, the task you requested, and the error message to help me investigate.

I hope it helps you spend less time on repetitive operations and more time refining the sound.
