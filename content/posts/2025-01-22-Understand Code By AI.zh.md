---
title: 告别代码考古：技术音频源码的 AI 阅读实践
date: 2025-01-22T10:00:00+08:00
tags:
  - 音频编程
aliases:
  - /2025/01/22/Understand Code By AI/
---
大家好，我是溪夜。

在游戏技术音频开发中，阅读代码是一项不可避免的任务。当代码库达到一定规模后，无论代码质量高低，这个过程往往会变成一场耗时耗力的"考古式挖掘"——你是否也曾在数十个文件间反复跳转，最终却迷失在代码的迷宫中？

最近，我在代码理解工作流中引入了 AI，发现它像一位不知疲倦的"资深架构师"，能够快速梳理代码脉络、解释复杂逻辑。

本文以“如何高效阅读代码库”为切入点，分享我的实践方案，希望能够帮助大家告别“考古式”代码检索，把时间留给更重要的架构设计与逻辑实现。

## 术语
文中会用到这些术语：
- **RAG**：Retrieval-Augmented Generation，即检索增强生成
- **LLM**：Large Language Model，即大型语言模型
- **Vibe Coding**：即氛围编程。通过 Prompt 给 AI 描述需求，让 AI 自主编码的开发方式
- **Spec-Driven Coding**：即规范驱动开发。以规范作为约束的 AI 软件开发模式，通过结构化的规范文档，确保 AI 行为可控

## 开发中的反思
### 代码阅读的困境
游戏技术音频的开发日常，可粗略分为两部分：
- 离线工具：多为团队自研框架或从零开发，代码阅读问题相对较小
- 音频功能：需要理解 Wwise 引擎集成及游戏客户端的代码细节，才能确定音频系统的接入位置

对于后者，为解决一个需求，经常要重复"沟通=>查询=>尝试"三部曲多次，才能定位到所需的代码位置并最终实现逻辑。

### 传统方法的局限
从工程的视角来看，这件事可以抽象为：
- 问题：要实现的功能
- 答案：使用哪些 API 或算法、在哪里增改代码、确保不产生副作用

为了寻找答案，过去我们会通过阅读文档或源码的方式，一点点从代码中抽丝剥茧，但这样存在很多问题：
- **文档与代码脱节**：项目存在开发文档滞后或没有文档的情况，注释也是如此。不仅对理解没有帮助，甚至成为一种干扰
- **上下文缺失**：在 IDE 中使用 `Go to Definition` 虽然方便，但容易让人陷入细节，跳转次数太多后容易忘记上下文，只见树木不见森林
- **依赖关系复杂**：大型项目中，一个简单的 `Init()` 方法背后可能隐藏着复杂的单例初始化、事件绑定和资源加载，仅靠人脑"堆栈"很难完全记忆
- **破坏心流**：为了理清一个模块，需要在十几个文件间反复横跳，大脑被迫在不同逻辑片段间"上下文切换"，极易破坏心流

这些问题困扰着每一位游戏音频开发者，我非常喜欢 NotebookLM 在 X（Twitter）账号签名中的那句话：Think Smarter, Not Harder，因此一直在思考如何系统解决这个问题。
在 AI 时代，我们终于有了新选择。

## AI 时代的思路
### 直接 Vibe Coding？
Vibe Coding 这一概念出现后不久，我就开始了探索。
经过实践，Vibe Coding 在中小型项目中表现尚可，即使有些不达预期的地方，也可通过多轮 Prompt 调校代码质量。

但面对企业级游戏项目时，存在很多问题：
- **视野受限**：AI 只能看到上下文中的代码，即使通过 RAG 等方式压缩上下文，仍然只能在观察到的代码中做出决策。同时容易"忘记"业务边界，在细节上出错
- **验证困难**：游戏项目中的代码逻辑很复杂，很多时候难以在代码层做单元测试，AI 难以自主验证结果，导致 Vibe Coding 结果难以控制
- **缺乏规范**：人、AI、工具三者之间缺乏统一协议，工程中的开发规范、接口定义等背景信息也无从获取

Vibe Coding 的局限让我们意识到，单纯依赖 AI 的"自由发挥"并不够。那么，能否给 AI 加上"规则"？

