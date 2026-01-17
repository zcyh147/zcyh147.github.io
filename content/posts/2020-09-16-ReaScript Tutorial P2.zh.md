---
title: 补完 REAPER 效率链的最后一环（二）使用 reapy
date: 2020-09-21T16:46:00+08:00
tags:
  - REAPER
aliases:
  - /2020/09/16/如何使用 ReaScript 进一步改善 Reaper 效率？（二）/
---
大家好，我是溪夜。
在《补完 REAPER 效率链的最后一环（一）ReaScript 基础》中，我们分析了如何使用 Lua 编写脚本的全过程。并通过一个实例，**把从抽象逻辑到最终的 GUI 脚本程序这一条开发的流程完整的跑通了一遍。**
在此相信读者已经有了一定的脚本开发基础，哪怕还没动手学习，应该也对脚本开发的流程有了大概的认知。
本系列教程的第二篇中，会讨论一下如何用 reapy 在 REAPER 外部对 ReaScript API 进行调用。通过使用 reapy，我们**一方面能够获得更加 Python 的脚本开发体验。另一方面在某些需要用户避免接触 REAPER 而又需要其功能的场景下，可通过把脚本调用外置来解决这个需求。**

> 本系列文章阅读需要的前置知识：
> - 有一定的英文基础，能够看懂 ReaScript 文档。最好有在 Cockos 论坛上搜索答案的能力。
> - 有 Python 基础，会配置相应的开发环境，了解 PySimpleGUI 使用。
> - 对 REAPER 的功能比较了解。

## 缘起：对暴雪声音设计师工作流的思考
### 1.1. Wwise Tour 2016 - Blizzard Overwatch
在 Wwise Tour 2016 中，守望先锋的开发者分享了关于音频设计的内容。
当他们演示 TED 引擎时，通过按住 Record 按钮录制语音，引擎就自动完成了一系列调用。其所执行的步骤大概是是完成录音、调用 REAPER 进行处理、调用 LMB（现在的 AMB）进行响度处理、调用 Wwise 生成 WEM 等。要知道去年我对这种自动化流程还不太熟悉，这种流畅的工作流让我印象非常深刻。
### 1.2. 我的思索
他们调用 REAPER 的方法我非常感兴趣，因当时知识有限，不知还有命令行的用法（REAPER、LMB、Wwise 都支持 Command Line），所以甚至想到了会不是走 Win32 API 调用 REAPER 时做到隐藏页面再调 ReaScript API 来做到的……
因为去年只会 Python，就想着怎么用它来玩 ReaScript，所以**在探索过程中找到了 reapy**，发现它大大增加了 Python 程序员使用 ReaScript 时的易用性。
**这段探索故事的结尾，正是本篇文章的来源。**
## 为什么要用 reapy？
### 2.1. ReaScript 支持的三种脚本语言对比
在上篇文章中我们提到，除了支持 C/C++，**ReaScript 支持的三门脚本语言分别是自有的 EEL、Lua 及 Python。**
对于使用 Python 来进行 ReaScript 开发来说，除了会性能略差于 EEL 和 Lua，使用 Tkinter 这种 GUI 框架也容易出现问题（尤其是 macOS 中）。但我们也知道，**Python 有着海量的第三方资源，reapy 正是我挖掘到的一个很棒的 ReaScript Wrapper。**
首先我们来看看这三种脚本语言的 API 调用名称，它们是略有区别的，拿测试 API 连通性的 `APITest()` 举例：
```lua
EEL2:
APITest();

Lua:
reaper.APITest()

Python:
RPR_APITest()
```
可以发现，只有 EEL 保持了最简略的 API 调用名称。而 Lua 需要加入 `reaper.` 的前缀（当然，对于 Lua 我们可以通过加入一行 `local r = reaper` 让脚本写法变成 `r.APITest()`，**这也是 Moy 老师文章中所提到的小技巧，与 Python 的 as 重命名同理**）。
但是对于 Python 的 API 而言，这个 RPR_ 的讨厌前缀就很难在使用时去掉了。而这篇文章所介绍的 reapy 却可以轻松去掉这个前缀，这只是它的一个小优点。
### 2.2. reapy 的优势
就像上面提到的，使用 reapy 可以让 Python 调用 ReaScript 变的更为简单，因为它有这些优势：
1. **API 调用名称更简单，ReaScript 中毫无用处的 RPR_ 前缀被去掉了，**而且对 ReaScript 进行了优雅且 Pythonic 的装饰。同样的调用控制台输出消息功能，以前需要使用 `RPR_ShowConsoleMsg("Hello world!")`，现在只需一句 `reapy.print("Hello world!")` 即可做到。更加简单，也更加的面向对象。
2. **在 REAPER 内外均可调用，并解决了在 REAPER 外调用 ReaScript 性能差的问题。**因为 ReaScript 通过外部 API 调用时会运行在 defer loop 当中，这会严重影响复杂脚本的性能。为此，reapy 提供了环境管理器 `reapy.inside_reaper` 来解决这个问题。
3. **更新及时**，另一个 ReaScript Python 装饰 beyond.Reaper 在 V27 后已经多年不更新，ReaPyLib 也是停更很久，而 reapy 在本文写作的上一个月还在持续更新。
4. **具有结构分类**，原始的 ReaScript API 就是一团乱麻，而 reapy 为其进行了逻辑完善的分类排布。
5. 外部调用会更稳定，因为 ReaScript 的设计原因，用 Python 在 REAPER 内部引用外部库会有或多或少的问题。

