---
title: 人人都能用 WAAPI（三）Functions（执行类 API）剩余部分及 Topics（订阅类 API）
date: 2020-09-25T16:46:00+08:00
tags:
  - 音频编程
aliases:
  - /2020/09/09/WAAPI 一文通（三）/
---
大家好，我是溪夜。
在《人人都能用 WAAPI（三）》中，我们会继续上一篇的内容，讨论 WAAPI 的 Functions（执行类）中剩下的其他的 API 及 Topics（订阅类）。
考虑到 Audiokinetic 官网无代码框，我在 GitHub 创建了一个仓库，其中包括了本系列文章中所有的代码，地址为：https://github.com/zcyh147/Everyone-can-use-WAAPI
> 阅前须知：
> - **把 API 逐条列出讲解是为了快速阐述其功能，补充文档的一些不足，以帮助大家快速对 WAAPI 建立印象**，并非重写参考文档。所以建议看完本文后按照第一篇文中所提的方法，用自己喜欢的整理方式重新整理一次。
> - 本文并不会把每个参数全都翻译并复述一遍功能，这里**均假设读者已学会了概述中的 JSON 阅读方法，能够自行根据我的介绍查阅 WAAPI 参数及返回值等文档信息，此外还希望读者能准确的找到在线文档中对应的章节。**
> - 为了照顾初学者，我尽量把注释写到每一行，以便快速入门。
> - 学会 RTFM（Read The Fucking Manual），因为接下来的文章比较严肃。**如发现某些概念看不懂或找不到，请善用 Wwise 文档强大的搜索功能或通过 Google 检索所需答案。**
> - **因为 WAAPI 的功能也是随版本更新逐渐添加的，建议安装最新版 Wwise 进行操作。**当报错信息提示 “The procedure URI is unknown.” 时，就代表你的当前 WAAPI 版本并不支持此 API。

## Functions（执行类 API）剩余部分
### wwise.ui、wwise.waapi、wwise.debug 概览
![ui waapi debug](/images/ui%20waapi%20debug.png)
`wwise.ui`、`wwise.waapi`、`wwise.debug` 这几个小分类是执行类里比较简单的部分，功能分别为 UI 控制操作功能、WAAPI 的反射功能及 Debug 功能。
### ui（用户界面级操作）
#### bringToForeground, captureScreen, getSelectedObjects（窗口操作、截图、获取选中对象）
`bringToForeground` 能够把当前 Wwise 窗口前置，注意这个功能只在 Windows 下才有效。
`captureScreen` 可以对当前 Wwise 工程进行截图，如果不进行参数的话。指定默认会截取整个视图。通过其中的 `rect` 参数可以设置截图的 xy 轴起始点及宽度高度。如果想截取指定的 View，可以在 `viewName` 中进行指定，同时可通过 `viewSyncGroup` 指定获取 View 中的 Sync Group。
`getSelectedObjects` 可以获得当前选择对象的相关信息。通常在获取对象 GUID 或 Short ID 时，可以按住 Shift 键后在对象上点右键，在菜单中点选复制。而这个 API 可以对这个工作流程进行优化，它的参数只有 Options 用来决定返回值是哪个信息。
对于刚才提到的操作，我们可在 Options 中添加 `id` 参数，即可在调用这个 API 的时候获得 GUID 返回值。**这个功能与 `ak.wwise.core.object.get` 能获取的数据种类是完全一样的。**想获得更为便捷的信息获取工作流，也可以通过命令扩展功能把脚本调用整合到右键菜单上。
#### project.open, project.close（读取工程与关闭工程）
通过 `project.open` 可以打开指定的工程，为此需要传入 `path` 参数。此外还可设置 `bypassSave` 来决定是否提示用户保存当前工程。
在 `project.close` 也是同理，可通过 `bypassSave` 决定是否提示用户保存当前工程。如果设定为 False，会直接关闭工程。
#### commands.execute, commands.getCommands（执行命令与获取可用命令列表）
**commands 的 `execute` 是个更“直接”的命令执行功能**。
在上一篇中我们提到当想达到一个具体的需求时要先找到对应的 API，再按文档要求调用 API 以实现它的功能。但如果我们想完成一些简单的需求，比如 Wwise 本身在软件页面上就有的一些功能。这种方法无疑是很麻烦，远不如一个快捷键来的方便。
> 举个例子，如果我们在自己做的工具想一键生成所有 SoundBank，按上一篇文中的方法应该怎么做？注意 `generate` 是没有功能去生成所有 SoundBank 的。所以想用这个 API 实现需求，我们就必须先获取所有 SoundBank 的名称或 GUID，再作为参数反复调用 API 以让其逐个生成 SoundBank，这无疑是笨拙且低效的。

