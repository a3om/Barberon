<?php

function response($data = null)
{
	if (Input::has('callback'))
	{
		return Input::get('callback') . '(' . json_encode(['response' => $data]) . ');';
	}

	if (Request::ajax())
	{
		return ['response' => $data];
	}

	return '<pre>' . print_r(['response' => $data], true) . '</pre>';
}

function error($data = null)
{
	if (Input::has('callback'))
	{
		return Input::get('callback') . '(' . json_encode(['error' => $data]) . ');';
	}

	if (Request::ajax())
	{
		return ['error' => $data];
	}

	return '<pre>' . print_r(['error' => $data], true) . '</pre>';
}

include (app_path() . '/api/v1.php');

// for ($i = 0; $i < 100; ++$i)
// {
// 	$post = new Post;
// 	$post->text = 'Text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text.';
// 	$post->user_id = 1;
// 	$post->host_type = 'Point';
// 	$post->host_id = 1;
// 	$post->save();
// }

// View::creator('point', function($view)
// {
// 	$view->with('userPivot', Auth::check() ? Auth::user()->getPointPivot($view->point) : null);
// });

// View::creator('main', function($view)
// {
// 	$view->with('userAddress', Auth::check() ? Auth::user()->address->name : null);

// 	$view->with('userSubscribedPointsCount', Auth::check() ? Auth::user()->getCountOfPointPivots(function($query)
// 	{
// 		$query = $query->where('subscribed', true);
// 	}
// 	) : 0);
// });

// Route::any('register', function()
// {
// 	$rules =
// 	[
// 		'name' => 'required',
// 		'email' => 'required|email',
// 		'password' => 'required|min:6',
// 	];

// 	$validator = Validator::make(Input::all(), $rules);

// 	if ($validator->fails())
// 	{
// 		return ['success' => false, 'errors' => $validator->errors()];
// 	}

// 	if (User::where('email', Input::get('email'))->first())
// 	{
// 		$validator->errors()->add('email', 'Пользователь с таким e-mail адресом уже существует в нашей системе');
// 		return ['success' => false, 'errors' => $validator->errors()];
// 	}

// 	$user = new User;
// 	$user->name = Input::get('name');
// 	$user->email = Input::get('email');
// 	$user->password = Input::get('password');

// 	$rememberToken = str_random(60);

// 	while(User::where('remember_token', $rememberToken)->first())
// 	{
// 		$rememberToken = str_random(60);
// 		continue;
// 	}

// 	$user->remember_token = $rememberToken;
// 	$user->save();
// 	Auth::login($user);
// 	return ['success' => true, 'user' => $user];
// });

// Route::any('login', function()
// {
// 	$rules =
// 	[
// 		'email' => 'required|email',
// 		'password' => 'required|min:6',
// 	];

// 	$validator = Validator::make(Input::all(), $rules);

// 	if ($validator->fails())
// 	{
// 		return ['success' => false, 'errors' => $validator->errors()];
// 	}

// 	if (!$user = User::where('email', Input::get('email'))->first())
// 	{
// 		$validator->errors()->add('email', 'Пользователя с таким e-mail адресом не существует в нашей системе');
// 		return ['success' => false, 'errors' => $validator->errors()];
// 	}

// 	if ($user->password != Input::get('password'))
// 	{
// 		$validator->errors()->add('password', 'Неправильный пароль');
// 		return ['success' => false, 'errors' => $validator->errors()];
// 	}

// 	Auth::login($user);
// 	return ['success' => true, 'user' => $user];
// });

// Route::any('logout', function()
// {
// 	if (Auth::check())
// 	{
// 		Auth::logout();
// 		return ['success' => true];
// 	}

// 	return ['success' => false];
// });

// Route::group(['prefix' => '{address}', 'before' => 'test'], function()
// {
// 	Route::any('edit', function($addressName)
// 	{
// 		if ($profile = Profile::where('address', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					return 'abc';
// 				}
// 				case 'User':
// 				{
// 					if (!Auth::check())
// 					{
// 						return 404;
// 					}

