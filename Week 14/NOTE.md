# 组件化（一）

## 1. 组件化的概念与基本组成

### 什么是组件？

组件一般来说组件是和**UI强相关**的东西，某种意义上可以认为它是一种**特殊模块**或一种**特殊对象**。它在组合架构上呈现一种**树形结构**。并且组件有一定的**模板化的配置**能力。

了解组件之前我们可以先了解一下与之有类似之处的对象，对象包含以下三种要素：

* **属性** properties
  * **属性**是描述对象事物共同的性质和特点，例如：一个对象的颜色和形式，人的能力，身份，以及社会的基础关系等等。
* **方法** methods
  * 指的是[类别](https://zh.wikipedia.org/wiki/类_(计算机科学))（所谓的**类方法**、**静态方法**或**工厂方法**）、或者是[对象](https://zh.wikipedia.org/wiki/物件_(電腦科學))（所谓的**实例方法**）两者其中之一的一种[子程序](https://zh.wikipedia.org/wiki/子程式)。方法的目的是提供一个机制，以访问（对于读和写）对象或类别的私有属性。
* **继承关系** Inherit
  * 继承可以使得子类具有父类的属性和方法或者重新定义、追加属性和方法等。

对于组件来说，一般由以下几个要素组成：

* **属性** Properties
* **方法** Methods
* **继承关系** Inherit
* **特性** Attribute
  * 组件的 Attribute和Properties其实都可以翻译成属性，下面会详细的展开介绍两者之间的不同之处。
* **配置&状态 **Config & State
  * Config是对组件的配置，如：对象构造函数中传递的参数;
  * State是随着组件的使用用户调用以及一些方法的响应，而产生的组件状态的改变
* **事件** Event
  * 组件往组件外部传递信息的媒介。
* **生命周期** Lifecycle
* **后代** Children
  * Children是树形结构的必要性，没有Children组件无法形成树形结构，描述界面的能力就相对较弱。
  * 比如：一些基于拖拽的系统，可以在界面上将组件一个一个拖过去，但互相之间没有形成树形结构，对于简单应用来说是可以满足需求的，但复杂应用来说，对界面语义要求高，同时又涉及自动排版，以至于拖拽形式不能满足复杂应用的需求。

对象与组件的区别在于，组件在对象的基础上增加了上述许多与语义相关的要素，使得组件更加适合描述UI。

关于理解组件的这些要素，我们可以看下图所示：

![组件](./img/组件.jpg)

组件的使用者一般有三种身份，最终在组件注入的系统中操作组件的使用用户、将组件编排入自己系统的使用组件的程序员、以及组件的设计、编写者。

从上图我们可以得知：

* 使用用户在界面上进行了一系列的输入操作，信息传递给了组件，进而改变了组件**状态State**
* 于此同时,当组件的State发生改变的时候,可能会进而影响组件**子组件Children**
* 而程序员可以通过Attribute去更改组件的一些特性。同时也可以通过Property去改变组件的属性。Attribute与Property主要的区别在于，Attribute主要用makeup language(声明性语言)。Attribute与Property 是否一致取决于组件体系的设计者
* 而Methods 和Property 差不多，但Methods所描述的过程相对较为复杂。Methods和Property是使用组件的程序员向开发组件的程序员传递消息。
* 而**事件Evnet**是由开发组件的程序员向使用组件的程序员传递消息。

这张图组件的各个要素的作用，以及在组件系统中信息流转的方向。

## 2. 组件的组成元素详解

上面我们对组件已经有了一个初步基本的认识，下面我们将详细的说明一些组件要素的概念：

#### Attribute与Property

Attribute强调的是描述性。可能是事物本身的特性。如黄色的头发

Property强调的是从属关系。比如有一个对象有一个Property是一个对象，则它们之间是有从属关系的。

Attribute与Property在HTML中的示例：

```
Attribute:

<my-component attribute=“v” />
myComponent.getAttribute(“a”)
myComponent.setAttribute(“a”,“value”);

Property:

myComponent.a = “value”;

------------------------------------------

<div class="cls1 cls2"></div>
<script>
var div = document.getElementByTagName(‘div’);
div.className // cls1 cls2 
</script>
------------------------------------------

<div class="cls1 cls2" style="color:blue" ></div>
<script>
var div = document.getElementByTagName('div');
div.style // 对象
</script>

------------------------------------------

<a href="//m.taobao.com" ></div>
<script>
var a = document.getElementByTagName('a’); 
a.href // “http://m.taobao.com”，这个 URL 是 resolve 过的结果
a.getAttribute(‘href’) // “//m.taobao.com”，跟 HTML 代码中完全一致
</script>

------------------------------------------

<input value = "cute" />
<script>
var input = document.getElementByTagName(‘input’); // 若 property 没有设置，则结果是 attribute 
input.value // cute 
input.getAttribute(‘value’); // cute 
input.value = ‘hello’; // 若 value 属性已经设置，则 attribute 不变，property 变化，元素上实际的效果是 property 优先
input.value // hello 
input.getAttribute(‘value’); // cute 
</script>

```

#### 如何设计组件状态？

![组件状态设置](./img/组件状态.jpg)

四个场景：

* Markup set —— 标签声明设置
* JS set —— JavaScript 设置
* JS Change —— JavaScript 改变
* User Input Change —— 终端用户去改变

四个要素：

* Property： 不可被标签声明设置，可以被JS代码设置和改变，一般来说用户输入是不会改变Property的，但具体还是要看业务逻辑是否需要让用户输入改变Property。
* Attribute：可以被标签声明设置，可以被JS代码设置和改变，跟Property类似，一般来说用户输入是不会改变Attribute。
* State：只能从组件的内部去改变，不能从外部获得改变，一般来说设计创造组件的开发者是不会提供给使用组件的开发者接口去改变组件State的，因为在设计程序员无法知道State何时被改变的情况下，State无法保持一致性和可控性。但用户输入是可以改变组件的State的。比如：用户点击tab组件，那个tab被激活了，这是需要通过State去控制的。
* Config：是一个一次性构造的结构，只有在组件构造的时候会触发，它是一次性被传入是不可更改的。也因为Config的不可更改性，我们通常会把Config留给全局。一般情况下一个页面的每个组件都会特定一份的Config。

#### 生命周期

任何组件的生命周期都是从Created开始，然后从destroyed结束。这点延伸出万事万物是一致都有的。那在这两者之间，对于组件来说还会有什么阶段呢？

![生命周期](./img/生命周期.jpg)

* 挂载/卸载
  * mount：代表的是组件创建了之后，有没有被实际构造并显示出来。
  * mount和unmount是可以循环重复发生的，以至于unmount之后可以重回Created的一个状态。
* 更新
  * 组件的使用程序员，可以改变组件属性，接而触发更新渲染update。
  * 组件的使用用户，可以改变组件状态，接而触发更新渲染update。

上述所有就组成了一个组件基本完整生命周期，而我们平时所看到的什么willmount、didmount...诸如此类，其实都是组件基本完整生命周期中更细节的位置。组件基本完整的生命周期是从本质从面最贴近人类思维抽象的描述。

#### Chirldren

Chirldren是构建组件树中最重要的组件特性。Chirldren的分为两种一种是Content型，一种是Template 型。

* Content 型: 有几个Chirldren最终就显示几个。这种情况下的组件树是比较简单的。
* Template 型：Chirldren代表的是模板的作用。例如：list组件的渲染。



