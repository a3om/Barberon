(function()
{
    window.Application =
    {
        Models: {},
        Collections: {},
        Views: {},
        state: {},
    };

    // Backbone.sync = function(method, model, options)
    // {
    //     // return 1;
    // };

    Application.Vent = new _.extend({}, Backbone.Events);

    Application.Models.User = Backbone.Model.extend(
    {
        defaults:
        {
            //
        },

        urlRoot: '/users',
    });

    Application.Models.Auth = Backbone.Model.extend(
    {
        defaults:
        {
            loggedIn: false,
            user: null,
        },

        initialize: function()
        {
            this.attributes = Application.state.auth;
            console.log('Инициализация модели атворизации');
        },

        check: function()
        {
            return this.get('loggedIn');
        },

        login: function(data, callback)
        {
            var self = this;

            $.ajax(
            {
                url: '/login',
                method: 'POST',
                data: data,
            })
            .done(function(data)
            {
                if (!data.success)
                {
                    console.log(data);
                    callback && callback(data);
                    return;
                }

                callback && callback(data);

                self.set(
                {
                    loggedIn: true,
                    user: data.user,
                });

                Application.Vent.trigger('auth:loggedIn');
            });
        },

        register: function(data, callback)
        {
            var self = this;

            $.ajax(
            {
                url: '/register',
                method: 'POST',
                data: data,
            })
            .done(function(data)
            {
                if (!data.success)
                {
                    console.log(data);
                    callback && callback(data);
                    return;
                }

                callback && callback(data);

                self.set(
                {
                    loggedIn: true,
                    user: data.user,
                });

                Application.Vent.trigger('auth:loggedIn');
            });
        },

        logout: function(callback)
        {
            var self = this;

            $.ajax(
            {
                url: '/logout',
                method: 'POST',
            })
            .done(function(data)
            {
                if (!data.success)
                {
                    console.log(data);
                    callback && callback(data);
                    return;
                }

                callback && callback(data);

                self.set(
                {
                    loggedIn: false,
                    user: null,
                });

                Application.Vent.trigger('auth:loggedOut');
            });
        },
    });
})();

$(function()
{
    Application.Models.auth = new Application.Models.Auth;
    
    Application.Views.Header = Backbone.View.extend(
    {
        el: '#header',

        initialize: function()
        {
            this.template = _.template($('#headerTemplate').html());
            this.listenTo(Application.Models.auth, 'change', this.render);
            this.render();
            console.log('Вид был проинициализирован');
        },

        events:
        {
            'click #loginButton': 'login',
            'click #registerButton': 'register',
            'click #profileButton': 'openMenu',
            'click #logoutButton': 'logout',
        },

        login: function()
        {
            barberon.modal.show('login');
            return false;
        },

        register: function()
        {
            barberon.modal.show('registration');
            return false;
        },

        openMenu: function()
        {
            $('#header .menu').addClass('active');
            $('#header .profile').addClass('clicked');
            return false;
        },

        logout: function()
        {
            Application.Models.auth.logout();
            return false;
        },

        render: function()
        {
            this.$el.html(this.template(
            {
                auth: Application.Models.auth,
            }));

            barberon.recalculateWidth();
            return this;
        },
    });
    
    Application.Views.AddressEdit = Backbone.View.extend(
    {
        el: '#middle .wrapper',

        initialize: function()
        {
            //
        },
    });

    Application.Router = Backbone.Router.extend(
    {
        routes:
        {
            '': 'index',
            ':address': 'address',
            ':address/services': 'addressServices',
            ':address/edit': 'addressEdit',
        },

        index: function()
        {
            console.log('index');
        },

        address: function(address)
        {
            console.log('address // address = %s', address);
        },

        addressServices: function(address)
        {
            console.log('addressServices // address = %s', address);
        },

        addressEdit: function(address)
        {
            $.ajax(
            {
                url: '/' + address,
                method: 'POST',
            })
            .done(function(data)
            {
                console.log('addressEdit // address = %s', address);
                console.log(data);
            });
        },
    });

    new Application.Router();
    Backbone.history.start({pushState: true});
    Application.Views.header = new Application.Views.Header();
    Application.Models.user = new Application.Models.User;

    $('#loginForm').submit(function()
    {
        Application.Models.auth.login($(this).serialize(), function(data)
        {
            data = (typeof data === 'object') ? data : {};
            data.errors = data.errors || {};

            ['email', 'password'].forEach(function(field) {

                if (!data.errors[field]) {

                    $('#loginForm input[name=\'' + field + '\']').parent().removeClass('error').find('.error').text('').hide('slow');
                    return;
                }

                $('#loginForm input[name=\'' + field + '\']').parent().addClass('error').find('.error').text(data.errors[field][0]).show('slow');
            });

            if (!data.success)
            {
                return;
            }

            barberon.modal.hide();
        });

        return false;
    });

    $('#registrationForm').submit(function()
    {
        Application.Models.auth.register($(this).serialize(), function(data)
        {
            data = (typeof data === 'object') ? data : {};
            data.errors = data.errors || {};

            ['name', 'email', 'password'].forEach(function(field)
            {
                if (!data.errors[field]) {

                    $('#registrationForm input[name=\'' + field + '\']').parent().removeClass('error').find('.error').text('').hide('slow');
                    return;
                }

                $('#registrationForm input[name=\'' + field + '\']').parent().addClass('error').find('.error').text(data.errors[field][0]).show('slow');
            });

            if (!data.success)
            {
                return;
            }

            barberon.modal.hide();
        });

        return false;
    });
});