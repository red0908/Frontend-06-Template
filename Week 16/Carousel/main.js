import { createElement } from './Framework'
import { Carousel } from './Carousel'
import { Button } from './Button' 
import { List } from './List'

let carImgs = [
  {
    img: 'https://static001.geekbang.org/resource/image/bd/2e/bddfad3dc8fb2f7c4942a0dc1286c92e.jpg',
    url: 'https://time.geekbang.org/',
    title: '灰白猫'
  },{
    img: 'https://static001.geekbang.org/resource/image/9b/74/9b6e9e3ac4415ffc166a8ea277c58d74.jpg',
    url: 'https://time.geekbang.org/',
    title: '花猫'
  },{
    img: 'https://static001.geekbang.org/resource/image/13/c7/13b7877ec262155ae5e7e20340a46ac7.jpg',
    url: 'https://time.geekbang.org/',
    title: '白猫加黑'
  },{
    img: 'https://static001.geekbang.org/resource/image/73/2a/737fb9f94c18a26a875c27169222b82a.jpg',
    url: 'https://time.geekbang.org/',
    title: '橘猫'
  }
]
/**Carousel轮播组件 */
let a = <Carousel 
  data={carImgs}
  onChange={event => console.log(event.detail.position)}
  onClick={event => location.href = event.detail.data.url}/>
a.mountTo(document.body)

/**Button组件，普通的内容型Children*/
let button = <Button>button</Button>

button.mountTo(document.body)

/**List组件，模板型Children*/
let list = <List data={carImgs}>
  {
    (record) => 
      <div class="list-item">
        <img src={record.img}/>
        <a href={record.url}>{record.title}</a>
      </div>
  }
</List>
let test = <div>
  <div>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
  </div>
</div>
list.mountTo(document.body)
test.mountTo(document.body)

