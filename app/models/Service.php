<?php

class Service extends Eloquent {

	public function point()
	{
		return $this->belongsTo('Point');
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
