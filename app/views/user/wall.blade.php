@extends('user')
@section('content')
@if ($user->posts->count() != 0)
@foreach ($user->posts as $key => $post)
@if ($key != 0)
<div class="separator"></div>
@endif
<div class="post">
	<div class="avatar">
		<img src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSlMW7dUiK-9Fo76jT7ab3ONwXrir2FiJghDDMMdC252RI767vp" alt="" />
	</div>
	<div class="content">
		<div class="title">
			<span class="name">{{ $post->user->name }}</span>
			<span class="date">{{ $post->created_at->format('d') }} {{ getMonthInGenetive($post->created_at->format('n') - 1) }} {{ $post->created_at->format('Y в H:i') }}</span>
			<a href="#" class="remove">
				<img src="/img/remove16.png" alt="" />
			</a>
		</div>
		<div class="text">{{ $post->text }}</div>
	</div>
</div>
@endforeach
@else
<div class="noPosts">Пока нет ни одной записи</div>
@endif
@stop