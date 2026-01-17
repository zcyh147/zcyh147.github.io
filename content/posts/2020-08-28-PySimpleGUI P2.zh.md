---
title: 写给声音设计师的 GUI 开发大法（二）进阶篇（第二版）
date: 2020-11-19T16:46:00+08:00
tags:
  - 音频编程
aliases:
  - /2020/08/28/PySimpleGUI 第二篇/
---
大家好，我是溪夜。
在《写给声音设计师的极速 GUI 开发大法（一）》中简单的讨论了 PySimpleGUI 作为一个快速且优雅的 GUI 框架的优点和基础使用方法，并且完成了一个实用的小程序。
在进阶篇中会讨论一些深入的内容，选择那些在程序中比较常用的控件元素进行讨论，这样能够方便大家更快的了解这个框架的优秀之处。
这系列的文章目的就是让声音设计师和技术音频设计师们能够更快速将自己的工具加上脚本，所以我会规避踩过的坑以分享一套完整的技术使用方案给大家。
**如同 PySimpleGUI 文档中的逻辑，我们鼓励大家使用现成的设计样例快速完成自己的程序，而不是挣扎于费劲的 GUI 代码设计。**
在文章的最后，我们通过一个设计样例把这些东西串起来，看一下实际的使用。

> 第二版更新内容：
> 1. 改进文字表述方面的细节。
> 2. 增加了更多的框架使用方法。
> 3. 修订了一些代码上的不严谨写法。

## PySimpleGUI 原理
### 1.1. 详解基础工作原理
回到第一篇的示例“小刘鸭之窗”，我为代码加上注释，以此系统解释一下 PySimpleGUI 的工作原理。
![PySimpleGUI](/images/PySimpleGUI-1.png)

```python
import PySimpleGUI as sg

# 指定主题，需以主题名称作为参数
sg.theme('Light Brown 11')   

# 构建窗体，PySimpleGUI 的窗体是一个二维列表（随复杂程度变化，也可更多维），其中的每个子列表代表布局中的一行元素（即控件），每个元素后的括号内的参数代表该元素的各种属性
layout = [  [sg.InputText(size=(30, None)), sg.Button(button_text='Ok', size=(10, 1))]  ]

# 将窗口标题与窗体 layout 作为参数传递给 sg.Window()。此时只创建了 Window 类的一个实例，并没有显示窗口
window = sg.Window('小刘鸭之窗', layout)

# 建立 Event Loop（为了保证窗口事件持续发生，One-Shot 类窗口也可无 Event Loop），在其中对 window 调用 read 方法。此时会显示窗口并读取 window 对象的返回值。因为只有 Button 类元素会触发事件（其他元素在属性中也可设置对点击产生事件响应），所以在本例中只有点击 OK 按钮的时候才会触发窗口的 read 方法
while True:
    # read 方法会在此阻塞循环继续运行，以在此等待用户触发事件
    event, values = window.read()
    
    # 当满足 if 循环的条件，如接收到窗口关闭时（event 为 None）会跳出循环
    if event == sg.WIN_CLOSED:
        break

    # 当 Ok 按钮被按下并触发事件，window.read() 读取的返回值 values 时才会在弹出窗口中显示用户输入值
    sg.popup('Input is ' + values[0])
    
# 跳出 Event Loop 后关闭窗体，close() 方法是窗口能退出的保证，防止程序出错或无法关闭
window.close()
```
通过这些代码能观察到 PySimpleGUI 的这些特性：
1. 窗体布局代码和参数指派非常清晰，可读性极好。
2. Event Loop 是在程序代码本身内的，用户具有更大的控制权。而 Tkinter 等则是接管了这部分，相对没那么自由。
3. 通过 `print` 打印出 `window.read()` 的返回值，会发现它是一个元组，例如 `('OK', {0: 'User Input'})`。**不难看出元组中第一个元素是触发了 `window.read()` 函数的组件的名称即 Event。第二个元素就是获得的返回值字典，**如果没有在元素属性中指定返回值的索引 `key`，它会默认从0开始索引，其对应的值也就是我们得到的用户输入值。

### 1.2. 元素（控件）的常见参数
每个元素的可设定属性需查文档以获得完整的资料，**但常见参数是元素之间通用的，这些也是在设计 UI 时常用到的部分。**
在这里我把常见属性罗列出来，以方便大家快速检索：
1. `'title', title=None, text=None`：标题或内容
2. `size=(None, None)`：尺寸大小
3. `font=None`：字体字号
4. `xxx_justification=None`：文字或元素的对齐方式
5. `enable_events=Bool`：是否触发事件
6. `key=None`：自定义触发事件后返回元组中的索引
7. `tooltip=None`：鼠标悬停时显示提示
8. `target=None`：将值传给指定元素

