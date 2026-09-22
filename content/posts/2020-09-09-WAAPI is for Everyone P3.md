---
title: WAAPI is for Everyone | Part 3 Remaining Functions and Topics
date: 2020-09-25T16:46:00+08:00
tags:
  - Audio Middleware
aliases:
  - /2020/09/09/WAAPI is for Everyone P3/
---

Hello. I’m Thomas Wang (also known as Xi Ye).
In Part 3, we will continue where we left off and go through the remaining execution APIs (Functions), followed by the subscription APIs (Topics).
Since the Audiokinetic website did not support code blocks when I wrote this series, I created a repository on GitHub. You will find all the code referred to in these articles here:
https://github.com/zcyh147/Everyone-can-use-WAAPI

> Before we proceed, there are a few things that I want to clarify:
> - **The main purpose of listing the APIs here is to clarify their usage, fill in some gaps in the documents, and get you up and running quickly.** This is not a replacement for the API reference. I suggest you make your own list using the method described in Part 1, with whichever tools you prefer.
> - I won’t go through every argument and repeat its description. **This blog assumes that you’ve learned how to read the JSON definitions in Part 1, look up WAAPI arguments and return values, and find the corresponding sections in the online documents.**
> - For the sake of beginners, I’ve tried to add notes to each line of code wherever possible.
> - Get into the habit of reading the manual. The following articles get more technical. **If a concept is unfamiliar or difficult to find, use the search feature in the Wwise documents or look it up on Google.**
> - **WAAPI features are added over time, so I recommend using the latest version of Wwise.** When the “The procedure URI is unknown.” error message occurs, it means that the API is not supported by your current version of WAAPI.

## Remaining Functions (Execution APIs)

### wwise.ui, wwise.waapi, wwise.debug Overview

![wwise.ui, wwise.waapi and wwise.debug mind map](/images/ui%20waapi%20debug.png)

These three smaller branches are relatively simple. `wwise.ui` handles user interface operations, `wwise.waapi` provides API reflection features, and `wwise.debug` provides debugging features.

### ui (User Interface Operations)

#### bringToForeground, captureScreen, getSelectedObjects (Window Operations, Screenshots and Selected Objects)

`bringToForeground` brings the current Wwise window to the foreground. Note that this feature is only available on Windows.
`captureScreen` takes a screenshot of the current Wwise project. If no arguments are specified, it captures the entire view. The `rect` argument lets you specify the starting X and Y coordinates, width and height. To capture a particular view, specify its name with `viewName`. You can also use `viewSyncGroup` to specify the view’s Sync Group.
`getSelectedObjects` retrieves information about the currently selected objects. Normally, to copy an object’s GUID or Short ID, you hold Shift, right-click the object, and choose the appropriate Copy command. This API simplifies that workflow. It only takes Options, which determine what information is returned.
For example, to get the GUID, include `id` in the `return` option. **The types of information available here are the same as those provided by `ak.wwise.core.object.get`.** For an even more convenient workflow, you can use a Command Add-on to run your script from the context menu.

#### project.open, project.close (Opening and Closing Projects)