## 配置开发环境
老规矩，请大家自行参考这些优质文章配置相关开发环境。对于开发工具也并非强求，用自己喜欢的开发工具均可。
### 3.1. Windows 下配置
#### 安装 Anaconda
https://segmentfault.com/a/1190000022797661
#### 配置 Anaconda 
https://zhuanlan.zhihu.com/p/25198543
#### 配置 VS Code 开发环境
https://zhuanlan.zhihu.com/p/30324113
### 3.2. macOS 下配置
#### 安装 Anaconda
https://blog.csdn.net/lq_547762983/article/details/81003528
#### 配置 Anaconda 

#### 配置 VS Code开发环境
此两步可参考上面的链接，操作类似。
### 3.3. 在 REAPER 中配置 Python 的路径
**注意，reapy 声称能够帮助用户配置 REAPER 中的 Python 路径，所以可先执行 3.4. 中的提到的 `reapy.configure_reaper()`，如果配置未成功再按本段内容手工配置。**
在 REAPER 中想使用 Python 需要配置一些参数:
1. 打开 Options - Preferences 中的 ReaScript，在窗口中勾选 Enable Python to use with ReaScript，以打开 Python 支持。
2. 因为 REAPER 并不知道 Python 的所在，自动检测如果未检测出 Python，可能还需指定你的 Python 文件。

下面是在 Windows 和 macOS 的配置截图，供大家参考。其中使用的环境都是 Anaconda 中的 Python，直接安装的 Python 也可按照相同的方法指定环境路径并定位所需的 Python 文件。
![macOS 配置](/images/macOS%20%E9%85%8D%E7%BD%AE.png)
macOS 配置
![Windows 配置](/images/Windows%20%E9%85%8D%E7%BD%AE.png)
Windows 配置
#### 3.4. 安装 reapy 并测试
因为 conda-forge 中没有 reapy，所以 reapy 可以通过以下两种方式安装：
1. 没有 Conda 的话，直接执行 `pip install python-reapy` 在本地 pip 环境中安装 reapy。
2. 有 Conda 的话，同样执行上述命令，在 Conda 的 pip 环境中安装 reapy。

