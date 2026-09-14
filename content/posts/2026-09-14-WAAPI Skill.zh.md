---
title: "人人都能用 WAAPI（四）：waapi-skill"
date: 2026-09-14T00:00:00+08:00
tags:
  - "Audio Programming"
  - "Wwise"
  - "AI"
---
大家好，我是溪夜。

距离本系列的上一篇文章，已经过去六年了。当年想用 WAAPI 优化 Wwise 工作流，需要手动查文档、写代码，再反复测试。如今，这些工作都可以直接让 AI 帮忙了。

但直接让 AI 写 WAAPI 脚本，往往会在接口参数和版本差异上反复试错，同样的任务也不一定每次都能写对。

为了减少这些重复试错，我开发了 `waapi-skill`，把 WAAPI 的版本差异和调用规则封装起来，让 Agent 根据自然语言需求查询、修改工程，并检查执行结果。

这篇文章会介绍它的能力、安装方法和实际使用案例，也会分享开发中的测试与思考。

## 什么是 waapi-skill？
`waapi-skill` 是一个免费开源的 Agent Skill，让 Agent 能够读取和修改 Wwise 工程，以及订阅工程中的事件。

它支持 Windows 和 macOS 双平台，兼容 Wwise 2021.1—2025.1 五个版本，覆盖了市面大多数在运营项目所使用的 Wwise 版本。其中，2021.1—2023.1 的 WAAPI 接口已全部封装，2024.1 和 2025.1 的接口覆盖率约为 88%。