### 1.3. PySimpleGUI 版本区别
在 import 语句中使用不同的模块名，可以导入不同的 PySimpleGUI 版本。之所以有不同的版本区别，是因为 PySimpleGUI 可以通过代码调用不同的 GUI 库来实现最终的窗口。
以下是不同版本之间的区别：
1. **PySimpleGUI**：最常用的 Python 3 Tkinter 版，是第一个最完整的版本，建议用在 Python 3.7.3及之前最为稳定
2. **PySimpleGUI27**：已不受支持的 Python 2.7 Tkinter 版
3. **PySimpleGUIWx**：WxPython 版，GUI 三巨头之二。优点是相对 Qt 版来说，打包 exe 空间占用只有几 MB，且系统托盘功能支持完善。缺点是，并非所有的 Qt 控件都可用
4. **PySimpleGUIQt**：Qt 版，GUI 三巨头之三。是第二个完整版本，缺点是打包 exe 后空间较大，需要上百 MB。且虽然所有控件都可用，但功能不一定完善
5. **PySimpleGUIWeb**：Remi 版，即  Web 版。如果想要 PySimpleGUI 创建的程序跑在浏览器中，需要使用这个库。请注意这个模式下支持的元素类型有限，具体需参考（https://github.com/PySimpleGUI/PySimpleGUI/tree/master/PySimpleGUIWeb#what-works）

### 1.4. 简单的 Web 程序
PySimpleGUI 优雅的设计让跨平台变的很友好，而通过上面提到的 Remi 版还可轻易实现 Web 程序。**某些情况下，这对开发轻量的需要运行在手机或平板上的工具而言，无疑是一个很简单的方法。**
下面我们看实现效果。这里以第一篇文章结尾处的程序 *GUI Enemy No. 1* 为例，通过修改 `import` 语句并执行。**为了方便演示，这里只演示布局在浏览器中执行的效果，去掉了多余的功能代码。**
```python
import PySimpleGUIWeb as sg # 只修改此处

layout = [  [sg.Text('Browse Folders')],
            [sg.Input(), sg.FolderBrowse('Browse', key='folder')],
            [sg.Output(size=(70, 20), font=("宋体", 10))],
            [sg.Button('Cock it'), sg.Button('Cancel')] ]

window = sg.Window('GUI Enemy No. 1', layout)

while True:
    event, values = window.read()
    if event in (None, 'Cancel'):
        break
    if event == 'Cock it': 
        print('Work work!')

window.close()
```
执行效果：
![PySimpleGUI Remi](/images/PySimpleGUI%20Remi.png)

可以看到，在浏览器中弹出了相同的 GUI 布局，且在点击 Cock it 按钮的时候可正常输出字符串。点击 Cancel 也可关闭程序，再刷新后会发现本机此端口的 Web 程序已被关闭。
**但因为 Remi 版本 PySimpleGUI 不支持 FolderBrowse 元素，所以点击 Browse 时没有效果。**
## 一些较为复杂的布局实现
上篇文章结尾处的小程序虽然略有实用性，**但和日常使用的软件还差了太多**。
比如，如何实现菜单？如何让窗口内的布局和数据显示实现变化？如何实现多窗口？甚至实现多线程？？
为了解决这些疑惑，本小节要讨论一下如何实现现代软件设计中的必备的那些 UI 元素。
**既然是设计提高效率的工具，那在满足需求的前提下，交互设计也一定要富有效率的简洁。**
实际工作中我们把很多分散的功能集成在一起，以避免让用户频繁的在不同程序之间切换，此时如何通过本小节提到的元素进行功能集成就是必须要考虑的问题了。
### 2.1. 解决单行元素带来的布局限制
PySimpleGUI 的布局定义虽然基于二维列表，**但这不代表程序每行只能有一个元素（控件），这样的话 UI 设计会很死板。**当然，PySimpleGUI 的 GUI 设计哲学就是以行为单位设计元素，**如果你有天马行空的浮动布局构思，可使用 Qt 中的 QWidget，或者使用 Kivy 这类框架完成。**
在这里要引入 Container Element（容器元素）的概念，它的作用就是在容器内放入一段布局代码，从而实现跟布局中元素的复杂排布。
#### 2.1.1. 通过 Column 元素在布局中创建栏分割
**PySimpleGUI 中提供了一种元素来解决这种固定的单行模式，即 `Column`。**
观看执行截图，会发现左边的推子和右边的一堆文本输入框之间已经不再是对称的关系了。
```python
import PySimpleGUI as sg

# 定义一个 Column 元素，我们会发现它与普通的窗体定义形式一样，也是一个二维列表
col = [ [sg.Text('col Row 1'), sg.Input('col input 1')],
        [sg.Text('col Row 2'), sg.Input('col input 2')],
        [sg.Text('col Row 3'), sg.Input('col input 3')],
        [sg.Text('col Row 4'), sg.Input('col input 4')],
        [sg.Text('col Row 5'), sg.Input('col input 5')],
        [sg.Text('col Row 6'), sg.Input('col input 6')],
        [sg.Text('col Row 7'), sg.Input('col input 7')] ]

# 定义主窗体，第一行是一个 Slider 元素和我们刚定义好的 Column 元素，后两行分别为普通的文本框和按钮
layout = [  [sg.Slider(range=(1,100), default_value=10, orientation='v', size=(8,20)), sg.Column(col)],
            [sg.In('Last input')],
            [sg.OK()]  ]

# 显示窗体，并定义窗口关闭行为
window = sg.Window('第一行使用栏分隔符定义的窗口', layout)
event = window.read()
window.close()
```
执行效果：
![不对称布局1](/images/%E4%B8%8D%E5%AF%B9%E7%A7%B0%E5%B8%83%E5%B1%801.png)

