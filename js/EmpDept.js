
var AppRouter = Backbone.Router.extend({
    routes:{
        '':'homePage',
        'dept':'deptOperaton',
        'emp':'empOperation',
        'emp/add':'empAddition'
    },
    empAddition:function () {
        appRouter.deptCollection.fetch();
        appRouter.deptListView.render();
    },
    initialize:function(){
        this.deptCollection = null ;
        this.deptAdditionView = null ;
        this.deptListView = null ;

        this.empCollection = null;
        this.empAdditionView = null ;
        this.empListView = null ;
    },
    removeDept:function () {
        if(this.deptAdditionView){
            this.deptAdditionView.undelegateEvents();
            this.deptAdditionView.destroy();
        }
        if(this.deptListView){
            this.deptListView.undelegateEvents();
            this.deptListView.destroy();
        }
    },
    removeEmp:function () {
        if(this.empAdditionView){
            this.empAdditionView.undelegateEvents();
            this.empAdditionView.destroy();
        }
        if(this.empListView){
            this.empListView.undelegateEvents();
            this.empListView.destroy();
        }
    },
    homePage:function(){

       /* if(this.deptCollection){
            this.deptCollection.reset();
        }
        if(this.deptAdditionView){
            this.deptAdditionView.destroy();
        }
        if(this.deptListView){
            this.deptListView.destroy();
        }
        if(this.empCollection){
            this.empCollection.reset();
        }
        if(this.empAdditionView){
            this.empAdditionView.destroy();
        }
        if(this.empListView){
            this.empListView.destroy();
        }*/
    },
    deptOperaton:function () {

        $("#deptMngSection").css('display','block');
        $("#empMngSection").css('display','none');
        //this.removeEmp();

        if(!this.deptAdditionView){
            this.deptAdditionView = new DeptAdditionView();
        }
        this.deptAdditionView.render();

        if(!this.deptCollection){
            this.deptCollection = new DeptCollection();
        }
        if(!this.deptListView){
            this.deptListView = new DeptListView({collection:this.deptCollection})
        }
        this.deptListView.render();

       /* var deptCollection = new DeptCollection();
        deptCollection.fetch({success:function (response) {
            var deptListView = new DeptListView({collection:deptCollection});
            deptListView.render();
        }});*/
    },

    empOperation:function () {

        $("#deptMngSection").css('display','none');
        $("#empMngSection").css('display','block');
        //this.removeDept();

       if(!this.deptCollection){
           this.deptCollection = new DeptCollection();
       }
        if(!this.empAdditionView){
            this.empAdditionView = new EmpAdditionView({collection:this.deptCollection});
        }
       this.empAdditionView.render();

       if(!this.empCollection){
           this.empCollection = new EmpCollection();
       }
        if(!this.empListView){
            this.empListView = new EmpListView({collection:this.empCollection});
        }
       this.empListView.render();
    }

});


var Dept = Backbone.Model.extend({
    // idAttribute:'id',
    initialize:function(){
        this.on("invalid", function(model, errMsg) {
            alert(errMsg);
        });
    },
    defaults:{
        id:null,
        name:null,
        deptNo:null
    },
    validate:function (attrs) {
        if(!attrs.name || !attrs.deptNo){
            return '信息不完整';
        }
    }
});

var DeptCollection = Backbone.Collection.extend({
    model:Dept,
    url:'http://localhost:8080/dept/all',
    initialize:function(){
      self = this;
      Backbone.on('deptUpdate',function(dept){
          //self.add(dept,{merge:true});
          //self.fetch();
      });
      /*Backbone.on('deptDelete',function (delDept) {
          //self.reset();
          self.fetch();
      });*/
    }/*,
    parse:function (response) {
        return response;
    }*/
});

var DeptAdditionView = Backbone.View.extend({
    el:'#deptAddView',
    initialize:function () {
        this.render();
    },
    render:function () {
        var deptAddTpl = $("#deptAddTemplate").html();
        //this.$el.html(juicer(deptAddTpl,{}));
        this.$el.html(juicer(deptAddTpl,{}));
        //this.delegateEvents();
        return this;
    },
    events:{
        'click #saveDeptBtn':'saveDept'
    },

    saveDept:function () {
        var deptNo = $('#deptNo').val();
        var deptName = $('#deptName').val();

        var dept = new Dept({name:deptName,deptNo:deptNo});
        dept.save({},{url:'http://localhost:8080/dept/',success:function (model,response) {
                dept.set('id',response);
                Backbone.trigger('deptAddition',dept);
            }});

        //添加完新条目，列表没有更新？？？？？？？？？？？？？？？
        //appRouter.deptListView.render();
        appRouter.navigate('emp/add',{trigger:true});

    }
});

