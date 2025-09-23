<?php

namespace App\Swagger;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="My Test Application API",
 *     version="1.0.0",
 *     description="API documentation"
 * )
 *
 * @OA\Tag(
 *     name="Auth",
 *     description="Authentication endpoints"
 * )
 * 
 */
class SwaggerInfo
{
    // Only global annotations here (no routes)
}