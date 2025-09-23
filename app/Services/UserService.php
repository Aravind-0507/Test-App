<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function getAllUsers()
    {
        return User::all();
    }

    public function createUser(array $data): User
    {
        return User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'phone'    => $data['phone'] ?? null, 
        ]);
    }

    public function getUserById($id): User
    {
        return User::findOrFail($id);
    }

    public function updateUser(User $user, array $data): User
    {
        if (isset($data['password']) && $data['password']) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']); 
        }
        $user->update($data);
        return $user;
    }

    public function deleteUser(User $user): bool
    {
        return $user->delete();
    }

    public function validateUserData(array $data, $id = null)
    {
        $rules = [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email' . ($id ? ",$id" : ''),
            'password' => $id ? 'sometimes|string|min:6' : 'required|string|min:6',
            'phone'    => 'nullable|string|unique:users,phone' . ($id ? ",$id" : ''),
        ];
        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}