安装完毕之后，打开 REAPER，在终端中执行 `python -c "import reapy; reapy.configure_reaper()"`。这一步的目的是为了初始化 reapy，同时添加脚本 activate_reapy_server.py，它是 reapy 在 REAPER 外部使用的前提，会在外部调用的时候持续保持运行。
作为测试，在 REAPER 内外均可执行以下语句观察执行效果：
```python
import reapy
reapy.test_api()
```
![在内外同时执行](/images/%E5%9C%A8%E5%86%85%E5%A4%96%E5%90%8C%E6%97%B6%E6%89%A7%E8%A1%8C.png)
在 VS Code 和 REAPER 内分别执行同样的代码
我们会发现，都得到了一样的返回结果，这代表 reapy 已经配置成功：
![屏幕快照 2020-09-18 02.13.46](/images/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202020-09-18%2002.13.46.png)
测试结果
## reapy 解析
### 4.1. 开发理念
reapy 由 Roméo Després 开发，他现在是华纳音乐（法国）的数据分析师，也曾在 IRCAM 工作过。
reapy 的核心开发理念就是为了解决 ReaScript 在 Python 下糟糕的使用体验，比如毫不 Pythonic 的 API 设计，通过修饰完成了面向对象层的重设计。这也是目前唯一一个活跃的 Python 版 ReaScript 项目。
**对于普通用户而言，最直观的感受就是部分常用 API 变的简单易用了，**因为 API 经过装饰后的易用性变的非常好。而未经过处理的 API 的也可继续使用不带 RPR_ 前缀的原名进行调用，
对于不想费时间学习 EEL 或 Lua 的 Python 程序员来说，reapy 是个非常友善的切入点。
**当然，reapy 也有缺点。**因为现在都没开发到 V1.0 版本，所以只有主要的 API 完成了装饰，根据需求复杂程度可能还需混合使用新旧 API。
### 4.2. 简单实例
在 3.4. 小节中我们提到了测试 API 的用法，在原生的 Python 版 ReaScript 中的 `RPR_APITest()`，在 reapy 中只需写成 `reapy.test_api()` 即可。
大家还记得，上一篇文章中用脚本复刻了一条 Action 的功能 `Item edit: Move position of item under mouse to edit cursor`，这是之前的 Lua 版代码：
```lua
local r = reaper

r.Undo_BeginBlock()

item = r.BR_GetMouseCursorContext_Item()
cursor_pos = r.GetCursorPosition()
r.SetMediaItemInfo_Value(item, "D_POSITION", cursor_pos)

r.Undo_EndBlock()
```
如果用 Python 配合原生 ReaScript API 来写会是这样的：
```python
RPR_Undo_BeginBlock()

item = BR_GetMouseCursorContext_Item()
cursor_pos = RPR_GetCursorPosition()
RPR_SetMediaItemInfo_Value(item, "D_POSITION", cursor_pos)

RPR_Undo_EndBlock()
```
现在我们用 reapy 在 REAPER 内重写一遍代码，看看与之的版本有什么区别。当然，这段代码在 REAPER 外执行也是可以的，只是在外面执行时 `r.perform_action(40528)` 这句是没有意义的。
```python
import reapy as r
from reapy import reascript_api as rpr
# 获取当前工程
proj = r.Project()

# Undo Block 开始
proj.begin_undo_block()
# reapy 中使用第三方 API 有些问题（虽然老版文档说 reascript_api 中可用所有的第三方 API），所以这里使用 reapy 装饰后的 Main_OnCommand 执行 Action（Item: Select item under mouse cursor）以获取鼠标下的对象
r.perform_action(40528)

# 获取鼠标下的对象并对返回值加以处理为 str，给 SetMediaItemInfo_Value 的参数做好准备。
item = str(proj.get_selected_item(0))
item = eval(item.strip('Item()'))
# 获取当前游标位置
cursor_pos = proj.cursor_position

# 以前的 API 也可在 reascript_api 直接引用，目前 reapy 还没加入 item.set_info_value(param_name, param_value)语法，所以这步略显麻烦
rpr.SetMediaItemInfo_Value(item, "D_POSITION", cursor_pos)

# Undo Block 结束
proj.end_undo_block()
```
从这段重写的代码中可看出：
1. 大多数 API 都被装饰过了，调用起来更符合 Python 的风格，也更加面向对象。
2. 对于没装饰的 API，也提供了去除恼人前缀的调用方式。

对于一个还在持续开发中的第三方库来说，我还是非常期待它做到 V1.0 能做到多么完善。但即使是如此，现在的使用体验也很不错。
### 4.3. reapy 文档的阅读方法 - Translation Table
**ReaScript 的文档非常杂乱无章，**很多时候只能靠搜索碰运气，所以第一篇文中我们提到了优化版文档以供大家更快的查询所需 API。而对于 reapy，它也有一套自己的文档。
地址：https://python-reapy.readthedocs.io/en/latest/api_table.html
![reapy 文档](/images/reapy%20%E6%96%87%E6%A1%A3.png)

