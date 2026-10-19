---
title: "ReWwire：把 Wwise 多轨音频同步传输到 DAW"
date: 2026-10-19T00:00:00+08:00
slug: "2026-10-19-rewwire-wwise-to-daw"
tags:
  - "Game Audio"
  - "Wwise"
---

大家好，我是溪夜。

在游戏音频开发中，把音乐、音效、对白分别录下来用于回放是个常见需求。Wwise 自带的 Recorder 虽然能实现，但声音停止播放后，它的录制也会结束；若希望持续录制，需额外播放 Wwise Silence 来维持。录好的文件还需手动导入 DAW，整个过程比较繁琐。

此外在混音时，Wwise Mixing Desk 提供了很多功能，但表头监控功能也相对简单。

为了解决这些痛点，我开发了开源免费插件 ReWwire，将 Wwise 中多个 Bus 的输出同步传输到 DAW。既可用于分轨录制，也可使用自己熟悉的表头和分析插件，进行实时混音分析。

本文介绍它能做什么、怎样安装和配置，以及如何结合 REAPER 完成多轨录制与混音分析。

## ReWwire 是什么

### 功能

ReWwire 是一个 Windows 平台上的 Wwise => DAW 音频传输插件，名字取自 **Re**-**W**wise-**Wire**，灵感来自早年跨软件传输音频的 ReWire 协议。

它由 Wwise 端的 Sender 效果器插件和 DAW 端的 VST3 Receiver 插件组成，支持 Wwise 2021.1 - 2025.1 五个版本。

在需要录制的 Wwise Bus 上插入 Sender，在 DAW 轨道上插入 Receiver，两边设置相同的编号，就能把对应 Bus 的声音传进 DAW 轨道。

插件支持 Mono、Stereo、LCR（3.0）、Quad（4.0）、2.1、5.1、7.1、5.1.2、7.1.4 等扬声器布局，以及一至三阶 Ambisonics，单路最多传输 16 个声道。

使用时需注意：

* **操作系统**：仅支持 Windows x64，Wwise 与 DAW 需运行在同一台电脑上
* **采样率与声道布局**：两端需使用相同采样率，接收轨道与后续效果器需匹配传入的实际声道布局；插件不负责混音、重采样、上下混或 Ambisonics 解码

### 效果演示

下面通过 Wwise Adventure Game（WAG）演示实际效果，视频中同时录制了音乐、环境声、玩家、敌人、语音、UI 等 Bus 的声音，并演示了回放效果。

{{< video src="/videos/2026-10-19-rewwire/wag-demo.mp4" caption="Wwise Adventure Game：将 Wwise Bus 分轨录入 REAPER 并回放" >}}

## 使用方法

### 下载

