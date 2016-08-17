var App =
{
	//
};

$(function()
{
	App.Views = {};
	App.Templates = {};
	App.Vent = _.extend({}, Backbone.Events);

	App.History =
	{
		paths: [],

		push: function(object)
		{
			this.paths.push(object);
			App.Vent.trigger('history:push');
		},

		pop: function(count)
		{
			this.paths.splice(-count, count);
		},

		get: function(index)
		{
			if (this.paths.length == 0)
			{
				return '';
			}

			index = (index < 0) ? this.paths.length + index : index;

			if (index < 0 || index >= this.paths.length)
			{
				return '';
			}

			return this.paths[index];
		},
	};

	App.Api =
	{
		version: '1',

		request: function(path, data, success, error, context)
		{
			$.ajax(
			{
				url: '/v' + this.version + '/' + path,
				data: data,
				method: 'POST',
			})
			.done(function(data)
			{
				if (!data.response)
				{
					error && (context ? error.apply(context, [data.error]) : error(data.error));
					return;
				}

				success && (context ? success.apply(context, [data.response]) : success(data.response));
			});
		},
	};

	App.Account =
	{
		loggedIn: false,
		user: null,

		login: function(data, successCallback, errorCallback, context)
		{
			App.Api.request('account/login', data, function(user)
        	{
        		this.loggedIn = true;
        		this.user = user;
        		successCallback && (context ? successCallback.apply(context, [user]) : successCallback(user));
        		App.Vent.trigger('account:loggedIn', user);
        	},
        	function(error)
        	{
        		errorCallback && (context ? errorCallback.apply(context, [error]) : errorCallback(error));
        	},
        	this);
		},

		register: function(data, successCallback, errorCallback, context)
		{
			App.Api.request('account/register', data, function(user)
        	{
        		this.loggedIn = true;
        		this.user = user;
        		successCallback && (context ? successCallback.apply(context, [user]) : successCallback(user));
        		App.Vent.trigger('account:loggedIn', user);
        	},
        	function(error)
        	{
        		errorCallback && (context ? errorCallback.apply(context, [error]) : errorCallback(error));
        	},
        	this);
		},

		logout: function(successCallback, errorCallback, context)
		{
			App.Api.request('account/logout', {}, function()
        	{
        		this.loggedIn = false;
        		this.user = null;
        		successCallback && (context ? successCallback.apply(context) : successCallback());
        		App.Vent.trigger('account:loggedOut');
        	},
        	function(error)
        	{
        		errorCallback && (context ? errorCallback.apply(context, [errors]) : errorCallback(error));
        	},
        	this);
		},

		check: function()
		{
			return this.loggedIn;
		},
	};

	App.recalculateWidth = function()
	{
		var $body = $('body'), $wrapper = $('.wrapper');
	    var bodyWidth = $body.css('overflow', 'hidden').width();
	    var wrapperWidth = $wrapper.width();
	    // console.log('bodyWidth = ' + bodyWidth);
	    $wrapper.css('margin-left', (bodyWidth - wrapperWidth) / 2);
	    $body.css('overflow', '');
	};

	App.Templates.header = _.template($('#headerTemplate').html());
	App.Templates.authorizeModal = _.template($('#authorizeModalTemplate').html());
	App.Templates.search = _.template($('#searchTemplate').html());
	App.Templates.subheaderPoint = _.template($('#subheaderPointTemplate').html());
	App.Templates.pointWall = _.template($('#pointWallTemplate').html());
	App.Templates.pointInformation = _.template($('#pointInformationTemplate').html());
	App.Templates.pointServices = _.template($('#pointServicesTemplate').html());
	App.Templates.pointComments = _.template($('#pointCommentsTemplate').html());

	App.Views.Header = Backbone.View.extend(
    {
        el: '#header .wrapper',

        initialize: function()
        {
            var self = this;
            this.render();
            // console.log('Вид был проинициализирован');
            
            $(document).on('click', function()
            {
            	self.documentClick();
            });

            App.Vent.on('account:loggedIn', this.accountLoggedIn, this);
            App.Vent.on('account:loggedOut', this.accountLoggedOut, this);
            App.Vent.on('history:push', this.historyPush, this);
        },

        events:
        {
            'click #loginButton': 'login',
            'click #registerButton': 'register',
            'click #profileButton': 'openMenu',
            'click #logoutButton': 'logout',
            'click #backButton': 'historyBack',
        },

        login: function()
        {
        	console.log('login');
        	App.Views.authorizeModal = new App.Views.AuthorizeModal({focus: 'login'});
            // barberon.modal.show('login');
            // return false;
        },

        register: function()
        {
        	console.log('register');
        	App.Views.authorizeModal = new App.Views.AuthorizeModal({focus: 'registration'});
            // barberon.modal.show('registration');
            // return false;
        },

        openMenu: function()
        {
            this.$('.menu').addClass('active');
            this.$('.profile').addClass('clicked');
            return false;
        },

        logout: function()
        {
        	console.log('logout');
            App.Account.logout();
            return false;
        },

        documentClick: function()
        {
        	if (this.$('.profile').hasClass('clicked'))
        	{
        		this.$('.menu').removeClass('active');
            	this.$('.profile').removeClass('clicked');
        	}
        },

        accountLoggedIn: function(user)
        {
        	this.render();
        },

        accountLoggedOut: function(user)
        {
        	this.render();
        },

        historyPush: function()
        {
        	console.log('history push');
        	this.render();
        },

        historyBack: function()
        {
        	App.History.pop(2);
        },

        render: function()
        {
            this.$el.html(App.Templates.header(
            {
            	history: App.History.get(-2),
                account: App.Account,
            }));

            // barberon.recalculateWidth();
            return this;
        },
    });

	App.Views.AuthorizeModal = Backbone.View.extend(
    {
        el: '#authorizeModal',

        initialize: function(options)
        {
        	options = options || {};
            // this.listenTo(Application.Models.auth, 'change', this.render);
            this.render();

            if (options.focus)
            {
            	// console.log('FOCUS');
            }

            // console.log('Вид был проинициализирован');
        },

        events:
        {
            'submit #loginForm': 'loginFormSubmit',
            'submit #registrationForm': 'registrationFormSubmit',
            'click .overlay': 'overlayClick',
        },

        overlayClick: function()
        {
        	// console.log('Клик по фону модального окна');
        	this.clear();
        	return false;
        },

        loginFormSubmit: function()
        {
        	App.Account.login(this.$('#loginForm').serialize(), function(user)
        	{
        		this.clear();
        	},
        	function(error)
        	{
        		['email', 'password'].forEach(function(field)
        		{
	                if (!error[field])
	                {
	                    this.$('#loginForm input[name=\'' + field + '\']').parent().removeClass('error').find('.error').text('').hide('slow');
	                    return;
	                }

	                this.$('#loginForm input[name=\'' + field + '\']').parent().addClass('error').find('.error').text(error[field][0]).show('slow');
	            });
        	},
        	this);

        	return false;
        },

        registrationFormSubmit: function()
        {
        	console.log('submit');

        	App.Account.register(this.$('#registrationForm').serialize(), function(user)
        	{
        		this.clear();
        	},
        	function(error)
        	{
        		['name', 'email', 'password'].forEach(function(field)
	            {
	                if (!error[field]) {

	                    this.$('#registrationForm input[name=\'' + field + '\']').parent().removeClass('error').find('.error').text('').hide('slow');
	                    return;
	                }

	                this.$('#registrationForm input[name=\'' + field + '\']').parent().addClass('error').find('.error').text(error[field][0]).show('slow');
	            });
        	},
        	this);

        	return false;
        },

        clear: function()
		{
			this.undelegateEvents();
			this.$el.html('').hide();

			if (App.Views.authorizeModal)
        	{
        		App.Views.authorizeModal = null;
        	}
		},

        render: function()
        {
            this.$el.html(App.Templates.authorizeModal(
            {
                auth: App.auth,
            }
            )).show();

            // barberon.recalculateWidth();
            return this;
        },
    });
	
	App.Views.Search = Backbone.View.extend(
	{
		el: '#middle .wrapper',

		initialize: function()
		{
			this.render();
		},

		render: function()
		{
			this.$el.html(App.Templates.search(
			{
				//
			}));
		},
	});

	App.Views.Point = Backbone.View.extend(
	{
		el: '#middle .wrapper',
		rendered: false,
		point: null,
		subview: null,
		page: null,

		initialize: function(point, page)
		{
			this.point = point;
			this.page = page;
			this.render();
			$(document).on('click', this.documentClick);
			// console.log('Шаблон был проинициализирован');
		},

		setPage: function(page)
		{
			this.page = page;
			this.$('.menu a').removeClass('active');
			this.$('.menu a[data-id=' + page + ']').addClass('active');
		},

		events:
		{
			'click #subscribeButton': 'subscribe',
			'click #unsubscribeButton': 'unsubscribe',
			'click #subscribedButton': 'openUnsubscribe',
		},

		subscribe: function()
		{
			if (!App.Account.check())
			{
				App.Views.authorizeModal = new App.Views.AuthorizeModal();
				return;
			}

			App.Api.request('points/' + this.point.id + '/subscribe', {}, function()
			{
				this.$('#subscribeButton').hide();
				this.$('#subscribedButton').show();
			},
			function(error)
			{
				console.log(error);
			});
		},

		unsubscribe: function()
		{
			App.Api.request('points/' + this.point.id + '/unsubscribe', {}, function()
			{
				this.$('#subscribeButton').show();
				this.$('#subscribedButton').hide();
			},
			function(error)
			{
				console.log(error);
			});
		},

		openUnsubscribe: function(event)
		{
			this.$('#subscribedButton').addClass('clicked');
			return false;
		},

		documentClick: function()
		{
			// console.log('Клик по документу');

			if ($('#subscribedButton').hasClass('clicked'))
			{
				$('#subscribedButton').removeClass('clicked')
			}
		},

		render: function()
		{
			// console.log(this.point);

			this.$el.html(App.Templates.subheaderPoint(
			{
				point: this.point,
				page: this.page,
			}));

			this.rendered = true;
		},
	});

	App.Views.PointWall = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		posts: null,

		initialize: function(posts)
		{
			// console.log('Шаблон стены был проинициализирован');
			this.posts = posts;
			this.render();
		},

		events:
		{
			//
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointWall(
			{
				posts: this.posts,
			}));
		},
	});

	App.Views.PointInformation = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		point: null,

		initialize: function(point)
		{
			// console.log('Шаблон информации был проинициализирован');
			var self = this;
			this.point = point;
			this.render();

			ymaps.ready(function()
			{
				var map = new ymaps.Map("map",
				{
			        center: [self.point.latitude, self.point.longitude],
			        zoom: 17,
			    });

			    var point = new  ymaps.Placemark([self.point.latitude, self.point.longitude], {balloonContent: '<strong>' + self.point.name + '</strong><br />' + self.point.location, 'iconContent': self.point.name}, {preset: 'islands#greenStretchyIcon'});
				map.geoObjects.add(point);
			});
		},

		events:
		{

		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointInformation(
			{
				point: this.host,
			}));
		},
	});

	App.Views.PointServices = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		servicesSections: null,

		initialize: function(servicesSections)
		{
			// console.log('Шаблон услуг был проинициализирован');
			this.servicesSections = servicesSections;
			this.render();
		},

		events:
		{
			'click .section': 'sectionClick',
		},

		sectionClick: function(event)
		{
			this.$('.services').hide();
			this.$('.section').removeClass('active');
			// console.log($(event.toElement).attr('data-id'));
			$(event.toElement).addClass('active');
			this.$('#servicesOfSection' + $(event.toElement).attr('data-id')).show();
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointServices(
			{
				servicesSections: this.servicesSections,
			}));
		},
	});

	App.Views.PointComments = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		comments: null,

		initialize: function(comments)
		{
			// console.log('Шаблон комментариев был проинициализирован');
			this.comments = comments;
			this.render();
		},

		events:
		{
			//
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointComments(
			{
				comments: this.comments,
			}));
		},
	});

	App.Router = Backbone.Router.extend(
	{
		routes:
		{
			'': 'search',
			':profile': 'profileWall',
			':profile/edit': 'profileEdit',
			':profile/comments': 'profileComments',
			':profile/services': 'profileServices',
			':profile/information': 'profileInformation',
		},

		search: function()
		{
			App.Views.search = new App.Views.Search({}, 'wall');
		},

		profileWall: function(address)
		{
			// 1. Включаем в приложении индикатор загрузки
			// 2. Ожидаем получения данных
			// 3. Если данные получены с ошибкой, выключаем загрузчик
			// 4. Если данные получены без ошибок
				// 1. Проверяем, отрисован ли шаблон профиля
				// 2. Если не отрисован - отрисовываем
				// 3. Отрисовываем подшаблон стены

			console.log('profile index');

			App.Api.request('profiles/' + address, {'with': 'posts'}, function(profile)
			{
				if (App.Views.point)
				{
					App.Views[App.Views.point.subview].clear();
					App.Views.point.subview = null;
					App.Views.point.setPage('wall');
				}
				else
				{
					App.Views.point = new App.Views.Point(profile.host, 'wall');
				}

				App.Views.point.subview = 'pointWall';
				App.Views.pointWall = new App.Views.PointWall(profile.host.posts);
				// console.log(App.Views.pointWall);
				App.History.push({path: address, title: 'Записи'});
			},
			function(error)
			{
				console.log(error);
			});
		},

		profileInformation: function(address)
		{
			console.log('Информация');

			App.Api.request('profiles/' + address, {}, function(profile)
			{
				if (App.Views.point)
				{
					App.Views[App.Views.point.subview].clear();
					App.Views.point.subview = null;
					App.Views.point.setPage('information');
				}
				else
				{
					App.Views.point = new App.Views.Point(profile.host, 'information');
				}

				App.Views.point.subview = 'pointInformation';
				App.Views.pointInformation = new App.Views.PointInformation(profile.host);
				App.History.push({path: address + '/information', title: 'Информация'});
			},
			function(error)
			{
				console.log(error);
			});
		},

		profileServices: function(address)
		{
			console.log('Услуги');

			App.Api.request('profiles/' + address, {'with': 'services'}, function(profile)
			{
				if (App.Views.point)
				{
					App.Views[App.Views.point.subview].clear();
					App.Views.point.subview = null;
					App.Views.point.setPage('services');
				}
				else
				{
					App.Views.point = new App.Views.Point(profile.host, 'services');
				}

				App.Views.point.subview = 'pointServices';
				App.Views.pointServices = new App.Views.PointServices(profile.host.services_sections);
				App.History.push({path: address + '/services', title: 'Услуги'});
			},
			function(error)
			{
				console.log(error);
			});
		},

		profileComments: function(address)
		{
			console.log('Отзывы');

			App.Api.request('profiles/' + address, {'with': 'comments'}, function(profile)
			{
				if (App.Views.point)
				{
					App.Views[App.Views.point.subview].clear();
					App.Views.point.subview = null;
					App.Views.point.setPage('comments');
				}
				else
				{
					App.Views.point = new App.Views.Point(profile.host, 'comments');
				}

				App.Views.point.subview = 'pointComments';
				App.Views.pointComments = new App.Views.PointComments(profile.host.comments);
				App.History.push({path: address + '/comments', title: 'Отзывы'});
			},
			function(error)
			{
				console.log(error);
			});
		},
	});

	App.router = new App.Router();
	Backbone.history.start();
	App.Views.header = new App.Views.Header;
	App.recalculateWidth();

	App.router.on('route', function(a, b, c)
	{
		console.log('on route');
		console.log(a, b, c);
	});
});