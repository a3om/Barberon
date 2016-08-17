@extends('point')
@section('content')
<form class="addComment" action="" id="addCommentForm">
	<textarea name="text" placeholder="Ваш комментарий..."></textarea>
	<input type="submit" value="Отправить" /> <span>Text Text Text</span>
</form>
<div class="separator"></div>
<div class="comments">
@if ($point->comments->count() != 0)
@foreach ($point->comments as $key => $comment)
@if ($key != 0)
<div class="separator"></div>
@endif
<form class="comment" id="comment{{ $comment->id }}">
	<div class="avatar">
		<img src="https://pbs.twimg.com/profile_images/572360620519878656/tMFYl1Re_400x400.jpeg" alt="" />
	</div>
	<div class="content">
		<div class="title">
			<span class="name">{{ $comment->user->name }}</span>
			<span class="date">{{ $comment->created_at->format('d') }} {{ getMonthInGenetive($comment->created_at->format('n') - 1) }} {{ $comment->created_at->format('Y в H:i') }}</span>
			<span class="options">
				<a href="#" class="editComment" data-id="{{ $comment->id }}">Редактировать</a> <a href="#" class="deleteComment" data-id="{{ $comment->id }}">Удалить</a>
			</span>
		</div>
		<div class="text">{{ $comment->text }}</div>
		<textarea name="text"></textarea>
		<div class="editLoader">Сохраняем...</div>
	</div>
</form>
@endforeach
@else
<div class="noComments">Пока нет ни одного комментария</div>
@endif
</div>
@stop