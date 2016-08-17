<?php

class ServicesSection extends Eloquent {

	public function services()
	{
		return $this->hasMany('Service', 'section_id');
	}
}