这时我们就可以用 `execute`，它的必备参数 `command` 即需要执行的命令。以上例所提的需求来说，在文档中的 Wwise Authoring Command Identifiers（https://www.audiokinetic.com/library/edge/?source=SDK&id=globalcommandsids.html）中翻阅命令列表。在其中可轻松找到 `GenerateAllSoundbanksAllPlatforms` 或 `GenerateAllSoundbanksCurrentPlatform`，甚至还有加上 AutoClose 的版本（即生成结束后自动关闭 SoundBank 生成窗口），在参数中写入一行简单的 `“command”: "GenerateAllSoundbanksAllPlatforms"`，此时执行远程调用，Wwise 就会自动对全部平台的全部 SoundBank 执行生成操作。
**与 WAAPI 的绝大多数执行过程不同，这种调用方法是会显示出窗口的，参数中也没有方法让其静默工作。**本质上就是代替我们完成了点击操作，但却**极大的扩展了 WAAPI 对于简单命令的执行能力。**
翻阅可用命令列表，除了能看到上面提到的 SoundBank 相关指令外，还可轻松看到诸如拷贝对象信息、调用系统菜单、显示各种窗口、版本管理相关等功能。
`getCommands` 可以看到当前版本平台支持的所有命令，**但它比 Wwise Authoring Command Identifiers 中所列出命令的会更多**，可优先作为使用时的参考。
#### commands.register, commands.unregister（命令扩展的注册与注销）
`register` 和 `unregister`，从名字上容易看出它们的功能是注册与注销，它们所控制的是 Wwise 的另一个进阶功能，即命令扩展（用户自定义的命令）的注册与注销。
> **命令扩展（Command Add-ons）是在 Wwise 中添加自定义的功能的一种方法，此功能可以增加到菜单中，可以用上一小节提到的 `execute` 命令执行，也可映射到控制器或快捷键上。**
>思考一个应用场景，你想对已导入的音频进行稍微复杂点的编辑，这时可能需要打开 DAW 或音频剪辑工具改完后再重新替换 Wwise 中的源文件，这显然比较麻烦。但通过命令扩展功能，就可以在 Wwise 中给音频源的菜单中增加直接调用 Audacity 的功能，如果再给 Audacity 传递一些预定义参数，让其自动对我们所选的文件进行读取操作以便于编辑。
>除了执行程序外，**命令扩展也可以调用脚本**。因为绝大多数音频设计的工作还是要面对 Wwise 本身的界面的，所以一些 WAAPI 功能脚本做好后我们可以嵌入到 Wwise 的菜单中，这样在工作中更加方便。

