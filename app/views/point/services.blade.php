@extends('point')
@section('content')
@if ($point->servicesSections->count() != 0)
<ul class="sections">
	@foreach ($point->servicesSections as $key => $section)
	<li {{ $key == 0 ? 'class="active"' : '' }} onclick="barberon.showServicesOfSection(this, {{ $section->id }});">{{ $section->name }}</li>
	@endforeach
</ul>@foreach ($point->servicesSections as $key => $section)<ul class="services" id="servicesOfSection{{ $section->id }}" {{ $key != 0 ? 'style="display: none;"' : '' }}>
	@foreach ($section->services as $service)
	<li>{{ $service->name }}<span>от {{ round($service->price_from) }} до {{ round($service->price_to) }} руб.</span></li>
	@endforeach
</ul>@endforeach
@else
<div class="noSections">Пока нет ни одной услуги</div>
@endif
@stop