// 					$user = Auth::user();

// 					if (Request::ajax())
// 					{
// 						$rules =
// 						[
// 							'name' => 'required',
// 							'email' => 'required|email',
// 						];

// 						$validator = Validator::make(Input::all(), $rules);

// 						if ($validator->fails())
// 						{
// 							return ['success' => false, 'errors' => $validator->errors()];
// 						}

// 						if (User::where('email', Input::get('email'))->where('id', '!=', $user->id)->first())
// 						{
// 							$validator->errors()->add('email', 'Пользователя с таким e-mail адресом уже существует в нашей системе');
// 							return ['success' => false, 'errors' => $validator->errors()];
// 						}

// 						if (Input::has('oldPassword'))
// 						{
// 							if ($user->password != Input::get('oldPassword'))
// 							{
// 								$validator->errors()->add('oldPassword', 'Неправильный старый пароль');
// 								return ['success' => false, 'errors' => $validator->errors()];
// 							}

// 							if (!Input::has('newPassword'))
// 							{
// 								$validator->errors()->add('newPassword', 'Поле новый пароль должно быть заполнено');
// 								return ['success' => false, 'errors' => $validator->errors()];
// 							}

// 							if (!Input::has('confirmationOfNewPassword'))
// 							{
// 								$validator->errors()->add('confirmationOfNewPassword', 'Поле подтверждение нового пароля должно быть заполнено');
// 								return ['success' => false, 'errors' => $validator->errors()];
// 							}

// 							if (Input::get('newPassword') != Input::get('confirmationOfNewPassword'))
// 							{
// 								$validator->errors()->add('confirmationOfNewPassword', 'Подтверждение нового пароля не совпадает с новым паролем');
// 								return ['success' => false, 'errors' => $validator->errors()];
// 							}

// 							$user->password = Input::get('newPassword');
// 						}

// 						$user->name = Input::get('name');
// 						$user->email = Input::get('email');
// 						$user->about = Input::get('about');
// 						$user->save();

// 						return ['success' => true];
// 					}

// 					return View::make('user/edit',
// 					[
// 						'user' => $user,
// 						'address' => $address,
// 						'location' => ['user', 'edit'],
// 					]);
// 				}
// 			}
// 		}

// 		return $addressName;
// 	});
// 	Route::any('services', function($address)
// 	{
// 		if ($profile = Profile::where('address', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					if (!$point = $profile->host()->with(['servicesSections' => function($query)
// 					{
// 						$query->orderBy('name', 'asc');
// 					},
// 					'servicesSections.services' => function($query)
// 					{
// 						$query->orderBy('name', 'asc');
// 					}
// 					])->first())
// 					{
// 						return 'Ошибка! Точка не найдена.';
// 					}

// 					return View::make('point/services',
// 					[
// 						'title' => $point->name,
// 						'point' => $point,
// 						'address' => $address,
// 						'path' => 'services',
// 						'location' => ['point', 'services'],
// 					]);
// 				}
// 			}

// 			throw new NotFoundHttpException;
// 		}

// 		throw new NotFoundHttpException;
// 	});

// 	Route::any('information', function($address)
// 	{
// 		if ($profile = Profile::where('name', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					if (!$point = $profile->host()->first())
// 					{
// 						return 'Ошибка! Точка не найдена.';
// 					}

// 					return View::make('point/information',
// 					[
// 						'title' => $point->name,
// 						'point' => $point,
// 						'address' => $address,
// 						'path' => 'information',
// 						'location' => ['point', 'information'],
// 					]);
// 				}
// 			}

// 			throw new NotFoundHttpException;
// 		}

// 		throw new NotFoundHttpException;
// 	});