回到 `register` 和 `unregister` 的功能上，**其实它们就是通过 WAAPI 来进行注册和注销命令扩展（其余的定义命令扩展方法是要在几个路径下的 Add-ons\Commands 目录中添加 JSON 配置参数来完成的）**。对此，技术音频设计师或许可以给用户封装一个自定义添加功能菜单的程序，调用 `register` 来进行用户定义功能的菜单添加。这样能够实现更加私订制化的的工作流实现。
#### 应用场景
对于 `bringToForeground, captureScreen, getSelectedObjects` 三个 API 而言，其中 `getSelectedObjects` 在快速获取对象的指定信息上非常便利，简化了 `get` 中的一部分功能，有效提升了效率。
`commands.execute` 对于 WAAPI 工具设计无疑是个非常重要的功能，通过代码直接调用现有的已封装好的功能，能够减少大量重复造轮子的时间。
对于使用 Metagrid 和 StreamDeck 来提升效率的用户来说，此时可以通过快捷键、 `commands.execute` 及 WAAPI 功能脚本三者进行功能部署，把工作流提升到最大化。
### waapi（WAAPI 反射）
#### getFunctions, getSchema, getTopics（获取 WAAPI 有关信息）
WAAPI 中的 `waapi` 类下面的三个是 API 反射函数，功能都是获取 WAAPI 有关信息。
`getFunctions` 能够获取当前所有可用的 Functions（执行类）API，`getTopics` 则是获取当前所有可用的 Topics（订阅类）API。
`getSchema` 以 WAAPI URI 作为参数，能够返回 URI 对应的 JSON 格式的 Schema（语法文档）。**注意此 API 因参数冲突问题，Python 用户需更新 waapi-client 0.5及后续版本才可正常工作。**
#### 应用场景
对于不允许工作电脑联网的公司，如果没有下载 Wwise SDK 文档，可用这种方法在离线时查询 WAAPI 有关参数和使用方法。
### debug（Debug 功能）
#### enableAsserts, enableAutomationMode, testAssert, testCrash
`enableAutomationMode` 为启用自动化模式，可减少自动化任务过程中由消息框和对话框造成的潜在中断。在大量的自动化工作中可以打开此选项，此时 Wwise 的界面也会变成炫酷的暗红色调。
`enableAsserts` 为断言开关，`testAssert` 用来在 Debug Builds 中测试断言。订阅类的 `ak.wwise.debug.assertFailed` 功能亦会返回断言失败时的具体信息。使用这个功能前需要知道，Wwise SDK 提供 Debug、Profile 和 Release 三个版本，日常的开发工作主要面对 Profile 版，Release 版本则用于最终的游戏发行版。Wwise 提供的断言测试功能，只能在 Debug（调试）版本中使用。
`testCrash` 为崩溃时用来 Debug 的功能。
### soundengine 概览
![soundengine](/images/soundengine.png)
`soundengine` 是执行类中的第二大分类，可以直接对声音引擎进行操作。**如果曾翻阅过 Wwise SDK，我们很容易发现 `soundengine` 的大部分 API 在其中都以同名出现过。**也就是说，WAAPI 将这一部分常用功能从 Wwise SDK 中暴露了出来，提供了另一种控制声音引擎的方法。
因为是对声音引擎的各种属性进行操作，所以这些 API 几乎都需要用户提供注册后的 Game Object 的 GUID 作为参数，以明确到底要对哪个操作对象进行控制。
在 Wwise 中 Game Object 是最核心的概念之一，只有把游戏引擎中的发声体与 Game Object 绑定，Wwise 才能知道到底要对为游戏中的哪个对象发声、设置位置、朝向等。
#### registerGameObj, unregisterGameObj（游戏对象注册与注销）
除了在游戏引擎中通过预制脚本或直接引用 Wwise SDK 注册外（这两者都是使用了 `AK::SoundEngine::RegisterGameObj()` 进行 Game Object 注册），我们也可通过 WAAPI 来进行 Game Object 的注册管理。
`registerGameObj` 与 `unregisterGameObj` 分别负责注册与注销 Wwise Game Object，其中 `registerGameObj` 需要提供 Game Object 的 ID 与名称，`unregisterGameObj` 只需 Game Object ID 即可注销对象。
#### executeActionOnEvent, postEvent, postTrigger, postMsgMonitor, seekOnEvent（执行与发送）
`postMsgMonitor` 在本系列文的第一篇概述中曾用来输出 “Hello Wwise!“ 字符串，它的功能只有一条，即把传入的信息输出到 Profiler 的 Capture Log 中。
`postEvent` 在提供 Game Object ID 与 Event ID 后可在特定的 Game Object 上发送 Event。
`postTrigger` 可在 Interactive Music 中手动触发 Stinger，与在 Wwise 中设置的 Trigger 触发效果相同。
`executeActionOnEvent` 可对特定 Game Object 上的 Event 执行 Action，必备参数除了 `gameObject`，`event`，`actionType` 用来决定操作对象和行为类型之外，还可用 `fadeCurve`（过度时的曲线类型），`transitionDuration`（过度时长）来为 Event 增加播放淡变。
`seekOnEvent` 可对指定 Event 的 Play Actions 中引用的所有播放对象中查找，为此需要提供相关的参数如 `event`，`gameObject`，`playingId` 及查找属性等。
#### stopAll, stopPlayingID（停止播放）
`stopAll` 可以停止特定游戏对象上播放的所有声音，因此需要 `gameObject` 指定被停止的游戏对象。如果该游戏对象不存在，那么所有声音都会被停止。
`stopPlayingID` 可以停止播放游戏对象上特定的内容，需要提供 `playingId` 来指明要停止播放的内容，同时还必须提供 `fadeCurve`，`transitionDuration` 来设置声音渐变时的曲线和时间。
#### setDefaultListeners, setListeners, setListenerSpatialization, setGameObjectAuxSendValues, setGameObjectOutputBusVolume, setPosition, setMultiplePositions, setObjectObstructionAndOcclusion, setScalingFactor（各种属性设置）
`setDefaultListeners` 可设置默认的听者，之后所有新注册的游戏对象都会以此作为听者。需要提供作为 `listeners`（听者）的 Game Object。
`setListeners` 可为单一发声体对象的设置听者，为此需要提供作为 `listeners`（听者）和 `emitter`（发声体）的 Game Object。
`setListenerSpatialization` 用来设定听者的空间化参数，对不同声道设置音量偏置。需要提供 `listener`（听者的 GUID），`volumeOffsets`（每个声道的偏置值），`spatialized`（空间化开关），`channelConfig`（声道构造）。
`setGameObjectAuxSendValues` 可对特定 Game Object 设定 Aux Bus，使用 `gameObject`（游戏对象的 GUID），`auxSendValues`（Aux Bus 对象、发送量、发送后对象的听者）来决定 Aux Send 的相关属性。
`setGameObjectOutputBusVolume` 设定指定发声体 Game Object 的 Output Bus 音量，需提供 `emitter`（需要被调整音量的发声体对象），`listener`（听者对象），`controlValue`（使用数值更改音量，0为静音，0-1为衰减量，1往上为增加量）。
`setPosition` 用来设置 Game Object 的位置参数，需要提供 `gameObject`（游戏对象）和 `position`（位置参数）。其中位置参数包括 `orientationTop`（Listener 头的斜度），`position`（Listener 的坐标），`orientationFront`（Listener 头部的朝向）。
`setMultiplePositions` 可以为一个发声体设置多个位置，预制脚本 AkAmbient 中的多点定位就是用 SDK 中它所对应的 API 实现的。参数除了 `gameObject`（游戏对象） 之外，还需要提供 `multiPositionType`（多点定位模式），`positions`（听者的位置和朝向）。
`setObjectObstructionAndOcclusion` 用来设置对象的声障和声笼级别，需要 `listener`（听者）和 `emitter`（发声体）及 `obstructionLevel`（声障级别），`occlusionLevel`（声笼级别）。
`setScalingFactor` 用来设置 Game Object 的缩放因子，可用来缩放衰减计算的范围。需要提供 `gameObject`（游戏对象），`attenuationScalingFactor`（衰减因子）。
#### setState, setSwitch, setRTPCValue, resetRTPCValue（Game Sync 设置）
`setState` 用来设置 State Group 中的 State，需要提供参数 `state`，`stateGroup`。
`setSwitch` 用来设置 Switch Group 中的 Switch State，需要提供参数 `gameObject`，`switchGroup`，`switchState`。
`setRTPCValue` 用来设置 RTPC 为指定值，需要参数 `gameObject`，`rtpc`（RTPC 对象），`value`（RTPC 数值）。
`resetRTPCValue` 可以重置 RTPC 为默认值，需要参数 `gameObject`，`rtpc`。
#### 应用场景
对于此分类下的 API 来说，绝大多数都是从 Wwise SDK 中暴露出来的功能，因此可知其使用场景多为需手工操作声音引擎属性时，例如引擎中的游戏运行时手工进行游戏对象注册注销、属性修改等。
## Topics（订阅类 API）
### wwise.core 概览
![订阅wwise.core](/images/%E8%AE%A2%E9%98%85wwise.core.png)