**在文档左边可以看到入门指南的 Api guide、安装指南、模块索引等章节，通常查询 API 需要面对的章节就是我给出的 Translation Table。**
reapy 的 API 分类是根据 Mespotine 的 ReaScript API 分类而定，不过可惜 Mespotine 的 API 分类原网页已经失效。
往下翻，我们会看到 API 中存在对应关系，**右边的列代表了 reapy 中的装饰 API**，而左边代表 ReaScript 中的原 API。
![文档实例2](/images/%E6%96%87%E6%A1%A3%E5%AE%9E%E4%BE%8B2.png)

使用 reapy 来开发脚本，在 Translation Table 中应优先使用 reapy 版的 API 以获得更好的 Python 编程体验。
目前的 reapy 还没有完成全部的 API 装饰，不过绝大多数常用的都已完成。其中的函数有两种简单用法：
1. 已经具有 reapy 装饰的，执行 `reapy.function_name()`。当然，也可以重命名 reapy 后执行如 `r.function_name()` 这样的语句。
2. 还没有 reapy 装饰的，可执行 `from reapy import reascript_api` 以从 reascript_api 中导入子模块后再使用。因为此子模块名字较长，可根据自己的喜好重命名，比如命名为 rpr，那么函数的调用就是 `rpr.raw_function_name()`。

### 4.4. reapy 文档的阅读方法 - Module Index
**此外，reapy 的设计重点是让 ReaScript 更加的 Pythonic，**所以使用时会发现它存在一种分层级的 API 管理逻辑。比如当你对 audio 或 midi 类对象执行的操作时，可以直接从 Module Index 找到对应的对象看看它都封装了什么方法，之后直接对对象执行相应的方法即可，不必再像传统的 ReaScript 设计流程那样把 Get 出的对象反复的作为参数传递。
我目前的使用习惯是以 Translation Table 为主要 API 搜索页面，Module Index 则在对某一类对象进行操作时去参考它目前封装的功能。
![文档层级](/images/%E6%96%87%E6%A1%A3%E5%B1%82%E7%BA%A7.png)
文档中的 Module Index

