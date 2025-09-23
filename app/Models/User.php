<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'phone', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function setPasswordAttribute($password)
    {
        $this->attributes['password'] = bcrypt($password);
    }

    public function getJWTIdentifier() 
    { 
        return $this->getKey(); 
    }
    public function getJWTCustomClaims() 
    { 
        return []; 
    }
}