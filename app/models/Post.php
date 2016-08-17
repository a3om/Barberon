<?php

class Post extends Eloquent {

	public function user()
	{
		return $this->belongsTo('User');
	}
}