// 	Route::group(['prefix' => 'comments'], function()
// 	{
// 		Route::any('add', function($address)
// 		{
// 			if ($profile = Profile::where('address', $address)->first())
// 			{
// 				switch ($profile->host_type)
// 				{
// 					case 'Point':
// 					{
// 						if (!$point = $profile->host()->first())
// 						{
// 							return ['success' => false, 'error' => 'Ошибка! Точка не найдена.'];
// 						}

// 						if (!Auth::check())
// 						{
// 							return ['success' => false, 'error' => 'Вы не авторизированы.'];
// 						}

// 						if (!Input::has('text'))
// 						{
// 							return ['success' => false, 'error' => 'Не заполнен текст комментария.'];
// 						}

// 						$comment = new Comment;
// 						$comment->text = Input::get('text');
// 						$comment->user_id = Auth::user()->id;
// 						$comment->host_type = 'Point';
// 						$comment->host_id = $point->id;
// 						$comment->save();

// 						return ['success' => true, 'comment' => $comment];
// 					}
// 				}

// 				throw new NotFoundHttpException;
// 			}

// 			throw new NotFoundHttpException;
// 		});

// 		Route::any('', function($address)
// 		{
// 			if ($profile = Profile::where('address', $address)->first())
// 			{
// 				switch ($profile->host_type)
// 				{
// 					case 'Point':
// 					{
// 						if (!$point = $profile->host()->with(['comments' => function($query)
// 						{
// 							$query->limit(10)->orderBy('created_at', 'desc');
// 						}
// 						])->first())
// 						{
// 							return 'Ошибка! Точка не найдена.';
// 						}

// 						return View::make('point/comments',
// 						[
// 							'title' => $point->name,
// 							'point' => $point,
// 							'address' => $address,
// 							'path' => 'comments',
// 							'location' => ['point', 'comments'],
// 						]);
// 					}
// 				}

// 				throw new NotFoundHttpException;
// 			}

// 			throw new NotFoundHttpException;
// 		});
// 	});

// 	Route::any('subscribe', function($address)
// 	{
// 		if ($profile = Profile::where('name', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					if (!$point = $profile->host()->first())
// 					{
// 						return ['success' => false, 'error' => 'Не найдена точка по такому адресу'];
// 					}

// 					if (!Auth::check())
// 					{
// 						return ['success' => false, 'error' => 'Пользователь не авторизирован'];
// 					}

// 					$pointPivot = Auth::user()->getPointPivot($point);

// 					if ($pointPivot->subscribed)
// 					{
// 						return ['success' => false, 'error' => 'Вы уже подписаны на эту точку'];
// 					}

// 					Auth::user()->updatePointPivot($point, ['subscribed' => true]);

// 					return ['success' => true, 'subscribedPointsCount' => Auth::user()->getCountOfPointPivots(function($query)
// 					{
// 						$query = $query->where('subscribed', true);
// 					}
// 					)];
// 				}
// 			}
// 		}
// 	});

// 	Route::any('unsubscribe', function($address)
// 	{
// 		if ($profile = Profile::where('name', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					if (!$point = $profile->host()->first())
// 					{
// 						return ['success' => false, 'error' => 'Не найдена точка по такому адресу'];
// 					}

// 					if (!Auth::check())
// 					{
// 						return ['success' => false, 'error' => 'Пользователь не авторизирован'];
// 					}

// 					$pointPivot = Auth::user()->getPointPivot($point);

// 					if (!$pointPivot->subscribed)
// 					{
// 						return ['success' => false, 'error' => 'Вы не подписаны на эту точку'];
// 					}

// 					Auth::user()->updatePointPivot($point, ['subscribed' => false]);
// 					return ['success' => true, 'subscribedPointsCount' => Auth::user()->getCountOfPointPivots(function($query)
// 					{
// 						$query = $query->where('subscribed', true);
// 					}
// 					)];
// 				}
// 			}
// 		}
// 	});

// 	Route::any('', function($address)
// 	{
// 		// $requests = include (app_path() . '/requests.php');

