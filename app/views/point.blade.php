@extends('main')
@section('scripts')
<script>
barberon.point =
{
    address: '{{ $point->profile->address }}',
};
</script>
@stop
@section('wrapper')
<div class="subheader forPoint">
    <div class="logo">
        <img src="http://{{ Config::get('app.domain') }}/img/testLogo.jpg" alt="" />
    </div>
    <div class="info">
        <div class="name">{{ $point->name }}</div>
        <div class="rating">{{ round($point->rating) }}%</div>
        <div class="location">{{ $point->location }}</div>
        <div class="description">{{ $point->description }}</div>
    </div>
    <div class="subscribed" id="subscribedButton" style="{{ ($userPivot && $userPivot->subscribed) ? '' : 'display: none;' }}">
        <div>Вы подписаны</div>
        <a class="unsubscribe" id="unsubscribeButton">Отписаться</a>
    </div>
    <div class="subscription" id="subscribeButton" style="{{ ($userPivot && $userPivot->subscribed) ? 'display: none;' : '' }}">Подписаться</div>
    <div class="menu">
        <a href="/{{ $point->profile->address }}" {{ $path == 'wall' ? 'class="active"' : '' }}>Записи<span>12</span></a>
        <a href="/{{ $point->profile->address }}/services" {{ $path == 'services' ? 'class="active"' : '' }}>Услуги</a>
        <a href="/{{ $point->profile->address }}/information" {{ $path == 'information' ? 'class="active"' : '' }}>Информация</a>
        <a href="/{{ $point->profile->address }}/comments" {{ $path == 'comments' ? 'class="active"' : '' }}>Отзывы</a>
    </div>
</div>
<div class="separator"></div>
<div id="content">
    @yield('content')
</div>
@stop