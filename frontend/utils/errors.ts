export class ServerDownError extends Error {
    constructor(message = 'The server is currently unavailable.') {
        super(message);
        this.name = 'ServerDownError';
    }
}

export class SessionExpiredError extends Error {
    constructor(message = 'Your session has expired. Please log in again.') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

export class SessionRefreshedError extends Error {
    constructor(message = 'Your session was refreshed. Please try your action again.') {
        super(message);
        this.name = 'SessionRefreshedError';
    }
}

export class ValidationError extends Error {
    public readonly status: number;
    public readonly body: { error_code?: string; detail?: string };

    constructor(status: number, body: any, message?: string) {
        super(message || body.detail || 'A validation error occurred.');
        this.name = 'ValidationError';
        this.status = status;
        this.body = body;
    }
}