虽然 `Slider` 元素和右边的一组元素中间没有显示出分割线，但可看出在布局层面上 `Slider` 和 `Column` 两者处于同一行，仍然遵循了 PySimpleGUI 的行布局结构。
#### 2.1.2. 通过 Frame 元素在布局中创建框架分割
`Frame` 元素是大家在软件使用中很常见的一种结构设计，通过外圈框住一部分布局，多用来划分程序之间不同的功能区域。
在 PySimpleGUI 中这也是一种实现复杂结构的方法，下面我们来看一段示例代码：
```python
import PySimpleGUI as sg

# 建立 Frame 内的结构（框架内的内容），仍是列表套列表的基本窗体结构。第一行为文本，第二行为两个复选框，在这里元素名称使用了缩写
frame_layout = [[sg.T('Frame text content')],
                [sg.CB('Check 1'), sg.CB('Check 2')]]
               
# 建立主窗体，第一行为 Frame 元素，可看到传入的第二个参数为刚创建的 Frame 内窗体结构 frame_layout。第二行为两个按钮
layout = [  [sg.Frame('Frame Title', frame_layout, font='Any 12', title_color='blue')],
            [sg.OK(), sg.Cancel()]  ]

# 显示窗体，并定义窗口关闭行为
window = sg.Window('Frame 元素示例', layout, font=("Helvetica", 12))
event = window.read()
window.close()
```
执行效果：
![不对称布局2](/images/%E4%B8%8D%E5%AF%B9%E7%A7%B0%E5%B8%83%E5%B1%802.png)

#### 2.1.3. Column 和 Frame 联用
下面看一段将上两段代码随便组合而成的布局，这两者可互相套用，以实现更复杂的布局结构。
```python
import PySimpleGUI as sg

# 创建三个 Column 元素的内容
col1 = [[sg.Text('col Row 1'), sg.Input('col input 1')],
        [sg.Text('col Row 2'), sg.Input('col input 2')],
        [sg.Text('col Row 3'), sg.Input('col input 3')],
        [sg.Text('col Row 4'), sg.Input('col input 4')],
        [sg.Text('col Row 5'), sg.Input('col input 5')],
        [sg.Text('col Row 6'), sg.Input('col input 6')],
        [sg.Text('col Row 7'), sg.Input('col input 7')]]
col2 = # 与 col1 相同，省略
col3 = # 与 col1 相同，省略

# 组装 Column 元素
colall1 = [ [sg.Slider(range=(1,100), default_value=10, orientation='v', size=(8,20)), sg.Column(col1)],
           [sg.In('Last input')],
           [sg.OK()] ]
colall2 = # 与 colall1 相同，省略
colall3 = # 与 colall1 相同，省略
               
# 构建布局，并把 Column 分别放到 Frame 元素当中
layout = [  [sg.Frame('Frame Title', colall1, font='Any 12', title_color='blue'), sg.Frame('Frame Title', colall2, font='Any 12', title_color='blue')],
            [sg.Slider(range=(1,100), default_value=10, orientation='v'), sg.OK(), sg.Cancel(), sg.Frame('Frame Title', colall3, font='Any 12', title_color='blue')]  ]

# 显示窗体，并定义窗口关闭行为
window = sg.Window('元素套用示例', layout, font=("Helvetica", 12))
event = window.read()
window.close()
```
执行结果：
![不对称布局3](/images/%E4%B8%8D%E5%AF%B9%E7%A7%B0%E5%B8%83%E5%B1%803.png)

### 2.2. 菜单栏
菜单栏几乎是每个现代软件的必备，哪怕看起来隐藏了菜单栏的软件，大多也通过设置类按钮或右键完成了应有的交互。除非做功能相对单一的工具程序，否则一定要考虑菜单栏。
**通常菜单的功能有：**
1. 打开新的窗口（文件浏览器、设置窗口、帮助文档等）
2. 执行主窗体中未列出的功能（使用频率比较低的功能）

