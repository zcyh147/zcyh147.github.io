---
title: "ReWwire: Stream Wwise Audio to Your DAW in Sync"
date: 2026-10-19T00:00:00+08:00
slug: "2026-10-19-rewwire-wwise-to-daw"
tags:
  - "Game Audio"
  - "Wwise"
---

Hi, I'm Thomas.

Recording music, sound effects, and dialogue as separate stems for playback is a common need in game audio development. Wwise's Recorder can do this, but recording ends when playback stops. Keeping it running requires an additional Wwise Silence source, and the recorded files still need to be imported into a DAW manually. The process can be cumbersome.

Wwise's Mixing Desk also provides plenty of mixing tools, but its metering is relatively basic.

To address these needs, I developed ReWwire, a free, open-source plugin that streams multiple Wwise buses to a DAW in sync. It can be used for stem recording or real-time mix analysis with familiar metering and analysis plugins.

This article covers what it does, how to install and configure it, and how to use it with REAPER for multitrack recording and mix analysis.

## What Is ReWwire?

### Features

ReWwire is a Wwise-to-DAW audio bridge for Windows. Its name combines **Re**-**W**wise-**Wire**, inspired by ReWire, the earlier protocol for streaming audio between applications.

It consists of a Sender effect plugin in Wwise and a VST3 Receiver plugin in the DAW, with support for five Wwise release series: 2021.1 through 2025.1.

Insert a Sender on each Wwise bus you want to record, add a Receiver to its corresponding DAW track, and assign matching IDs. The bus audio is then routed to that track.

Supported speaker layouts include Mono, Stereo, LCR (3.0), Quad (4.0), 2.1, 5.1, 7.1, 5.1.2, and 7.1.4, along with first- through third-order Ambisonics. Each stream supports up to 16 channels.

Requirements and limitations:

- **Operating system:** Windows x64 only. Wwise and the DAW must run on the same computer.
- **Sample rate and channel layout:** Both applications must use the same sample rate. The receiving track and downstream effects must accommodate the incoming layout. ReWwire does not mix, resample, upmix, downmix, or decode Ambisonics.

### Demo

The following Wwise Adventure Game (WAG) demo shows simultaneous recording of the Music, Ambient, Player, Enemies, Voice, and UI buses, followed by playback.

{{< video src="/videos/2026-10-19-rewwire/wag-demo.mp4" caption="Wwise Adventure Game: recording Wwise buses into REAPER and playing back the stems" >}}

## Getting Started

### Download