var DeptListView = Backbone.View.extend({
    el:'#deptListView',
    initialize:function () {
        //this.collection = collection ;
        var self = this;
        _.forEach(['reset', 'remove', 'range','add'], function (e) {
            self.listenTo(self.collection, e, self.render);
        });
        self.render();

        Backbone.on('deptAddition',function (dept) {
            //self.collection.add(dept);
            self.collection.add(dept);
            //self.render();
        });
        Backbone.on('deptDelete',function (delDept) {
           self.collection.fetch();
        });
        /*this.listenTo(this.collection,'change',this.render);
        this.render();*/
    },
    //在el范围内查找元素，绑定点击事件
    events:{
        'click .edit':'doEdit',
        'click .remove':'doRemove'
    },
    doEdit:function(e){

        var tr = e.currentTarget.parentElement ;
        var btnTxt = e.currentTarget.innerHTML;

        if(btnTxt == '编辑'){
            var self = this ;
            $(tr).find('td.init').each(function () {
                //alert(this.innerHTML);
                $(this).attr('contenteditable',true);
                e.currentTarget.innerHTML = "保存";
            });
        }else if(btnTxt == '保存'){
            var id = $(tr).attr('id');
            var deptName = $(tr).find('td.init').first().text();
            var deptNo = $(tr).find('td.init:nth-child(2)').text();

            var deptUpdate = new Dept({id:id,name:deptName,deptNo:deptNo});
            deptUpdate.save({},{url:'http://localhost:8080/dept/'});
            Backbone.trigger('deptUpdate',deptUpdate);

            $(tr).find('td.init').each(function () {
                $(this).attr('contenteditable',false);
                e.currentTarget.innerHTML = "编辑";
            });
        }
    },
    doRemove:function(e){
        var tr = e.currentTarget.parentElement;
        var id = $(tr).attr('id');
        var delDept = new Dept({id:id});
        //注意此处删除操作
        var removedDept = appRouter.deptListView.collection.remove(delDept);
        delDept.destroy({url:'http://localhost:8080/dept/' + id});

        Backbone.trigger('deptDelete',delDept);
    },
    render:function () {
        //this.$el.html('');
        var deptListTpl = $("#deptListTemplate").html();
        this.collection.fetch();
        this.$el.html(juicer(deptListTpl,{"deptList":this.collection.toJSON()}));

        //this.delegateEvents();
        return this;
    }
});

///////////////////////////////EMP///////////////////////////
///////////////////////////////////////////////////
var Emp = Backbone.Model.extend({
    idAttribute:'id',
    initialize:function () {
      this.on('invalid',function (model, errMsg) {
          alert(errMsg);
      })  
    },
    defaults:{
        id:null,
        name:null,
        empNo:null,
        dept:null
    },
    validate:function (attrs) {
        if(!attrs.name || !attrs.empNo ||!attrs.dept){
            return '信息残缺'; //验证失败，此处返回非空信息即可，此时会触发一个invalid事件
        }
    }
});

var EmpCollection = Backbone.Collection.extend({
    model:Emp,
    url:'http://localhost:8080/emp/full/all',
    initialize:function(){
        self = this ;
        /*Backbone.on('empUpdate',function (emp) {
            //self.add(emp,{merge: true});
            //self.collection.reset();
            //self.collection.fetch();
        });
        Backbone.on('empDelete',function (emp) {
            //self.collection.reset();
            //self.collection.fetch();
        })*/
    }/*,
    parse:function (response) {
        return response;
    }*/
});

var EmpAdditionView = Backbone.View.extend({
    el: '#empAddView',
    initialize: function () {
        var self = this;
        _.forEach(['reset', 'remove', 'range', 'add'], function (e) {
            self.listenTo(self.collection, e, self.render);
        });
        self.render();
    },
    render: function () {
       // this.$el.html('');
        var empAddTpl = $("#empAddTemplate").html();
        this.collection.fetch();
        this.$el.html(juicer(empAddTpl, {'deptList': this.collection.toJSON()}));
        //this.delegateEvents();
        return this;
    },
    events: {
        'click #saveEmpBtn': 'saveEmp'
    },
    saveEmp: function () {
        var empName = $("#empName").val();
        var empNo = $("#empNo").val();
        var deptId = $('#empDeptList option:selected').attr('deptId');

        var emp = new Emp({name:empName,empNo:empNo,dept:deptId});
        emp.save({},{url:'http://localhost:8080/emp/',success:function (model, pk) {
                emp.set('id',pk); //此处回填idcollection（pk是后端返回的主键信息），构造楚一个完整的model，方便后续添加到对应的
                Backbone.trigger('empAddition',emp);
            }});
        Backbone.trigger('empAddition',emp);
    }
});