与 Functions（执行类 API）相同，Topics（订阅类 API）中最大的功能模块也是 `wwise.core`。
**在开始前请注意这些 API 的一个共同点，它们的可选的 Options 中绝大多数存在两个公用选项**。其一是 `platform`（平台），另一个是通过 `return` 设置的 Wwise 对象内置的存取器提供的诸多标准属性（可参考文档中有关 “built-in accessors for Wwise objects” 的描述，以下简称为“基本信息”）。
### object（订阅有关对象属性的改变）
#### created, preDeleted, postDeleted
`created` 可在工程中有对象被创建时，发布此对象被订阅的信息。具体的信息类型需要使用 Options 参数指定，如果此参数留空，发布的信息中只会包含 `object` 基本信息（包括 GUID 与对象类型）。
`preDeleted` 与 `postDeleted` 的功能近似，区别是发布订阅的信息的时间点不同，**前者在对象删除前发布消息，后者在删除后发布消息**。对于需要精确时间戳的情况下，`preDeleted` 能够更精确的获得准确删除操作开始的时间点。与 `created` 一样，如果不提供 Options 指定订阅返回值，默认也只会返回 `object` 的基本信息。
#### childAdded, childRemoved
`childAdded` 与 `childRemoved` 订阅了父对象（容器对象）中子对象的状态，当子对象被添加或移除时，会发布订阅的信息类型。
它们需要提供 Options 参数，来决定发布的信息中返回哪些对象信息类型。当不提供 Options 参数时，默认只会返回 `parent`（父对象） 和 `child`（对象的基本信息）。
#### attenuationCurveChanged, attenuationCurveLinkChanged
`attenuationCurveChanged` 可订阅对象的衰减曲线的使用情况，但这个改变情况并非指衰减曲线本身（分割点位置、曲线类型）的变化，而是 Attenuation Editor 中衰减曲线的使用状态。
`attenuationCurveLinkChanged` 订阅了衰减曲线在不同平台下的 Link 情况。
**我进行了多次测试，发现实际使用中这两者的功能相同，都会响应彼此的设计功能而发布相同的返回信息**，因此这两个 API 可以混用。它们的可选 Options 参数中可设定所需的对象的基本信息。
#### curveChanged, nameChanged, notesChanged
`curveChanged` 可订阅对象属性曲线发生改变的情况，并不会返回曲线改变了多少。如不指定 Options，默认会返回 `owner`（被修改的对象）和 `curve`（被修改的曲线对象）的基本信息。
`nameChanged` 可订阅对象名称的变化，如不指定 Options，默认会返回 `oldName`（修改前的对象名），`newName`（修改后的对象名），`object`（对象的基本信息）。
`notesChanged` 可订阅对象备注的变化，如不指定 Options，默认会返回 `oldNotes`（修改前的备注），`newNotes`（修改后的备注），`object`（对象的基本信息）。
#### propertyChanged, referenceChanged
`propertyChanged` 可订阅对象的属性发生改变的具体情况，**它也是 `wwise.core.object` 订阅子类中唯一需要提供必须参数的 API**，Options 中必备的参数有 property（被修改的属性名）和 object（对象名或 GUID）。同时也指定基本参数来决定发布信息的返回值。默认情况下会返回 `property`（被修改的属性名），`object`（对象的基本信息），`old`（之前的属性值），`new`（新的属性值），`platform`（被修改属性值所在的平台）。
`referenceChanged` 用来订阅对象引用发生变化的情况，如不指定 Options，默认会返回 `old`（之前的引用对象），`new`（之的的引用对象），`object`（引用被修改的对象），`reference`（被修改的引用对象的名字）。
### project（订阅工程的状态改变）
#### loaded, saved
`loaded` 可在工程被正确加载后发布信息，无需参数，这个 API 指的是通过菜单打开工程或 `ak.wwise.ui.project.open` 打开工程并加载完成后才会发布消息。
`saved` 可在工程保存后发布被修改文件的路径消息，**它所返回的 `modifiedPaths` 很详细，每个被修改的 wwu 文件和工程内文件的的路径都会被返回。**
#### preClosed, postClosed
`preClosed` 和 `postClosed` 分别可在工程开始关闭和关闭完成时发布消息，注意这个关闭指的是通过 Crtl + F4 快捷键或 `ak.wwise.ui.project.close` 来关闭的工程，并不是点击窗口关闭按钮去关闭整个 Wwise。
### soundbank（订阅 SoundBank 生成状态）
#### generated, generationDone
`generated` 可订阅 SoundBank 开始生成时的信息，在每个平台的每个 SoundBank 开始生成时都会被触发，因此会发布多个消息。Options 中除了设定 SoundBank 对象的基础信息（Wwise 对象基本信息）外，还可选择加入 `bankData`（base64 编码的包内数据及编码后的大小），`infoFile`（在结果中添加 bankInfo，其中包括 SoundBank 内的详细信息如 Event 信息、路径、GUIID 等），`pluginInfo`（JSON 格式，工程所用到的插件相关信息） 三个选项。**当选中这三个选项时，会在返回信息中增加更具体的信息，自带的 `soundbank` 中只有对象基础消息，是无法反映出 SoundBank 内具体的构成的。**
`generationDone` 可订阅 SoundBank 生成结束时的 log 信息，不指定 Options 时，默认会返回 `logs` 中的 `severity`（生成完成后的错误程度，从无错误到最严重分别为 Message、Warning、Error、Fatal Error），`time`（日志时间戳），`message`（日志消息），`messageId`（日志消息 ID）。
### switchContainer（订阅 Switch Container 容器内的指派变化）
#### assignmentAdded, assignmentRemoved
`assignmentAdded` 和 `assignmentRemoved` 可以订阅 Switch Container 中指派的添加与移除，它们两者可选的 Options 与可发布的信息完全一致，在这里放在一起讨论。
在 Options 中如果不指定需返回的 Switch Container 和指派对象的基本信息时，这两个 API 默认都只会返回 `stateOrSwitch`（子对象指派到了 Switch 还是 State 中，并返回它的信息），`switchContainer`（容器本身的信息），`child`（被指派到容器内对象的有关信息）
### transport（订阅走带状态变化）
#### stateChanged
`stateChanged` 可订阅走带对象的状态变化，必须用 Options 提供 `transport`（走带对象的 GUID）。当状态改变，会发布 `transport`（正在订阅的走带对象的 GUID），`object`（被走带对象所控制对象的 GUID），`state`（走带播放状态）。
### audio（订阅音频导入状态）
#### imported
`imported` 可订阅音频导入操作完成后的消息，可选的 Options 中可设定每个被导入对象所要返回的基本信息。
### log（订阅日志中对象的添加情况）
#### itemAdded
`itemAdded` 可订阅日志中条目的增加，不需要指定 Options，在发布信息中可以返回 `channel`（可返回 Log 窗口中选项卡的名称），`item`（选项卡内具体新增的条目，如 time，severity 等）。
### wwise.debug 概览
![订阅wwise.debug](/images/%E8%AE%A2%E9%98%85wwise.debug.png)

