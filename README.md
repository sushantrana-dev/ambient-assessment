# Ambient Assessment - Hierarchical Space Navigator

A full-stack application for managing camera streams in hierarchical spaces, featuring a React TypeScript frontend and FastAPI backend.

## Project Overview

This project consists of two main components:
- **Frontend**: React TypeScript web application for space and camera stream management
- **Backend**: FastAPI server providing RESTful API endpoints

## Frontend Features

- **Site Selection**: Choose between different sites (San Jose, Toronto, Mars)
- **Hierarchical Space Navigation**: Tree structure displaying spaces and sub-spaces
- **Camera Stream Management**: Select/deselect individual camera streams
- **Bulk Selection**: Select all cameras in a space with three-state checkboxes
- **Selected Cameras List**: View and remove selected cameras with hover interactions
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works on desktop and mobile devices

## Backend Features

- **RESTful API**: FastAPI-based server with comprehensive endpoints
- **Space Management**: CRUD operations for spaces and streams
- **Error Handling**: Proper HTTP status codes and error messages
- **CORS Support**: Cross-origin resource sharing enabled
- **Data Validation**: Pydantic models for request/response validation

## Server Optimization Plan

If I had more time, here are the high-level optimizations I would implement for the server:

### 1. Database Integration
**Current State**: Using in-memory JSON data storage
**Optimization**: Replace with a proper database (PostgreSQL or SQLite)
- **Why**: Better data persistence, concurrent access, and scalability
- **Benefits**: Data survives server restarts, supports multiple users, better performance for large datasets
- **Implementation**: Use SQLAlchemy ORM with FastAPI for type-safe database operations

### 2. Caching Strategy
**Current State**: No caching implemented
**Optimization**: Implement multi-layer caching system
- **Redis Cache**: For frequently accessed data like site lists and space hierarchies
- **In-Memory Cache**: For session-specific data and temporary lookups
- **Benefits**: Faster response times, reduced database load, better user experience
- **Implementation**: Use Redis for distributed caching, functools.lru_cache for local caching

### 3. Authentication & Authorization
**Current State**: No authentication system
**Optimization**: Add user management and access control
- **JWT Tokens**: Secure API access with token-based authentication
- **Role-Based Access**: Different permissions for different user types
- **Benefits**: Secure API endpoints, user-specific data, audit trails
- **Implementation**: Use FastAPI security with JWT tokens and role-based middleware

### 4. API Rate Limiting
**Current State**: No rate limiting
**Optimization**: Implement request throttling
- **Rate Limiting**: Prevent API abuse and ensure fair usage
- **Per-User Limits**: Different limits for different user types
- **Benefits**: Prevents server overload, protects against abuse, ensures service quality
- **Implementation**: Use FastAPI middleware with Redis for distributed rate limiting

### 6. Logging & Monitoring
**Current State**: No logging system
**Optimization**: Comprehensive logging and monitoring
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Request Tracking**: Track API calls, response times, and errors
- **Performance Monitoring**: Monitor server performance and bottlenecks
- **Benefits**: Better debugging, performance insights, operational visibility
- **Implementation**: Use Python logging with structured format and monitoring tools
