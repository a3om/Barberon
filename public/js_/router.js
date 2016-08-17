var Router = Backbone.Router.extend(
{
	routes:
	{
		'': 'index',
		'*address': 'pointOrUser',
	},

	pointOrUser: function(address)
	{
		console.log('pointOrUser');
	},

	index: function()
	{
		console.log('index');
	}

});

new Router();
Backbone.history.start({pushState: true});