### 再试试 Spec-Driven Coding
Spec-Driven Coding 是一种 AI 编程工程化的开发模式，它的原理是：
- Prompt 通过有层次、模板、约束的结构化文档保存，确保 AI 能够随时以"外挂知识"的形式掌握要求
- 上下文通过工具、接口、数据库动态注入
- 工作流可复用、可编排、可监控

即使面对大项目，它也能实现较好的效果。

但即便如此，仍存在一些问题：
- 这种开发模式需要提供结构化的文档，以便 AI 明确各类背景知识
- 若开发者对代码库了解有限，自然无法提供有效的规范文档，AI 只好继续自由探索，再次陷入不可控

这也佐证了一个观点：**AI 是认知放大器**。若对代码库认知不够，仅凭一些 Prompt，AI 也无法妙笔生花。
难道就没有别的办法了吗？难道只能回到传统的代码理解工作流吗？答案是：**有的**。

### 是时候使用 DeepWiki 了
DeepWiki 是一款代码理解工具，底层原理类似 Google NotebookLM，同样基于 RAG（关于 RAG 的简要介绍，可参考我的上一篇推文"打造高效游戏音频问答知识库"）。
它的核心逻辑是 **Codebase Awareness**（代码库感知），主要功能包括：
- **全库索引**：像 IDE 一样，先对整个 Repo 进行扫描，建立抽象语法树（AST）和引用关系图谱
- **语义理解**：理解代码的语义，知道代码模块之间的关联，而非仅进行文本匹配
- **引用溯源**（Source Grounding）：生成的解释中提供来源链接，可在引用的代码中随时溯源，确保每一句解释都有据可查

这就像为代码库配了一位 24 小时在线的"原作者"，它记得所有逻辑的来龙去脉，随叫随到。
除了理解代码细节外，DeepWiki 还可随时提供架构视角，让我们第一次有了在微观和宏观之间自由检视代码的能力。
根据从 DeepWiki 中获得的代码架构知识，还可以完善 Spec-Driven Coding 的规范文档，从而实现 AI 工具在研发中的正反馈循环。

## 使用案例
下面通过三个实际场景，展示 DeepWiki 如何辅助理解复杂代码逻辑。

### 案例一：`AkSpatialAudioVolume` 是如何把物理信息传递给 SoundEngine 的
Wwise 在 UE 集成中提供了 `AkSpatialAudioVolume` 组件，用于将场景物理信息传递给 SoundEngine。

**问题**：在 Wwise 空间音频系统中，`AkSpatialAudioVolume` 是 Wwise 与 UE 物理世界交互的重要组件，对于在 Editor 中已经布置好的一个 `AkSpatialAudioVolume`，游戏 Runtime 时它身上执行了哪些逻辑，将数据传递给 Wwise SoundEngine 底层 SDK 的整套流程中发生了哪些事情？

**结果**：
- DeepWiki 详细展示了从 `AkSpatialAudioVolume` 的三个子组件开始，经过一系列流程，最终传递至底层 `AK::SpatialAudio` API 的完整过程
- AI 生成的流程图清晰展示了整个调用链：

![](/images/Pasted%20image%2020260123014902.png)

![](/images/Pasted%20image%2020260123015000.png)

### 案例二：Wwise 资产被创建为 UAsset 的全套流程
Wwise Unreal Integration 中会自动生成 UAsset，想了解这个资产创建时的来龙去脉。

**问题**：在 Wwise Browser 中点击 Reconcile 按钮后，经历了哪些步骤，才能把 Wwise 中一个新建的 Event 资产创建为 UAsset

