# Backbone-Juicer-CRUD-Demo
## 注意事项
  1. events使用：利用event进行view之间的交互，方便优雅: Backbone.trigger('self-definition-eventName',params)
  
  2. view的使用style: 一种是一个view对应一个model，这样后续很容易获取当前触发事件的view的model，
      第二种是直接使用一个view （collection）渲染出来一个list，此时当一个view发生事件时候可能没法定位当前view对应collection中哪个model，
      若要定位model需要根据model.id或者model.cid，所以此种情况可能需要在遍历colleciton时候将model.id作为自定义属性设置进去，
      后续再获取id来定位model。
      
  3. 对于一个SPA应用，所有的视图只初始化一次，相当于单例模式，后续只需要渲染，还是每次渲染或者视图切换时候在重新生成一个view对象，此两者需要衡量使用。
  
  4. 尽量在交互中通过修改model或者修改collection来触发view的更新。