var EmpListView = Backbone.View.extend({
    el:'#empListView',
    initialize:function () {
        self = this ;
        //this.listenTo(this.model, "change", this.render);
        _.forEach(['reset', 'remove', 'range', 'add'], function (e) {
            self.listenTo(self.collection, e, self.render);
        });
        this.listenTo(this.mode,'change')
        Backbone.on('empAddition',function (emp) {
            self.collection.add(emp);
        });
        Backbone.on('empUpdate',function (emp) {
            //self.render();
            self.collection.fetch();
        });
        Backbone.on('empDelete',function (emp) {
            // self.render();
            self.collection.fetch();
        })
        this.render();
    },
    render:function () {
       // this.$el.html('');
        this.collection.fetch();
        var empListTpl = $("#empListTemplate").html();
        this.$el.html(juicer(empListTpl,{'empList':this.collection.toJSON()}));
        //this.delegateEvents();
        return this;
    },
    events:{
        'click .edit':'doEdit',
        'click .remove':'doRemove'
    },
    doEdit:function (e) {
        var tr = e.currentTarget.parentElement ;
        var btnTxt = e.currentTarget.innerHTML;

        if(btnTxt == '编辑'){
            var self = this ;
            $(tr).find('td.init').each(function () {
                //alert(this.innerHTML);
                $(this).attr('contenteditable',true);
                e.currentTarget.innerHTML = "保存";
            });
        }else if(btnTxt == '保存'){

            // 保存数据到数据库
            var id = $(tr).attr('id');
            var empNo = $(tr).find('td.init').first().text();
            var empName = $(tr).find('td.init:nth-child(2)').text();
            var dept = $(tr).find('td.init').last().text();

            var updateRow = new Emp();
            updateRow.set('name',empName);
            updateRow.set('empNo',empNo);
            updateRow.set('dept',dept);

            updateRow.save({},{url:'http://localhost:8080/emp/'});

            Backbone.trigger('empUpdate',updateRow);

            //alert(updateRow.get('name'));

            $(tr).find('td.init').each(function () {
                $(this).attr('contenteditable',false);
                e.currentTarget.innerHTML = "编辑";
            });
        }


    },
    doRemove:function (e) {

        var tr = e.currentTarget.parentElement;
        var id = $(tr).attr('id');

        var delEmp = new Emp({id:id});
        var removedEmp = appRouter.deptListView.collection.remove(delEmp);
        delEmp.destroy({url:'http://localhost:8080/emp/' + id});
        Backbone.trigger('empDelete',delEmp);
        //alert(curDelModel.get('name'));
    }
});


$(function () {


    //  Backbone.history.start({pushState:true})
    //trigger，返回true触发事件，返回false只是url变化，不触发事件
    //replace ,替换url，history不会记录变动
    //appRouter.navigate('',{trigger:true,replace:true});

    $('#deptMngBtn').click(function () {

       /* $("#empContainer").css('display','none');
        $("#deptContainer").css('display','block');*/
        $("#deptMngSection").css('display','block');
        $("#empMngSection").css('display','none');
        appRouter.navigate('dept',{trigger:true});
        //window.location.reload();
    });
    $("#empMngBtn").click(function () {

        /*$("#deptContainer").css('display','none');
        $("#empContainer").css('display','block');
*/
        $("#deptMngSection").css('display','none');
        $("#empMngSection").css('display','block');
        appRouter.navigate('emp',{trigger:true});
        //window.location.reload();
    });

    appRouter = new AppRouter();
    Backbone.history.start();
    //appRouter.navigate('',{trigger:true});
    /*var deptAdditionView = new DeptAdditionView();
    var deptCollection = new DeptCollection();
    var deptListView = new DeptListView({collection:deptCollection});*/


    /*var empAdditionView = new EmpAdditionView({collection:deptCollection});
    var empCollection = new EmpCollection();
    var empListView = new EmpListView({collection:empCollection});*/


});