**结果**：
DeepWiki 从 Wwise Browser 中按钮被按下开始，一路追踪到 `UEditorLoadingAndSavingUtils::SavePackages` 这个 UE 底层的资产保存接口，完整展示了整个流程：
``` md
在 Wwise Browser 中点击 Reconcile 按钮后，会经历以下步骤来创建新的 Event UAsset：

## 1. 点击 Reconcile 按钮并检查前置条件
点击按钮后，会触发 `OnReconcileClicked` 方法，首先检查 SoundBanks 是否已生成。如果未生成，会提示用户先生成 SoundBanks。 [0-cite-0](#0-cite-0) 

## 2. 创建 Reconcile 窗口
通过 `CreateReconcileTab` 方法获取选中的项目（如果没有选择则选择所有根项目）。 [0-cite-1](#0-cite-1) 

## 3. 转换为 Reconcile 项目并获取 Wwise 引用
调用 `ConvertWwiseItemTypeToReconcileItem` 将选中的 Wwise 树项目转换为 Reconcile 项目。 [0-cite-2](#0-cite-2) 
在转换过程中，会通过 `GetAllWwiseRefs` 从 ProjectDatabase 获取所有 Wwise 引用（GUID 映射）。 [0-cite-3](#0-cite-3) 

## 4. 分析需要执行的操作
通过 `GetAssetChanges` 方法分析哪些资产需要创建、更新、删除或重命名。对于新建的 Event（在 Wwise 中存在但 UAsset 不存在），会被添加到 `AssetsToCreate` 列表中。 [0-cite-4](#0-cite-4) 
判断是否需要创建的逻辑：如果 `WwiseAnyRef` 有效但 `Asset` 无效，则需要创建。 [0-cite-5](#0-cite-5) 

## 5. 显示 Reconcile 窗口
创建并显示 `SWwiseReconcile` 模态窗口，列出所有需要处理的项目。 [0-cite-6](#0-cite-6) 

## 6. 用户确认执行 Reconcile
用户在窗口中点击 "Reconcile Unreal Assets" 按钮，触发实际的 Reconcile 操作。 [0-cite-7](#0-cite-7) 

## 7. 执行资产创建流程
`ReconcileAssets` 方法会依次执行删除、更新、重命名和创建操作。对于新建 Event，会调用 `CreateAssets` 方法。 [0-cite-8](#0-cite-8) 

## 8. 创建具体的 Event UAsset
在 `CreateAssets` 中，会遍历 `AssetsToCreate` 列表。对于每个 Event：
- 通过 `GetAssetDefaultName` 获取资产名称 [0-cite-9](#0-cite-9) 
- 通过 `GetAssetPackagePath` 获取资产包路径 [0-cite-10](#0-cite-10) 
- 通过 `GetUClassFromWwiseRefType` 确定资产类型。对于 Event，返回 `UAkAudioEvent::StaticClass()` [0-cite-11](#0-cite-11) 
- 使用 `AssetToolsModule->Get().CreateAsset()` 创建新的 UAkAudioEvent 对象 [0-cite-12](#0-cite-12) 

## 9. 填充 Wwise 元数据
调用 `FillInfo` 方法将 Wwise 的 GUID、ShortID 和名称填充到新创建的 UAsset 中。 [0-cite-13](#0-cite-13) 
`FillInfo` 的实现会从 `WwiseAnyRef` 提取元数据并存储到 `WwiseObjectInfo` 结构中。 [0-cite-14](#0-cite-14) 

## 10. 保存资产
最后调用 `UEditorLoadingAndSavingUtils::SavePackages` 保存所有新创建的资产到磁盘。 [0-cite-15](#0-cite-15) 

## Notes
- 整个流程依赖于 SoundBanks 的元数据（JSON 文件），这些元数据通过 `FWwiseProjectDatabase` 加载
- 资产的默认创建路径由 `UAkSettings::DefaultAssetCreationPath` 配置，会结合 Wwise 项目中的文件夹结构
- Event UAsset 的命名直接使用 Wwise 中的 Event 名称
- 所有新建资产都会通过 `PostLoad()` 方法进行初始化
- Reconcile 过程在主线程执行，会显示进度条（`FScopedSlowTask`）
```

![](/images/Pasted%20image%2020260121022718.png)

### 案例三：`Wwise-MCP` 中，`post_event()` 是如何从 MCP 协议一路向下被调用的
`Wwise-MCP` 是一个 Wwise MCP 协议开源项目，想要快速搞清楚它是如何从 MCP 协议一路实现 `post_event()` 的。

**问题**：以 `post_event` 接口为例，展示一下它从 MCP 入口到最终调用这个 WAAPI 的完整调用链

