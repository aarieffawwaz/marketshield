import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => 'ApiException: $message';
}

/// Thin client for the public MarketShield API (`/api/v1`, CORS `*`).
class MsApi {
  /// Override with `--dart-define=MS_API_BASE=...` for local testing.
  static const base =
      String.fromEnvironment('MS_API_BASE', defaultValue: 'https://marketshield-inception.vercel.app/api/v1');
  static const timeout = Duration(seconds: 6);

  final http.Client _client;
  MsApi([http.Client? client]) : _client = client ?? http.Client();

  /// Returns the raw JSON body of a GET. No custom headers, so browsers send it without a CORS preflight.
  Future<String> getRaw(String path) async {
    final res = await _client.get(Uri.parse('$base$path')).timeout(timeout);
    if (res.statusCode != 200) throw ApiException('GET $path -> ${res.statusCode}');
    return utf8.decode(res.bodyBytes);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, Object?> body) async {
    // On web, text/plain keeps this a "simple" CORS request (the API's OPTIONS reply has no CORS headers);
    // the server parses the JSON body regardless of content type.
    final res = await _client
        .post(Uri.parse('$base$path'),
            headers: {'content-type': kIsWeb ? 'text/plain;charset=utf-8' : 'application/json'}, body: jsonEncode(body))
        .timeout(timeout);
    if (res.statusCode != 200) throw ApiException('POST $path -> ${res.statusCode}');
    final decoded = jsonDecode(utf8.decode(res.bodyBytes));
    if (decoded is! Map<String, dynamic>) throw ApiException('POST $path: unexpected body');
    return decoded;
  }
}