下面我们看一下 PySimpleGUI 中简单的菜单实现，因为 `Menu` 元素在 macOS 下因冲突会有问题，这里在 Windows 下执行代码。
**为了添加乐趣，我模仿一下 Wwise 的菜单：**
```python
import PySimpleGUI as sg      

sg.theme('Dark Blue 3')

# 设定菜单的层级结构，仍然是多维列表的形式。其中&代表 Alt + 快捷键，可方便用户使用快捷键触发功能。分隔符代表菜单中的横线，用于分割菜单不同区域
menu_def = [['&Project'],      
            ['&Edit'],      
            ['&Views'],
            ['&Layouts', ['Designer', 'Profiler', 'SoundBank', 'Mixer', 'Schematic', 'Interactive Music', 'Voice Profiler', 'Game Object Profiler', 'Dynamic Dialogue', '---', 'Warn When Modifying Docked Layout', 'Reset Facroty Layouts...']],
            ['&Audio'],
            ['&Windows'],
            ['&Help', 'About...']]

# Output 元素用来占位，使窗口看得更清晰一些
layout = [  [sg.Menu(menu_def)],
            [sg.Output(size=(80, 30))]  ]      

window = sg.Window("Wwise-like Menu - Wwise 2019.2.4", layout)        

event, values = window.read()      
window.close()
```
执行结果：
![PySimpleGUI Menu](/images/PySimpleGUI%20Menu-3.png)

### 2.3. 多窗口
既然我们已经实现了菜单栏，现在就来看一下如何打开新的窗口。
PySimpleGUI 中的窗口实现基于 `sg.Window()` 创建的窗体实例，所以创建一个新窗口是非常简单的。而上面提到的两种不同的窗口设计方法区别，就在于第二个窗口出现时第一个窗口是否要被关闭或隐藏。
在实例中我们一切从简，在主窗口中放一个按钮，用来打开另一个窗口。**并设置两种条件，即第二个窗口打开时第一个窗口分是否会被关闭两种情况。**
```python
import PySimpleGUI as sg

sg.theme('Dark Blue 3')

# 定义三个窗口并封装在函数中，函数的返回值为创建窗口实例，第一个为主窗口
def window_main():
    layout = [  [sg.Button('Visible'), sg.Button('Invisible')],
                [sg.Output(size=(40, 20))]  ]
    return sg.Window('Main Window', layout, finalize=True)

# Keep Original 窗口，打开此窗口的话主窗口不会被关闭
def windows_keep():
    layout = [  [sg.Text('Keep Original')]  ]
    return sg.Window('Window 1', layout, finalize=True)

# Kill Original 窗口，打开此窗口的话会把主窗口关闭
def windows_kill():
    layout = [  [sg.Text('Kill Original')]  ]
    return sg.Window('Window 2', layout, finalize=True)

# 分别创建三个窗口的实例
window_main, window_1, window_2 = window_main(), None, None

while True:
    # 通过 read_all_windows 方法读取窗口、事件等
    window, event, values = sg.read_all_windows()
    # 设定判断条件决定窗口的存留，其中之所以给 window_2 设定跳出循环，是因为 window_2 时主窗口已经关闭，所以无需直接结束程序
    if event == sg.WIN_CLOSED:
        window.close()
        if window == window_1:
            window_1 = None
        elif window == window_2:
            break
        elif window == window_main:
            break
    elif event == 'Visible':
        window_1 = windows_keep()
    elif event == 'Invisible':
        window_2 = windows_kill()
        window_main.hide()
window.close()
```
执行结果：
![PySimpleGUI Multi](/images/PySimpleGUI%20Multi.png)