**结果**：
DeepWiki 清晰展示了这个 API 的工作流程，宏观上分为四个步骤：FastMCP 框架接到请求 => 调用类库中的 `post_event()` 接口 => 管理 Game Object 确保具备 Post Event 条件 => 最终 Post Event。

这个案例展示了 DeepWiki 的 **Codemap 模式**，它以树形结构展示代码自顶向下的调用链，并提供对应的代码锚点：

![](/images/Pasted%20image%2020260121020208.png)

## 搭建代码知识库
使用 DeepWiki 非常简单，只需四步：
1. 打开 DeepWiki（https://deepwiki.com），授权连接 GitHub 账号
2. 点击首页的 `Add repo`，选择要生成知识库的 Repo，支持公开库和私有库（前面的案例一、二，就是我将 Wwise UE 集成源码传到了私有库中作为知识库数据源）
![](/images/Pasted%20image%2020260123015139.png)
3. 系统会自动拉取代码并构建索引，后续代码更新后也会定期更新索引
4. 索引完成后，在主页即可开始对话
![](/images/Pasted%20image%2020260123015255.png)

## 补充说明
### DeepWiki 的优缺点
每个产品都有优缺点，DeepWiki 同样不例外。

**优点**：
- 免费
- 代码理解能力很强，即使是 Linux Kernel（https://github.com/torvalds/linux）这种千万级行数的代码库，仍能给出可信的回答

**缺点**：
- 为了能够被索引，需要将代码存储到 GitHub、公网 GitLab、公网 Bitbucket 等平台，内部代码难以保密
- 仅支持文本代码，对于游戏引擎中的二进制逻辑资产（如 UE Blueprint）无能为力

### 定制 DeepWiki 代码知识库的风格
在代码库创建 `.devin/wiki.json` 后，可以对代码知识库的范围、页面结构、页面内容等做出定制。
关于具体用法，可参考官方文档：https://docs.devin.ai/work-with-devin/deepwiki

### 如何为内部代码库建立知识库
内部代码库为了避免泄密，不可能传递给 DeepWiki 这类外部平台。
并且内部项目代码迭代频繁（通常还用了 Perforce 或 Subversion 等私有版本控制系统），再维护一份外部代码库做为检索数据源的成本极高。
有以下几种方法，可作为备选方案：
- **开源私有部署方案**：开源方案 `deepwiki-open`（https://github.com/AsyncFuncAI/deepwiki-open）实现了与 DeepWiki 类似的功能，部署项目并接入私有 LLM 后，即可在完全保密的情况下实现类似用例
- **商业私有部署方案**：Sourcegraph Cody 是一款 AI IDE，提供了类似 DeepWiki 的功能，支持企业内网部署
- **AI IDE**：以 Windsurf 为例，它内置了 DeepWiki 和 Codemap，可对本地任意代码库进行检索，但其 DeepWiki 功能相对有限

### 如何本地化
有些人习惯阅读中文文档，以提高理解效率。
这里提供两个思路：
- **沉浸式翻译**：使用这款经典的双语翻译 Chrome 插件，可在网页内实现双语翻译
- **Zread**：下一小节提到的 Zread 界面和文档均为中文，且与 DeepWiki 高度相似，但从我个人体验来看不如 DeepWiki 好用

### 类似产品
这里列举一些类似产品，可作为 DeepWiki 之外的选择：
- **Zread**（免费）：智谱开发的 DeepWiki 国内版，基于 GLM 模型，提供中文界面及文档
- **Qoder**（付费）：Bright Zenith 开发的 AI IDE，内部提供了 Code Wiki 功能

## 总结
本文介绍了如何使用 DeepWiki 这一 AI 工具来高效理解复杂的代码库。
传统的代码阅读方式往往伴随着高认知负荷和低效的上下文切换，而 DeepWiki 通过**全库索引**和**语义理解**，解决了这一痛点：
- **宏观层面**：它能充当架构师，梳理模块关系和业务流程
- **微观层面**：它能充当导师，解释晦涩算法和潜在的副作用
- **协作层面**：它能充当无形的文档维护者，让团队知识不再随人员流动而丢失

工具的进化是为了释放人的创造力。作为技术音频设计师，我们不应该被困在代码迷宫中，而应该投入到真正重要的事情上——打磨音频系统，为玩家创造更好的听觉体验。