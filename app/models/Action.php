<?php

class Action extends Eloquent {

	public function point()
	{
		return $this->belongsTo('Point');
	}
}