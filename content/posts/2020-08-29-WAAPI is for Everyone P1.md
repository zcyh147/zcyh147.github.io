---
title: WAAPI is for Everyone | Part 1 Overview
date: 2020-11-14T18:46:00+08:00
tags:
  - Audio Middleware
aliases:
  - /2020/11/14/WAAPI is for Everyone P1/
---
Hello. I’m Thomas Wang (also known as Xi Ye).
I discovered WAAPI (Wwise Authoring API) in the second half of last year. For a non-professional programmer like me, it was easy to get overwhelmed with new concepts like WAMP, JSON etc. Nevertheless, aside from the official documents, there are very few videos, articles and projects shared by other developers. Instead of asking for help, I tried to figure things out all by myself. And, I learned a lot.
> In open source, we feel strongly that to really do something well, you have to get a lot of people involved.  --- Linus Torvalds

**Ideas are only valuable if you put them out to the world, right?** So, with the open source spirit in mind, I decided to share this WAAPI guide series with you all. They are more like a complement to the official documents, yet more approachable and beginner friendly.
Being beginner friendly doesn’t mean that you have to start from scratch. Instead, with these guides, it will be easier as you venture into the world of WAAPI. **The tool I’m using is Python, so our discussion will be based on that. Of course, you can use other programming languages supported by WAAPI to make remote calls (using C# to call WAAPI for instance).**

> This blog series assume that:
> - You know how to configure the development environment, install and use Python, Anaconda, pip, VS Code, PyCharm etc.
> - You are familiar with basic Python syntax.
> - You have a comprehensive understanding of Wwise features.
> - You are eager to optimize the existing Wwise workflow.
> - You know something about mind maps.

## Why Should We Use WAAPI?
### 1.1. Have You Ever Struggled to Work More Efficiently When Using Wwise?
- Is it possible to reduce the click and drag & drop operations?
- How to create playback rules easily for hundreds or maybe even thousands of imported assets?
- Can we automate the logic connection when using Game Syncs, Events or SoundBanks?
- How to build a dynamic interaction between DAW and Wwise?
- How to link the CI system to constantly optimize the integration pipeline?
- etc.

### 1.2. What’s The Point of Introducing WAAPI?
If you have asked yourself any of the questions listed above, WAAPI would be a good answer. 
As a great feature introduced in Wwise 2017.1, WAAPI is meant to execute repetitive tasks and streamline the workflow. Using WAAPI, you can do all kinds of operations such as retrieving project information, importing audio files, building container hierarchies, posting Events, setting Game Syncs etc. **WAAPI is an essential tool for sound designers to optimize the Wwise workflow. It can save you a lot of time, allowing you to focus on the creative side of things.**
Many companies in the industry don’t have such a position like Game Audio Programmer or Technical Sound Designer. If you happen to be employed by one of them, this blog could be very helpful. **The best way to streamline your workflow is constant optimization of repetitive tasks. Instead of waiting and wondering, let’s see how to actually do it.**
### 1.3. Aren’t The Official Documents Thorough Enough?
Among all audio middlewares as far as I know, Wwise has the most thorough localized official documents. **Yet, you still need some background tech knowledge to learn and use WAAPI.** That’s why I wrote this blog series, hoping to make an useful complement to those documents. Meanwhile, there are great articles talking about WAAPI on the Audiokinetic blog. Enjoy reading them if you like.
## Learning WAAPI More Efficiently Using Mind Maps
### 2.1 Summarizing WAAPI Essentials With Mind Maps
As an important learning tool, mind maps inspired me tremendously in the past eight years. 
As you can see, there are a wide variety of WAAPI APIs. It takes time for you to search them in the documents and find out which one does what. For instance, how do you know that you can use ak.wwise.core.object.get when you want to carry out API queries?
![](/images/%E7%B9%81%E7%90%90%E7%9A%84API.png)

I was wondering if there is a better way to do this. And, bingo!
Creating mind maps came to my mind. How to summarize WAAPI essentials with mind maps? Let’s take ak.wwise.core.object.get for example.
1. First, forget about the `ak` prefix. Then you divide the rest into three parts: `wwise.core`, `object` and `get`.
2. Then you sort all APIs by their features, using boxes to identify them.

![Global View](/images/%E5%AF%BC%E5%9B%BE1.png)

![Local View](/images/%E5%AF%BC%E5%9B%BE2.png)

### 2.2. Importing Into the Knowledge Base for Further Clarification
Now we’ve built a basic logic system for learning WAAPI. Next, we need to import the information into MarginNote 3 for further clarification.
![Here is how it looks in MN3](/images/%E5%AF%BC%E5%9B%BE3.png)

Now you can see the whole picture of WAAPI very clearly. More importantly, it provides you a better way to learn and use these APIs. This works for me, and maybe for you too. Certainly, you may choose any other tools that suit you better. 
**I won’t show you all the mind maps that I created.** You can make your own ones with the method mentioned previously. It shouldn’t be that difficult.If you are interested, you can redo what I just did. It doesn’t matter whether you choose MarginNote 3, XMind or something else. **The most important thing is that you actually do it.**

## How I Wrote This Blog Series?
Now that you know how I summarized WAAPI essentials. Let’s talk about how I wrote this blog series. 
**WAAPI APIs can be divided into two categories: execution (Functions) and subscription (Topics)**. Based on this, I wrote this blog series. 
(Note: Again, I left out the ak. prefix.)
1. Overview
2. wwise.core (mainly execution APIs)
3. wwise.ui, wwise.debug, wwise.waapi
4. soundengine
5. wwise.core, wwise.debug, wwise.ui (subscription APIs)
6. Making Calls to WAAPI in the Game Engine
7. Examples

## WAAPI Basics
### 4.1. What is WAAPI?
WAAPI (Wwise Authoring API) is an essential module in Wwise. Through making calls to these APIs, you can tell Wwise to execute operations directly, without having to move the mouse or type with the keyboard.
These operations involve UIs (views, options, commands), core features (quickly adding audio files), sound engine (setting RTPC values, posting Events etc.). More information on WAAPI:
https://www.audiokinetic.com/zh/library/edge/?source=SDK&id=waapi.html
### 4.2. Programming Languages and Calling Methods Supported by WAAPI
#### Programming Languages
You can make WAAPI calls with a variety of languages such as C++, C#, JavaScript, Python etc. The last three are relatively easy for beginners. (Python 3.6+ is recommended.) If there is no need for making WAAPI calls within plug-ins, then you don’t have to use C++.
#### Calling Methods
**WAAPI provides three methods to make API calls: WAMP, HTTP POST and Wwise plug-ins.**
In most cases, we use WAMP. Because it’s the only one that support both execution and subscription APIs. **So what is WAMP?**
It’s a method of communication via WebSocket. If you are unfamiliar with the principles of network communication, you can think of it as a method of transporting information over the network. To achieve this, you need an IP address and a port to connect to WAAPI. 
You can execute the required operations only if your application is connected to Wwise via WAMP. 
More information on how to make WAAPI calls:
https://www.audiokinetic.com/library/edge/?source=SDK&id=waapi_gettingstarted.html
### 4.3. Configuring the Development Environment
> Development environment is nothing new, so I’m not going to talk about it here. If you are interested, feel free to check the links below.

**Since Conda doesn’t have the waapi-client package required by WAAPI, we have to install it manually. If you are not a fan of Anaconda, you can use pip instead.**
In case you are, it’s better to do it as described in the official document: first you install pip, then manage packages with pip within Anaconda. For more information, please check the links below.
(For advanced users only) You could use the conda skeleton pypi and conda build commands to install the package. But I never tried personally, so I will leave it to you.
#### Installing Anaconda
https://docs.anaconda.com/anaconda/install/
#### Configuring Anaconda and Adding the waapi-client Package With pip
https://docs.anaconda.com/anaconda/user-guide/ https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-pkgs.html#installing-non-conda-packages
**Note: With pip installed, you can run pip install waapi-client directly in Python 3.**
#### Configuring the VS Code Development Environment
https://code.visualstudio.com/docs/python/environments
#### Enabling WAAPI in Wwise
https://www.audiokinetic.com/library/edge/?source=SDK&id=waapi_prepare.html
### 4.4. Differences Between Execution and Subscription APIs
> Execution APIs execute certain operations, subscription APIs get the return result after that. They are referred to as “remote call” and “publish & post” in the official Wwise documents.

**Execution APIs：**
as their names suggest, all of these APIs are used to execute certain operations.
A specific operation will be executed after you make an API call. All those three methods are able to make execution API calls, although HTTP POST is not the best choice.
**Subscription APIs：**
When you make a subscription API call, your application will wait for Wwise to react. If you subscribed to an object creation action, you will get the return result only after that action is executed. Such calls are only possible with WAMP. They cannot be done via the other two methods.
### 4.5. JSON and WAAPI Documents
#### What is JSON?
People who’s not a professional programmer (like me) may wonder what JSON is when using WAAPI for the first time.
**JSON (JavaScript Object Notation) is a lightweight data-interchange format that uses human-readable text to store and transmit data objects.** If you are familiar with XML, then you probably know something about JSON.
It’s important to know what JSON is. Because this format will be used for both input arguments and return values when making a remote call to WAAPI. **Let’s find out the answer before we proceed.** For further clarification, here is an example.
#### Arguments and Result (Execution APIs)
Here is the `ak.wwise.core.object.create` doc in which there are two tables.
![Arguments](/images/%E5%8F%82%E6%95%B01.png)

![Result](/images/%E7%BB%93%E6%9E%9C1-1.png)

Both of them have three columns: Name, Type and Description.
You can use a function to pass in arguments and get the return result. **In the Arguments table, these are the arguments that you want to pass in when making function calls. In the Result table, these are the result that you will get in return when it’s done.**
As mentioned previously, **they are all in JSON format. Note that those with an asterisk (*) are mandatory arguments, the rest are optional ones.**
Let’s have a look at the Arguments table. There are three types of arguments:
1. `Name *` needs a single string as an argument to define the name. That means you only have to provide one name in string format for JSON to use. But why does `parent *` need four arguments? As you can see, the first one is `any of:`. That means you can choose any of the following three arguments to define the parent. They can be a name, a GUID or a path.
2. As for `notes`, it doesn’t have an asterisk. Because it’s not a mandatory argument. In other words, you can decide whether to pass in a note as needed when using `ak.wwise.core.object.create`.
3. `children` is kind of puzzling. It’s different from the previous arguments. Actually, it’s an array in which you need to populate the argument that you want to pass in. `children[... ].type *` and `children[... ].name *` are mandatory arguments. So you have to populate the type and name sub-arguments.

Now let’s take a look at the Result table. You can probably figure out what kinds of return result you would get as long as you know which arguments will be passed in. For instance, you created some objects using `ak.wwise.core.object.create`. Naturally, Wwise should return their names, GUIDs and paths accordingly. In the meantime, errors will be reported if it fails.
#### How to Use JSON?
In the previous section, we explained what the arguments are and what return result you could get. Now you may wonder how to populate these arguments to make sure that WAAPI can receive them properly. 
Let’s take `ak.wwise.core.object.create` for example, and see how it works.
```python
# Arguments that are required to execute ak.wwise.core.object.create
args = {
    "parent": parent_guid, 
    "type": "Sound", 
    "name": "Simple_SFX"
}

# Result that you will get after executing ak.wwise.core.object.create and passing in args
result = {
    "id": object_guid, 
    "name": "Simple_SFX"
}
```
As you can see from the example, **JSON is actually something like a dictionary in Python**. The difference is that all quotes in JSON must be double quotes, and JSON blocks should be in string format. **However, under the Python + WAAPI environment, it seems that these two rules are not strictly verified**. So you don’t have to use the `json` modules in Python to make a format conversion. It works even if you write in dictionary format.
![](/images/%E5%AF%B9%E7%85%A7%E8%A1%A8.png)
By comparing Python and JSON, you can see the corresponding relationship in terms of data structure. These objects are essential when using WAAPI. You can get the required result only if the arguments are set up as described.
#### How to Format the JSON Syntax for Better Readability?
WAAPI argument documents are defined using JSON, which lack of readability. **In order to better understand these arguments when using WAAPI, we need to format the JSON syntax.**
Here is the argument syntax for `ak.wwise.core.object.create`:
![](/images/%E5%8F%82%E6%95%B02.png)

It has a very poor readability. To improve this, we can use JSON formatting tools such as JSON Editor (>https://jsoneditoronline.org/).
Remember how messy the format was? Now it’s much better!
![JSON1](/images/JSON1.png)

With the argument syntax formatted, we can clearly see the required arguments in the required section, as well as type and description in the properties section. There are two more properties. `localDefinitions` is actually the definition for `children` mentioned previously. `patternProperties` is the potential value type when setting object properties via `@propertyName`.

![JSON2](/images/JSON2.png)

The Result table works the same way. In the following image, we can clearly see the default return values: name, children and ID. With the JSON syntax formatted, it’s much more readable both for arguments and return values.
**When you want to call a WAAPI function, all you need is to modify the required arguments under the JSON framework, then make a remote call.**
To understand the corresponding relation between JSON and Python, you should refer to examples as your first step. It’s recommended that you check all examples listed in the Wwise Authoring API Examples Index. Since these examples are quite brief, I suggest you go through the descriptions here first.
Now let’s see how to use these arguments in a full context. Here is an example from the official document, describing how to create a Random Container with two Sound SFX objects included.
```python
# 1. Arguments provided in the example code
{
    # Parent GUID, type, name, property value
    "parent": "{7A12D08F-B0D9-4403-9EFA-2E6338C197C1}", 
    "type": "RandomSequenceContainer", 
    "name": "Boom", 
    "@RandomOrSequence": 1, 
    # Children type and name
    "children": [
        {
            "type": "Sound", 
            "name": "A"
        }, 
        {
            "type": "Sound", 
            "name": "B"
        }
    ]
}

# 2. Arguments in a real scenario
from waapi import WaapiClient, CannotConnectToWaapiException

try:
    with WaapiClient() as client:
        # Assign the JSON-formatted arguments to args
        args = {
            "parent": "{7A12D08F-B0D9-4403-9EFA-2E6338C197C1}", 
            "type": "RandomSequenceContainer", 
            "name": "Boom", 
            "@RandomOrSequence": 1, 
            "children": [
                {
                    "type": "Sound", 
                    "name": "A"
                }, 
                {
                    "type": "Sound", 
                    "name": "B"
                }
            ]
        }
        # Execute a remote call. The first argument is the API name, the second is the JSON argument.
        client.call("ak.wwise.core.object.create", args)
        
except CannotConnectToWaapiException:
    print("Could not connect to Waapi: Is Wwise running and Wwise Authoring API enabled?")
    
# 3. The return result after making a remote call, including parent GUID, parent container name, children GUID, children name.
{
    "id": "{66666666-7777-8888-9999-AAAAAAAAAAAA}", 
    "name": "Boom", 
    "children": [
        {
            "id": "{46813545-2168-3547-8328-681AB678D6F5}", 
            "name": "A"
        }, 
        {
            "id": "{68465134-2548-2377-3541-321354318ABD}", 
            "name": "B"
        }
    ]
}
```
#### Options and Publish (Subscription APIs)
If you look carefully at the official documents, you will notice that the subscription API arguments are a bit different. **There are two tables: Options and Publish, instead of Arguments and Result**.
Subscription APIs are based on the callback functions executed when publishing topics. Arguments in the Options table define the type of return value in a callback function, avoiding unnecessary queries. Meanwhile, you can think of arguments in the Publish table as a different form of those in the Result table. It essentially returns the same information in JSON format, only that it’s published when the subscribed topics are modified. 
Nevertheless, there are exceptions for the execution APIs, such as `ak.wwise.core.audio.importTabDelimited`, `ak.wwise.core.object.get`, `ak.wwise.core.profiler.getBusses`, `ak.wwise.core.profiler.getVoices`. They have both Arguments and Options tables listed. The former specifies the query scope (mandatory). The later indicates the query options (optional). They will be further described in Part 2.
### 4.6. Hello Wwise！
We’ve talked about the basics. Now let’s see how it works in a real scenario! 
**Take “Hello Wwise!” for example.**
#### Determining Which APIs to Use
Obviously, for a scenario like Hello World, we should use execution APIs.
`ak.soundengine.postMsgMonitor` can do the job perfectly.
#### Code
For better readability, I added thorough notes in the code. You can check each of them below.
```python
from waapi import WaapiClient, CannotConnectToWaapiException

# “try…except…” statement for handling Python exceptions. For instance, when the WAAPI connection fails.
try:
    # Use the default address to connect to Wwise. You can change the port as needed.
    with WaapiClient() as client:

        # All WAAPI arguments are in JSON format, no matter they are passed in or sent back. Use the dictionary to define the printout message (Hello Wwise!)
        print_args = {
            "message": "Hello Wwise!"
        }
        # Make a remote call to ak.soundengine.postMsgMonitor, then pass in the arguments you just defined
        client.call("ak.soundengine.postMsgMonitor", print_args)

except CannotConnectToWaapiException:
    print("Could not connect to Waapi: Is Wwise running and Wwise Authoring API enabled?")
```
#### Result
Don’t forget to click Start Capture before you execute the script. Otherwise, the Profiler won’t start the capture process. In the end, we will get the following information:
![In the WAAPI tab in Logs, we can see that a WAMP connection has been built.](/images/%E7%BB%93%E6%9E%9C1.png)

![In Profiler, we can see the printout message "Hello Wwise!”.](/images/%E7%BB%93%E6%9E%9C2.png)

## WAAPI Use Cases
### 5.1. Execution APIs
#### Without Arguments
Getting information about the current project through the `getInfo` function.
```python
from waapi import WaapiClient, CannotConnectToWaapiException
from pprint import pprint

try:
    with WaapiClient() as client:
        result = client.call("ak.wwise.core.getInfo")
        pprint(result)

except CannotConnectToWaapiException:
    print("Could not connect to Waapi: Is Wwise running and Wwise Authoring API enabled?")
```
Result:
![With Arguments](/images/%E7%BB%93%E6%9E%9C3-1.png)

#### With Arguments
Refer to the "Hello Wwise!" section.
### 5.2. Subscription APIs
Using `ak.wwise.core.object.nameChanged`, we can subscribe to the project information when the object name is changed, and return its new name, old name and type.
```python
from waapi import WaapiClient, CannotConnectToWaapiException
from pprint import pprint

# “try…except…else…” statement for handling Python exceptions
try:
    client = WaapiClient()

except CannotConnectToWaapiException:
    print("Could not connect to Waapi: Is Wwise running and Wwise Authoring API enabled?")

else:
    # Use on_name_changed() as the callback function to get the return result in dictionary format
    def on_name_changed(*args, **kwargs):
        # Get the object type
        obj_type = kwargs.get("object", {}).get("type")
        # Get the old name
        old_name = kwargs.get("oldName")
        # Get the new name
        new_name = kwargs.get("newName")

        # Use the format function to print out the info, and tell user that an object of type XXX has been renamed from A to B
        print("Object '{}' (of type '{}') was renamed to '{}'\n".format(old_name, obj_type, new_name))
        # Terminate the WAMP connection as needed
        client.disconnect()

    # Subscribe to required topics, and pass in the callback function. Choose type to return the object’s type when its name is changed
    handler = client.subscribe("ak.wwise.core.object.nameChanged", on_name_changed, {"return": ["type"]})

    # Print out the info to remind user that a subscription to ak.wwise.core.object.nameChanged has been made. Make a suggestion that user should rename the object to verify the script
    print("Subscribed 'ak.wwise.core.object.nameChanged', rename an object in Wwise")
```
Here is the return result. The project information is printed out as we expected.
![](/images/%E7%BB%93%E6%9E%9C4.png)

## What’s Next?
In Part 2, we will talk about wwise.core execution APIs. There are a lot of examples in the official documents. But to get started quickly, I will show you some actual use cases. Stay tuned if you are interested!