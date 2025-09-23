<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use App\Services\UserService;
use Illuminate\Validation\ValidationException;
use App\Services\TwilioService;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected $userService;
    protected $twilio;

    public function __construct(UserService $userService, TwilioService $twilio)
    {
        $this->userService = $userService;
        $this->twilio = $twilio;
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register a new user",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="phone", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="User registered successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login a user",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login successful"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     *
     * @OA\Post(
     *     path="/api/google-login",
     *     summary="Login using Google OAuth",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token"},
     *             @OA\Property(property="token", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Google login successful"),
     *     @OA\Response(response=401, description="Invalid Google token")
     * )
     *
     * @OA\Get(
     *     path="/api/users",
     *     summary="Get all users",
     *     tags={"Auth"},
     *     @OA\Response(response=200, description="List of all users")
     * )
     *
     * @OA\Get(
     *     path="/api/users/{id}",
     *     summary="Get user by ID",
     *     tags={"Auth"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="User ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="User data")
     * )
     *
     * @OA\Post(
     *     path="/api/users",
     *     summary="Create a user",
     *     tags={"Auth"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="phone", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="User created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Update a user",
     *     tags={"Auth"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="phone", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="User updated successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Delete a user",
     *     tags={"Auth"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="User deleted successfully")
     * )
     */

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string',
        ]);
        $user = $this->userService->createUser($request->all());
        if ($user->phone) {
            try {
                Log::info("Trying to send WhatsApp to {$user->phone}");
                $this->twilio->sendWhatsApp(
                    $user->phone, 
                    "Hi {$user->name}, welcome! Your registration is successful."
                );
                Log::info("WhatsApp sent successfully");
            } catch (\Exception $e) {
                Log::error("Twilio WhatsApp error: " . $e->getMessage());
            }
        }
        return response()->json([
            'message' => 'User registered successfully',
            'user'    => $user,
            'success' => true,
        ], 200);
    }

    public function login(Request $request)
    {
        $credentials = [
            'email' => $request->email,
            'password' => trim($request->password),
        ];
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }
        $user = auth()->user();
        if (!empty($user->phone)) {
            try {
                $this->twilio->sendWhatsApp(
                    $user->phone, 
                    "Hello {$user->name}, you have successfully logged in!"
                );
            } catch (\Exception $e) {
                Log::error("Twilio WhatsApp error: " . $e->getMessage());
            }
        }
        return response()->json([
            'success'      => true,
            'message'      => 'Login successful',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    public function googleLogin(Request $request)
    {
        $request->validate(['token' => 'required|string']);
        $client = new \Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
        $payload = $client->verifyIdToken($request->token);
        if (!$payload) {
            return response()->json(['success' => false, 'error' => 'Invalid Google token'], 401);
        }
        $user = User::firstOrCreate(
            ['email' => $payload['email']],
            [
                'name'     => $payload['name'] ?? 'Google User',
                'password' => bcrypt(Str::random(16)),
            ]
        );
        return response()->json([
            'success' => true,
            'google_token' => $request->token,
            'user' => $user,
        ]);
    }

    public function index()
    {
        return response()->json($this->userService->getAllUsers());
    }

    public function show($id)
    {
        return response()->json($this->userService->getUserById($id));
    }

    public function store(Request $request)
    {
        try {
            $this->userService->validateUserData($request->all());
            $user = $this->userService->createUser($request->all());
            return response()->json(['success' => true, 'message' => 'User created successfully', 'data' => $user], 200);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $user = $this->userService->getUserById($id);
        try {
            $this->userService->validateUserData($request->all(), $id);
            $data = $request->all();
            if (!empty($data['password'])) {
                $data['password'] = bcrypt($data['password']);
            }
            $updatedUser = $this->userService->updateUser($user, $data);
            return response()->json(['success' => true, 'message' => 'User updated successfully', 'data' => $updatedUser]);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        $user = $this->userService->getUserById($id);
        $this->userService->deleteUser($user);
        return response()->json(['message' => 'User deleted successfully']);
    }
}  