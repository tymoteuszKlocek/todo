'use strict';

var app = {}; // create namespace for our app

// Models

app.Todo = Backbone.Model.extend({
    defaults: {
        title: '',
        completed: false
    },
    toggle: function () {
        this.save({ completed: !this.get('completed') });
    }
});
//var todo = new app.Todo();
// Colections 

app.TodoList = Backbone.Collection.extend({
    model: app.Todo,
    localStorage: new Store("backbone-todo"),
    completed: function () {
        return this.filter(function (todo) {
            return todo.get('completed');
        })
    },
    remaining: function () {
        return this.without.apply(this, this.completed());
    }
});

// instance of the Collection
app.todoList = new app.TodoList();

// Views

app.TodoView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this; // enable chained calls  - what does it mean?
    },
    initialize: function () {
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.remove, this);
    },
    events: {
        'dblclick label': 'edit',
        'keypress .edit': 'updateOnEnter',
        'blur .edit': 'close',
        'click .toggle': 'toggleCompleted',
        'click .destroy': 'destroyItem'
    },
    edit: function () {
        this.$el.addClass('editing');
        this.input.focus();
        console.log('edit');
    },
    close: function () {
        var value = this.input.val().trim();
        if (value) {
            this.model.save({ title: value });
        }
        this.$el.removeClass('editing');
    },
    updateOnEnter: function (e) {
        if (e.which == 13) {
            this.close();
        }
    },
    toggleCompleted: function () {
        this.model.toggle();
    },
    destroyItem: function () {
        this.model.destroy();

    }
})

app.AppView = Backbone.View.extend({
    el: '#todoapp',
    initialize: function () {
        this.input = $('#new-todo');
        // when new elements are added to the collection render then with addOne
        app.todoList.on('add', this.addOne, this);
        app.todoList.on('reset', this.addAll, this);
        app.todoList.fetch(); // Loads list from local storage
    },
    events: {
        'keypress #new-todo': 'createTodoOnEnter'
    },
    createTodoOnEnter: function (e) {
        if (e.which !== 13 || !this.input.val().trim()) { // ENTER_KEY = 13
            return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val('');
    },
    addOne: function (todo) {
        var view = new app.TodoView({ model: todo });
        $('#todo-list').append(view.render().el); // what is this 'el'?
    },
    addAll: function () {
        // clean the todo list
        this.$('#todo-list').html('');  // why here we use html ???
        // filter todo item
        switch (window.filter) {
            case 'pending':
                _.each(app.todoList.remaining(), this.addOne);
                break;
            case 'completed':
                _.each(app.todoList.completed(), this.addOne);
                break;
            default:
                app.todoList.each(this.addOne, this);
                break;
        }
    },
    newAttributes: function () {
        return {
            title: this.input.val().trim(), // trim from js, and if I want to use underscore method here (let say there is something like trim in underscore --> this.input.val()._.trim() ??)
            completed: false
        }
    }
});

app.Router = Backbone.Router.extend({
    routes: {
        '*filter': 'setFilter'
    },
    setFilter: function (params) {
        console.log('app.router.params = ' + params);
        window.filter = params.trim() || '';
        app.todoList.trigger('reset');
    }
});     

//--------------
// Initializers
//--------------   

app.router = new app.Router();
Backbone.history.start();  // what is thi for?
app.appView = new app.AppView();

