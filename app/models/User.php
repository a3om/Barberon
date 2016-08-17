<?php

use Illuminate\Auth\UserTrait;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableTrait;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

	use UserTrait, RemindableTrait;

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	
	protected $hidden = array('password', 'remember_token');

	public function devices()
	{
		return $this->belongsToMany('Device');
	}

	public function points()
	{
		return $this->belongsToMany('Point');
	}

	public function users()
	{
		return $this->belongsToMany('User', null, 'user0_id', 'user1_id');
	}

	public function profile()
	{
		return $this->morphOne('Profile', 'host');
	}

	public function posts()
	{
		return $this->morphMany('Post', 'host');
	}

	public function getPointPivot($point)
	{
		if (!$pivot = DB::table($this->points()->getTable())->where('point_id', $point->id)->first())
		{
			$pivot = $this->points()->attach($point->id);
			$pivot = (object) ['subscribed' => false];
		}

		return $pivot;
	}

	public function updatePointPivot($point, $data)
	{
		return DB::table($this->points()->getTable())->where('point_id', $point->id)->update($data);
	}

	public function getCountOfPointPivots($where = null)
	{
		$query = DB::table($this->points()->getTable());
		$where && $where($query);
		return $query->count();
	}

	public function getUserPivot($user)
	{
		if (!$pivot = DB::table($this->users()->getTable())->where('user1_id', $user->id)->first())
		{
			$pivot = $this->users()->attach($user->id);
			$pivot = (object) ['subscribed' => false];
		}

		return $pivot;
	}

	public function updateUserPivot($user, $data)
	{
		return DB::table($this->users()->getTable())->where('user1_id', $user->id)->update($data);
	}

	public function getCountOfUserPivots($where = null)
	{
		$query = DB::table($this->users()->getTable());
		$where && $where($query);
		return $query->count();
	}
}