// 		// if (method_exists($requests, $addressName))
// 		// {
// 		// 	$user = Input::has('rememberToken') ? User::where('remember_token', Input::get('rememberToken'))->first() : (Auth::check() ? Auth::user() : null);

// 		// 	if (Request::ajax())
// 		// 	{
// 		// 		sleep(1);
// 		// 		return (array) $requests->$addressName((object) Input::all(), $user);
// 		// 	}

// 		// 	if (Input::has('callback'))
// 		// 	{
// 		// 		return Response::json((array) $requests->$addressName((object) Input::all(), $user))
// 		// 			->setCallback(Input::get('callback'));
// 		// 	}

// 		// 	return '<pre>' . print_r((array) $requests->$addressName((object) Input::all(), $user), true) . '</pre>';
// 		// }

// 		if ($profile = Profile::where('address', $address)->first())
// 		{
// 			switch ($profile->host_type)
// 			{
// 				case 'Point':
// 				{
// 					if (!$point = $profile->host()->with(['posts' => function($query)
// 					{
// 						$query->limit(10)->orderBy('id', 'desc');
// 					}
// 					])->first())
// 					{
// 						return 'Ошибка! Точка не найдена.';
// 					}

// 					return View::make('point/wall',
// 					[
// 						'title' => $point->name,
// 						'point' => $point,
// 						'address' => $address,
// 						'path' => 'wall',
// 						'location' => ['point', 'index'],
// 					]);
// 				}
// 				case 'User':
// 				{
// 					if (Request::ajax())
// 					{
// 						$profile->with('host');
// 						return [];
// 					}

// 					if (!$user = $profile->host()->with(['posts' => function($query)
// 					{
// 						$query->limit(10)->orderBy('id', 'desc');
// 					}
// 					])->first())
// 					{
// 						return 'Ошибка! Пользователь не найден.';
// 					}
					
// 					return View::make('user/wall',
// 					[
// 						'title' => $user->name,
// 						'user' => $user,
// 						'address' => $address,
// 						'path' => 'wall',
// 						'location' => ['user', 'index'],
// 					]);
// 				}
// 			}

// 			return $profile->address;
// 		}

// 		return $address;
// 	})
// 	->where('address', '[0-9A-Za-z-_\.]{3,}');
// });

// Route::any('', function()
// {
// 	// return ServicesSection::with('services')->get();
// 	// foreach (Point::get() as $point)
// 	// {
// 	// 	$point->description = 'Text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text text.';
// 	// 	$point->save();
// 	// }
// 	// return;
// 	$searchParams =
// 	[
// 		'searchBy' => Input::has('searchBy') && Input::get('searchBy') && in_array(Input::get('searchBy'), ['points', 'services', 'actions']) ? Input::get('searchBy') : 'points',
// 		'query' => Input::has('query') ? Input::get('query') : '',
// 	];

// 	$searchByLang =
// 	[
// 		'points' => 'точкам',
// 		'services' => 'услугам',
// 		'actions' => 'акциям',
// 	];

// 	$orderByLang =
// 	[
// 		'rating' => 'рейтингу',
// 		'distance' => 'дистанции',
// 	];

// 	$count = (Input::has('count') && is_numeric(Input::get('count')) && Input::get('count') > 10) ? Input::get('count') : 10;

// 	switch ($searchParams['searchBy'])
// 	{
// 		case 'points':
// 		{
// 			$query = Point::query();
// 			break;
// 		}
// 		case 'services':
// 		{
// 			$query = Service::query()->select('services.*')->with('point')->join('points', 'services.point_id', '=', 'points.id');
// 			break;
// 		}
// 		case 'actions':
// 		{
// 			$query = Action::query()->select('services.*')->with('point')->join('points', 'actions.point_id', '=', 'points.id');
// 			break;
// 		}
// 	}

// 	$query = $query->take($count);

