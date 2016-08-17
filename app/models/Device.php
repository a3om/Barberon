<?php

class Device extends Eloquent {

	public function user()
	{
		return $this->hasOne('User');
	}
}
