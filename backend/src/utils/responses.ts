import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send a successful response (200 OK)
 */
export const sendSuccess = <T>(res: Response, data: T, message?: string): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(200).json(response);
};

/**
 * Send a created response (201 Created)
 */
export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || 'Resource created successfully',
  };
  return res.status(201).json(response);
};

/**
 * Send a no content response (204 No Content)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send a not found response (404 Not Found)
 */
export const sendNotFound = (res: Response, message = 'Resource not found'): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(404).json(response);
};

/**
 * Send an unauthorized response (401 Unauthorized)
 */
export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(401).json(response);
};

/**
 * Send a forbidden response (403 Forbidden)
 */
export const sendForbidden = (res: Response, message = 'Forbidden'): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(403).json(response);
};

/**
 * Send a validation error response (422 Unprocessable Entity)
 */
export const sendValidationError = (
  res: Response,
  errors: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    message: 'Validation failed',
    errors,
  };
  return res.status(422).json(response);
};

/**
 * Send a bad request response (400 Bad Request)
 */
export const sendBadRequest = (res: Response, message: string): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(400).json(response);
};

/**
 * Send an internal server error response (500 Internal Server Error)
 */
export const sendServerError = (res: Response, message = 'Internal server error'): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(500).json(response);
};