下面通过实例看看这些层级的使用，我引用一些比较常用的 API 以供参考。
当执行 `import reapy`，会默认导入 reapy.core.reaper.reaper 内所有的函数，是常见工程级操作的顶层层级。**事实上 reapy 的层级位置在文档中是 reaper.core.reaper，所以以此开头的 audio、defer、midi、ui 等需通过 reapy.audio、reapy.midi 的方法来调用。**
```python
import reapy as r

# reapy 顶层封装的功能
r.print("Hello REAPER!") # 控制台输出
r.clear_console() # 清除控制台
r.perform_action(action_id) # 调用 Action
r.open_project(filepath) # 打开工程
r.get_reaper_version() # 获取 REAPER 版本
r.set_global_automation_mode(mode) # 设置全局 Automation 模式

# 一种常见用法，以轨道对象举例，首先要获取一个轨道对象，可通过名字或轨道编号获取
track = r.proj.tracks[num or name]
# 获取轨道对象后，就可对它执行 reapy.core.Track() 类中封装的所有方法了。对 Item 对象来说也是同理
track.GUID # 获取 GUID
track.add_item(start=0, end=None, length=0) # 添加 item 对象并返回它
track.delete() # 删除轨道
track.get_info_value(param_name) # 获取指定属性值
track.set_info_value(param_name, param_value) # 设置指定属性值
track.solo() # Solo 轨道
track.mute() # Mute 轨道

# 对 MIDI 对象进行各种操作
r.midi.get_active_editor() # 返回活动的 MIDI 编辑器
r.midi.get_input_names() # 获得所有 MIDI 输入通道名
r.midi.get_n_inputs() # 返回 MIDI 输入通道数
r.midi.reinit() # 重置所有 MIDI 设备

# 对包络线对象进行各种操作
r.Envelope.name() # 返回包络线名字
r.Envelope.get_value(time, raw=False) # 获取包络线指定时间点上的值
r.Envelope.n_points() # 获取包络线中的点位数
r.Envelope.add_item(position=0.0, length=1.0, pool=0) # 创建新的包络线对象
```
**reapy.tools，其中的 `inside_reaper()` 用于提高外部调用 ReaScript 时的性能。**因为 ReaScript 外部引用是运行在 defer loop 之中的，执行效率比 Native ReaScript 差很多，只有每秒不到60次的执行效率，在进行重复次数很多的操作时会有很大性能影响。
为了解决这个问题，需要使用 `reapy.tools.inside_reaper` 模块，它的功能是把这部分代码通过自带的服务器脚本放到 REAPER 内部环境执行，再把结果取回外部。
```python
import reapy as r

project = r.Project() # 获取当前工程对象

# 求1000次工程的 BPM，直接在外部调用需要半分钟以上
bpms = [project.bpm for _ in range(1000)]

# 使用 inside_reaper() 后命令会从内部运行这段代码，只需0.1秒
with r.inside_reaper():
     bpms = [project.bpm for _ in range(1000)]
```
`reapy.config` 内定义了有关 reapy 开关和 Web 接口的内容，普通用户可以不用在意。
`reapy.errors` 包括各种报错信息，可与 Python 的异常处理语句合用。
## 实现一个简单的根据文件名导入 REAPER 的 GUI 程序
我们都知道，批量的文件处理（比如对于游戏语音对白）所需的导入文件，均匀设置对象间隔及按区域导出这些功能对于 REAPER 来说是非常简单就能做到的。
为了演示 reapy 在外部的完整运行效果，**假设一个需求，使用 ReaScript 导入文件，并能够要根据需求设定不同的属性值及效果器。**通过让录音师进行规范的命名，在导入 REAPER 的时候可以轻松做到这件事。**在这里设定文件名的格式为 `<ItemName>_<Volume>_<FX>.wav`**
- 注意：出于篇幅限制，只在示例文件名中定义一个属性和一个效果器，有更多的需求只需扩展代码即可。对于直接引入效果器链的方法不加以讨论，有兴趣的朋友可以自行改写 ReaPack 中的脚本 `mpl_Add FXChain to selected track`，将其从文件浏览器中选择效果器链的方法改成引入用户指定的效果器链文件名即可。

### 5.1. 抽象功能逻辑
为了演示，首先建立两个示例文件：
`Player_Heavy_Hit_12_-3_ReaEQ.wav`
`UI_Bright_Button_01_-5_ReaDelay.wav`
音效文件的命名对于下划线使用的非常广泛，这里假设在已有文件名的最后加入两个下划线后缀，分别指定为音量与效果器的属性。
于是我们抽象出功能逻辑：
1. 使用 Python 读取文件名中的信息，并且暂存到容器中
2. 使用 REAPER 在当前工程中插入新轨道
3. 对轨道设置属性
4. 对轨道设置 FX

### 5.2. 选用 API
1. 使用 Python 读取文件名中的信息，并且暂存到容器中：略
2. 使用 REAPER 在当前工程中插入新轨道：InsertMedia()
3. 对轨道设置属性：set_info_value()
4. 对轨道设置 FX：add_fx()

