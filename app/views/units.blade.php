@extends('main')
@section('scripts')
<script type="text/javascript">
barberon.loader.setUnits({{ json_encode($units->getIds()) }});
barberon.loader.setSearchParams({{ json_encode($searchParams) }});
barberon.loader.setUnitsYet({{ json_encode($units->count() >= 10) }});
</script>
@stop
@section('wrapper')
<div id="topbar">
    <form class="search" id="searchForm">
        <input type="text" name="query" autocomplete="off" id="query" placeholder="Введите название" value="{{ Input::get('query') }}" />
        <img src="http://{{ Config::get('app.domain') }}/img/searchLoader.gif" alt="" id="searchLoader" />
    </form>
</div>
<div id="sidebar">
    <div class="dropdown">
        <div class="title">
            <span id="searchByTitle">Поиск по {{ $searchByLang }}</span>
            <span>&#9660;</span>
        </div>
        <ul>
            <li>По точкам</li>
            <li>По услугам</li>
            <li>По акциям</li>
        </ul>
        <input type="hidden" name="searchBy" id="searchBy" value="name" />
    </div>
    <div class="options">
    	<div class="title">Сортировка</div>
        <div class="separator"></div>
        <div class="content">
        	<div class="sorter">
        		<div class="title">
        			<span id="sortingByTitle">По {{ $orderByLang }}</span>
        			<span>&#9660;</span>
        		</div><div class="order">{{ $searchParams['order'] == 'desc' ? '&darr;' : '&uarr;' }}</div>
        		<ul>
        			<li>По рейтингу</li>
        			<li>По дистанции</li>
        		</ul>
        	</div>
        </div>
        <div id="servicesPriceFilter" {{ $searchParams['searchBy'] == 'services' ? '' : 'style="display: none;"' }}>
			<div class="separator"></div>
	        <div class="title">Стоимость услуги</div>
	        <div class="separator"></div>
	        <div class="content">
	        	<div class="filter">
	    			<input type="text" name="from" class="from" placeholder="От..." autocomplete="off" id="filterPriceFrom" value="{{ Input::get('priceFrom') }}" /><input type="text" name="to" class="to" placeholder="До..." autocomplete="off" id="filterPriceTo" value="{{ Input::get('priceTo') }}" />
	    			<div id="slider-range"></div>
	        	</div>
	        </div>
	    </div>
    </div>
    <!-- <div class="params">
        <div class="title">Сортировать</div>
        <ul class="choice">
            <li>
                <label for="sortingByRating">
                    <span></span>
                    <input type="radio" name="orderBy" id="sortingByRating" value="rating" checked /> по рейтингу
                </label>
            </li>
            <li>
                <label for="sortingByCost">
                    <span></span>
                    <input type="radio" name="orderBy" id="sortingByCost" value="cost" /> по цене
                </label>
            </li>
        </ul>
        <div class="title">Мин. стоимость услуги</div>
        <div class="filter">
            От <input type="text" name="cost" value="" /> ₽
        </div>
        <div class="title">Показывать только акции</div>
        <ul class="choice">
            <li>
                <label for="showOnlyActions">
                    <span></span>
                    <input type="checkbox" name="onlyActions" id="showOnlyActions" value="true" /> Да
                </label>
            </li>
        </ul>
    </div> -->
    <div id="scroll">
        <div class="border"></div>
        <div class="arrow"></div>
    </div>
</div>
<div id="content" class="withSidebar withTopbar">
	@if ($units->count())
	@foreach ($units as $key => $unit)
	@if ($key)
	<div class="separator"></div>
	@endif
	@if ($searchParams['searchBy'] == 'points')
	<a class="point" href="http://{{ Config::get('app.domain') }}/{{ $unit->profile->address }}">
        <div class="logo">
            <img src="/img/testLogo.jpg" alt="" />
        </div>
        <div class="info">
            <div class="name">{{ $unit->name }}</div>
            <div class="rating">{{ round($unit->rating) }}%</div>
            <div class="location">{{ $unit->location }}</div>
            <div class="description">{{ $unit->description }}</div>
        </div>
    </a>
    @elseif ($searchParams['searchBy'] == 'services')
    <a class="point" href="http://{{ Config::get('app.domain') }}/{{ $unit->point->profile->address }}">
        <div class="logo">
            <img src="http://{{ Config::get('app.domain') }}/img/testLogo.jpg" alt="" />
        </div>
        <div class="info">
            <div class="name">{{ $unit->point->name }}</div>
            <div class="rating">{{ round($unit->point->rating) }}%</div>
            <div class="location">{{ $unit->point->location }}</div>
            <div class="service">
            	<div class="name">{{ $unit->name }}</div>
            	<div class="description">{{ $unit->description }}</div>
            	<div class="price">от {{ round($unit->price_from) }} до {{ round($unit->price_to) }} руб.</div>
            </div>
        </div>
    </a>
    @elseif ($searchParams['searchBy'] == 'actions')

    @endif
    @endforeach
    @if ($units->count() >= 10)
	<div id="loading">Идет загрузка...</div>
	@endif
	@else
	<div id="noResults">Не найдено ни одной точки по Вашему запросу</div>
	@endif
</div>
@stop