`project.open` opens the project specified by the `path` argument. You can also use `bypassSave` to control whether Wwise prompts you to save the current project.
`project.close` works in a similar way. Set `bypassSave` to `True` to close the project without prompting the user to save it. See the [project.close reference](https://www.audiokinetic.com/library/2024.1.7_8863/?id=ak_wwise_ui_project_close.html&source=SDK) for the argument definition.

#### commands.execute, commands.getCommands (Executing Commands and Getting Available Commands)

**`commands.execute` provides a more direct way to execute commands.**
In Part 2, we talked about finding the right API for a task, then calling it according to the documents. But what if we only need a simple operation that is already available in the Wwise interface? Rebuilding it with individual APIs can be much less convenient than pressing a shortcut key.

> For example, suppose we want a button in our own tool that generates all SoundBanks. With the approach described in Part 2, we would first retrieve the names or GUIDs of the SoundBanks, then pass them to `generate` to generate the required banks. For a simple “generate everything” button, that is quite a bit of extra work.

This is where `execute` comes in. Its required argument, `command`, specifies the command to run. For our example, check the list in the [Wwise Authoring Command Identifiers reference](https://www.audiokinetic.com/library/edge/?source=SDK&id=globalcommandsids.html). You will find `GenerateAllSoundbanksAllPlatforms` and `GenerateAllSoundbanksCurrentPlatform`, along with AutoClose variants that close the SoundBank generation window when generation finishes.
With `"command": "GenerateAllSoundbanksAllPlatforms"` in the arguments, a single remote call tells Wwise to generate all SoundBanks for all platforms.
**Unlike most WAAPI operations, this command displays a window, and its arguments do not provide a way to run it silently.** Essentially, it performs the same operation as clicking in the interface. Even so, **it greatly expands the range of simple operations that we can perform through WAAPI.**
Besides SoundBank generation, the command list includes operations for copying object information, accessing system menus, displaying views, working with source control, and more.
`getCommands` retrieves all commands supported by the current version and platform. **It can return more commands than those listed in the Wwise Authoring Command Identifiers reference**, so it is a useful place to start.

#### commands.register, commands.unregister (Registering and Unregistering Command Add-ons)

As their names suggest, `register` and `unregister` register and unregister something. In this case, that something is a Command Add-on: a user-defined command in Wwise.

> **Command Add-ons let you add custom features to Wwise. You can add them to menus, execute them with the `execute` API discussed above, or map them to a controller or keyboard shortcut.**
> Suppose an imported audio file needs more detailed editing. Normally, you would open a DAW or audio editor, edit the file, and replace the source file in Wwise. With a Command Add-on, you can add an item to the audio source’s context menu that launches Audacity. By passing predefined arguments, you can have Audacity open the selected file for editing automatically.
> **Command Add-ons can also run scripts.** Since most sound design work still takes place in the Wwise interface, adding your WAAPI scripts to its menus makes them much easier to use in daily work.

Back to `register` and `unregister`: **these APIs let you register and unregister Command Add-ons through WAAPI.** The other way to define these commands is to place JSON configuration files in the `Add-ons\Commands` directories under the supported locations.
A Technical Sound Designer could build a small tool that lets users define their own menu commands, then call `register` to add them to Wwise. This gives users more control over their own workflows.

#### Usage

Of the three APIs `bringToForeground`, `captureScreen` and `getSelectedObjects`, the last is especially convenient for quickly retrieving specific information about selected objects. It simplifies part of the work that you would otherwise do with `get`.
`commands.execute` is particularly useful when building WAAPI tools. Calling an existing Wwise command directly saves us from implementing the same behavior ourselves.
If you use Metagrid or StreamDeck, you can combine keyboard shortcuts, `commands.execute`, and WAAPI scripts to bring these operations into your workflow.

### waapi (WAAPI Reflection)

#### getFunctions, getSchema, getTopics (Getting WAAPI Information)

The three APIs under the `waapi` branch provide reflection features. They retrieve information about WAAPI itself.
`getFunctions` retrieves all currently available execution APIs (Functions), while `getTopics` retrieves all currently available subscription APIs (Topics).
`getSchema` takes a WAAPI URI and returns its schema in JSON format. **Python users need waapi-client 0.5 or later for this API to work correctly, due to an argument conflict in earlier versions.**

#### Usage

If your company does not allow work computers to access the Internet, and you have not downloaded the Wwise SDK documents, these APIs provide a way to look up WAAPI arguments and usage information offline.

### debug (Debugging Features)

#### enableAsserts, enableAutomationMode, testAssert, testCrash

`enableAutomationMode` enables automation mode, reducing potential interruptions caused by message boxes and dialogs during automated tasks. This is useful when running a large number of operations. Wwise also switches to a rather distinctive dark red interface in this mode.
`enableAsserts` enables or disables assertions, and `testAssert` tests assertions in Debug builds. The subscription API `ak.wwise.debug.assertFailed` can also provide details when an assertion fails.
Before using these features, it helps to know that the Wwise SDK has three build configurations: Debug, Profile and Release. Most day-to-day development uses Profile, while Release is intended for the final game build. Assertion testing is only available in Debug builds.
`testCrash` deliberately triggers a crash for debugging purposes.

### soundengine Overview

![soundengine mind map](/images/soundengine.png)

`soundengine` is the second major branch of execution APIs. It lets us operate the sound engine directly. **If you’ve looked through the Wwise SDK, you will recognize most of these API names.** WAAPI exposes these commonly used SDK features, giving us another way to control the sound engine.
Since these APIs operate on sound engine properties, most require the ID of a registered Game Object to identify the target.
Game Objects are one of the core concepts in Wwise. Associating an emitter in the game engine with a Wwise Game Object tells Wwise which object should produce a sound, where it is, and which direction it faces.

#### registerGameObj, unregisterGameObj (Registering and Unregistering Game Objects)

In a game engine, we normally register Game Objects through integration scripts or direct SDK calls. Both approaches ultimately use `AK::SoundEngine::RegisterGameObj()`. WAAPI provides another way to manage that registration.
`registerGameObj` and `unregisterGameObj` register and unregister Wwise Game Objects respectively. `registerGameObj` requires the Game Object’s ID and name, while `unregisterGameObj` only needs its ID.

#### executeActionOnEvent, postEvent, postTrigger, postMsgMonitor, seekOnEvent (Executing Actions and Posting Events)

We used `postMsgMonitor` in Part 1 to print “Hello Wwise!”. It has one simple purpose: to write the supplied message to the Profiler’s Capture Log.
`postEvent` posts an Event on a specific Game Object, using the Game Object ID and Event ID.
`postTrigger` posts a Trigger to trigger a Stinger in Interactive Music, just as a Trigger configured in Wwise would.
`executeActionOnEvent` executes an Action on an Event associated with a specific Game Object. The required arguments `gameObject`, `event` and `actionType` identify the target and the type of Action. You can also use `fadeCurve` and `transitionDuration` to define the curve and duration of a playback transition.
`seekOnEvent` seeks within the playing objects referenced by the Play Actions of a specified Event. To do this, provide the relevant arguments, such as `event`, `gameObject`, `playingId`, and the seek settings.

#### stopAll, stopPlayingID (Stopping Playback)

`stopAll` stops all sounds playing on the Game Object specified by `gameObject`. If no Game Object is specified, it stops all sounds. See the [stopAll reference](https://www.audiokinetic.com/library/edge/?id=ak_soundengine_stopall.html&source=SDK) for details.
`stopPlayingID` stops the content associated with a particular `playingId`. The `fadeCurve` and `transitionDuration` arguments define the fade-out curve and duration.

#### setDefaultListeners, setListeners, setListenerSpatialization, setGameObjectAuxSendValues, setGameObjectOutputBusVolume, setPosition, setMultiplePositions, setObjectObstructionAndOcclusion, setScalingFactor (Setting Sound Engine Properties)

`setDefaultListeners` sets the default listeners for newly registered Game Objects. Provide the listener Game Objects through `listeners`.
`setListeners` sets the listeners for a single emitter. It takes the listener Game Objects in `listeners` and the emitter Game Object in `emitter`.
`setListenerSpatialization` configures spatialization for a listener, including volume offsets for individual channels. Its arguments include `listener` (the listener’s Game Object ID), `volumeOffsets` (the per-channel volume offsets), `spatialized` (whether spatialization is enabled), and `channelConfig` (the channel configuration).
`setGameObjectAuxSendValues` sets the auxiliary sends for a Game Object. Use `gameObject` to identify the object, and `auxSendValues` to specify the Aux Busses, send amounts, and listeners associated with the sends.
`setGameObjectOutputBusVolume` sets the Output Bus volume for a particular emitter. Provide `emitter`, `listener`, and `controlValue`. A value of 0 mutes the output, values between 0 and 1 attenuate it, and values above 1 increase it.
`setPosition` sets a Game Object’s position and orientation. It takes `gameObject` and `position`. The position information includes `orientationTop` (the upward orientation vector), `position` (the coordinates), and `orientationFront` (the forward orientation vector).
`setMultiplePositions` sets multiple positions for one emitter. The AkAmbient integration script uses the corresponding SDK API for its multiple-position feature. In addition to `gameObject`, provide `multiPositionType` (the multiple-position mode) and `positions` (the positions and orientations).
`setObjectObstructionAndOcclusion` sets an object’s obstruction and occlusion levels. Its arguments are `listener`, `emitter`, `obstructionLevel`, and `occlusionLevel`.
`setScalingFactor` sets a Game Object’s scaling factor, which scales the distance used in attenuation calculations. Provide `gameObject` and `attenuationScalingFactor`.

#### setState, setSwitch, setRTPCValue, resetRTPCValue (Setting Game Syncs)

`setState` sets the current State within a State Group. It takes `state` and `stateGroup`.
`setSwitch` sets the current Switch within a Switch Group for a Game Object. It takes `gameObject`, `switchGroup`, and `switchState`.
`setRTPCValue` sets an RTPC to a specified value. It takes `gameObject`, `rtpc` (the RTPC), and `value` (the RTPC value).
`resetRTPCValue` resets an RTPC to its default value. It takes `gameObject` and `rtpc`.

#### Usage

Most APIs in this branch expose features from the Wwise SDK. They are useful when we need to control sound engine properties ourselves, such as registering or unregistering Game Objects and changing their properties during gameplay.

## Topics (Subscription APIs)

### wwise.core Overview

![wwise.core subscription APIs mind map](/images/%E8%AE%A2%E9%98%85wwise.core.png)

Just as with execution APIs, `wwise.core` is the largest branch of subscription APIs.
**Before we begin, there are two common options that you will find in many of these APIs:** `platform`, which specifies the platform, and `return`, which selects standard properties exposed by the built-in accessors for Wwise objects. Refer to “built-in accessors for Wwise objects” in the documents for details. Below, I will refer to this object data as “basic information.”

### object (Subscribing to Object Changes)

#### created, preDeleted, postDeleted

`created` publishes information when an object is created in the project. Use Options to specify which object information you want to receive. Without additional Options, the notification contains the default basic information in `object`.
`preDeleted` and `postDeleted` are similar. **The difference is when they publish their notifications: before or after the object is deleted.** If the timing matters, `preDeleted` lets you respond as the deletion begins. As with `created`, you can use Options to request additional object information; otherwise, only the default basic information is returned.

#### childAdded, childRemoved

`childAdded` and `childRemoved` publish notifications when a child is added to or removed from a parent object, such as a container.
Use Options to specify which object information to include. Without additional Options, the notification contains basic information about `parent` and `child`.

#### attenuationCurveChanged, attenuationCurveLinkChanged

`attenuationCurveChanged` lets you subscribe to changes in how an object uses an attenuation curve. This refers to the curve’s usage setting in the Attenuation Editor, rather than changes to the curve’s points or shape.
`attenuationCurveLinkChanged` lets you subscribe to changes in the attenuation curve’s link settings across platforms.
**In my tests, both APIs responded to the changes described above and published the same information.** In the version I tested, I could use either for those cases. Their Options let you specify the basic object information to include.

#### curveChanged, nameChanged, notesChanged

`curveChanged` publishes a notification when an object’s property curve changes, but does not describe how much the curve has changed. Without additional Options, it returns basic information about `owner` (the object being modified) and `curve` (the modified curve object).
`nameChanged` publishes a notification when an object’s name changes. By default, it returns `oldName`, `newName`, and basic information about `object`.
`notesChanged` publishes a notification when an object’s notes change. By default, it returns `oldNotes`, `newNotes`, and basic information about `object`.

#### propertyChanged, referenceChanged

`propertyChanged` publishes details when a particular object property changes. **Among the `wwise.core.object` topics covered here, it is the only one with required Options.** You must specify `property` (the property name) and `object` (the object’s name or GUID). You can also specify which basic object information to include.
By default, it returns `property`, `object`, `old` (the previous value), `new` (the new value), and `platform` (the platform on which the property changed).
`referenceChanged` publishes a notification when an object reference changes. By default, it returns `old` (the previous referenced object), `new` (the new referenced object), `object` (the object whose reference changed), and `reference` (the name of the reference that changed).

### project (Subscribing to Project State Changes)

#### loaded, saved

`loaded` publishes a notification after a project has finished loading. It requires no arguments. This applies when you open a project from the menu or through `ak.wwise.ui.project.open`: the notification is published once loading is complete.
`saved` publishes the paths of modified files after the project is saved. **Its `modifiedPaths` data is quite detailed, including the paths of modified `.wwu` files and other project files.**

#### preClosed, postClosed

`preClosed` and `postClosed` publish notifications when the project begins closing and when it has finished closing, respectively. Here, closing means closing the project with Ctrl + F4 or `ak.wwise.ui.project.close`, rather than closing the entire Wwise application with the window’s Close button.

### soundbank (Subscribing to SoundBank Generation)

#### generated, generationDone

`generated` provides notifications for individual SoundBanks during generation. Since generation involves multiple SoundBanks and platforms, you may receive several notifications.
Besides specifying basic information about the SoundBank object, Options can include `bankData` (the base64-encoded bank data and its size), `infoFile` (detailed SoundBank information in `bankInfo`, such as Events, paths and GUIDs), and `pluginInfo` (JSON information about the plug-ins used by the project).
**These options add details about the generated content. The basic object information in `soundbank` alone does not describe what is inside the bank.**
`generationDone` publishes log information when SoundBank generation finishes. The default `logs` data includes `severity` (Message, Warning, Error or Fatal Error, in increasing order of severity), `time` (the log timestamp), `message`, and `messageId`.

### switchContainer (Subscribing to Assignment Changes)

#### assignmentAdded, assignmentRemoved

`assignmentAdded` and `assignmentRemoved` publish notifications when assignments are added to or removed from a Switch Container. Their Options and published information have the same structure, so we can discuss them together.
If you do not request additional information about the Switch Container and the assigned objects, both topics return basic information in `stateOrSwitch` (the State or Switch receiving the assignment), `switchContainer` (the container), and `child` (the assigned child object).

### transport (Subscribing to Transport State Changes)

#### stateChanged

`stateChanged` publishes notifications when a transport object’s state changes. You must specify the transport object’s ID with the `transport` option.
When the state changes, the notification includes `transport` (the subscribed transport’s ID), `object` (the GUID of the Wwise object it controls), and `state` (the playback state).

### audio (Subscribing to Audio Imports)

#### imported

`imported` publishes a notification after an audio import operation completes. Its Options let you specify the basic information to include for each imported object.

### log (Subscribing to New Log Entries)

#### itemAdded

`itemAdded` publishes a notification when a new entry is added to a log. No Options are required. The notification includes `channel` (the corresponding tab in the Logs window) and `item` (the new entry, including fields such as `time` and `severity`).

### wwise.debug Overview

![wwise.debug subscription APIs mind map](/images/%E8%AE%A2%E9%98%85wwise.debug.png)

#### assertFailed (Subscribing to Assertion Failures)

`assertFailed` is only available in Debug builds. It returns `fileName` (the source filename), `lineNumber` (the line in the source code), and `expression` (the assertion expression).

### wwise.ui Overview

![wwise.ui subscription APIs mind map](/images/%E8%AE%A2%E9%98%85wwise%20ui.png)

#### commands.executed, selectionChanged (Subscribing to Command Execution and Selection Changes)

`commands.executed` publishes a notification when a command is executed. Besides selecting basic object information, its Options let you specify `platform` and `language`. By default, it returns `platform`, `objects` (basic information about the objects involved), and `command` (the executed command’s ID).
**This topic responds to commands executed through the Wwise interface as well as those called through `ak.wwise.ui.commands.execute`.** You can use it to identify a command triggered by a manual operation and check it against the Wwise Authoring Command Identifiers reference.
`selectionChanged` publishes a notification when the selected objects change. It applies to **object selections in views such as the Project Explorer and Event Viewer**, rather than changes to individual settings. Its Options also let you specify `platform` and `language`, along with the basic information to return about the selected objects.

## Additional Notes

### Remaining Functions (Execution APIs)

The APIs under `wwise.ui`, `wwise.waapi`, and `wwise.debug` are fairly straightforward.
Game Object registration under `soundengine` may be less familiar to beginners, because integrations normally handle it for us. In Unity, for example, the AkGameObj script calls the SDK’s `RegisterGameObj` and `UnregisterGameObj` to manage registration without requiring us to do it manually.
If you want to register a Game Object yourself through `ak.soundengine.registerGameObj`, look at the registration process in the integration scripts. For example, the integration’s `GetAkGameObjectID` method shows how a game object identifier is converted to a 64-bit integer ID that can be passed to the registration API.

### Topics (Subscription APIs)

**To use a subscription API, you need a callback function to receive its notifications.** Unlike an execution API, which returns the result of a call, a subscription keeps listening for future changes while the connection remains active.
The callback tells your program which function to execute when a notification arrives, and where to pass the published information. For an example of passing arguments to a Topics callback, refer to the code in [Part 1](https://blog.audiokinetic.com/everyone-can-use-waapi-overview/).
If your program uses a blocking wait to keep the subscription alive, and you also want it to do other work, you can move that waiting logic to a separate thread.

## What’s Next?

Next, we will look at practical examples and demonstrate how WAAPI can be used in real projects.
As a complement to the documents, we will also discuss how to make WAAPI calls from commonly used game engines.
