'use strict';
(function(){
    var todoApp = {
        init: function(){
            // Set API End points for Todo Lists and Todo Items
            this.todoListsEndpoint = '/api/todolists/';
            this.todoItemsEndpoint = '/api/todos/';

            // Forms for creating new todo list / todo item
            this.newTodoListForm = $('.new-todolist');
            this.newTodoItemForm = $('.new-todoitem');

            // Containers
            this.loadingIndicatorContainer = $('.loading');
            this.todoListsContainer = $('.todolists-container');
            this.todoItemsContainer = $('.todos');

            // Local vars
            this.todoLists = [];
            this.todoItems = [];

            // Templates
            this.todoListTemplate = '<a href="#" class="button" data-todolistid="{{id}}" title="{{desc}}">{{name}}</a> ';

            this.todoItemTemplate = '<div class="row todo"> \
                <div class="seven columns"> \
                  <label for="ti{{id}}"> \
                    <input type="checkbox" id="ti{{id}}"> \
                    <span class="label-body">{{text}}</span> \
                  </label> \
                </div> \
                <div class="five columns actions"> \
                  <select> \
                    <option value="1">Low</option> \
                    <option value="2">Medium</option> \
                    <option value="3">High</option> \
                  </select> \
                  <a class="button" href="#" data-todoitemid="{{id}}">Edit</a> \
                </div> \
              </div>'
        },

        bind_todolists: function(){
            // Bind clicks on buttons to loading of corresponding todolist
            this.todoListsContainer.find('a.button').on('click', $.proxy(this.load_todolist, this));
        },

        bind_all: function(){
            // Bind todolist
            this.bind_todolists()

            // Bind creation of new todolists 
            this.newTodoListForm.on('submit', $.proxy(this.new_todolist, this));
        },

        new_todolist: function(event){
            // Creates a new todo list
            event.preventDefault();
            var that = this;
            var data = this.serializeFormData(this.newTodoListForm);

            this.loading(true);
            $.ajax({
                url: this.todoListsEndpoint,
                method: 'POST',
                data: data,
                success: function(todolist){
                    // Add todolist to container
                    that.todoListsContainer.append(Mustache.render(that.todoListTemplate, todolist));
                    that.bind_todolists();
                    that.load_todolist('', todolist.id);

                    // Cleanup
                    that.newTodoListForm.find('input').val('');
                    that.newTodoItemForm.find('input').focus();
                },

                complete: function(){
                    that.loading(false);
                }
            })

            return false;
        },

        // TodoLists loading / rendering
        // ---------
        render_todolist: function(){
            var that = this;
            var output = '';

            $.each(this.todoLists, function(index, todolist){
                output +=  Mustache.render(that.todoListTemplate, todolist);
            });

            this.todoListsContainer.html(output);
        },

        update_todolists: function(){
            var that = this; 
            this.loading(true);
            $.ajax({
                url: this.todoListsEndpoint,
                method: 'GET',

                success: function(lists){
                    console.log(lists.length + ' todolists loaded.')
                    that.todoLists = lists;
                    that.render_todolist();
                    that.bind_todolists();
                },

                error: function(){
                    console.log("Couldn't load todolists.")
                },

                complete: function(){
                    that.loading(false);
                }
            })
        },

        load_todolist: function(event, todolistid){
            var that = this;
            var todolistid = todolistid || event.target.dataset.todolistid;

            this.loading(true);
            $.ajax({
                url: this.todoListsEndpoint + todolistid,
                method: 'GET',
                success: function(todolist){
                    // Add 'button-primary' class to button to make it seem selected
                    that.todoListsContainer.find('a.button').removeClass('button-primary');
                    that.todoListsContainer.find("a[data-todolistid='" + todolistid + "']").addClass('button-primary');

                    // Load todo items from todolist
                    that.render_todoitems(todolist.todos);
                },

                error: function(){
                    console.log("Couldn't load selected todolist.")
                },

                complete: function(){
                    that.loading(false);
                }
            })
        },

        // Todoitems rendering (loading is handled by load_todolist)
        // ---------
        render_todoitems: function(todoitems){
            var that = this;
            var output = '';

            $.each(todoitems, function(index, todoitem){
                var item = Mustache.render(that.todoItemTemplate, todoitem);
                $(item).find('select').val(todoitem.priority);
                console.log($(item).html())
                output += item;
            });

            this.todoItemsContainer.html(output);
        },

        // Helper functions
        // ---------
        serializeFormData: function(form){
            // Tiny function that helps 
            // to provide consistant serialization
            // of data of a form.
            // Returns a JSON object of fields {name:value}
            var o = {};
            var a = form.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        },

        loading: function(show){
            if (show){
                this.loadingIndicatorContainer.stop().fadeIn('fast');
            }else{
                this.loadingIndicatorContainer.stop().fadeOut('slow');
            }
        }
    }

    // Inti vars
    todoApp.init();

    // Bind events
    todoApp.bind_all();

    // Load init list of todolists
    todoApp.update_todolists();
})();