通过执行结果可看出，点击 Visible 后会显示窗口 Keep Original。点击 Invisible 则会关闭主窗口并显示出 Kill Original，这里就不截图了。
### 2.4. 改变当前布局内的内容
#### 2.4.1. 更新数据
更新数据即修改布局中已有元素的属性，以让其显示出不同的内容，在 PySimpleGUI 中只需对窗口使用简单的 `update` 方法即可完成。
```python
import PySimpleGUI as sg

sg.theme('Dark Blue 3')

# 构建布局，指定第一行第二个 Text 元素的 key 为 '-OUTPUT-'，第二行的 Input 文本框元素的 key 为 '-IN-'，以方便后面通过 update 方法更新数据时找到正确的元素对象
layout = [  [sg.Text('Data you just entered:'), sg.Text(key='-OUTPUT-', size=(20, 1))],
            [sg.Input(key='-IN-')],
            [sg.Button('Update')]  ]

window = sg.Window('Update Data', layout)

while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    # 当点击 Update 按钮后，通过对窗口检索 '-OUTPUT-' 索引以获得第一行第二个 Text 元素，并用 update 方法修改它的值为 '-IN-' 索引对应的 Input 文本框内的值
    if event == 'Update':
        window['-OUTPUT-'].update(values['-IN-'])

window.close()
```
执行结果：
![Before Update](/images/Before%20Update.png)
数据更新前
![After Update](/images/After%20Update.png)
数据更新后
#### 2.4.2. 更新布局
有时我们需要窗口中的布局发生变化，**比如当事件发生时，增减窗口内的按钮或复选框等元素**。
与上文中提到的更新数据不同，**更新数据是对已有控件的属性进行修改，而可变布局是在已有布局中创建新的或删除现有的元素，**
PySimpleGUI 并不支持对已经创建的窗口进行动态改变，但我们可以换个思路来实现。这也是开发者 Mike 的建议，直接创建一个新窗口以显示新布局，同时隐藏或关闭之前的老窗口。
**在例子中，当按下按钮 Change，会自动在当前布局最下方添加新的元素（从新窗口中体现）。**
```python
import PySimpleGUI as sg

sg.theme('Dark Blue 3')

# 构建 Frame 元素，放入一些元素作为初始布局
frame = [   [sg.T('Fantasy')],
            [sg.CB('Scaramouche'), sg.CB('Fandango')]   ]

# 定义主布局，并创建主窗口
layout = [  [sg.Frame('Original Layout', frame, title_color='blue')],
            [sg.Button('Change')]  ]
window = sg.Window('Layout Changer', layout, finalize=True)

while True:
    # 因涉及多窗口管理，需使用 read_all_windows 方法
    window, event, values = sg.read_all_windows()
    
    if event == sg.WIN_CLOSED: 
        break
    if event == 'Change':
        # 此处使用 window.hide() 隐藏窗口也可，取决于是否要关闭之前的窗口
        window.close()
        
        # 定义新窗口的布局，并生成新窗口
        frame_new = [   [sg.T('Reality')],
                        [sg.CB('Bismillah'), sg.CB('Beelzebub')]   ]
        layout_new = [  [sg.Frame('New Layout', frame_new, title_color='red')]  ]
        window_new = sg.Window('Layout New', layout_new, finalize=True)

window.close()
```
执行结果：
![Old_Layout](/images/Old_Layout.png)
主窗口
![New_Layout](/images/New_Layout.png)
新窗口
### 2.5. 指定接受信息的目标控件
在第一篇文章最后的根据声道数修改文件名的小程序中，我们构建了如下的布局：
```python
layout = [  [sg.Text('Browse Folders')],
            [sg.Input(), sg.FolderBrowse('Browse', key='folder')],
            [sg.Output(size=(70, 20), font=("宋体", 10))],
            [sg.Button('Cock it'), sg.Button('Cancel')] ]
```
如果还记得这个程序的执行效果，会发现 `FolderBrowse`（文件夹选择器）元素所选择的文件夹路径会自动填入左边的 `Input`（文本框）元素中。
但本着编程所需的严谨，我们应该思考**为什么会发生代码未指定，程序却自动帮用户把数据填入某个文本框了？**事实上这和 PySimpleGUI 的设计细节有关系，在这里不加以讨论。
如果对这类选择器元素有数据传输目标的设定，可以在属性中加上 `target` 参数。例如下例中，具有具有好几个文本框的情况下，`FolderBrowse` 只会把文件路径数据传入设定好的文本框内。
```python
import PySimpleGUI as sg

sg.theme('Dark Blue 3')

# 根据代码设置，FolderBrowse 获取的文件夹只会在第二个文本框中显示
layout = [  [sg.Text('Browse Folders')],
            [sg.FolderBrowse('Browse', target='input')],
            [sg.Input()],
            [sg.Input(key='input')],
            [sg.Input()]  ]

window = sg.Window('GUI Enemy No. 1', layout)

while True:
    event, values = window.read()
    if event in (None, 'Cancel'):
        break

window.close()
```
执行效果：
![PySimpleGUI Target](/images/PySimpleGUI%20Target.png)
点击 Browse 选择文件夹后，可见按 `target` 设置放入了指定的文本框中。
### 2.6. 简单的多线程
在做有点复杂的工具时，多线程是一个离不开的话题。
在之前的程序中，一切都是单线程的，一旦陷入死循环或者 PySimpleGUI 本身的阻塞窗口阅读逻辑中，程序就进行不下去了。如果我们需要获得同时进行的程序逻辑，就必须通过多线程来解决。
**PySimpleGUI 只能在主线程中运行，在进行多线程设计的时候要注意这一点。**
在下面的程序中，我们让多线程同时进行两个逻辑：
1. 进行时间统计，让计数器每隔5秒输出字符串 Second Thread Here! 和时间戳
2. 显示一个简单的窗体，等待 windows.read() 的返回

