<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\HTTP;

use Symfony\Component\HttpFoundation\{Response, ResponseHeaderBag};

/**
 * Class for preparing custom response on request.
 */
class CustomResponse
{
  /**
   * Prepare response for request
   * 
   * @param           $content  Content of response
   * 
   * @return Response $response
   */
  public function prepareResponse($content): Response
  {
    //Below I create following headers: date, last_modified, etag
    $objectDate = new \DateTime();
    $objectDate->setTimeZone(new \DateTimeZone("Europe/Warsaw"));

    //date
    $date = $objectDate->format("D, d M Y H:i:s e");

    //last_modified
    $objectDate->setTimeStamp(filemtime(__FILE__) + 7200);

    //etag
    $etag = '#'.(string) filemtime(__FILE__);

    //headers
    $headers = [
        'Server' => 'PHP/7.2.19-0ubuntu0.18.04.1',
        'Date' => $date,
        'Content-Type' => 'text/html; charset=utf-8',
        'Connection' => 'keep-alive',
        'X-Download-Options' => 'noopen',
        'X-RateLimit-Limit' => '50',
        'X-RateLimit-Remaining' => '47',
        'X-RateLimit-Reset' => '120',
        'frame-ancestors' => 'none',
        'X-Xss-Protection' => '1; mode=block', 
        'X-Content-Type-Options' => 'nosniff',
        'X-Download-Options' => 'noopen',
        'X-Permitted-Cross-Domain-Policies' => 'none',
        'Referrer-Policy' => 'strict-origin-when-cross-origin'
    ];
    
    $response = new Response();
    $response->setContent($content);
    $response->setStatusCode(200);
    $response->setProtocolVersion('1.0');
    $response->headers = new ResponseHeaderBag($headers);
    $response->setCache([
      'etag' => $etag,
      'last_modified' => $objectDate,
      'max_age' => 3600,
      'private' => true,
      'public' => false,
    ]);

    return $response;
  }
}