项目地址：[https://github.com/zcyh147/waapi-skill](https://github.com/zcyh147/waapi-skill)

它在 Agent 操作 Wwise 时提供了这些支持：
- **版本适配**：按 Wwise 版本提供接口封装层，减少 AI 试错
- **按需加载**：只读取任务需要的信息，减少上下文占用
- **修改预览**：执行前展示目标对象和修改内容，便于检查是否符合预期
- **结果检查**：对支持回读的操作，修改后自行读取工程，核对修改结果

## Skill 的能力
### 读取工程
Skill 为 Wwise 工程读取操作做了封装，主要包括：
- 当前 Wwise 版本、连接地址和工程路径
- 当前选中的对象、Bus 和默认 Work Unit
- 按精确路径、GUID、名称、类型和层级关系查找对象
- 对象的属性、引用、AudioSource、OutputBus 和其他关联信息
- 查询 Profiler 的 Game Object、Voice Contribution 和部分 Debug 数据

### 修改工程
Skill 也为 Wwise 工程修改提供了封装，主要包括：
- 创建、删除和重命名 Wwise 对象
- 修改属性、引用、平台链接和 RTPC
- 导入音频文件、创建层级和 Event
- 设置 Switch Container Assignment
- 管理 SoundBank Inclusion、生成 SoundBank 及相关转换任务
- 部分插件、Authoring UI Command，甚至 Lua 和 Debug 操作

修改默认会先预览、确认后再执行，也可切换为只读或允许修改模式，具体配置见下文“安装与配置”。

### 订阅事件
Skill 还封装了 WAAPI 的订阅能力，可用来订阅 Wwise 对象创建、Wwise 对象选择切换、SoundBank 生成等事件。当事件发生后，可执行用户指定的任务。具体支持监听哪些事件，可通过自然语言询问 Agent 来确定。

监听时，支持两种模式：
- 有倒计时的监听：普通监听默认只等待 10 秒，结束后会自动取消订阅
- 长时间监听：需要持续监听时，会进入长时模式，在连接存续期间订阅事件

### 接口覆盖与边界
WAAPI 没有暴露的能力，Skill 不会凭空创造，因此超过 WAAPI 能力的请求会被明确拒绝。

Skill 中的 WAAPI 接口封装情况如下（2024.1 和 2025.1 未封装的接口，主要用于布局自定义和开发，以及部分界面侧的 Lua 脚本入口等，对普通用户意义不大）：

| Wwise 版本 | WAAPI 接口总数 | 已封装接口数 | 未封装接口数 |
| -------- | ---------: | -----: | -----: |
| 2021.1   |        126 |    126 |      0 |
| 2022.1   |        144 |    144 |      0 |
| 2023.1   |        181 |    181 |      0 |
| 2024.1   |        204 |    179 |     25 |
| 2025.1   |        214 |    187 |     27 |

## 安装与配置
### 安装
要安装 `waapi-skill`：
- 最简单的安装方法，将 `https://github.com/zcyh147/waapi-skill` 发给 Agent，让它来安装即可
- 若熟悉 `npx skills`，可使用 `npx skills add zcyh147/waapi-skill --skill waapi-skill` 来手动安装（全局安装需加 `--global`）

Python 版本要求：Skill 内部使用独立 Python 虚拟环境，系统需安装 Python `3.11` 到 `3.13`。

### 首次运行
先在 Wwise 中打开目标工程，并启用 WAAPI 功能，方法为：
- 打开 `Project > User Preferences`，在 `Wwise Authoring API (WAAPI)` 区域勾选 `Enable Wwise Authoring API`
- 注意要核对 `WAMP port`，本地 WAMP 连接默认使用 8080 端口；如果改过端口，Skill 也需要使用相同设置

首次使用时，Skill 会自动准备专用的 Python 虚拟环境。新会话加载 Skill 时，Agent 会汇报当前的 WAAPI 端口、适配版本和工程修改策略；若需要更换连接地址或端口，可直接用自然语言提出要求。

Skill 支持三种工程修改策略，默认为 `ask_before_changes`，后续可按需切换：
- `read_only`：只读模式。可以查询工程和讨论修改方案，不会执行工程修改
- `ask_before_changes`：询问模式。先展示修改预览，说明将处理哪些对象、改变什么，再等待你确认后执行
- `allow_changes`：允许模式。对于你已经明确提出的修改请求，仍会生成预览并告知变更内容，但不需要再发一条确认消息，可以继续执行并检查结果

下面是首次加载 Skill、修改配置，以及查询当前 Wwise 工程连接状态的示例：

```text
用户：
/waapi-skill

Agent：
waapi-skill 已加载。当前配置的 WAAPI 端口是 8080，Wwise 适配版本是 2021.1。
当前项目修改策略是 ask_before_changes；可用模式为 read_only、ask_before_changes 和 allow_changes。
你想在 Wwise 中查询或修改什么？
```

```text
用户：
将 Wwise 适配版本改为 2024

Agent：
已将 Wwise 适配版本设置为 2024.1，其他配置保持不变。
```

```text
用户：
请检查当前运行 Wwise 的版本和工程名称，以确认连接正常

Agent：
连接正常。
- 运行版本：Wwise 2024.1.13，Build 9056
- 当前工程：SampleProject
- 工程路径：D:\Sample_Project\SampleProject.wproj
- 工程状态：已保存，无未提交修改
运行版本与配置的 2024.1 适配版本一致。
```

## 使用案例
下面通过四个案例，展示 Skill 如何处理不同任务：Snow 演示已有脚步系统的局部迭代，Weather 演示复杂需求的分步执行，Alarm 演示问题诊断与修复，Subscribe 演示事件监听。

测试环境为 Codex + GPT-5.6 Sol High，测试所用的 Wwise 工程版本为 2024.1。

### Snow：给脚步系统加入雪地素材
Wwise 工程中有一个 `Player_Footsteps` Switch Container，用于播放按材质切换的脚步声。本次需要加入四条雪地样本，创建 Random Container 后指派给 `Snow` Switch；随后移除 Switch Container 中旧的 `Mud` Switch 指派。

本例的工程修改策略使用 `allow_changes`，明确提出修改需求后，Agent 会生成预览并继续执行。

```text
用户：
使用 Wwise 2024.1，继续使用 allow_changes 模式。

我有一组雪地上的脚步声放在 Assets/Snow 里。请在 \Actor-Mixer Hierarchy\Default Work Unit\WAAPI Skill Integration V2\PlayerFootstepsMaintenance\Player_Footsteps 下新建 Snow Random Container，把四条素材依次导入为 Snow_Step_01 到 Snow_Step_04，然后把 Snow 分配给 \Switches\Default Work Unit\WAAPI_V2_Surface 里的 Snow Switch。

随后，帮我移除 Mud 容器当前的 Surface/Mud 指派。

Agent：
已完成 Wwise 2024.1 工程修改：

- 在 Player_Footsteps 下创建了 Snow Random Container。
- 依次导入并命名为 Snow_Step_01～Snow_Step_04。
- 导入请求已包含 Snow → WAAPI_V2_Surface/Snow 指派；对象与媒体回读校验全部通过，但该原生导入接口只能提供结果结构级验证。
- 已移除 Mud 容器的 WAAPI_V2_Surface/Mud 指派，并完成业务状态回读验证。
- Mud 容器和 Mud Switch 均未删除。
```

下图展示了 Snow 素材已加入脚步系统并完成 Switch 分配，Mud 指派已移除，Metal 和 Wood 指派保持不变。

![雪地脚步素材与 Switch 指派](/images/2026-09-14-waapi-skill/snow-switch-assignments.png)

### Weather：从五条素材搭建天气系统
这个案例希望搭建一个简单的天气系统，需求中提供了雨、风和雷声共计五条样本，并给出层级、音量、循环、播放实例数限制、Event、Action 参数和 RTPC 曲线要求。

本例的工程修改策略使用 `ask_before_changes`，每一批修改都需要确认后才会执行。

**提出需求，查看整体预览**

```text
用户：
帮我在 Wwise 里创建一个天气系统。音频文件在 Assets/Weather 中，包含雨、风、雷共五条声音。请在 \Actor-Mixer Hierarchy\Default Work Unit\IntegrationLab 下创建 Weather_Interactive Actor-Mixer，里面再建 Rain、Wind 两个 Actor-Mixer 和一个 Thunder Random Container。把五条音频作为 Sound SFX 导入对应容器，再在 \Events\Default Work Unit\Integration_Weather 下为每条声音建立一个 Play Event。

所有声音都设为无限循环，忽略父级对象的播放实例限制，输出到 \Master-Mixer Hierarchy\Default Work Unit\Master Audio Bus\Weather_Bus。Rain_Bed 和 Wind_Bed 的音量分别是 -4 dB、-6 dB，最大实例数均改为 2；三条雷声音量依次为 -2 dB、-8 dB、-14 dB，最大实例数均改为 1。

五个 Play Action 的 Fade Time / Delay 分别是：Rain 0.25 / 0 秒，Wind 0.4 / 0.1 秒，Thunder Near 0.05 / 0 秒，Mid 0.12 / 0.08 秒，Far 0.25 / 0.16 秒。

最后把 \Game Parameters\Ambience\Rain_Intensity 绑定到 Rain_Bed 的 Volume，曲线点是 (0,-48)、(50,-12)、(100,0)。

Agent：
第一阶段的可执行预览已生成，Wwise 工程尚未改动。预览将：

- 创建 Weather_Interactive，以及 Rain、Wind 和 Thunder 容器。
- 导入五条 Sound SFX，配置无限循环、实例限制、音量和 Weather_Bus。
- 创建 Play_Rain_Bed、Play_Wind_Bed、Play_Thunder_Near/Mid/Far 五个 Event。

确认执行并验证后，我会继续生成 Play Action 的 Fade/Delay 配置，以及 Rain_Intensity → Rain_Bed Volume RTPC 曲线的后续预览。

是否确认执行第一阶段？
```

Agent 将需求拆成三批：先建立层级并导入素材、创建 Event，再设置 Play Action 的 Fade/Delay，最后绑定 RTPC。第一批确认执行后，它才继续给出下一批预览。

**确认建立层级、导入素材和创建 Event**

```text
用户：
没问题，执行吧。

Agent：
第一阶段已执行并验证成功。

第二阶段预览已生成，尚未写入以下 Play Action 参数：

- Rain：Fade 0.25 秒，Delay 0 秒
- Wind：Fade 0.4 秒，Delay 0.1 秒
- Thunder Near：Fade 0.05 秒，Delay 0 秒
- Thunder Mid：Fade 0.12 秒，Delay 0.08 秒
- Thunder Far：Fade 0.25 秒，Delay 0.16 秒

确认执行这一阶段后，我会继续生成 Rain_Intensity → Rain_Bed Volume 曲线预览。是否执行？
```

**确认 Play Action 参数**

```text
用户：
没问题，执行吧。

Agent：
Play Action 参数已执行并验证成功。

最终 RTPC 预览已生成，尚未写入：

- 控制参数：Rain_Intensity
- 目标：Rain_Bed → Volume
- 曲线点：(0,-48)、(50,-12)、(100,0)
- 点间插值：Linear
- 若已有同一 RTPC，则更新；否则新增

是否确认执行并完成最终验证？
```

**确认 RTPC 曲线，完成天气系统**

```text
用户：
没问题，执行吧。

Agent：
天气系统已在当前 Wwise 2024.1 工程中完成，并全部通过读回验证：

- 创建 Weather_Interactive / Rain / Wind / Thunder 层级。
- 导入五条 Sound SFX。
- 循环、音量、实例限制及 Weather_Bus 输出均已配置。
- 创建并配置五个 Play Event 及其 Fade/Delay。
- Rain_Intensity → Rain_Bed Volume RTPC 已建立，使用三点 Linear 曲线：(0,-48)、(50,-12)、(100,0)。
```

下图展示了天气系统中的 Rain、Wind、Thunder 层级，以及五条声音的音量设置。

![天气系统层级与音量设置](/images/2026-09-14-waapi-skill/weather-hierarchy.png)

### Alarm：排查报警器为什么没有声音
这个案例演示如何排查 Event 不出声的问题，检查对象是 `Play_Generator_Alarm`。初始请求只描述症状，让 Agent 自行查找原因。

本例使用 `allow_changes` 模式，先诊断原因，再按明确提出的请求修改输出总线。

**诊断原因**

```text
用户：
帮我查一下 Wwise 中的 \Events\Default Work Unit\IntegrationLab\Alarm\Play_Generator_Alarm 为什么没有声音，看看是什么原因。

Agent：
原因已定位：Generator_Alarm 开启了输出覆盖，被路由到：
\Master-Mixer Hierarchy\Default Work Unit\Master Audio Bus\Diagnostic_Dead_Bus

该 Bus 音量为 -96 dB，实际等同静音，所以 Event 播放时听不到声音。
事件、Play Action、目标 Sound 和音频源 generator_alarm.wav 均存在且关联正常。此次只做了诊断，未修改 Wwise 工程；allow_changes 模式已保存。
```

**修复输出总线**

```text
用户：
好的，把它的 Bus 改成机械类音效 Bus SFX_Machinery 吧。

Agent：
已修改并验证成功：
Generator_Alarm 的 Output Bus 已从 Diagnostic_Dead_Bus 切换为 SFX_Machinery。

Wwise 工程目前有未保存改动，记得保存工程。
```

### Subscribe：监听对象选择变化
这里做一个简单演示：监听当前选中对象的变化，输出对象名和类型，收到 10 次变化后结束监听。

监听开始后，我在 Wwise 中切换选中的对象，Agent 随着收到的事件输出结果，最后汇总如下：

```text
用户：
请监听 Wwise 工程里当前选中对象的切换，监控 10 次。每次选中的对象改变时，流式输出当前选中的对象名和类型

Agent：
已完成 10 次选择变化监控：

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

已达到目标次数并成功取消订阅。
```

这个演示只记录选择变化。实际工作中，还可以尝试用订阅辅助检查手动修改：整理工程时，让 Agent 监听指定范围内的对象引用变化。

比如用户在 Wwise 界面中调整 Bus 设置，Skill 根据变化检查新的 Bus 及相关播放链路，提示是否存在静音总线或异常路由。这样可以一边整理工程，一边获得检查结果，不必每改一处就回到对话里询问。

## 最佳实践
### 把需求说具体
使用 Skill 时，建议尽可能具体：
- **处理什么对象**：尽量给出完整路径、素材目录或明确的对象范围，避免只说“把那些脚步声改一下”
- **希望得到什么结果**：说明层级、命名、参数和对应关系。需要改音量时，直接给出目标值；需要导入素材时，说明放到哪里、创建什么对象
- **哪些内容要保留**：例如只移除 Mud 的指派，保留容器和其他材质设置，避免把局部迭代变成整套重建
- **这次要查问题还是直接修改**：排查时可以先要求只读诊断，确认原因后再提出修复；多步修改则可以先看预览，再逐步确认

这些条件不一定每次都要写全，但与当前任务有关的部分，最好一次交代清楚。

### 先在小范围试用
第一次处理批量任务时，可以先选少量有代表性的对象，让 Agent 完成一轮，再检查命名、层级、参数和关联是否符合预期，确认后再扩大范围。

例如批量导入语音，可以先用几条包含不同语言和角色的素材试跑，检查目录、对象和 Event 的创建结果。涉及播放效果的修改，也先要试听，确认听感符合预期。

### 封装重复工作
自然语言适合临时查询和需求还在变化的任务。但复杂工作如果每次都要重新描述，就容易变成“用文字编程”，反复交代规则和等待 Agent 拆解也会浪费时间。

**重复出现的业务，可以先封装成业务 Skill。** `waapi-skill` 主要封装的是 API 层能力，它知道怎样查询和修改 Wwise 对象，但不知道你的业务规则。因此，我建议把重复出现的需求进一步封装，例如：
- **语音导入 Skill**：约定文件命名、语言与角色目录、对象和 Event 的创建规则，以及导入后要检查的内容
- **脚步声迭代 Skill**：约定素材与材质的对应关系、需要替换或保留的对象，以及迭代后的检查步骤

业务 Skill 负责记录业务规则，`waapi-skill` 负责完成具体操作。每次使用时，只需提供本次变化的素材、对象或参数，减少重复交代背景的成本。

**流程稳定以后，可以进一步做成脚本或 App。** `waapi-skill` 中的版本资料、参数约束和操作流程，也可以作为开发参考。以后通过固定入口完成工作，就不必每次都让大模型重新推理执行步骤。生成的工具也需要用实际任务检查效果。

## 它经过了哪些测试
为了验证 `waapi-skill` 的操作是否正确，以及 Agent 能否用它完成实际工作，我设计了三类自动化测试：
- **基础功能测试**：先在不启动 Wwise 的情况下，检查版本适配、参数校验、修改预览和错误处理等程序规则；再连接真实 Wwise 测试工程执行操作，读取对象、属性、引用和输出文件，核对结果
- **Agent 单项任务测试**：给全新、无记忆的 Agent 一个明确的自然语言需求，检查它能否正确选择和使用相关能力，并由测试程序核对结果
- **Agent 完整工作流测试**：由测试 Agent 按预先定义的任务和提示词，与全新、无记忆的被测 Agent 展开多轮对话，让它使用 Skill 完成跨 API 的复杂操作。测试 Agent 负责组织对话、运行测试，并核对执行过程和最终工程是否符合要求

我最看重第三类测试，因为它更接近用户实际使用 Skill 的过程：提出需求，再通过多轮对话完成工作。验收时也会对照完整需求检查工程。比如给脚步系统增加雪地素材，既要确认素材导入和 Switch 分配正确，也要检查原有其他材质的设置是否保持不变。

`waapi-skill` 已在 Windows 和 macOS 上通过全套测试。在开发和测试过程中，Codex 累计运行了近 1.2 万次 `waapi-skill`。

![Codex 中的 waapi-skill 使用统计](/images/2026-09-14-waapi-skill/codex-skill-runs.png)

## 为什么做成 Skill
关于为什么选择 Skill 而不是 MCP，是看中了 Skill 可以按需加载资料到上下文的方式，想试试能否用它完成这套工具封装。

此外社区虽然已有一些 Wwise MCP 项目，但普遍不支持较老的 Wwise 版本。例如 BilkentAudio/Wwise-MCP（[https://github.com/BilkentAudio/Wwise-MCP](https://github.com/BilkentAudio/Wwise-MCP)）和 dcc-mcp-wwise（[https://github.com/dcc-mcp/dcc-mcp-wwise](https://github.com/dcc-mcp/dcc-mcp-wwise)）仅支持 Wwise 2024.1+；mcp_wwise（[https://github.com/john-tennant-sjs/mcp_wwise](https://github.com/john-tennant-sjs/mcp_wwise)）则仅支持 2023.1.17 和 2025.1.3。我希望能照顾仍在使用 Wwise 2021.1、2022.1 的老项目，因此做了更全的版本覆盖。

写作期间，Wwise 官方也推出了 MCP 支持。如果项目未来能用上 Wwise 2026，可优先考虑官方 MCP，官方文档见（[https://www.audiokinetic.com/en/public-library/2026.1.3_9276/?source=Help&id=wwise_mcp](https://www.audiokinetic.com/en/public-library/2026.1.3_9276/?source=Help&id=wwise_mcp)）。

## 总结
**六年后再写这个系列，我关注的重点已经改变。当年希望大家理解 WAAPI、学会写脚本；现在更关心的是，能不能只说出需求，就让 Agent 自动、稳定地解决问题。**

对使用者来说，最重要的是 Agent 能否实现目标。至于调了哪个接口、不同版本的参数有什么差别，这些实现细节并不重要。waapi-skill 想做的，就是把这部分细节封装起来，成为 Agent 可以使用的一项能力。

如果使用中遇到任何问题，欢迎到 GitHub 提 Issue（[https://github.com/zcyh147/waapi-skill/issues](https://github.com/zcyh147/waapi-skill/issues)）。遇到错误时，附上 Wwise 版本、操作需求和报错信息，会更方便我排查。

希望它能帮大家少做些重复操作，把更多时间留给打磨声音。