```python
import PySimpleGUI as sg
import time
import threading

# 创建子线程的任务，每隔5秒输出字符串 Second Thread Here!
def second_thread(window):
    while True:
        localtime = time.asctime(time.localtime(time.time()))
        print("Second thread here! TIME:", localtime)
        time.sleep(5)

# 运行子线程，并设置为 daemon 以保证会继承父线程的状态
def second_thread_function():
    threading.Thread(target=second_thread, args=(window,), daemon=True).start()

sg.theme('Dark Blue 3')

layout = [  [sg.Output(size=(50,10))],
            [sg.Button('Run Second Thread'), sg.Button('Exit')]  ]

window = sg.Window('Main Thread', layout)

while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED or event == 'Exit':
        break
    if event == "Run Second Thread":
        second_thread_function()

window.close()
```
执行效果：
![Multi_Thread](/images/Multi_Thread.png)

当程序运行后，文本框内什么都没有。而在点击按钮后会执行子线程并不断打印出字符串和时间，此时主线程（窗口本身）的功能一切是正常的，可随时退出。
如果疯狂点击 Run Second Thread，可以不断增加新的子线程，且不会对主窗口产生什么影响。
### 2.7. 更多控件
这里再列出一些比较重要的控件，方便大家引用：
`FileBrowse`：单文件选择
`FilesBrowse`：多文件选择
`Combo`：下拉选择菜单
`Radio`：单选按钮
`Slider`：滚动条
`ProgressBar`：进度条
`ButtonMenu`：按钮菜单（在 macOS 下可作为替代品）
`Image`：图片查看
`TabGroup`：选项卡
## 使用 QT Designer + PySimpleGUIDesigner 快速构建布局代码
本着“一切均可优化“的思维，我们会想**有没有快速构建 PySimpleGUI 布局代码的工具呢？**所见即所得的布局绘制工具才是王道。
nngogol 开发了 PySimpleGUIDesigner，可以把 QtDesigner 创建的布局文件转为 PySimpleGUI 格式的代码，能够大大提高布局部分代码的创建速度。
有了它的帮助，我们只需理清并完成 Event Loop 逻辑，就可快速开发想要的小工具了。
### 3.1. 通过 Qt Designer 创建布局
用过 Qt 的朋友对 Qt Designer 会比较熟悉。作为一款双平台可用的 Qt 布局绘制工具，我们只需在其中绘制好布局，再把绘制完成的 .ui 文件（本质上是 XML 格式的布局文件）通过 pyuic5 即可转为 Qt 的 Python GUI 代码。
**而 PySimpleGUIDesigner 正是巧妙的利用了 .ui 文件方便的中间格式特征，将其直接转为 PySimpleGUI 的代码。**
关于 Qt Designer 的安装和使用在此不再赘述，可参考以下链接：
- https://build-system.fman.io/qt-designer-download
- https://doc.qt.io/qt-5/qtdesigner-manual.html

受限于 PySimpleGUI 的 GUI 设计哲学，我们**仍需要以元素按行排布的逻辑进行布局构建**，即要把控件全都放置到 Qt Designer 的 Layout 内以规则排布，并放置到 Box 或 Frame 容器内。
对于控件位置随意的浮动布局，需参考文初提到的其它框架来完成。
从实用角度而言，“行布局”这种结构是完全够用的，无需担心功能无法实现。
我们在 Qt Designer 中创建一个简单的布局：
![QT1](/images/QT1.png)

### 3.2. 安装 PySimpleGUIDesigner
PySimpleGUIDesigner 安装可通过一行简单的 `pip install PySimpleGUIDesigner` 来完成，并且还需安装 `PySide2`和 `click` 两个依赖。
安装完成后，在命令行执行 `PySimpleGUIDesigner` 即可打开图形版本的程序。有点可惜的是，作者的 GUI 设计审美实在不怎么样。
![PySimpleGUIDesigner](/images/PySimpleGUIDesigner.png)
PySimpleGUIDesigner 主页面
另外附上 GitHub 地址：https://github.com/nngogol/PySimpleGUIDesigner
### 3.3. 转换布局文件为 PySimpleGUI 代码
浏览打开之前我创建的 test.ui 文件，target object name 中选择要进行布局转换的 Qt 容器。在这个例子中因为 UI 元素单一，使用默认的即可。
点击 convert 即可看到转换好的代码：
![PySimpleGUIDesigner Code1](/images/PySimpleGUIDesigner%20Code1.png)

```python
# 生成的不含 Event Loop 的纯布局代码
sg.Frame('', layout = [
   [sg.T('First name'), sg.I('')],
   [sg.T('Second name'), sg.I('')],
   [sg.T('Age'), sg.Spin(list(range(0, 99)), initial_value=0)],
   [sg.T(''), sg.B('OK', key='clickeme__1')]
])
```
点击 convert + all events 也可看到包含 Event Loop 的完整源码：
![PySimpleGUIDesigner Code 2](/images/PySimpleGUIDesigner%20Code%202.png)

