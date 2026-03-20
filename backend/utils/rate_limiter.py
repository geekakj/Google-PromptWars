import time
from fastapi import Request, HTTPException
from collections import defaultdict
from typing import Dict

class RateLimiter:
    def __init__(self, requests_per_minute: int = 20):
        self.requests_per_minute = requests_per_minute
        self.visits: Dict[str, list] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        # Clean up old visits
        self.visits[client_ip] = [v for v in self.visits[client_ip] if v > now - 60]
        
        if len(self.visits[client_ip]) >= self.requests_per_minute:
            return False
            
        self.visits[client_ip].append(now)
        return True

limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if not limiter.is_allowed(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
    response = await call_next(request)
    return response
