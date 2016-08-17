<?php

class Profile extends Eloquent {

	public function host()
	{
		return $this->morphTo();
	}
}
