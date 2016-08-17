@extends('point')
@section('scripts')
<script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
<script type="text/javascript">
ymaps.ready(function() {

	var map = new ymaps.Map("map", {

        center: [{{ $point->latitude }}, {{ $point->longitude }}],
        zoom: 17,
    });

    var point = new  ymaps.Placemark([{{ $point->latitude }}, {{ $point->longitude }}], {balloonContent: '<strong>{{ $point->name }}</strong><br />{{ $point->location }}', 'iconContent': '{{ $point->name }}'}, {preset: 'islands#greenStretchyIcon'});
	map.geoObjects.add(point);
});
</script>
@stop
@section('content')
<div class="workdays">
	<div class="title">Рабочие дни</div>
	<ul>
		<li>Пн.<span>8:00 - 18:00</span></li>
		<li>Вт.<span>8:00 - 18:00</span></li>
		<li>Ср.<span>8:00 - 18:00</span></li>
		<li>Чт.<span>8:00 - 18:00</span></li>
		<li>Пт.<span>8:00 - 18:00</span></li>
		<li>Сб.<span>Выходной</span></li>
		<li>Вс.<span>Выходной</span></li>
	</ul>
</div>
<div class="internet">
	<div class="title">Интернет</div>
	<ul>
		<li>
			<div class="image">
				<img src="http://{{ Config::get('app.domain') }}/img/vk128.png" alt="" />
			</div>
			<span>ВКонтакте</span>
			<a href="http://vk.com/justdoit" target="_blank" class="right">vk.com/justdoit</a>
		</li>
		<li>
			<div class="image">
				<img src="http://{{ Config::get('app.domain') }}/img/website96.png" alt="" />
			</div>
			<span>Веб-сайт</span>
			<a href="http://google.com" target="_blank" class="right">google.com</a>
		</li>
	</ul>
</div>
<div class="contacts">
	<div class="title">Контакты</div>
	<ul>
		<li>
			<div class="image">
				<img src="http://{{ Config::get('app.domain') }}/img/phone128.png" alt="" />
			</div>
			<span>Телефон</span>
			<span class="right">8 (843) 262-22-22</span>
		</li>
		<li>
			<div class="image">
				<img src="http://{{ Config::get('app.domain') }}/img/email128.png" alt="" />
			</div>
			<span>E-Mail</span>
			<a href="mailto://atom-danil@yandex.ru" class="right">atom-danil@yandex.ru</a>
		</li>
	</ul>
</div>
<div class="separator"></div>
<div id="map" style="width: 100%; height: 400px;"></div>
@stop