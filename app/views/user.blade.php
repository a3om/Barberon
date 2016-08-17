@extends('main')
@section('wrapper')
<div class="subheader forUser">
    <div class="logo">
        <img src="http://{{ Config::get('app.domain') }}/img/testLogo.jpg" alt="" />
    </div>
    <div class="info">
        <div class="name">{{ $user->name }}</div>
        <div class="about">{{ $user->about }}</div>
    </div>
    <div class="statistics">
        <a class="block" href="/{{ $address->name }}">
            <div class="count">25</div>
            <div class="name">постов</div>
        </a>
        <a class="block" href="/{{ $address->name }}/users">
            <div class="count">25</div>
            <div class="name">интересных людей</div>
        </a>
        <a class="block" href="/{{ $address->name }}/points">
            <div class="count">25</div>
            <div class="name">точек</div>
        </a>
        <a class="block" href="/{{ $address->name }}/subscribers">
            <div class="count">25</div>
            <div class="name">подписчиков</div>
        </a>
    </div>
    <div class="options">
        <a href="/{{ $address->name }}/edit">Редактировать</a>
    </div>
    <div class="menu">
        <a href="/{{ $address->name }}" {{ $path == 'wall' ? 'class="active"' : '' }}>Записи<span>12</span></a>
    </div>
</div>
<div class="separator"></div>
<div id="content">
    @yield('content')
</div>
@stop