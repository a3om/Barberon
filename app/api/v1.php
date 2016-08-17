<?php

// sleep(1);

Route::group(['prefix' => 'v1'], function()
{
	Route::group(['prefix' => 'account'], function()
	{
		Route::any('login', function()
		{
			$rules =
			[
				'email' => 'required|email',
				'password' => 'required|min:6',
			];

			$validator = Validator::make(Input::all(), $rules);

			if ($validator->fails())
			{
				return error($validator->errors());
			}

			if (!$user = User::where('email', Input::get('email'))->with('profile')->first())
			{
				$validator->errors()->add('email', 'Пользователя с таким e-mail адресом не существует в нашей системе');
				return error($validator->errors());
			}

			if ($user->password != Input::get('password'))
			{
				$validator->errors()->add('password', 'Неправильный пароль');
				return error($validator->errors());
			}

			Auth::login($user);

			$pointSubscriptionsCount = $user->getCountOfPointPivots(function($query)
			{
				$query->where('subscribed', true);
			});

			return response(array_merge($user->toArray(), ['pointSubscriptionsCount' => $pointSubscriptionsCount]));
		});

		Route::any('register', function()
		{
			$rules =
			[
				'name' => 'required',
				'email' => 'required|email',
				'password' => 'required|min:6',
			];

			$validator = Validator::make(Input::all(), $rules);

			if ($validator->fails())
			{
				return error($validator->errors());
			}

			if (User::where('email', Input::get('email'))->first())
			{
				$validator->errors()->add('email', 'Пользователь с таким e-mail адресом уже существует в нашей системе');
				return error($validator->errors());
			}

			$user = new User;
			$user->name = Input::get('name');
			$user->email = Input::get('email');
			$user->password = Input::get('password');
			$rememberToken = str_random(60);

			while(User::where('remember_token', $rememberToken)->first())
			{
				$rememberToken = str_random(60);
				continue;
			}

			$user->remember_token = $rememberToken;
			$user->save();
			Auth::login($user);
			return response(array_merge($user->toArray(), ['pointSubscriptionsCount' => 0]));
		});

		Route::any('logout', function()
		{
			if (Auth::check())
			{
				Auth::logout();
			}

			return response();
		});
	});

	Route::group(['prefix' => 'profiles'], function()
	{
		Route::any('{address}', function($address)
		{
			if (!$profile = Profile::where('address', $address)->first())
			{
				return error();
			}

			if ($profile->host_type == 'Point')
			{
				$host = $profile->host();

				if (Input::has('with'))
				{
					$properties = explode(',', Input::get('with'));

					foreach ($properties as $property)
					{
						switch ($property)
						{
							case 'posts':
							{
								$host->with(['posts' => function($query)
								{
									$query->orderBy('id', 'desc')->limit(10);
								},
								'posts.user']);

								continue;
							}
							case 'comments':
							{
								$host->with(['comments' => function($query)
								{
									$query->orderBy('id', 'desc')->limit(10);
								},
								'comments.user']);

								continue;
							}
							case 'services':
							{
								$host->with(['servicesSections' => function($query)
								{
									$query->orderBy('name', 'asc');
								},
								'servicesSections.services' => function($query)
								{
									$query->orderBy('name', 'asc');
								}
								]);

								continue;
							}
							case 'actions':
							{
								$host->with(['actions' => function($query)
								{
									$query->orderBy('created_at', 'desc');
								},
								]);
							}
						}
					}
				}

				if (!$host = $host->first())
				{
					return error([]);
				}

				if (Auth::check())
				{
					$host->userPivot = Auth::user()->getPointPivot($host);
				}

				$host->postsCount = $host->posts()->count();
				$host->commentsCount = $host->comments()->count();
				$host->actionsCount = $host->actions()->count();
				$host->profile = $profile;

				return response(
				[
					'address' => $address,
					'host_type' => $profile->host_type,
					'host' => $host->toArray(),
				]);
			}

			if ($profile->host_type == 'User')
			{
				$host = $profile->host();

				if (Input::has('with'))
				{
					$properties = explode(',', Input::get('with'));

					foreach ($properties as $property)
					{
						switch ($property)
						{
							case 'posts':
							{
								$host->with(['posts' => function($query)
								{
									$query->orderBy('id', 'desc')->limit(10);
								},
								'posts.user']);

								continue;
							}
							case 'points':
							{
								$host->with(['points' => function($query)
								{
									$query->where('subscribed', true)->orderBy('point_user.created_at', 'desc')->limit(10);
								},
								'points.profile']);
							}
						}
					}
				}

				if (!$host = $host->first())
				{
					return error([]);
				}

				if (Auth::check())
				{
					$host->userPivot = Auth::user()->getUserPivot($host);
				}

				$host->postsCount = $host->posts()->count();
				$host->usersCount = DB::table('user_user')->where('user0_id', $host->id)->where('subscribed', true)->count();
				$host->followersCount = DB::table('user_user')->where('user1_id', $host->id)->where('subscribed', true)->count();
				$host->pointsCount = DB::table('point_user')->where('user_id', $host->id)->where('subscribed', true)->count();
				$host->profile = $profile;

				return response(
				[
					'address' => $address,
					'host_type' => $profile->host_type,
					'host' => $host->toArray(),
				]);
			}

			return error();
		});
	});
	
	Route::group(['prefix' => 'points'], function()
	{
		Route::any('{id}/subscribe', function($id)
		{
			if (!Auth::check())
			{
				return error();
			}

			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			$userPivot = Auth::user()->getPointPivot($point);

			if ($userPivot->subscribed)
			{
				return response([]);
			}

			Auth::user()->updatePointPivot($point, ['subscribed' => true]);

			$count = Auth::user()->getCountOfPointPivots(function($query)
			{
				$query->where('subscribed', true);
			});

			return response(['count' => $count]);
		});

		Route::any('{id}/unsubscribe', function($id)
		{
			if (!Auth::check())
			{
				return error();
			}
			
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			$userPivot = Auth::user()->getPointPivot($point);

			if (!$userPivot->subscribed)
			{
				return response([]);
			}

			Auth::user()->updatePointPivot($point, ['subscribed' => false]);

			$count = Auth::user()->getCountOfPointPivots(function($query)
			{
				$query->where('subscribed', true);
			});

			return response(['count' => $count]);
		});

		Route::any('{id}/isSubscribed', function($id)
		{
			if (!Auth::check())
			{
				return error();
			}
			
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			$userPivot = Auth::user()->getPointPivot($point);
			return response($userPivot->subscribed);
		});

		Route::any('{id}/comments', function($id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			$count = Input::has('count') && Input::get('count') > 0 && Input::get('count') <= 100 ? Input::get('count') : 100;
			$query = $point->comments()->with('user');
			
			if (Input::has('offset') && Input::get('offset') >= 0)
			{
				$query->offset(Input::get('offset'));
			}

			$query->limit($count)->orderBy('id', 'desc');
			return response($query->get()->toArray());
		});

		Route::any('{id}/comments/add', function($id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error('Вы должны ввести текст комментария');
			}

			$comment = new Comment;
			$comment->text = Input::get('text');
			$comment->host_type = 'Point';
			$comment->host_id = $point->id;
			$comment->user_id = Auth::user()->id;
			$comment->save();
			$comment->user = Auth::user()->toArray();
			return response($comment->toArray());
		});

		Route::any('{id}/comments/{comment_id}/remove', function($id, $comment_id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!$comment = $point->comments()->where('id', $comment_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			$comment->delete();
			return response();
		});

		Route::any('{id}/comments/{comment_id}/edit', function($id, $comment_id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!$comment = $point->comments()->where('id', $comment_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error();
			}
			
			$comment->text = Input::get('text');
			$comment->save();
			return response();
		});

		Route::any('{id}/posts', function($id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			$count = Input::has('count') && Input::get('count') > 0 && Input::get('count') <= 100 ? Input::get('count') : 100;
			$query = $point->posts()->with('user');
			
			if (Input::has('offset') && Input::get('offset') >= 0)
			{
				$query->offset(Input::get('offset'));
			}

			$query->limit($count)->orderBy('id', 'desc');
			return response($query->get()->toArray());
		});

		Route::any('{id}/posts/add', function($id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error('Вы должны ввести текст записи');
			}

			$post = new Post;
			$post->text = Input::get('text');
			$post->host_type = 'Point';
			$post->host_id = $point->id;
			$post->user_id = Auth::user()->id;
			$post->save();
			$post->user = Auth::user()->toArray();
			return response($post->toArray());
		});

		Route::any('{id}/posts/{post_id}/edit', function($id, $post_id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!$post = $point->posts()->where('id', $post_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error();
			}

			$post->text = Input::get('text');
			$post->save();
			return response();
		});

		Route::any('{id}/posts/{post_id}/remove', function($id, $post_id)
		{
			if (!$point = Point::where('id', $id)->first())
			{
				return error();
			}

			if (!$post = $point->posts()->where('id', $post_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			$post->delete();
			return response();
		});
	});
	
	Route::group(['prefix' => 'users'], function()
	{
		Route::any('{id}', function($id)
		{
			$user = User::query()->with('profile')->where('id', $id);

			if (Input::has('with'))
			{
				$properties = explode(',', Input::get('with'));

				foreach ($properties as $property)
				{
					switch ($property)
					{
						case 'posts':
						{
							$user->with(['posts' => function($query)
							{
								$query->orderBy('id', 'desc')->limit(10);
							},
							'posts.user']);

							continue;
						}
						case 'points':
						{
							$user->with(['points' => function($query)
							{
								$query->where('subscribed', true)->orderBy('point_user.created_at', 'desc')->limit(10);
							},
							'points.profile']);
						}
					}
				}
			}

			if (!$user = $user->first())
			{
				return error([]);
			}

			if (Auth::check())
			{
				$user->userPivot = Auth::user()->getUserPivot($user);
			}

			$user->postsCount = $user->posts()->count();
			$user->usersCount = DB::table('user_user')->where('user0_id', $user->id)->where('subscribed', true)->count();
			$user->followersCount = DB::table('user_user')->where('user1_id', $user->id)->where('subscribed', true)->count();
			$user->pointsCount = DB::table('point_user')->where('user_id', $user->id)->where('subscribed', true)->count();

			return response($user->toArray());
		});

		Route::any('{id}/points', function($id)
		{
			if (!$user = User::where('id', $id)->first())
			{
				return error();
			}

			$count = Input::has('count') && Input::get('count') > 0 && Input::get('count') <= 100 ? Input::get('count') : 100;
			$query = $user->points()->where('point_user.subscribed', true);
			
			if (Input::has('offset') && Input::get('offset') >= 0)
			{
				$query->offset(Input::get('offset'));
			}

			$query->limit($count)->orderBy('created_at', 'desc');
			return response($query->get()->toArray());
		});

		Route::any('{id}/posts', function($id)
		{
			if (!$user = User::where('id', $id)->first())
			{
				return error();
			}

			$count = Input::has('count') && Input::get('count') > 0 && Input::get('count') <= 100 ? Input::get('count') : 100;
			$query = $user->posts()->with('user');
			
			if (Input::has('offset') && Input::get('offset') >= 0)
			{
				$query->offset(Input::get('offset'));
			}

			$query->limit($count)->orderBy('id', 'desc');
			return response($query->get()->toArray());
		});

		Route::any('{id}/posts/add', function($id)
		{
			if (!$user = User::where('id', $id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error('Вы должны ввести текст записи');
			}

			$post = new Post;
			$post->text = Input::get('text');
			$post->host_type = 'User';
			$post->host_id = $user->id;
			$post->user_id = Auth::user()->id;
			$post->save();
			$post->user = Auth::user()->toArray();
			return response($post->toArray());
		});

		Route::any('{id}/posts/{post_id}/edit', function($id, $post_id)
		{
			if (!$user = User::where('id', $id)->first())
			{
				return error();
			}

			if (!$post = $user->posts()->where('id', $post_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			if (!Input::has('text'))
			{
				return error();
			}

			$post->text = Input::get('text');
			$post->save();
			return response();
		});

		Route::any('{id}/posts/{post_id}/remove', function($id, $post_id)
		{
			if (!$user = User::where('id', $id)->first())
			{
				return error();
			}

			if (!$post = $user->posts()->where('id', $post_id)->first())
			{
				return error();
			}

			if (!Auth::check())
			{
				return error();
			}

			$post->delete();
			return response();
		});
	});
	
	Route::group(['prefix' => 'search'], function()
	{
		Route::any('', function()
		{
			$search = Input::has('search') && in_array(Input::get('search'), ['points', 'services', 'actions']) ? Input::get('search') : 'points';
			$sort = Input::has('sort') && in_array(Input::get('sort'), ['rating', 'distance']) ? Input::get('sort') : 'rating';
			$order = Input::has('order') && in_array(Input::get('order'), ['desc', 'asc']) ? Input::get('order') : 'desc';
			$count = Input::has('count') && Input::get('count') > 0 && Input::get('count') <= 100 ? Input::get('count') : 100;

			switch ($search)
			{
				case 'points':
				{
					$query = Point::query()->with('profile');

					if (Input::has('query'))
					{
						$query->where('name', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
						$query->orWhere('location', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
						$query->orWhere('description', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
					}

					if ($sort == 'rating')
					{
						$query->orderBy($sort, $order);
					}
					
					break;
				}
				case 'services':
				{
					$query = Service::query()->select('services.*')->with('point', 'point.profile')->join('points', 'services.point_id', '=', 'points.id');

					if (Input::has('query'))
					{
						$query->where('services.name', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
						$query->orWhere('services.description', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
					}

					if ($sort == 'rating')
					{
						$query->orderBy('points.' . $sort, $order);
					}
					
					break;
				}
				case 'actions':
				{
					$query = Action::query()->select('actions.*')->with('point', 'point.profile')->join('points', 'actions.point_id', '=', 'points.id');

					if (Input::has('query'))
					{
						$query->where('actions.name', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
						$query->orWhere('actions.description', 'like', '%' . str_replace('%', '\\%', Input::get('query')) . '%');
					}

					if ($sort == 'rating')
					{
						$query->orderBy('points.' . $sort, $order);
					}

					break;
				}
			}

			if (Input::has('offset') && Input::get('offset') >= 0)
			{
				$query->offset(Input::get('offset'));
			}

			$query->limit($count);
			return response($query->get()->toArray());
		});
	});
	
	Route::any('{anything}', function()
	{
		return error();
	})
	->where('anything', '.*');

	Route::any('', function()
	{
		return error();
	});
});