```python
# 生成的含 Event Loop 的完整代码
import PySimpleGUI as sg

layout = [
 [sg.Frame('', layout = [
   [sg.T('First name'), sg.I('')],
   [sg.T('Second name'), sg.I('')],
   [sg.T('Age'), sg.Spin(list(range(0, 99)), initial_value=0)],
   [sg.T(''), sg.B('OK', key='clickeme__1')]
])]]
window = sg.Window('App', layout)

while True:
    event, values = window.read()
    if event in (None, 'Exit'):
        break

    if event == '':
        pass

	if event == 'clickeme__1':
		pass

window.close()
```
### 3.4. 执行测试
可以看到，PySimpleGUIDesigner 把一些布局中的空格部分也转换为了相应的代码，我们加以修改并完善一下。
其中 `Frame` 元素主要是为了在 Qt Designer 中进行布局规划，可根据需求去掉。
```python
import PySimpleGUI as sg

frame = [   [sg.T('First name'), sg.I('')],
            [sg.T('Second name'), sg.I('')],
            [sg.T('Age'), sg.Spin(list(range(0, 99)), initial_value=0)],
            [sg.T(''), sg.B('OK', key='clickeme__1')]   ]

layout = [  [sg.Frame('Qt Frame', frame, title_color='blue')]]

window = sg.Window('PySimpleGUIDesigner Demo', layout, font=("Helvetica", 12))

event = window.read()
window.close()
```
执行结果：
![PySimpleGUIDesigner Result](/images/PySimpleGUIDesigner%20Result.png)

容易看出，因为 PySimpleGUIDesigner 在生成代码的时候加入了额外的 `sg.T('')` 等占位符，导致与代码直接书写出的布局略有不同，但这部分后期按需修改去掉即可，在这里就不加以演示了。
## 如何阅读 PySimpleGUI 官方文档
PySimpleGUI 的官方文档总共分为三大板块，与一般的文档不同，PySimpleGUI 的作者比较话痨，所以在技术文档中会少见的看到他所写的散文叙述，这也让看习惯干巴巴技术文档的人可能不太习惯。
### Home
建议初学者通读这部分，不仅能够在前面的“散文”部分了解作者 Mike 的设计理念，也能一览 PySimpleGUI 的全貌。
### Call Reference
这部分是 PySimpleGUI 的参考手册，建议查找参数时善用页面内搜索以获得想要结果。
### Cookbook
PySimpleGUI 的特色项目之一，作者鼓励大家多用 Cookbook 中的 Recipe，选择自己需要的设计模式，直接复制粘贴出来，进一步改善 GUI 创建的效率。
## 实例程序
既然这系列文章的标题是《写给声音设计师的极速 GUI 开发大法》，即后期的实例会围绕 WAAPI、ReaScript 等主题展开，也可能涉及些 Python 音频相关库如 pydub、librosa 等。
### 5.1. 程序需求
在《人人都能用 WAAPI（二）wwise.core 分支》的结尾中有一段根据文件名导入 Wwise 的代码，在这里再加入获取工程信息的功能，并且把导入成功与获取后的信息都打印到程序的文本框中。
并且我们加上双语选项，即让当用户点击切换语言按钮时，实现中英文切换以扩大用户群体。
### 5.2. 原型构建
![GUI Prototype](/images/GUI%20Prototype.png)
使用 Pencil 绘制原型
### 5.3. 功能代码
略，请参考《人人都能用 WAAPI（二）wwise.core 分支》。
### 5.4. GUI 代码
```python
import PySimpleGUI as sg

sg.theme('Dark Blue 3')

def window_eng(): # 封装英文窗口
    # 英文子布局
    file_importer_frame_eng = [ [sg.Input(size=(42, 1)), sg.FolderBrowse('Browse', key='folder')],
                                [sg.Button('Import')] ]
    language_switch_frame_eng = [   [sg.Radio('English', "RADIO1", default=True, size=(10,1))],
                                    [sg.Radio('Chinese', "RADIO1", default=False, size=(10,1), key="-IN1-")],
                                    [sg.Button('Switch')]   ]
    button_column_eng = [   [sg.Button('Get Project Info')],
                            [sg.Button('Exit')]   ]

    # 英文主布局
    layout_eng = [  [sg.Frame('File Importer', file_importer_frame_eng, title_color='blue', element_justification="c"), sg.Frame('Language Switch', language_switch_frame_eng, title_color='blue', element_justification='c')],
                    [sg.Output(size=(50,10)), sg.Column(button_column_eng, element_justification="c")]  ]

    # 返回英文主窗口，此处 Window 后忘记了括号
    return sg.Window('PySimpleGUI + WAAPI (Multi-Window', layout_eng, finalize=True)

def window_zh(): # 封装中文窗口
    # 中文子布局
    file_importer_frame_zh = [  [sg.Input(size=(39, 1)), sg.FolderBrowse('浏览文件夹', key='folder')],
                                [sg.Button('导入')]  ]
    language_switch_frame_zh = [    [sg.Radio('英文', "RADIO2", default=True, size=(10,1), key="-IN2-")],
                                    [sg.Radio('中文', "RADIO2", default=False, size=(10,1))],
                                    [sg.Button('切换')]    ]
    button_column_zh = [    [sg.Button('获得工程消息')],
                            [sg.Button('退出')]    ]

    # 中文主布局
    layout_zh = [   [sg.Frame('导入文件', file_importer_frame_zh, title_color='blue', element_justification='c'), sg.Frame('语言选择', language_switch_frame_zh, title_color='blue', element_justification='c')],
                    [sg.Output(size=(50,10)), sg.Column(button_column_zh, element_justification='c')]   ]

    # 返回中文主窗口，此处 Window 后忘记了括号
    return sg.Window('PySimpleGUI + WAAPI (Multi-Window', layout_zh, finalize=True)

# 先只创建英文主窗口实例
window1, window2 = window_eng(), None

while True:
    window, event, values = sg.read_all_windows()
    if event in (None, 'Exit', '退出'):
        break
    # 设定判断条件，以响应不同窗口下的语言切换逻辑
    elif event == "Switch" or "切换":
        if window == window1 and values["-IN1-"] == True:
            window2 = window_zh()
            window1.Hide()
        elif window == window2 and values["-IN2-"] == True:
            window1.UnHide()
            window2.Hide()

window.close()
```
### 5.5. 运行效果
当执行英文窗口中选中文选项和中文窗口选英文选项这两个逻辑的时候，可以看到窗口实现了正确切换。
而在英文窗口中选英文选项，在中文窗口选中文选项，根据代码，这两条逻辑会让窗口保持在当前语言不切换。
![英文窗口](/images/%E8%8B%B1%E6%96%87%E7%AA%97%E4%BD%93.png)
英文版窗口
![中文窗口](/images/%E4%B8%AD%E6%96%87%E7%AA%97%E4%BD%93.png)
中文版窗口
### 5.6. 打包为 exe 可执行文件（Windows）
为了打包为 exe 可执行文件，需要安装 `PyInstaller`，需要在终端或命令行执行 `pip install PyInstaller`。如果使用 conda，则输入 `conda install PyInstaller`。
随后在命令行执行 `pyinstaller -wF program_name.py` 即可生成 exe 文件。
![Win EXE](/images/Win%20EXE.png)
Win10 下打包好后的 exe 文件执行图
如果想偷懒，也可以使用下面打包好的 exe 生成器来进行操作：
- https://pypi.org/project/pysimplegui-exemaker/#description
- https://zhuanlan.zhihu.com/p/95222129