请在 GitHub 下载最新安装包：[GitHub Latest Release](https://github.com/zcyh147/ReWwire/releases/latest)。

安装包中提供：一份通用的 `ReWwire_Receiver` 压缩包，以及对应五个 Wwise 版本的 `ReWwire_Sender` 压缩包：`2021.1.14.8108`、`2022.1.19.8584`、`2023.1.19.8928`、`2024.1.13.9056` 和 `2025.1.7.9143`。

按 Wwise 的公开插件接口规则，同一 `YEAR.MAJOR`（如 `2024.1.x`）内具备接口兼容，如果在同大版本的其他小版本中使用，建议先试录一下。

### 安装与集成

#### DAW

解压 Receiver 压缩包，将 `ReWwire_Receiver.vst3` 复制到 Windows 常用的 VST3 目录（如 `C:\Program Files\Common Files\VST3`），并重启 DAW 加载插件。

#### Wwise Authoring

Wwise 端可通过 Audiokinetic Launcher 导入对应版本的 Sender 安装包：

1. 在 Launcher 中打开 `Plug-ins` 页面，在 `Wwise Version` 中选择要安装插件的 Wwise 版本

   ![在 Launcher 中选择 Wwise 版本](/images/2026-10-19-rewwire/launcher-plugins.png)

2. 点击 `Add from directory` 旁的下拉框，选择 `Add from archive` 导入安装包，找到 ReWwire Sender 后点击 `Modify` 完成安装

   ![通过 Launcher 安装 ReWwire Sender](/images/2026-10-19-rewwire/launcher-install.png)

3. 重新打开 Wwise 工程，在效果器列表中即可找到 `ReWwire Sender`

   ![Wwise 效果器菜单中的 ReWwire Sender](/images/2026-10-19-rewwire/sender-menu.png)

此外，也可以按压缩包内说明手动安装：将 Authoring DLL 与 XML 文件复制到对应 Wwise 安装目录的 `Authoring/x64/Release/bin/Plugins` 下。

#### 游戏引擎

录制游戏内的声音，还需要将 Sender 接入游戏中。建议使用动态加载，省去静态库链接和插件注册代码，下面按这种方式介绍 Unity 和 UE 的集成。

需要静态集成时，参考 [ReWwire Runtime 集成说明](https://github.com/zcyh147/ReWwire/blob/main/docs/release-packages.md#runtime-integration)。

**Unity**

- 在 Audiokinetic Launcher 的 `Unity` 页面找到工程，选择 `Modify Wwise in Project...`，更新插件文件
- 若手动安装，将 Runtime 版本的 `ReWwire_Sender.dll` 放入集成的 DSP 目录。Assets 形式的 Wwise Integration 路径为：

```text
<UnityProjectRoot>/Assets/Wwise/API/Runtime/Plugins/Windows/x86_64/DSP/
```

- DLL 的 `Profile`／`Release` 配置需与 Wwise 运行库匹配
- 在 Wwise 中添加 Sender 后，重新生成 Windows SoundBanks
- 确认打包后的游戏包含 Runtime DLL 和更新后的 SoundBanks，运行游戏并通过 REAPER 试录

**Unreal Engine**

- 在 Audiokinetic Launcher 的 `Unreal Engine` 页面找到工程，选择 `Modify Wwise in Project...`，更新插件文件
- 确认 Runtime DLL 已进入 Wwise Integration 对应平台与配置的 `bin` 目录，例如 Wwise 2024.1 的目录结构为：

```text
<UnrealProjectRoot>/Plugins/WwiseSoundEngine/ThirdParty/<Platform>/<Configuration>/bin/ReWwire_Sender.dll
```

- 在 Wwise 中添加 Sender 后，重新生成 Windows SoundBanks
- 确认打包后的游戏包含 Runtime DLL 和更新后的 SoundBanks，运行游戏并通过 REAPER 试录

### 配置插件

Sender 的 Channel ID 与 Receiver 的 Bus ID 需要设置为相同编号。以同时录制音乐、音效、对白三条 Bus 为例，两端需按下表设置：

| Wwise Bus | Sender Channel ID | DAW Track | Receiver Bus ID |
| --------- | ----------------- | --------- | -------------------- |
| 音乐        | 1                 | 音乐        | 1                    |
| 音效        | 2                 | 音效        | 2                    |
| 对白        | 3                 | 对白        | 3                    |

#### 设置 ID

在 Wwise 的三个 Bus 上分别插入 `ReWwire Sender`，并在 REAPER 中建立三条轨道、分别插入 `ReWwire Receiver`。

- 在 Sender 的 `Effect` 中找到 `Channel ID (Static)`，设置 Sender ID

   ![Sender 的 Channel ID 设置](/images/2026-10-19-rewwire/sender-id.png)

- 在 Receiver 界面上的 `Bus ID` 设为相同 ID

   ![Receiver 的 Bus ID 设置](/images/2026-10-19-rewwire/receiver-id.png)

#### 设置 DAW 轨道声道格式

**插件编号与轨道声道配置需要分别对应。** 编号决定接收哪一路 Bus，声道配置决定怎样容纳这一路音频。

Receiver 最多同时显示和输出 16 个声道，对于常规多声道（如 5.1、7.1），直接将 REAPER 接收轨道的 Track Channels 改为相同声道数即可。

由于 REAPER 的轨道声道数只能设为偶数，ReWwire 针对 REAPER 中明确支持的几种奇数配置做了偶数槽位适配：

- **Mono / Center、LFE**：1 声道，使用 2 个槽位
- **2.1、3.0（LCR）**：3 声道，使用 4 个槽位；LCR 仍保持原布局，不会变成 Quad
- **二阶 Ambisonics（2OA）**：9 声道，使用 10 个槽位
- **Auro 10.1**：11 声道，使用 12 个槽位

多出来的最后一个槽位仅作为静音占位（`PAD`），没有扬声器身份。

#### 选择传输模式

ReWwire Receiver 的 **Bridge Mode** 提供两种传输模式：

- `Stable recording`：用于分轨录制，通过内部缓冲维持多轨音频的连续性，代价是一定的传输延迟。
- `Synchronized monitor`：用于低延迟监听和表头分析，目前仅支持 REAPER。数据不足时允许跳过缺失内容，以保持共同参考同步

可以在播放时选择新模式，但需要停止 REAPER 的播放和录音后才会生效，暂停（Pause）不算停止。Wwise 可以继续播放，切换准备期间可能短暂静音。

### 开始录制

以 REAPER 为例：

1. 确认 Receiver 使用 `Stable recording`，并按前文设置接收轨道的 `Track channels`
2. 点击各接收轨道的 `Record Arm` 按钮，使轨道进入录音待命状态。右键点击该按钮，在 `Record: output` 子菜单中选择输出录音模式：立体声选择 `Record: output (stereo)`，多声道选择 `Record: output (multichannel)`
3. 点击 REAPER 的 `Record` 按钮开始录音，再在 Wwise 或游戏中触发声音。也可以先在 Wwise 或游戏中播放声音，再开始录音。
4. 录制完成后点击 `Stop`，保留录音文件，即可回放各条分轨

## 用例

### 录制 Wwise Bus 分轨

将同一次运行中的音乐、音效、对白分别录下，便于后续独听、回放和混音对比。

### 把 REAPER 当作多路混音表头与分析器

利用 `Synchronized monitor` 模式，可以把 REAPER 当成 Wwise 的外挂表头检测工具。

在各条接收轨的 Receiver 后面挂上平时常用的响度表、频谱仪、相位表或动态分析效果链（FX Chain），就能一边在 Wwise 里播放和调整混音，一边在 REAPER 里同时观察频谱、响度等数据。

### 建议：让 Agent 帮忙自动配置两端工程

配置 Bus ID、逐轨挂插件、设置声道映射和录音模式，是一组适合交给 Agent 的重复操作。提供工程路径和分轨目标后，可以让它检查现有配置，创建或复用对应轨道，并保存 REAPER 工程。

这次 WAG 的接入就结合了工程文件修改、WAAPI 查询核对，以及 REAPER 的 ReaScript 配置与保存。生成 RPP 只是其中一步，还需要打开工程，确认插件实际加载、参数和通道映射正确，再做一次短录。

下面是一份可按自己工程调整的提示词；其中的 FX Chain 名称替换为你已有的效果链，不需要时删掉该项即可：

```text
请帮我用 ReWwire 将 Wwise 中的 Music、SFX、Voice 三条 Bus 分别录进 REAPER。
Wwise Project：[路径]；Wwise Version：[版本]；REAPER Project：[现有工程路径或新建位置]。

在 Wwise 中，为这三条 Bus 添加或复用 Sender，设置不同的 Channel ID (Static)。在 REAPER 中建立或复用同名 Track，加载 Receiver，并将 Bus ID 设为对应的编号。保留已有工程内容，不要重复添加插件。
根据各 Bus 的实际 Channel Layout 设置 Track channels 和 Receiver 的 pin mapping，统一 Sample Rate，使用 Stable recording，选择对应声道数的 Record: output 选项，并开启 Record Arm。
在 Receiver 后加载我已有的 [FX Chain 名称]，用于表头分析。找不到 Bus、插件或 FX Chain 时，先向我确认。

完成后保存 RPP，检查两端配置是否对应，并告诉我打开哪个工程、如何开始录音。我会触发游戏声音进行试录。
```

## 参考

### 传输机制

ReWwire 使用本机共享内存作为跨进程音频缓冲：Wwise 端的 Sender 按音频块写入采样数据与声道布局，DAW 端的各个 Receiver 按编号读取对应数据流，并协调读取位置以保持各轨道的相对时间关系。

Receiver 底部状态栏中也显示有关数据：

* **Wwise / DAW samples**：分别代表 Wwise 发送端与 DAW 接收端当前的音频处理块大小（Block Size）
* **Bridge**：表示从 Sender 输入到 Receiver 输出之间的软件传输耗时观测（暂无有效读数时显示 `—`）

### 插件测试

围绕日常混音检查会遇到的情况，ReWwire 在开发过程中主要做了三类测试：

* **多轨同步与声道路由**：在五个 Wwise 覆盖版本上，用可区分 Bus 和声道的测试信号检查短录音内容、静音隔离和共同时间偏移；另外针对音频尾部，以及 REAPER 下核准奇数声道布局的 `PAD` 槽位映射设计专门检查
* **宿主生命周期与模式切换**：检查工程保存重开、编号换绑、宿主重启重连，以及在 REAPER 停止状态下切换 `Stable`／`Monitor` 模式后，音频与参考时钟能否正常恢复
* **实机场景与持续运行**：使用 Wwise Adventure Game（WAG，基于 Unity）完成了多轨短录检查；并且做了接近 24 小时的自然运行与试听，期间保持稳定

## 总结

ReWwire 要解决的问题很简单：把 Wwise 中的多条 Bus 同步录进 DAW，或者接入 REAPER 中，用熟悉的表头分析器分析数据，让回听对比和混音问题定位更轻松。

本插件的技术选型并非是唯一答案，另一种不错的方案是通过 Wwise 的 AK ASIO 插件与 ReaRoute 虚拟 ASIO 驱动，将音频路由到 REAPER，Dante Poggio 在他的 `Output_ChannelSelect` 插件中演示了这个方案。

在使用中遇到问题，欢迎在 [GitHub Issues](https://github.com/zcyh147/ReWwire/issues) 反馈，希望这个工具能帮大家省去混音检查时的折腾，更高效地打磨声音。