Download the latest packages from [GitHub Releases](https://github.com/zcyh147/ReWwire/releases/latest).

The release includes one shared `ReWwire_Receiver` package and separate `ReWwire_Sender` packages for five Wwise versions: `2021.1.14.8108`, `2022.1.19.8584`, `2023.1.19.8928`, `2024.1.13.9056`, and `2025.1.7.9143`.

Wwise's public plugin interfaces provide compatibility within the same `YEAR.MAJOR` series, such as `2024.1.x`. If you use a different minor version in the same series, I recommend making a short test recording first.

### Installation and Integration

#### DAW

Extract the Receiver package, copy `ReWwire_Receiver.vst3` to a standard Windows VST3 directory, such as `C:\Program Files\Common Files\VST3`, and restart the DAW to load the plugin.

#### Wwise Authoring

Use the Audiokinetic Launcher to import the Sender package for your Wwise version:

1. Open the **Plug-ins** page and select the target version under **Wwise Version**.

   ![Select the Wwise version in Audiokinetic Launcher](/images/2026-10-19-rewwire/launcher-plugins.png)

2. Open the dropdown next to **Add from directory**, select **Add from archive**, and import the package. Select ReWwire Sender, then click **Modify** to install it.

   ![Install ReWwire Sender through Audiokinetic Launcher](/images/2026-10-19-rewwire/launcher-install.png)

3. Reopen the Wwise project. **ReWwire Sender** should now appear in the effects list.

   ![ReWwire Sender in the Wwise effects menu](/images/2026-10-19-rewwire/sender-menu.png)

Alternatively, follow the package instructions to install it manually: copy the Authoring DLL and XML file into `Authoring/x64/Release/bin/Plugins` under the appropriate Wwise installation.

#### Game Engines

To record in-game audio, the Sender must also be integrated into the game. I recommend dynamic loading, which avoids adding static-library links and plugin registration code. The Unity and UE instructions below use this approach.

For static integration, see the [ReWwire Runtime integration guide](https://github.com/zcyh147/ReWwire/blob/main/docs/release-packages.md#runtime-integration).

**Unity**

- Find the project on the Audiokinetic Launcher's **Unity** page and select **Modify Wwise in Project...** to update the plugin files.
- For manual installation, place the Runtime version of `ReWwire_Sender.dll` in the integration's DSP directory. For an Assets-based Wwise Integration, the path is:

```text
<UnityProjectRoot>/Assets/Wwise/API/Runtime/Plugins/Windows/x86_64/DSP/
```

- The DLL's `Profile` or `Release` configuration must match the Wwise runtime used by the project.
- After adding the Sender in Wwise, regenerate the Windows SoundBanks.
- Confirm that the packaged game includes the Runtime DLL and updated SoundBanks, then run the game and make a test recording in REAPER.

**Unreal Engine**

- Find the project on the Audiokinetic Launcher's **Unreal Engine** page and select **Modify Wwise in Project...** to update the plugin files.
- Confirm that the Runtime DLL is in the Wwise Integration's `bin` directory for the appropriate platform and configuration. For example, Wwise 2024.1 uses this structure:

```text
<UnrealProjectRoot>/Plugins/WwiseSoundEngine/ThirdParty/<Platform>/<Configuration>/bin/ReWwire_Sender.dll
```

- After adding the Sender in Wwise, regenerate the Windows SoundBanks.
- Confirm that the packaged game includes the Runtime DLL and updated SoundBanks, then run the game and make a test recording in REAPER.

### Plugin Configuration

The Sender's Channel ID and the Receiver's Bus ID must match. To record music, sound effects, and dialogue on three separate tracks, configure them as follows:

| Wwise bus | Sender Channel ID | DAW track | Receiver Bus ID |
| --- | --- | --- | --- |
| Music | 1 | Music | 1 |
| SFX | 2 | SFX | 2 |
| Dialogue | 3 | Dialogue | 3 |

#### Assigning IDs

Insert **ReWwire Sender** on each of the three Wwise buses. In REAPER, create three tracks and insert **ReWwire Receiver** on each.

- In the Sender's **Effect** group, set **Channel ID (Static)**.

  ![Sender Channel ID in Wwise](/images/2026-10-19-rewwire/sender-id.png)

- Set **Bus ID** in the corresponding Receiver to the same value.

  ![Receiver Bus ID in REAPER](/images/2026-10-19-rewwire/receiver-id.png)

#### Configuring Track Channels

**The plugin IDs and track channel configurations serve different purposes.** The ID selects which bus to receive; the channel configuration determines how the track accommodates that audio.

The Receiver can display and output up to 16 channels at once. For common multichannel layouts such as 5.1 and 7.1, set the receiving REAPER track's **Track channels** to the corresponding channel count.

REAPER tracks use even channel counts, so ReWwire pads certain supported odd-channel layouts to an even number of channel slots:

- **Mono / Center, LFE:** 1 channel carried in 2 slots
- **2.1, 3.0 (LCR):** 3 channels carried in 4 slots; LCR retains its layout and does not become Quad
- **Second-order Ambisonics (2OA):** 9 channels carried in 10 slots
- **Auro 10.1:** 11 channels carried in 12 slots

The additional final slot is silent padding (`PAD`) and has no speaker assignment.

#### Choosing a Bridge Mode

ReWwire Receiver provides two options under **Bridge Mode**:

- **Stable recording:** For stem recording. Internal buffering maintains continuity across tracks, at the cost of some transport latency.
- **Synchronized monitor:** For low-latency listening and metering. Currently supported only in REAPER. When data is unavailable, it may skip missing content to remain synchronized to the shared reference.

You can select a new mode during playback, but it only takes effect after REAPER's playback and recording have stopped. **Pause** does not count as **Stop**. Wwise can keep playing; there may be a brief silence while the mode change is prepared.

### Recording

In REAPER:

1. Confirm that the Receiver is in **Stable recording** mode and set **Track channels** as described above.
2. Click **Record Arm** on each receiving track. Right-click that button and choose the appropriate option under **Record: output**: **Record: output (stereo)** for stereo, or **Record: output (multichannel)** for multichannel recording.
3. Click **Record** in REAPER, then trigger sounds in Wwise or the game. You can also start playback in Wwise or the game first, then start recording.
4. Click **Stop** when finished and keep the recorded files. You can then play back the individual stems.

## Use Cases

### Recording Wwise Bus Stems

Capture music, sound effects, and dialogue separately from the same play session for solo playback, review, and mix comparisons.

### Using REAPER for Multitrack Metering and Analysis

With **Synchronized monitor**, REAPER can serve as an external metering setup for Wwise.

Insert your usual loudness meters, spectrum analyzers, phase meters, or dynamics analysis FX Chain after the Receiver on each track. You can then play audio and adjust the mix in Wwise while comparing spectrum, loudness, and other measurements across tracks in REAPER.

### Tip: Let an Agent Configure Both Projects

Assigning Bus IDs, inserting plugins, configuring channel mappings, and setting recording modes are repetitive tasks that an agent can help with. Give it the project paths and the buses you want to record, and it can inspect the existing setup, create or reuse matching tracks, and save the REAPER project.

The WAG setup combined project-file edits, verification through WAAPI queries, and configuration and saving through REAPER's ReaScript. Generating an RPP file is only part of the work: the project still needs to be opened to confirm that the plugins load, parameters and channel mappings are correct, and a short recording works.

Here is a prompt you can adapt to your project. Replace the FX Chain placeholder with an existing chain, or remove that instruction if you do not need it:

```text
Please use ReWwire to record the Music, SFX, and Voice buses from this Wwise project onto separate tracks in REAPER.
Wwise Project: [path]; Wwise Version: [version]; REAPER Project: [existing project path or new project location].

In Wwise, add or reuse a Sender on each of these three buses and assign a different Channel ID (Static) to each. In REAPER, create or reuse tracks with matching names, load a Receiver on each, and set its Bus ID to match the corresponding Sender. Preserve the existing project content and do not add duplicate plugins.
Set Track channels and the Receiver's pin mapping to accommodate each bus's actual Channel Layout. Use a matching Sample Rate, select Stable recording, choose the Record: output option for the required channel count, and enable Record Arm.
Load my existing [FX Chain name] after the Receiver for metering. If a bus, plugin, or FX Chain cannot be found, ask me before proceeding.

Save the RPP when finished, check that both sides are configured consistently, and tell me which project to open and how to start recording. I will trigger sounds in the game for a test recording.
```

## Reference

### How Audio Is Transferred

ReWwire uses local shared memory as a cross-process audio buffer. The Sender in Wwise writes audio samples and channel-layout information in blocks. Each Receiver in the DAW reads the stream for its assigned ID, and the Receivers coordinate their read positions to preserve relative timing across tracks.

The Receiver's status bar also shows:

- **Wwise / DAW samples:** The current audio block sizes on the Wwise Sender and DAW Receiver sides, respectively.
- **Bridge:** The observed software transport time from Sender input to Receiver output. A dash (`—`) appears when no valid reading is available.

### Plugin Testing

Development included three main categories of tests based on situations encountered during routine mix checks:

- **Multitrack synchronization and channel routing:** Across the five covered Wwise versions, distinguishable signals for each bus and channel were used to check short recordings, mute isolation, and a shared time offset. Additional checks covered audio tails and `PAD` slot mappings for the supported odd-channel layouts in REAPER.
- **Host lifecycle and mode switching:** Checks covered saving and reopening projects, reassigning IDs, restarting and reconnecting hosts, and restoring audio and the reference clock after switching between Stable and Monitor while REAPER was stopped.
- **In-game use and extended operation:** Short multitrack recordings were checked with the Unity-based Wwise Adventure Game. I also ran and listened to the setup during nearly 24 hours of normal use, during which it remained stable.

## Conclusion

ReWwire addresses a straightforward need: record multiple Wwise buses into a DAW in sync, or bring them into REAPER for analysis with familiar meters, making playback comparisons and mix troubleshooting easier.

ReWwire's technical approach is not the only option. Another useful approach is to route audio to REAPER through Wwise's AK ASIO plugin and the ReaRoute virtual ASIO driver. Dante Poggio demonstrates this approach with his `Output_ChannelSelect` plugin.

If you encounter a problem, please report it through [GitHub Issues](https://github.com/zcyh147/ReWwire/issues). I hope this tool makes mix checks less cumbersome and leaves you more time to refine the sound.