### 5.7. 打包为 app 可执行文件（macOS）
对于生成 macOS App 的需求，根据官网文档可使用 `pyinstaller --onefile --add-binary='/System/Library/Frameworks/Tk.framework/Tk':'tk' --add-binary='/System/Library/Frameworks/Tcl.framework/Tcl':'tcl' your_program.py` 或添加 `--windowed` 参数到 pyinstaller 的命令行中。
不过遗憾的是 pyinstaller 在 macOS 下生成 PySimpleGUI 的程序没有反应，只能在终端打开的情况下运行。
为解决这个问题，我们要使用另外一个打包工具 Platypus：
1. 在 Script Type 中选择你的 Python 环境，在本例中我使用 Conda，所以填写入 `/anaconda3/bin/python`。
2. 如果对图标有需求可选择需要的图标文件。
3. 在 Interface 处选择 None，我们的程序本身就有 GUI，所以无需 Platypus 为我们创建图形外壳。
4. Identifier 和 Author 处可按需填入，之后按 Create App 生成 App 文件。

![Platypus 配置](/images/Platypus%20%E9%85%8D%E7%BD%AE.png)
Platypus 配置与生成的可执行文件
![可执行文件](/images/%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6.png)
执行可执行 App 文件后打开的窗口
## 接下来讲什么？
在学完本文后，相信大家已经对 PySimpleGUI 有了足够的认识，并能按照想法设计一些程序了。
接下来我会联动《人人都能用 WAAPI》和《写给声音设计师的极速 GUI 开发大法》，为大家带来一些我和朋友们开源项目的 GUI 代码分析。
考虑到受众群体。**我会尽量对除了 Python 基本概念之外的代码都书写注释，只要有 Python 基础都能看懂。**希望作为这两个系列文章的联动产物，为大家展现更多工作中的实际应用。