#### assertFailed（订阅资源失败信息）
`assertFailed` 只在 Debug 版本下可用，会返回 `fileName`（原文件名），`lineNumber`（代码行数），`expression`（错误注释）。
### wwise.ui 概览
![订阅wwise ui](/images/%E8%AE%A2%E9%98%85wwise%20ui.png)

#### commands.executed, selectionChanged（订阅命令执行状态与选择改变）
`commands.executed` 可订阅有命令被执行，可选的 Options 中除了设定对象的基本信息外，还可设定 platform（平台）和 language（语言）。默认情况下会返回 platform（平台），objects（被执行对象的基本信息），command（被执行命令的 ID）。**这条 API 不只响应通过 `ak.wwise.ui.commands.execute` 所执行的命令，用户正常执行的操作也会有响应，因此可用作查看当前命令是否在 Wwise Authoring Command Identifiers 受支持的验证工具。**
`selectionChanged` 可订阅工程中选中对象的变化，只对**Project Explorer 和 Event Viewer 这种含有条目的对象有效**，对调整选项无效。可选的 Options 中同样可以指定 `platform`（平台）和 `language`（语言），返回值只会返回 `object`（被选中对象的基本信息）。
## 补充
### Functions（执行类 API）剩余部分
`wwise.ui`、`wwise.waapi`、`wwise.debug` 中的功能非常简单。
但 `soundengine` 中关于 Game Object 注册的部分可能让初学者难以理解，因为通常游戏对象的管理都是通过集成包自动完成的，例如在 Unity 中会有 AkGameObj 脚本来调用 SDK 中的 `RegisterGameObj` 和 `UnregisterGameObj` 来帮我们注册或注销 Game Object，无需用户亲自介入。
如果在 WAAPI 使用时想要通过 `ak.soundengine.registerGameObj` 手动注册 Game Object，可参考预制脚本中的注册流程，如参考集成包内的 `GetAkGameObjectID` 方法把游戏对象标识符转为 int64 从而传入 API 注册游戏对象。
### Topics（订阅类 API）
对订阅 Topics 类 API 来说，**所有的调用都是需要回调函数来指定返回值的**。之所以这样设计，是因为订阅执行后程序会阻塞并等待返回值，并不像执行类 API 调用一次就结束程序。
因此我们需要一个回调函数，指明当订阅的信息发生时用谁来接受产生的信息，以便于当信息发生时执行此函数。关于 Topics 类的回调函数传参办法，请参考第一篇中的示例代码（https://blog.audiokinetic.com/everyone-can-use-waapi-overview/）。
对于订阅类 API 来说，因为调用时会阻塞，所以如果想同时让程序做别的功能，可把这部分调用放入多线程。
## 接下来讲什么？
接下来是本系列文章的实例篇，通过实际项目演示一下 WAAPI 在具体工作中的应用。
另外，作为对文档的补充，我们会展开讨论如何在常见的游戏引擎中调用 WAAPI。