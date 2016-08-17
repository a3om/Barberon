var App =
{
	Views: {},
	Templates: {},
	State: {},
};

$(function()
{
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

		change: function(object)
		{
			if (this.paths.length == 0)
			{
				return;
			}

			this.paths[this.paths.length - 1] = object;
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
				if (data.response === undefined)
				{
					error && (context ? error.apply(context, [data.error]) : error(data.error));
					return;
				}

				success && (context ? success.apply(context, [data.response]) : success(data.response));
			});
		},
	};

	App.Loader = function(path, query, perPage, units)
	{
		var _count = 0;
		var _end = false;
		var _query = query;
		var _onLoad = null;
		var _onEnd = null;
		var _onNewQuery = null;
		var _onNoResults = null;

		this.count = function()
		{
			return _count;
		};

		this.incrementCount = function()
		{
			++_count;
		};

		this.decrementCount = function()
		{
			--_count;
		};

		this.load = function()
		{
			var query = _(_query).clone();
			query.offset = _count;
			query.count = (_count == 0 && query.count) ? query.count : perPage;

			App.Api.request(path, query, function(units)
			{
				if (units.length == 0)
				{
					if (_count)
					{
						_end = true;
						_onEnd && _onEnd();
						return;
					}

					_onNoResults && _onNoResults();
					return;
				}

				_count += units.length;
				_onLoad && _onLoad(units);

				if (units.length < perPage)
				{
					_end = true;
					_onEnd && _onEnd();
				}
			},
			function(error)
			{
				console.log(error);
			},
			this);
		};

		this.changeQuery = function(query)
		{
			_query = query;
			_count = 0;
			_end = false;
			_onNewQuery && _onNewQuery(query);
		};

		this.onLoad = function(callback)
		{
			if (!callback)
			{
				return;
			}

			_onLoad = callback;
		};

		this.onEnd = function(callback)
		{
			if (!callback)
			{
				return;
			}

			_onEnd = callback;
		};

		this.onNewQuery = function(callback)
		{
			if (!callback)
			{
				return;
			}

			_onNewQuery = callback;
		};

		this.onNoResults = function(callback)
		{
			if (!callback)
			{
				return;
			}

			_onNoResults = callback;
		};

		setTimeout(function()
		{
			if (units !== undefined)
			{
				if (units.length == 0)
				{
					if (_count)
					{
						_end = true;
						_onEnd && _onEnd();
						return;
					}

					_onNoResults && _onNoResults();
					return;
				}

				_onLoad && _onLoad(units);
				_count += units.length;

				if (units.length < perPage)
				{
					_end = true;
					_onEnd && _onEnd();
				}
			}
		},
		0);
	},

	App.Account =
	{
		loggedIn: App.State.Account ? App.State.Account.loggedIn : false,
		user: App.State.Account ? App.State.Account.user : null,

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
        		console.log(error);
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
        		console.log(error);
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
        		console.log(error);
        		errorCallback && (context ? errorCallback.apply(context, [errors]) : errorCallback(error));
        	},
        	this);
		},

		check: function()
		{
			return this.loggedIn;
		},
	};

	App.Scroller = function()
	{
	    var lastPosition = 0;
	    var lastScrollPosition = 0;
	    var going = false;
	    var descriptionScroll = 0;

        $('#scroll').click(function()
        {
            if (going)
            {
                return false;
            }

            if (lastScrollPosition == 0)
            {
                going = true;

                $({deg: 360}).animate({deg: 180},
                {
                    duration: 400,

                    step: function(now)
                    {
                        $('#scroll .arrow').css('transform', 'rotate(' + now + 'deg)');
                    }
                });

                descriptionScroll = 0;

                $('html, body').animate({scrollTop : 0}, 400, function()
                {
                    console.log('Закончили перемещение');
                });

                lastScrollPosition = $(window).scrollTop();
            }
            else
            {
                going = true;
                
                $({deg: 180}).animate({deg: 360},
                {
                    duration: 400,

                    step: function(deg)
                    {
                        $('#scroll .arrow').css('transform', 'rotate(' + deg + 'deg)');
                    }
                });

                descriptionScroll = lastScrollPosition;

                $('html, body').animate({scrollTop : lastPosition}, 400, function()
                {
                    going = false;
                });

                lastScrollPosition = 0;
            }
        });

	    this.updateState = function(scrollPosition)
	    {
	        if (going)
	        {
	            if (descriptionScroll != scrollPosition)
	            {
	                return;
	            }

	            going = false;
	            return;
	        }

	        if (scrollPosition > 100)
	        {
	            $('#scroll').show();
	            $('#scroll .arrow').css('transform', 'rotate(0deg)');
	            lastScrollPosition = 0;
	        }
	        else
	        {
	            $('#scroll').hide();
	            console.log('Переместились вверх');
	        }

	        lastPosition = scrollPosition;
	    };

	    this.up = function()
	    {
	        console.log('To up');
	        $('#scroll').show().css('transform', 'rotate(0deg)');
	    };

	    this.down = function()
	    {
	        console.log('To down');
	        $('#scroll').show().css('transform', 'rotate(180deg)');
	    };

	    App.Vent.on('scroll', function()
	    {
	    	this.updateState($(window).scrollTop());
	    },
	    this);
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

	App.includeTemplates = function(templates)
	{
		templates = templates || [];

		_(templates).each(function(template)
		{
			App.Templates[template] = _.template($('#' + template + 'Template').html());
		});
	};

	App.includeTemplates(
	[
		// Common

		'header',
		'authorizeModal',

		// Search

		'search',
		'searchSeparator',
		'searchUnit',
		'searchNotFound',
		'searchLoading',
		'searchLoad',

		// Point

		'subheaderPoint',

		'pointWall',
		'pointWallLoading',
		'pointWallLoad',
		'pointWallNotFound',
		'pointWallSeparator',
		'pointWallPost',

		'pointInformation',
		'pointServices',

		'pointComments',
		'pointCommentsLoading',
		'pointCommentsLoad',
		'pointCommentsNotFound',
		'pointCommentsSeparator',
		'pointCommentsOne',

		'pointActions',
		'pointActionsLoading',
		'pointActionsLoad',
		'pointActionsNotFound',
		'pointActionsSeparator',
		'pointActionsOne',

		// User

		'subheaderUser',

		'userWall',
		'userWallLoading',
		'userWallLoad',
		'userWallNotFound',
		'userWallSeparator',
		'userWallPost',

		'userPoints',
		'userPointsLoading',
		'userPointsLoad',
		'userPointsNotFound',
		'userPointsSeparator',
		'userPointsOne',
	]);

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
            App.Vent.on('account:updatePointSubscriptions', this.pointSubscriptionsUpdate, this);
        },

        events:
        {
            'click #loginButton': 'login',
            'click #registerButton': 'register',
            'click #profileButton': 'openMenu',
            'click #logoutButton': 'logout',
            'click #backButton': 'historyBack',
            'click #editProfileButton': 'editProfile',
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

        pointSubscriptionsUpdate: function(count)
        {
        	this.$('#subscribedPointsCount').text(count);
        },

        editProfile: function()
        {
        	console.log(App.Account.user.profile);
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

		initialize: function(query)
		{
			var self = this;
			this.query = query;
			this.render();
			this.loader = new App.Loader('search', this.query, 10);
			
			this.loader.onLoad(function(units)
			{
				self.unitsWereLoaded(units);
			});

			this.loader.onEnd(function()
			{
				self.unitsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				self.unitsNotFound();
			});

			this.$('#content').html(App.Templates.searchLoading({first: true}));
			this.loader.load();

			$(document).on('click', function(event)
			{
				self.documentClick(event);
			});

			App.Vent.on('scroll', function()
			{
				var $header = $('#header'), $sidebar = $('#sidebar'), $topbar = $('#topbar');

				if ($(window).scrollTop() < $header.height())
		        {
		            $sidebar.css('position', 'absolute');
		            $sidebar.css('top', $header.height());
		            $topbar.css('position', 'absolute');
		            $topbar.css('top', $header.height());
		        }
		        else
		        {
		            $sidebar.css('position', 'fixed');
		            $sidebar.css('top', 0);
		            $topbar.css('position', 'fixed');
		            $topbar.css('top', 0);
		        }
			});

			new App.Scroller;
		},

		events:
		{
			'submit #searchForm': 'searchFormSubmit',
			'click #sidebar .dropdown': 'sidebarDropdownClick',
			'click #sidebar .dropdown li': 'sidebarDropdownLiClick',
			'click .sorter .title': 'sortDropdownClick',
			'click .sorter li': 'sortDropdownLiClick',
			'click .sorter .order': 'sortDropdownOrderClick',
			'keyup #filterPriceFrom': 'filterPriceChange',
			'keyup #filterPriceTo': 'filterPriceChange',
		},

		searchFormSubmit: function()
		{
			this.query.query = this.$('#query').val();
			this.queryChange();
			return false;
		},

		sidebarDropdownClick: function(event)
		{
			this.$('#sidebar .dropdown').addClass('clicked').find('ul').addClass('active');
			return false;
		},

		sidebarDropdownLiClick: function(event)
		{
			var elements =
			[
				{title: 'Поиск точек', search: 'points',},
				{title: 'Поиск услуг', search: 'services',},
				{title: 'Поиск акций', search: 'actions',},
			];

			var element = elements[$(event.toElement).index()];
			this.$('#searchByTitle').text(element.title);
			this.$('#sidebar .dropdown').removeClass('clicked').find('ul').removeClass('active');

			if (element.search == 'services')
			{
				this.$('#servicesPriceFilter').show();
				this.filterPriceChange();
			}
			else
			{
				this.$('#servicesPriceFilter').hide();
				delete this.query.priceFrom;
				delete this.query.priceTo;
			}

			this.query.search = element.search;
			this.queryChange();
			return false;
		},

		sortDropdownClick: function(event)
		{
			this.$('.sorter').addClass('clicked').find('ul').addClass('active');
			return false;
		},

		sortDropdownLiClick: function(event)
		{
			var elements =
			[
				{title: 'По рейтингу', sort: 'rating',},
				{title: 'По расстоянию', sort: 'distance',},
			];

			var element = elements[$(event.toElement).index()];
			this.$('.sorter #sortingByTitle').text(element.title);
			this.$('.sorter').removeClass('clicked').find('ul').removeClass('active');
			this.query.sort = element.sort;
			this.queryChange();
			return false;
		},

		sortDropdownOrderClick: function(event)
		{
			var desc = ($(event.toElement).text() == '↓');
			$(event.toElement).html(desc ? '&uarr;' : '&darr;');
			this.query.order = desc ? 'asc' : 'desc';
			this.queryChange();
		},

		filterPriceChange: function(event)
		{
			if (!this.$('#filterPriceFrom').val() || !this.$('#filterPriceFrom').val().match(/[0-9]+/))
			{
				return false;
			}

			if (!this.$('#filterPriceTo').val() || !this.$('#filterPriceTo').val().match(/[0-9]+/))
			{
				return false;
			}

			this.query.priceFrom = this.$('#filterPriceFrom').val().match(/[0-9]+/)[0];
			this.query.priceTo = this.$('#filterPriceTo').val().match(/[0-9]+/)[0];
			this.queryChange();
		},

		queryChange: function()
		{
			App.Vent.off('lowScroll');
			delete this.query.count;
			this.replaceHistoryState();
			this.$('#content').html(App.Templates.searchLoading({first: true}));
			this.loader.changeQuery(this.query);
			this.loader.load();
		},

		unitsWereLoaded: function(units)
		{
			var self = this;
			var type = this.query.search ? this.query.search : 'points';

			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(units).each(function(unit, index)
				{
					this.$('#content').append(App.Templates.searchSeparator());

					this.$('#content').append(App.Templates.searchUnit(
					{
						unit: unit,
						type: type,
					}));
				});
			}
			else
			{
				this.$('#content').html('');

				_(units).each(function(unit, index)
				{
					if (index != 0)
					{
						this.$('#content').append(App.Templates.searchSeparator());
					}

					this.$('#content').append(App.Templates.searchUnit(
					{
						unit: unit,
						type: type,
					}));
				});
			}

			this.$('#content').append(App.Templates.searchLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewUnits();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewUnits();
		    },
		    this);

			this.query.count = this.loader.count();
			this.replaceHistoryState();
		},

		unitsIsEnded: function()
		{
			this.$('#loading').remove();
			this.$('#load').remove();
		},

		unitsNotFound: function()
		{
			this.$('#content').html(App.Templates.searchNotFound());
		},

		documentClick: function(event)
		{
			if (this.$('#sidebar .dropdown').hasClass('clicked'))
			{
				this.$('#sidebar .dropdown').removeClass('clicked').find('ul').removeClass('active');
			}

			if (this.$('.sorter').hasClass('clicked'))
			{
				this.$('.sorter').removeClass('clicked').find('ul').removeClass('active');
			}
		},

		replaceHistoryState: function()
		{
			var query = (this.query.length == 0) ? '' : '?' + $.param(this.query)
			App.History.change({path: query, title: 'Поиск' + (this.query.query ? ' ' + this.query.query : '')});
			window.history.replaceState({}, null, query);
		},

		loadNewUnits: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#content').append(App.Templates.searchLoading({first: false}));
			this.loader.load();
		},

		render: function()
		{
			var self = this;

			var searchTitle =
			{
				'points': 'Поиск точек',
				'services': 'Поиск услуг',
				'actions': 'Поиск акций',
			};

			var sortTitle =
			{
				'rating': 'По рейтингу',
				'distance': 'По расстоянию',
			};

			var order =
			{
				'desc': true,
				'asc': true,
			};

			this.$el.html(App.Templates.search(
			{
				query: this.query,
				searchTitle: this.query.search && searchTitle[this.query.search] ? searchTitle[this.query.search] : searchTitle['points'],
				sortTitle: this.query.sort && sortTitle[this.query.sort] ? sortTitle[this.query.sort] : sortTitle['rating'],
				order: this.query.order && order[this.query.order] ? order[this.query.order] : 'desc',
				servicesPriceFilter: true,
			}));

			this.$("#slider-range").slider(
	        {
	            range: true,
	            min: 50,
	            max: 5000,
	            step: 25,
	            values: [50, 5000],

	            slide: function(event, ui)
	            {
	                $('#filterPriceFrom').val(ui.values[0]);
	                $('#filterPriceTo').val(ui.values[1]);
	            },

	            change: function(event, ui)
	            {
	            	self.filterPriceChange(event);
	            },
	        });
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
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
			App.Vent.on('account:loggedIn', this.accountLoggedIn, this);
			App.Vent.on('account:loggedOut', this.accountLoggedOut, this);
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

			App.Api.request('points/' + this.point.id + '/subscribe', {}, function(information)
			{
				this.$('#subscribeButton').hide();
				this.$('#subscribedButton').show();

				if (information.count !== undefined)
				{
					App.Vent.trigger('account:updatePointSubscriptions', information.count);
				}
			},
			function(error)
			{
				console.log(error);
			});
		},

		unsubscribe: function()
		{
			App.Api.request('points/' + this.point.id + '/unsubscribe', {}, function(information)
			{
				this.$('#subscribeButton').show();
				this.$('#subscribedButton').hide();

				if (information.count !== undefined)
				{
					App.Vent.trigger('account:updatePointSubscriptions', information.count);
				}
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

		accountLoggedIn: function()
		{
			App.Api.request('points/' + this.point.id + '/isSubscribed', {}, function(subscribed)
			{
				if (subscribed)
				{
					this.$('#subscribeButton').hide();
					this.$('#subscribedButton').show();
				}
			});
		},

		accountLoggedOut: function()
		{
			this.$('#subscribeButton').show();
			this.$('#subscribedButton').hide();
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

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},
	});

	App.Views.PointWall = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		point: null,

		initialize: function(point, posts)
		{
			// console.log('Шаблон стены был проинициализирован');
			var self = this;
			this.point = point;
			this.render();
			this.loader = new App.Loader('points/' + point.id + '/posts', {}, 10, posts);

			this.loader.onLoad(function(posts)
			{
				console.log('Были загружены новые посты');
				self.postsWhereLoaded(posts);
			});

			this.loader.onEnd(function()
			{
				self.postsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				self.postsNotFound();
			});
		},

		postsWhereLoaded: function(posts)
		{
			var self = this;
			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(posts).each(function(post, index)
				{
					self.$('#posts').append(App.Templates.pointWallSeparator());

					self.$('#posts').append((new App.Views.PointWallPost(post, self)).el);
				});
			}
			else
			{
				_(posts).each(function(post, index)
				{
					if (index != 0)
					{
						self.$('#posts').append(App.Templates.pointWallSeparator());
					}

					self.$('#posts').append((new App.Views.PointWallPost(post, self)).el);
				});
			}

			this.$('#posts').append(App.Templates.pointWallLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewPosts();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewPosts();
		    },
		    this);
		},

		postsIsEnded: function()
		{
			console.log('Комментарии закончились');
			this.$('#loading').remove();
			this.$('#load').remove();
			App.Vent.off('lowScroll');
		},

		postsNotFound: function()
		{
			this.$('#posts').html(App.Templates.pointWallNotFound());
		},

		loadNewPosts: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#posts').append(App.Templates.pointWallLoading({first: false}));
			console.log('Подгружаем ещё...');
			this.loader.load();
		},

		postRemoved: function(pointWallPostView)
		{
			console.log(pointWallPostView);

			this.loader.decrementCount();

			if (this.loader.count() == 0)
			{
				this.postsNotFound();
			}
			else
			{
				if (pointWallPostView.$el.prev('.separator').length != 0)
				{
					pointWallPostView.$el.prev('.separator').remove();
				}
				else if (pointWallPostView.$el.next('.separator').length)
				{
					pointWallPostView.$el.next('.separator').remove();
				}
			}
		},

		events:
		{
			'submit .addPost': 'addPost',
		},

		addPost: function(event)
		{
			var self = this;
			this.$('.addPost span').removeClass('error success').text('Идет добавление...').fadeIn('fast');
            this.$('.addPost input').attr('disabled', 'disabled');

            App.Api.request('points/' + this.point.id + '/posts/add', this.$('.addPost').serialize(), function(post)
            {
            	this.$('.addPost input').removeAttr('disabled');

            	this.$('.addPost span').addClass('success').fadeOut('fast', function()
                {
                    self.$('.addPost textarea').val('');
                    $(this).text('Запись была успешно добавлена!').fadeIn('fast');

                    if (self.loader.count())
					{
						self.$('#posts').prepend(App.Templates.pointWallSeparator());
					}
					else
					{
						self.$('.noPosts').remove();
					}

	                self.$('#posts').prepend((new App.Views.PointWallPost(post, self)).el);
					self.loader.incrementCount();
                });
            },
            function(error)
            {
            	this.$('.addPost input').removeAttr('disabled');

            	this.$('.addPost span').addClass('error').fadeOut('fast', function()
                {
                    $(this).text(error || 'К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                });

            	console.log(error);
            },
            this);

			event.preventDefault();
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
	
	App.Views.PointWallPost = Backbone.View.extend(
	{
		tagName: 'form',
		className: 'post',
		post: null,
		pointWallView: null,

		initialize: function(post, pointWallView)
		{
			this.post = post;
			this.pointWallView = pointWallView;
			this.render();
		},

		events:
		{
			'click .options .remove': 'removeButtonClick',
			'click .options .edit': 'editButtonClick',
			'click .options .ok': 'okButtonClick',
		},

		removeButtonClick: function()
		{
			var self = this;

			App.Api.request('points/' + this.pointWallView.point.id + '/posts/' + this.post.id + '/remove', {}, function()
			{
				self.pointWallView.postRemoved(self);
				self.clear();
			},
			function(error)
			{
				console.log(error);
			});
		},

		editButtonClick: function()
		{
			console.log('Клик по редактированию');
			this.$('.content').hide();
			this.$('.editContent').show();
			this.$('.editContent textarea').val(this.post.text);
			this.$('.options .edit').hide();
			this.$('.options .ok').show();
		},

		okButtonClick: function()
		{
			var data = $.unparam(this.$el.serialize());

			App.Api.request('points/' + this.pointWallView.point.id + '/posts/' + this.post.id + '/edit', data, function()
			{
				this.$('.editContent').hide();
				this.$('.content').show();
				this.$('.options .ok').hide();
				this.$('.options .edit').show();
				this.post.text = data.text;
				this.$('.content .text').html(this.post.text.replace(/</g, '&lt;').replace(/\n/g, '<br />'));
			},
			function(error)
			{
				console.log(error);
			},
			this);
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.remove();
		},

		render: function()
		{
			this.$el.html(App.Templates.pointWallPost({post: this.post}));
			return this;
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

			window.ymaps && ymaps.ready(function()
			{
				var map = new ymaps.Map("mapCanvas",
				{
			        center: [self.point.latitude, self.point.longitude],
			        zoom: 17,
			    });

			    var point = new  ymaps.Placemark([self.point.latitude, self.point.longitude],
			    {
			    	balloonContent: '<strong>' + self.point.name + '</strong><br />' + self.point.location,
			    	'iconContent': self.point.name,
			   	},
			   	{
			   		preset: 'islands#greenStretchyIcon',
			   	});

				map.geoObjects.add(point);
				$('#content .map').show();
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
		point: null,

		initialize: function(point, comments)
		{
			// console.log('Шаблон комментариев был проинициализирован');
			var self = this;
			this.point = point;
			this.render();
			this.loader = new App.Loader('points/' + point.id + '/comments', {}, 10, comments);

			this.loader.onLoad(function(comments)
			{
				console.log('Были загружены новые комментарии');
				self.commentsWhereLoaded(comments);
			});

			this.loader.onEnd(function()
			{
				self.commentsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				console.log('Не найдено ни одного комментария');
				self.commentsNotFound();
			});
		},

		commentsWhereLoaded: function(comments)
		{
			var self = this;
			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(comments).each(function(comment, index)
				{
					self.$('#comments').append(App.Templates.pointCommentsSeparator());

					self.$('#comments').append((new App.Views.PointCommentsOne(comment, self)).el);
				});
			}
			else
			{
				_(comments).each(function(comment, index)
				{
					if (index != 0)
					{
						self.$('#comments').append(App.Templates.pointCommentsSeparator());
					}

					self.$('#comments').append((new App.Views.PointCommentsOne(comment, self)).el);
				});
			}

			this.$('#comments').append(App.Templates.pointCommentsLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewComments();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewComments();
		    },
		    this);
		},

		commentsIsEnded: function()
		{
			console.log('Комментарии закончились');
			this.$('#loading').remove();
			this.$('#load').remove();
			App.Vent.off('lowScroll');
		},

		commentsNotFound: function()
		{
			console.log('Комментарии не найдены');
			this.$('#comments').html(App.Templates.pointCommentsNotFound());
		},

		loadNewComments: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#comments').append(App.Templates.pointCommentsLoading({first: false}));
			console.log('Подгружаем ещё...');
			this.loader.load();
		},

		commentRemoved: function(pointCommentsOneView)
		{
			this.loader.decrementCount();

			if (this.loader.count() == 0)
			{
				this.commentsNotFound();
			}
			else
			{
				if (pointCommentsOneView.$el.prev('.separator').length != 0)
				{
					pointCommentsOneView.$el.prev('.separator').remove();
				}
				else if (pointCommentsOneView.$el.next('.separator').length)
				{
					pointCommentsOneView.$el.next('.separator').remove();
				}
			}
		},

		events:
		{
			'submit .addComment': 'addComment',
		},

		addComment: function(event)
		{
			var self = this;
			this.$('.addComment span').removeClass('error success').text('Идет добавление...').fadeIn('fast');
            this.$('.addComment input').attr('disabled', 'disabled');

            App.Api.request('points/' + this.point.id + '/comments/add', this.$('.addComment').serialize(), function(comment)
            {
            	this.$('.addComment input').removeAttr('disabled');

            	this.$('.addComment span').addClass('success').fadeOut('fast', function()
                {
                    self.$('.addComment textarea').val('');
                    $(this).text('Комментарий был успешно добавлен!').fadeIn('fast');

                    if (self.loader.count())
					{
						self.$('#comments').prepend(App.Templates.pointCommentsSeparator());
					}
					else
					{
						self.$('.noComments').remove();
					}

	                self.$('#comments').prepend((new App.Views.PointCommentsOne(comment, self)).el);
					self.loader.incrementCount();
                });
            },
            function(error)
            {
            	this.$('.addComment input').removeAttr('disabled');

            	this.$('.addComment span').addClass('error').fadeOut('fast', function()
                {
                    $(this).text(error || 'К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                });

            	console.log(error);
            },
            this);

			event.preventDefault();
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointComments());
		},
	});

	App.Views.PointCommentsOne = Backbone.View.extend(
	{
		tagName: 'form',
		className: 'comment',
		comment: null,
		pointCommentsView: null,

		initialize: function(comment, pointCommentsView)
		{
			this.comment = comment;
			this.pointCommentsView = pointCommentsView;
			this.render();
		},

		events:
		{
			'click .options .remove': 'removeButtonClick',
			'click .options .edit': 'editButtonClick',
			'click .options .ok': 'okButtonClick',
		},

		removeButtonClick: function()
		{
			var self = this;

			App.Api.request('points/' + this.pointCommentsView.point.id + '/comments/' + this.comment.id + '/remove', {}, function()
			{
				self.pointCommentsView.commentRemoved(self);
				self.clear();
			},
			function(error)
			{
				console.log(error);
			});
		},

		editButtonClick: function()
		{
			console.log('Клик по редактированию');
			this.$('.content').hide();
			this.$('.editContent').show();
			this.$('.editContent textarea').val(this.comment.text);
			this.$('.options .edit').hide();
			this.$('.options .ok').show();
		},

		okButtonClick: function()
		{
			var data = $.unparam(this.$el.serialize());

			App.Api.request('points/' + this.pointCommentsView.point.id + '/comments/' + this.comment.id + '/edit', data, function()
			{
				this.$('.editContent').hide();
				this.$('.content').show();
				this.$('.options .ok').hide();
				this.$('.options .edit').show();
				this.comment.text = data.text;
				this.$('.content .text').html(this.comment.text.replace(/</g, '&lt;').replace(/\n/g, '<br />'));
			},
			function(error)
			{
				console.log(error);
			},
			this);
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.remove();
		},

		render: function()
		{
			this.$el.html(App.Templates.pointCommentsOne({comment: this.comment}));
			return this;
		},
	});
	
	App.Views.PointActions = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		point: null,

		initialize: function(point, actions)
		{
			var self = this;
			this.point = point;
			this.render();
			this.loader = new App.Loader('points/' + point.id + '/actions', {}, 10, actions);

			this.loader.onLoad(function(actions)
			{
				console.log('Были загружены новые акции');
				self.actionsWhereLoaded(actions);
			});

			this.loader.onEnd(function()
			{
				self.actionsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				console.log('Не найдено ни одного комментария');
				self.actionsNotFound();
			});
		},

		actionsWhereLoaded: function(actions)
		{
			var self = this;
			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(actions).each(function(action, index)
				{
					self.$('#actions').append(App.Templates.pointActionsSeparator());

					self.$('#actions').append(App.Templates.pointActionsOne(
					{
						action: action,
					}));
				});
			}
			else
			{
				_(actions).each(function(action, index)
				{
					if (index != 0)
					{
						self.$('#actions').append(App.Templates.pointActionsSeparator());
					}

					self.$('#actions').append(App.Templates.pointActionsOne(
					{
						action: action,
					}));
				});
			}

			this.$('#actions').append(App.Templates.pointActionsLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewActions();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewActions();
		    },
		    this);
		},

		actionsIsEnded: function()
		{
			console.log('Акции закончились');
			this.$('#loading').remove();
			this.$('#load').remove();
			App.Vent.off('lowScroll');
		},

		actionsNotFound: function()
		{
			console.log('Комментарии не найдены');
			this.$('#action').html(App.Templates.pointActionsNotFound());
		},

		loadNewActions: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#actions').append(App.Templates.pointActionsLoading({first: false}));
			console.log('Подгружаем ещё...');
			this.loader.load();
		},

		events:
		{
			'submit .addAction': 'addAction',
		},

		addComment: function(event)
		{
			var self = this;
			this.$('.addAction span').removeClass('error success').text('Идет добавление...').fadeIn('fast');
            this.$('.addAction input').attr('disabled', 'disabled');

            App.Api.request('points/' + this.point.id + '/actions/add', this.$('.addAction').serialize(), function(comment)
            {
            	this.$('.addAction input').removeAttr('disabled');

            	this.$('.addAction span').addClass('success').fadeOut('fast', function()
                {
                    self.$('.addAction textarea').val('');
                    $(this).text('Акция была успешно добавлена!').fadeIn('fast');

                    if (self.loader.count())
					{
						self.$('#actions').prepend(App.Templates.pointActionsSeparator());
					}
					else
					{
						self.$('.noActions').remove();
					}

	                self.$('#actions').prepend(App.Templates.pointActionsOne(
					{
						action: action,
					}));

					self.loader.incrementCount();
                });
            },
            function(error)
            {
            	this.$('.addAction input').removeAttr('disabled');

            	this.$('.addAction span').addClass('error').fadeOut('fast', function()
                {
                    $(this).text(error || 'К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                });

            	console.log(error);
            },
            this);

			event.preventDefault();
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.pointActions());
		},
	});

	App.Views.User = Backbone.View.extend(
	{
		el: '#middle .wrapper',
		rendered: false,
		point: null,
		subview: null,
		page: null,

		initialize: function(user, page)
		{
			this.user = user;
			this.page = page;
			this.render();
			$(document).on('click', this.documentClick);
			App.Vent.on('account:loggedIn', this.accountLoggedIn, this);
			App.Vent.on('account:loggedOut', this.accountLoggedOut, this);
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
			// if (!App.Account.check())
			// {
			// 	App.Views.authorizeModal = new App.Views.AuthorizeModal();
			// 	return;
			// }

			// App.Api.request('points/' + this.point.id + '/subscribe', {}, function(information)
			// {
			// 	this.$('#subscribeButton').hide();
			// 	this.$('#subscribedButton').show();

			// 	if (information.count !== undefined)
			// 	{
			// 		App.Vent.trigger('account:updatePointSubscriptions', information.count);
			// 	}
			// },
			// function(error)
			// {
			// 	console.log(error);
			// });
		},

		unsubscribe: function()
		{
			// App.Api.request('points/' + this.point.id + '/unsubscribe', {}, function(information)
			// {
			// 	this.$('#subscribeButton').show();
			// 	this.$('#subscribedButton').hide();

			// 	if (information.count !== undefined)
			// 	{
			// 		App.Vent.trigger('account:updatePointSubscriptions', information.count);
			// 	}
			// },
			// function(error)
			// {
			// 	console.log(error);
			// });
		},

		openUnsubscribe: function(event)
		{
			// this.$('#subscribedButton').addClass('clicked');
			// return false;
		},

		documentClick: function()
		{
			// console.log('Клик по документу');

			// if ($('#subscribedButton').hasClass('clicked'))
			// {
			// 	$('#subscribedButton').removeClass('clicked')
			// }
		},

		accountLoggedIn: function()
		{
			// App.Api.request('points/' + this.point.id + '/isSubscribed', {}, function(subscribed)
			// {
			// 	if (subscribed)
			// 	{
			// 		this.$('#subscribeButton').hide();
			// 		this.$('#subscribedButton').show();
			// 	}
			// });
		},

		accountLoggedOut: function()
		{
			// this.$('#subscribeButton').show();
			// this.$('#subscribedButton').hide();
		},

		render: function()
		{
			// console.log(this.point);

			this.$el.html(App.Templates.subheaderUser(
			{
				user: this.user,
				page: this.page,
			}));

			this.rendered = true;
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},
	});

	App.Views.UserWall = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		user: null,

		initialize: function(user, posts)
		{
			// console.log('Шаблон стены был проинициализирован');
			var self = this;
			this.user = user;
			this.render();
			this.loader = new App.Loader('users/' + user.id + '/posts', {}, 10, posts);

			this.loader.onLoad(function(posts)
			{
				console.log('Были загружены новые посты');
				self.postsWhereLoaded(posts);
			});

			this.loader.onEnd(function()
			{
				self.postsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				self.postsNotFound();
			});
		},

		postsWhereLoaded: function(posts)
		{
			var self = this;
			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(posts).each(function(post, index)
				{
					self.$('#posts').append(App.Templates.userWallSeparator());

					self.$('#posts').append((new App.Views.UserWallPost(post, self)).el);
				});
			}
			else
			{
				_(posts).each(function(post, index)
				{
					if (index != 0)
					{
						self.$('#posts').append(App.Templates.userWallSeparator());
					}

					self.$('#posts').append((new App.Views.UserWallPost(post, self)).el);
				});
			}

			this.$('#posts').append(App.Templates.userWallLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewPosts();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewPosts();
		    },
		    this);
		},

		postsIsEnded: function()
		{
			console.log('Комментарии закончились');
			this.$('#loading').remove();
			this.$('#load').remove();
			App.Vent.off('lowScroll');
		},

		postsNotFound: function()
		{
			this.$('#posts').html(App.Templates.pointWallNotFound());
		},

		loadNewPosts: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#posts').append(App.Templates.pointWallLoading({first: false}));
			console.log('Подгружаем ещё...');
			this.loader.load();
		},

		events:
		{
			'submit .addPost': 'addPost',
		},

		addPost: function(event)
		{
			var self = this;
			this.$('.addPost span').removeClass('error success').text('Идет добавление...').fadeIn('fast');
            this.$('.addPost input').attr('disabled', 'disabled');

            App.Api.request('users/' + this.user.id + '/posts/add', this.$('.addPost').serialize(), function(post)
            {
            	this.$('.addPost input').removeAttr('disabled');

            	this.$('.addPost span').addClass('success').fadeOut('fast', function()
                {
                    self.$('.addPost textarea').val('');
                    $(this).text('Запись была успешно добавлена!').fadeIn('fast');

                    if (self.loader.count())
					{
						self.$('#posts').prepend(App.Templates.pointWallSeparator());
					}
					else
					{
						self.$('.noPosts').remove();
					}

	                self.$('#posts').prepend((new App.Views.UserWallPost(post, self)).el);
					self.loader.incrementCount();
                });
            },
            function(error)
            {
            	this.$('.addPost input').removeAttr('disabled');

            	this.$('.addPost span').addClass('error').fadeOut('fast', function()
                {
                    $(this).text(error || 'К сожалению, произошла ошибка, попробуйте повторить позднее').fadeIn('fast');
                });

            	console.log(error);
            },
            this);

			event.preventDefault();
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.html('');
		},

		render: function()
		{
			this.$el.html(App.Templates.userWall(
			{
				posts: this.posts,
			}));
		},
	});

	App.Views.UserWallPost = Backbone.View.extend(
	{
		tagName: 'form',
		className: 'post',
		post: null,
		userWallView: null,

		initialize: function(post, userWallView)
		{
			this.post = post;
			this.userWallView = userWallView;
			this.render();
		},

		events:
		{
			'click .options .remove': 'removeButtonClick',
			'click .options .edit': 'editButtonClick',
			'click .options .ok': 'okButtonClick',
		},

		removeButtonClick: function()
		{
			var self = this;

			App.Api.request('users/' + this.userWallView.user.id + '/posts/' + this.post.id + '/remove', {}, function()
			{
				self.userWallView.postRemoved(self);
				self.clear();
			},
			function(error)
			{
				console.log(error);
			});
		},

		editButtonClick: function()
		{
			console.log('Клик по редактированию');
			this.$('.content').hide();
			this.$('.editContent').show();
			this.$('.editContent textarea').val(this.post.text);
			this.$('.options .edit').hide();
			this.$('.options .ok').show();
		},

		okButtonClick: function()
		{
			var data = $.unparam(this.$el.serialize());

			App.Api.request('users/' + this.userWallView.user.id + '/posts/' + this.post.id + '/edit', data, function()
			{
				this.$('.editContent').hide();
				this.$('.content').show();
				this.$('.options .ok').hide();
				this.$('.options .edit').show();
				this.post.text = data.text;
				this.$('.content .text').html(this.post.text.replace(/</g, '&lt;').replace(/\n/g, '<br />'));
			},
			function(error)
			{
				console.log(error);
			},
			this);
		},

		clear: function()
		{
			this.undelegateEvents();
			this.$el.remove();
		},

		render: function()
		{
			this.$el.html(App.Templates.pointWallPost({post: this.post}));
			return this;
		},
	});

	App.Views.UserPoints = Backbone.View.extend(
	{
		el: '#middle .wrapper #content',
		user: null,

		initialize: function(user, points)
		{
			var self = this;
			this.user = user;
			this.render();
			this.loader = new App.Loader('users/' + user.id + '/points', {}, 10, points);

			this.loader.onLoad(function(points)
			{
				console.log('Были загружены новые точки');
				self.pointsWhereLoaded(points);
			});

			this.loader.onEnd(function()
			{
				self.pointsIsEnded();
			});

			this.loader.onNewQuery(function()
			{
				console.log('Запрос изменился, начинаем всё заново');
			});

			this.loader.onNoResults(function()
			{
				console.log('Не найдено ни одного комментария');
				self.pointsNotFound();
			});
		},

		pointsWhereLoaded: function(points)
		{
			var self = this;
			this.$('#loading').remove();

			if (this.loader.count())
			{
				_(points).each(function(point, index)
				{
					self.$('#points').append(App.Templates.userPointsSeparator());

					self.$('#points').append(App.Templates.userPointsOne(
					{
						point: point,
					}));
				});
			}
			else
			{
				_(points).each(function(point, index)
				{
					if (index != 0)
					{
						self.$('#points').append(App.Templates.userPointsSeparator());
					}

					self.$('#points').append(App.Templates.userPointsOne(
					{
						point: point,
					}));
				});
			}

			this.$('#points').append(App.Templates.userPointsLoad());
			
			this.$('#load').click(function()
			{
				self.loadNewPoints();
			});

			App.Vent.off('lowScroll');

			App.Vent.on('lowScroll', function()
		    {
		    	this.loadNewPoints();
		    },
		    this);
		},

		pointsIsEnded: function()
		{
			console.log('Точки закончились');
			this.$('#loading').remove();
			this.$('#load').remove();
			App.Vent.off('lowScroll');
		},

		pointsNotFound: function()
		{
			console.log('Точки не найдены');
			this.$('#points').html(App.Templates.userPointsNotFound());
		},

		loadNewPoints: function()
		{
			App.Vent.off('lowScroll');
			this.$('#load').remove();
			this.$('#points').append(App.Templates.userPointsLoading({first: false}));
			console.log('Подгружаем ещё...');
			this.loader.load();
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
			this.$el.html(App.Templates.userPoints());
		},
	});

	App.Router = Backbone.Router.extend(
	{
		routes:
		{
			'': 'search',
			'/': 'search',
			'user:id': 'userWall',
			'user:id/points': 'userPoints',
			':profile': 'profileWall',
			':profile/edit': 'profileEdit',
			':profile/comments': 'profileComments',
			':profile/services': 'profileServices',
			':profile/information': 'profileInformation',
			':profile/points': 'profilePoints',
			':profile/actions': 'profileActions',
		},

		search: function(query)
		{
			console.log('search');

			App.view && App.Views[App.view].clear();
			var unparamedQuery = $.unparam(query);
			App.Views.search = new App.Views.Search(unparamedQuery, 'wall');
			App.view = 'search';
			App.History.push({path: (query ? '?' + query : ''), title: 'Поиск' + (unparamedQuery.query ? ' ' + unparamedQuery.query : '')});
		},

		userWall: function(id)
		{
			console.log('user index');

			App.Api.request('users/' + id, {'with': 'posts'}, function(user)
			{
				if (user.profile)
				{
					Backbone.history.navigate('/' + user.profile.address, true);
					return;
				}

				if (App.view == 'user')
				{
					App.Views[App.Views.user.subview].clear();
					App.Views.user.subview = null;
					App.Views.user.setPage('wall');
				}
				else
				{
					App.view && App.Views[App.view].clear();
					App.Views.user = new App.Views.User(user, 'wall');
				}

				App.Views.user.subview = 'userWall';
				App.Views.userWall = new App.Views.UserWall(user, user.posts);
				App.view = 'user';
				// console.log(App.Views.pointWall);
				App.History.push({path: 'user' + id, title: 'Записи'});
			},
			function(error)
			{
				console.log(error);
			});
		},

		userPoints: function(id)
		{
			console.log('user points');

			App.Api.request('users/' + id, {'with': 'points'}, function(user)
			{
				if (user.profile)
				{
					Backbone.history.navigate('/' + user.profile.address + '/points', true);
					return;
				}

				if (App.view == 'user')
				{
					App.Views[App.Views.user.subview].clear();
					App.Views.user.subview = null;
					App.Views.user.setPage('points');
				}
				else
				{
					App.view && App.Views[App.view].clear();
					App.Views.user = new App.Views.User(user, 'points');
				}

				App.Views.user.subview = 'userPoints';
				App.Views.userPoints = new App.Views.UserPoints(user, user.points);
				App.view = 'user';
				App.History.push({path: 'user' + id + '/points', title: 'Точки'});
			},
			function(error)
			{
				console.log(error);
			});
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
				if (profile.host_type == 'Point')
				{
					if (App.view == 'point')
					{
						App.Views[App.Views.point.subview].clear();
						App.Views.point.subview = null;
						App.Views.point.setPage('wall');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.point = new App.Views.Point(profile.host, 'wall');
					}

					App.Views.point.subview = 'pointWall';
					App.Views.pointWall = new App.Views.PointWall(profile.host, profile.host.posts);
					App.view = 'point';
					// console.log(App.Views.pointWall);
					App.History.push({path: address, title: 'Записи'});
					return;
				}

				if (profile.host_type == 'User')
				{
					if (App.view == 'user')
					{
						App.Views[App.Views.user.subview].clear();
						App.Views.user.subview = null;
						App.Views.user.setPage('wall');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.user = new App.Views.User(profile.host, 'wall');
					}

					App.Views.user.subview = 'userWall';
					App.Views.userWall = new App.Views.UserWall(profile.host, profile.host.posts);
					App.view = 'user';
					// console.log(App.Views.pointWall);
					App.History.push({path: address, title: 'Записи'});
					return;
				}
			},
			function(error)
			{
				console.log(error);
			});
		},

		profileInformation: function(address, query)
		{
			console.log('Информация');

			App.Api.request('profiles/' + address, {}, function(profile)
			{
				if (profile.host_type == 'Point')
				{
					if (App.view == 'point')
					{
						App.Views[App.Views.point.subview].clear();
						App.Views.point.subview = null;
						App.Views.point.setPage('information');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.point = new App.Views.Point(profile.host, 'information');
					}

					App.Views.point.subview = 'pointInformation';
					App.Views.pointInformation = new App.Views.PointInformation(profile.host);
					App.view = 'point';
					App.History.push({path: address + '/information', title: 'Информация'});
					return;
				}

				return;
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
				if (profile.host_type == 'Point')
				{
					if (App.view == 'point')
					{
						App.Views[App.Views.point.subview].clear();
						App.Views.point.subview = null;
						App.Views.point.setPage('services');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.point = new App.Views.Point(profile.host, 'services');
					}

					App.Views.point.subview = 'pointServices';
					App.Views.pointServices = new App.Views.PointServices(profile.host.services_sections);
					App.view = 'point';
					App.History.push({path: address + '/services', title: 'Услуги'});
					return;
				}
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
				if (profile.host_type == 'Point')
				{
					if (App.view == 'point')
					{
						App.Views[App.Views.point.subview].clear();
						App.Views.point.subview = null;
						App.Views.point.setPage('comments');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.point = new App.Views.Point(profile.host, 'comments');
					}

					App.Views.point.subview = 'pointComments';
					App.Views.pointComments = new App.Views.PointComments(profile.host, profile.host.comments);
					App.view = 'point';
					App.History.push({path: address + '/comments', title: 'Отзывы'});
					return;
				}
			},
			function(error)
			{
				console.log(error);
			});
		},

		profilePoints: function(address)
		{
			console.log('Точки');

			App.Api.request('profiles/' + address, {'with': 'points'}, function(profile)
			{
				if (profile.host_type == 'User')
				{
					if (App.view == 'user')
					{
						App.Views[App.Views.user.subview].clear();
						App.Views.user.subview = null;
						App.Views.user.setPage('points');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.user = new App.Views.User(profile.host, 'points');
					}

					App.Views.user.subview = 'userPoints';
					App.Views.userPoints = new App.Views.UserPoints(profile.host, profile.host.points);
					App.view = 'user';
					App.History.push({path: address + '/points', title: 'Точки'});
					return;
				}
			},
			function(error)
			{
				console.log(error);
			});
		},

		profileActions: function(address)
		{
			console.log('Акции');

			App.Api.request('profiles/' + address, {'with': 'actions'}, function(profile)
			{
				if (profile.host_type == 'Point')
				{
					if (App.view == 'point')
					{
						App.Views[App.Views.point.subview].clear();
						App.Views.point.subview = null;
						App.Views.point.setPage('actions');
					}
					else
					{
						App.view && App.Views[App.view].clear();
						App.Views.point = new App.Views.Point(profile.host, 'actions');
					}

					App.Views.point.subview = 'pointActions';
					App.Views.pointActions = new App.Views.PointActions(profile.host, profile.host.actions);
					App.view = 'point';
					App.History.push({path: address + '/actions', title: 'Акции'});
					return;
				}
			},
			function(error)
			{
				console.log(error);
			});
		}
	});

	App.router = new App.Router();
	Backbone.history.start({pushState: true});
	App.Views.header = new App.Views.Header;
	App.recalculateWidth();

	$(window).resize(function()
    {
        App.recalculateWidth();
    });

	App.router.on('route', function(a, b, c)
	{
		App.Vent.off('lowScroll');
		console.log('on route');
		console.log(a, b, c);
	});

	$(document).on('click', function(event)
	{
		$element = $(event.toElement);
		$parents = $element.parents('a[target!="_blank"]');

		if ($parents.length)
		{
			var href = $parents.attr('href');

			if (!href)
			{
				return;
			}

			Backbone.history.navigate(href, true);
			event.preventDefault();
			return;
		}
	});

	$(document).on('click', 'a[target!="_blank"]', function(event)
	{
		var href = $(event.toElement).attr('href');

		if (!href)
		{
			return;
		}

		Backbone.history.navigate(href, true);
		event.preventDefault();
	});

	App.getScrollPercentage = function()
	{
		return ($(document).height() - $(window).height() - $(window).scrollTop()) / $(window).height();
	};

	$(window).scroll(function()
    {
        if (App.getScrollPercentage() < 1.0)
        {
            App.Vent.trigger('lowScroll');
        }

        App.Vent.trigger('scroll');
    });
});