// 	if ($searchParams['query'] != '')
// 	{
// 		switch ($searchParams['searchBy'])
// 		{
// 			case 'points':
// 			{
// 				$query = $query->where('name', 'like', '%' . str_replace('%', '\\%', $searchParams['query']) . '%');
// 				$query = $query->orWhere('location', 'like', '%' . str_replace('%', '\\%', $searchParams['query']) . '%');
// 				$query = $query->orWhere('description', 'like', '%' . str_replace('%', '\\%', $searchParams['query']) . '%');
// 				break;
// 			}
// 			case 'services':
// 			{
// 				$query = $query->where('name', 'like', '%' . str_replace('%', '\\%', $searchParams['query']) . '%');
// 				$query = $query->orWhere('description', 'like', '%' . str_replace('%', '\\%', $searchParams['query']) . '%');
// 				break;
// 			}
// 			case 'actions':
// 			{
// 				break;
// 			}
// 		}
// 	}

// 	$searchParams['order'] = (Input::has('order') && Input::get('order') && in_array(Input::get('order'), ['asc', 'desc'])) ? Input::get('order') : 'desc';

// 	switch ($searchParams['searchBy'])
// 	{
// 		case 'points':
// 		{
// 			$searchParams['orderBy'] = (Input::has('orderBy') && Input::get('orderBy') && in_array(Input::get('orderBy'), ['rating'])) ? Input::get('orderBy') : 'rating';
// 			$query = $query->orderBy($searchParams['orderBy'], $searchParams['order']);
// 			break;
// 		}
// 		case 'services':
// 		{
// 			$searchParams['orderBy'] = (Input::has('orderBy') && Input::get('orderBy') && in_array(Input::get('orderBy'), ['rating'])) ? Input::get('orderBy') : 'rating';
// 			$query = $query->orderBy('points.' . $searchParams['orderBy'], $searchParams['order']);
// 			break;
// 		}
// 		case 'actions':
// 		{
// 			$searchParams['orderBy'] = (Input::has('orderBy') && Input::get('orderBy') && in_array(Input::get('orderBy'), ['rating'])) ? Input::get('orderBy') : 'rating';
// 			$query = $query->orderBy('points.' . $searchParams['orderBy'], $searchParams['order']);
// 			break;
// 		}
// 	}

// 	switch ($searchParams['searchBy'])
// 	{
// 		case 'services':
// 		{
// 			$searchParams['priceFrom'] = (Input::has('priceFrom') && Input::get('priceFrom') && Input::get('priceFrom') >= 50 && Input::get('priceFrom') <= 5000) ? Input::get('priceFrom') : 50;
// 			$searchParams['priceTo'] = (Input::has('priceTo') && Input::get('priceTo') && Input::get('priceTo') >= 50 && Input::get('priceTo') <= 5000) ? Input::get('priceTo') : 5000;

// 			if ($searchParams['priceFrom'] > $searchParams['priceTo'])
// 			{
// 				$searchParams['priceFrom'] = $searchParams['priceTo'];
// 			}

// 			$query = $query->where('price_from', '>=', $searchParams['priceFrom']);
// 			$query = $query->where('price_to', '<=', $searchParams['priceTo']);
// 			break;
// 		}
// 	}

// 	$units = $query->get();

// 	return View::make('units',
// 	[
// 		'title' => 'Салоны',
// 		'searchParams' => $searchParams,
// 		'searchByLang' => $searchByLang[$searchParams['searchBy']],
// 		'orderByLang' => $orderByLang[$searchParams['orderBy']],
// 		'units' => $units,
// 		'location' => ['index'],
// 	]);
// });

Route::any('{anything}', function()
{
	if (Auth::check())
	{
		$pointSubscriptionsCount = Auth::user()->getCountOfPointPivots(function($query)
		{
			$query->where('subscribed', true);
		});

		$profile = Auth::user()->profile;
	}
	else
	{
		$pointSubscriptionsCount = 0;
		$profile = null;
	}

	return View::make('main', ['pointSubscriptionsCount' => $pointSubscriptionsCount, 'profile' => $profile,]);
})
->where('anything', '.*');