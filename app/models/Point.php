<?php

class Point extends Eloquent {

	public function getServicesAttribute()
	{
		return unserialize($this->attributes['services']);
	}
	
	public function setServicesAttribute(Array $services)
	{
		$this->attributes['services'] = serialize($services);
	}

	public function comments()
	{
		return $this->morphMany('Comment', 'host');
	}

	public function posts()
	{
		return $this->morphMany('Post', 'host');
	}

	public function servicesSections()
	{
		return $this->hasMany('ServicesSection');
	}

	public function users()
	{
		return $this->belongsToMany('User');
	}

	public function actions()
	{
		return $this->hasMany('Action');
	}

	public function followers()
	{
		// return $this->;
	}

	public function profile()
	{
		return $this->morphOne('Profile', 'host');
	}

	public function getHexPath()
	{
		$hexValue = dechex($this->id - 1);

		for ($i = strlen($hexValue); $i < 8; ++$i)
		{
			$hexValue = '0' . $hexValue;
		}

		$path = [];

		for ($i = 0; $i < 4; ++$i)
		{
			$path[] = substr($hexValue, $i * 2, 2);
		}

		return implode('/', $path);
	}
}
