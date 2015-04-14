'use strict';
(function(){
    var todoApp = {
        init: function(){
            // Set API End points for Todo Lists and Todo Items
            this.todoListsEndpoint = '/api/todolists/';
            this.todoItemsEndpoint = '/api/todos/';
            this.authEndpoint = '/authenticate/';

            // Forms for creating new todo list / todo item
            this.newTodoListForm = $('.new-todolist');
            this.newTodoItemForm = $('.new-todoitem');
            this.authForm = $('.authenticate');

            // Containers
            this.loadingIndicatorContainer = $('.loading');
            this.todoListsContainer = $('.todolists-container');
            this.todoItemsContainer = $('.todos-container');

            // Local vars
            if (typeof(user_email) != 'undefined') {this.user_authenticated = user_email};
            this.todoLists = [];
            this.todoItems = [];
            this.selectedTodoList = null;

            // Templates
            this.formErrorItemTemplate = '<pre><code>{{message}}</code></pre>';
            this.todoListTemplate = '<a href="#" class="button" data-todolistid="{{id}}" title="{{desc}}">{{name}}</a> ';

            this.todoItemTemplate = '<div data-todoitemid="{{id}}" class="row todo todoitem-{{id}} {{#done}}ticked{{/done}}"> \
                <div class="seven columns"> \
                  <label for="ti{{id}}"> \
                    <input type="checkbox" id="ti{{id}}" {{#done}}checked{{/done}}> \
                    <span class="label-body">{{text}}</span> \
                  </label> \
                </div> \
                <div class="five columns actions"> \
                  <select> \
                    <option value="1">Low</option> \
                    <option value="2">Medium</option> \
                    <option value="3">High</option> \
                  </select> \
                  <a class="button edit-button" href="#">Edit</a> \
                </div> \
              </div>';

            // Simple jQuery.ajax setup to include CSRF token
            var that = this;  // Get copy of context
            this.csrftoken = $.cookie('csrftoken');
            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!that.is_csrf_safe(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", that.csrftoken);
                    }
                }
            });
        },

        bind_todolists: function(){
            // Bind clicks on buttons to loading of corresponding todolist
            this.todoListsContainer.find('a.button').on('click', $.proxy(this.load_todolist, this));
        },

        bind_todoitems: function(){
            
            var todoitem_input = this.todoItemsContainer.find('.todo').find('input');
            var todoitem_select = this.todoItemsContainer.find('.todo').find('select');
            var todoitem_edit = this.todoItemsContainer.find('.todo').find('.edit-button');

            var that = this;  // Get copy of context
            
            // Note: Intentionally avoiding PATCH.

            // Done tickin'
            todoitem_input.off();
            todoitem_input.change(function() {
                // Tick todo item as done
                var todoinput = this;

                var todoitem_id = $(todoinput).closest('.todo').data('todoitemid');

                var data = {
                    'todolist': that.selectedTodoList.id,
                    'text': $(todoinput).closest('.todo').find('span').text(),
                    'done': todoinput.checked
                };
                
                that.loading(true);

                $.ajax({
                    url: that.todoItemsEndpoint + todoitem_id + '/',
                    method: 'PUT',
                    data: data,
                    success: function(data){
                        $(todoinput).closest('.todo').toggleClass('ticked');
                    },
                    complete: function(){
                        that.loading(false);
                    }
                });
            });

            // Priority changin'
            todoitem_select.off();
            todoitem_select.change(function() {
                // Set todoitem priority
                var todoselect = this;

                var todoitem_id = $(todoselect).closest('.todo').data('todoitemid');

                var data = {
                    'todolist': that.selectedTodoList.id,
                    'text': $(todoselect).closest('.todo').find('span').text(),
                    'priority': $(todoselect).val()
                };

                that.loading(true);
                $.ajax({
                    url: that.todoItemsEndpoint + todoitem_id + '/',
                    method: 'PUT',
                    data: data,

                    complete: function(){
                        that.loading(false);
                    }
                });
            });


            // Todo text editing
            todoitem_edit.off();
            todoitem_edit.click(function() {
                // Set todoitem new text if it changed
                var editbutton = this;
                var current_text = $(editbutton).closest('.todo').find('span').text();
                var new_text = prompt("Edit:", current_text);
                if(new_text != current_text){
                    
                    var todoitem_id = $(editbutton).closest('.todo').data('todoitemid');

                    var data = {
                        'todolist': that.selectedTodoList.id,
                        'text': new_text,
                    };

                    that.loading(true);
                    $.ajax({
                        url: that.todoItemsEndpoint + todoitem_id + '/',
                        method: 'PUT',
                        data: data,
                        success: function(data){
                            $(editbutton).closest('.todo').find('span').text(new_text);
                        },

                        complete: function(){
                            that.loading(false);
                        }
                    });
                }
                
            });

        },

        bind_all: function(){
            // Bind todolist
            this.bind_todolists()

            // Bind authentication form if not authenticated
            if (!this.user_authenticated){
                this.authForm.on('submit', $.proxy(this.auth, this));
            }

            // Bind todo items
            this.bind_todoitems();

            // Bind todolists form submit
            this.newTodoListForm.on('submit', $.proxy(this.new_todolist, this));

            // Bind todoitem form submit
            this.newTodoItemForm.on('submit', $.proxy(this.new_todoitem, this));
        },


        // Authenticate: Log in if email/password correct. Create user if data is valid. 
        auth: function(){
            // Creates a new todo list
            event.preventDefault();
            var that = this;  // Get copy of context
            var data = this.serializeFormData(this.authForm);

            this.loading(true);

            $.ajax({
                url: this.authEndpoint,
                method: 'POST',
                data: data,

                success: function(data){
                    location.reload();
                },

                error: function(xhr, status, error){
                    var messages = xhr.responseJSON;
                    var errors_html = '';

                    for (var i in messages){
                        errors_html += Mustache.render(that.formErrorItemTemplate, {'message': messages[i]});
                    }

                    that.authForm.find('.errors').html(errors_html);
                },

                complete: function(){
                    that.loading(false);
                }
            });

            return false;
        },

        // Todo list related
        new_todolist: function(event){
            // Creates a new todo list
            event.preventDefault();
            var that = this;  // Get copy of context
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
            var that = this;  // Get copy of context

            var output = '';

            $.each(this.todoLists, function(index, todolist){
                output +=  Mustache.render(that.todoListTemplate, todolist);
            });

            this.todoListsContainer.html(output);

            // Load last selected todolist from localstorage if available
            if($.jStorage.get('selected_todolist')){
                that.load_todolist('', $.jStorage.get('selected_todolist'));
            };
        },

        update_todolists: function(){
            var that = this;  // Get copy of context

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
            var that = this;  // Get copy of context

            var todolistid = todolistid || event.target.dataset.todolistid;

            this.loading(true);
            $.ajax({
                url: this.todoListsEndpoint + todolistid + '/',
                method: 'GET',

                success: function(todolist){
                    // Add 'button-primary' class to button to make it seem selected
                    that.todoListsContainer.find('a.button').removeClass('button-primary');
                    that.todoListsContainer.find("a[data-todolistid='" + todolistid + "']").addClass('button-primary');

                    that.newTodoItemForm.find('input').focus();
                    that.newTodoItemForm.find('input').attr('placeholder', 'Add something to: ' + todolist.name);

                    that.selectedTodoList = todolist;

                    // Load todo items from todolist
                    that.todoItems = that.selectedTodoList.todos;
                    that.render_todoitems();

                    // Bind events
                    that.bind_todoitems();

                    // Set selected todolist in localstorage
                    $.jStorage.set('selected_todolist', that.selectedTodoList.id);
                },

                error: function(xhr, status, e){
                    console.log("Couldn't load selected todolist: " + e)
                    $.jStorage.set('selected_todolist', null);
                },

                complete: function(){
                    that.loading(false);
                }
            })
        },

        // Todo Item related
        new_todoitem: function(event){
            // Creates a new todo item in selected todo list
            if (this.selectedTodoList){
                event.preventDefault();
                var that = this; // Get copy of context

                var data = this.serializeFormData(this.newTodoItemForm);

                data.todolist = this.selectedTodoList.id;

                this.loading(true);
                $.ajax({
                    url: this.todoItemsEndpoint,
                    method: 'POST',
                    data: data,
                    success: function(todoitem){
                        var item = Mustache.render(that.todoItemTemplate, todoitem);
                        that.todoItemsContainer.append($(item).find('option[value=' + todoitem.priority + ']').attr('selected', true).end().prop('outerHTML'));

                        // Bind events
                        that.bind_todoitems();

                        // Cleanup
                        that.newTodoItemForm.find('input').val('');
                    },

                    complete: function(){
                        that.loading(false);
                    }
                })
            }
            return false;
        },

        // Todoitems rendering (loading is handled by load_todolist)
        // ---------
        render_todoitems: function(){
            var that = this;  // Get copy of context        
            var output = '';
            $.each(this.todoItems, function(index, todoitem){
                var item = Mustache.render(that.todoItemTemplate, todoitem);
                output += $(item).find('option[value=' + todoitem.priority + ']').attr('selected', true).end().prop('outerHTML');
            });

            console.log(this.todoItems.length + ' todos loaded.')

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

        is_csrf_safe: function(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS)$/.test(method));
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

    if (todoApp.user_authenticated){
        // Load init list of todolists
        todoApp.update_todolists();
    }
})();