### 5.3. 实现功能代码
使用 Python 读取文件名中的信息，暂存到一个提取好信息的字典中，并把所有字典放进一个列表中方便管理：
```python
import os
dict_list = []

# 对每一个文件进行参数获取，并存为一个字典
def get_dict(input_path):
    # 源文件名，如 `UI_Bright_Button_01_-5_C1.wav`
    raw_file_name = input_path.split(os.sep)[-1]
    # 指定音量
    volume = raw_file_name.split("_")[-2]
    # 指定效果器链
    fx = raw_file_name.split(".")[0].split("_")[-1]
    # 原文件名中的完整文件名，如 `UI_Bright_Button_01.wav`
    new_file_name = raw_file_name.rsplit('_', 2)[0] + "." + input_path.split(".")[-1]
    # 参数字典
    info_dict = {"path": input_path, "new_file_name": new_file_name, "volume": volume, "fx": fx}
    dict_list.append(info_dict)

# 对文件夹内所有 wav 文件执行操作，并调用 get_dict() 函数提取信息
def get_file(input_folder):
    file_end = []
    if os.path.isdir(input_folder):
        for file in os.listdir(input_folder):
            file_end.append(os.path.splitext(file)[-1])
            if file.endswith('.wav'):
                get_dict(input_folder + os.sep + file)
        insert_media(dict_list)
        if '.wav' in file_end:
            sg.popup('Processing Complete.')
        else:
            sg.popup('No wave file be found!')
    else:
        sg.popup('Check your input!')
```
从该文件夹的字典列表分别读出每个文件的属性，准备对对应的属性进行设置
```python
import reapy
from reapy import reascript_api as rpr

def insert_media(dict_list):
    # 获取当前工程
    proj = reapy.Project()
    
    for dict in dict_list:
        # 从列表中的每个字典里读取相应数据
        path = dict["path"]
        new_file_name = dict["new_file_name"]
        volume = dict["volume"]
        fx = dict["fx"]
        
        # 插入媒体到新轨道
        rpr.InsertMedia(path, 1)
        
        # 获取轨道对象
        num = proj.n_tracks - 1
        track = proj.tracks[num]
        
        # 设置轨道名，音量（含分贝换算及取小数），增加效果器
        track.name = new_file_name.split(".")[0]
        track.set_info_value("D_VOL", round((10 ** (int(volume) / 20)), 2))
        track.add_fx(fx)
```
设置 Render Matrix 并自动导出文件：
略，如感兴趣可参考 X-Raym 的 ReaScripts: Render Region Matrix Pack，他的脚本是图形界面中键鼠选取对象后再执行的，想在纯代码层面实现只需把这个多轨选择做到 API 里就行了。
### 5.4. 实现 GUI 代码
这里做一个最简单的文件夹选择器，并通过 popup 窗口以显示成功及报错信息。
```python
import PySimpleGUI as sg

def gui():
    layout = [  [sg.Text('Browse Folders')],
                [sg.Input(), sg.FolderBrowse('Browse', key='folder')],
                [sg.Button('Import'), sg.Button('Cancel')] ]
    
    window = sg.Window('Reaper Importer', layout)
    
    while True:
        event, values = window.read()
        if event in (None, 'Cancel'): 
            break
        if event == 'Import':
            if values['folder']:
                get_file(values['folder'])
                sg.popup('Done!')
            else:
                sg.popup('Choose some folder first!')
    
    window.close()
```
### 5.5. 连接 GUI 代码与功能代码
为了节省篇幅，函数体省略。因为这个程序比较简单，所以可不通过 `inside_reaper()` 改善性能。
```python
import os
import PySimpleGUI as sg
import reapy
from reapy import reascript_api as rpr
dict_list = []

def get_file(input_folder):
    Function body

def get_dict(input_path):
    Function body
    
def insert_media(list):
    Function body

def gui():
    Function body

def main():    
    gui()

if __name__ == '__main__':
    main()
```
### 5.6. 运行结果
建立一个新的工程并执行程序，可看到程序窗口已打开。
![执行前](/images/%E6%89%A7%E8%A1%8C%E5%89%8D.png)
执行前
接下来浏览到测试文件的文件夹，并点击 Import。发现文件已经自动被导入（这两个文件是粘贴自同一文件，所以波形相同），并且已设置了音量（可见音量旋钮略往左）和挂载了设置的效果器。
![执行后](/images/%E6%89%A7%E8%A1%8C%E5%90%8E.png)
执行后
## 接下来讲什么？
目前的两篇文章已经把 ReaScript 大概过了一遍，读者看后应该已有足够的基础去开发自己的脚本了。因为我暂时不准备在 EEL 上投入时间，所以这部分暂时不会涉及。
接下来《补完 REAPER 效率链的最后一环》专栏会有以下几个更新方向：
1. 开发技巧补遗，关于 API 的选用和复杂的脚本设计技巧还有很多值得谈的部分。
2. 拆解优质脚本，与大家共同分析它们的代码。
3. 分享我的自制脚本。

如果大家有兴趣，欢迎持续关注！