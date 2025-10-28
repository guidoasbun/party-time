"""
Celery application configuration for Party-Time.

FR-7: The system shall send email invitations
5.2.1: Email Service Setup

This module initializes and configures Celery for asynchronous task processing,
including email sending, notifications, and other background tasks.
"""

from celery import Celery
from app.core.config import get_settings

settings = get_settings()

# Determine broker and backend URLs
broker_url = settings.CELERY_BROKER_URL or settings.REDIS_URL
result_backend = settings.CELERY_RESULT_BACKEND or settings.REDIS_URL

# Initialize Celery app
celery_app = Celery(
    "party_time",
    broker=broker_url,
    backend=result_backend,
    include=['app.tasks.email_tasks']
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,

    # Task execution
    task_acks_late=True,  # Acknowledge tasks after completion
    task_reject_on_worker_lost=True,  # Reject tasks if worker is lost
    worker_prefetch_multiplier=1,  # Process one task at a time

    # Result backend
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,  # Persist results

    # Retry configuration
    task_default_retry_delay=settings.EMAIL_RETRY_DELAY,  # 5 minutes
    task_max_retries=settings.EMAIL_MAX_RETRIES,  # 3 retries

    # Worker configuration
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks
    worker_disable_rate_limits=False,

    # Task routing (can be expanded later for different queues)
    task_routes={
        'app.tasks.email_tasks.*': {'queue': 'emails'},
    },

    # Beat schedule (for periodic tasks - can be added later)
    beat_schedule={},
)

# Optional: Task annotations for specific task configurations
celery_app.conf.task_annotations = {
    'app.tasks.email_tasks.send_email_async': {
        'rate_limit': '10/m',  # 10 emails per minute
        'time_limit': 300,  # 5 minutes timeout
        'soft_time_limit': 240,  # 4 minutes soft timeout
    },
    'app.tasks.email_tasks.send_bulk_emails': {
        'rate_limit': '5/m',  # 5 bulk operations per minute
        'time_limit': 600,  # 10 minutes timeout
        'soft_time_limit': 540,  # 9 minutes soft timeout
    },
}
