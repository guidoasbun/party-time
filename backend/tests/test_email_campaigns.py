"""
Tests for email campaign functionality.

FR-7: The system shall send email invitations
5.2.3: Email Campaign Interface
"""

import pytest
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock, patch, AsyncMock

from app.services.email_campaign_service import EmailCampaignService
from app.schemas.email import (
    BulkInvitationRequest,
    RecipientFilter
)
from app.models.guest import Guest, RsvpStatus


class TestEmailCampaignService:
    """Test EmailCampaignService functionality"""

    @pytest.fixture
    def campaign_service(self):
        """Create EmailCampaignService instance"""
        return EmailCampaignService()

    @pytest.fixture
    def mock_event(self):
        """Create mock event"""
        event = Mock()
        event.id = uuid4()
        event.name = "Test Event"
        event.start_date = datetime(2025, 12, 1, 18, 0)
        event.location = "Test Venue"
        event.type = "wedding"
        return event

    @pytest.fixture
    def mock_guests(self):
        """Create mock guests with various statuses"""
        guests = []

        # Guest 1: Not invited, pending RSVP
        guest1 = Mock(spec=Guest)
        guest1.id = uuid4()
        guest1.email = "guest1@example.com"
        guest1.first_name = "John"
        guest1.last_name = "Doe"
        guest1.rsvp_status = RsvpStatus.PENDING
        guest1.invitation_sent_at = None
        guest1.rsvp_token = "TOKEN123"
        guests.append(guest1)

        # Guest 2: Already invited, pending RSVP
        guest2 = Mock(spec=Guest)
        guest2.id = uuid4()
        guest2.email = "guest2@example.com"
        guest2.first_name = "Jane"
        guest2.last_name = "Smith"
        guest2.rsvp_status = RsvpStatus.PENDING
        guest2.invitation_sent_at = datetime(2025, 10, 15)
        guest2.rsvp_token = "TOKEN456"
        guests.append(guest2)

        # Guest 3: Attending
        guest3 = Mock(spec=Guest)
        guest3.id = uuid4()
        guest3.email = "guest3@example.com"
        guest3.first_name = "Bob"
        guest3.last_name = "Johnson"
        guest3.rsvp_status = RsvpStatus.ATTENDING
        guest3.invitation_sent_at = datetime(2025, 10, 10)
        guest3.rsvp_token = "TOKEN789"
        guests.append(guest3)

        return guests

    def test_default_subject_formatting(self, campaign_service):
        """Test default subject line formatting"""
        event_name = "My Wedding"
        expected = "You're Invited! My Wedding"
        actual = campaign_service.default_subject.format(event_name=event_name)
        assert actual == expected

    @pytest.mark.asyncio
    async def test_get_event_not_found(self, campaign_service):
        """Test _get_event when event doesn't exist"""
        mock_db = AsyncMock()
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        event = await campaign_service._get_event(uuid4(), mock_db)
        assert event is None

    @pytest.mark.asyncio
    async def test_select_recipients_all_filter(self, campaign_service, mock_guests):
        """Test recipient selection with ALL filter"""
        event_id = uuid4()
        mock_db = AsyncMock()
        mock_result = AsyncMock()
        mock_result.scalars.return_value.all.return_value = mock_guests
        mock_db.execute = AsyncMock(return_value=mock_result)

        recipients = await campaign_service._select_recipients(
            event_id=event_id,
            recipient_filter=RecipientFilter.ALL,
            guest_ids=None,
            exclude_already_invited=False,
            db=mock_db
        )

        assert len(recipients) == 3

    @pytest.mark.asyncio
    async def test_select_recipients_not_invited_filter(self, campaign_service, mock_guests):
        """Test recipient selection with NOT_INVITED filter"""
        event_id = uuid4()
        mock_db = AsyncMock()
        mock_result = AsyncMock()
        # Only return guest1 (not invited)
        mock_result.scalars.return_value.all.return_value = [mock_guests[0]]
        mock_db.execute = AsyncMock(return_value=mock_result)

        recipients = await campaign_service._select_recipients(
            event_id=event_id,
            recipient_filter=RecipientFilter.NOT_INVITED,
            guest_ids=None,
            exclude_already_invited=False,
            db=mock_db
        )

        assert len(recipients) == 1
        assert recipients[0].invitation_sent_at is None

    @pytest.mark.asyncio
    async def test_select_recipients_custom_filter_requires_ids(self, campaign_service):
        """Test that custom filter requires guest_ids"""
        event_id = uuid4()
        mock_db = AsyncMock()

        with pytest.raises(ValueError, match="guest_ids required"):
            await campaign_service._select_recipients(
                event_id=event_id,
                recipient_filter=RecipientFilter.CUSTOM,
                guest_ids=None,  # Missing guest_ids
                exclude_already_invited=False,
                db=mock_db
            )

    @pytest.mark.asyncio
    async def test_update_invitation_timestamps(self, campaign_service, mock_guests):
        """Test updating guest invitation timestamps"""
        guest_ids = [guest.id for guest in mock_guests]

        mock_db = AsyncMock()
        mock_result = AsyncMock()
        mock_result.scalars.return_value.all.return_value = mock_guests
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.commit = AsyncMock()

        await campaign_service._update_invitation_timestamps(guest_ids, mock_db)

        # Verify commit was called
        mock_db.commit.assert_called_once()

        # Verify all guests have invitation_sent_at set
        for guest in mock_guests:
            assert guest.invitation_sent_at is not None

    @pytest.mark.asyncio
    async def test_create_email_logs(self, campaign_service, mock_event, mock_guests):
        """Test creating email log entries"""
        subject = "Test Invitation"

        mock_db = AsyncMock()
        mock_db.add_all = Mock()
        mock_db.commit = AsyncMock()

        await campaign_service._create_email_logs(
            event_id=mock_event.id,
            guests=mock_guests,
            subject=subject,
            db=mock_db
        )

        # Verify add_all was called with email logs
        mock_db.add_all.assert_called_once()
        email_logs = mock_db.add_all.call_args[0][0]
        assert len(email_logs) == 3

        # Verify commit was called
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_campaign_stats_no_logs(self, campaign_service):
        """Test getting campaign stats when no logs exist"""
        event_id = uuid4()

        mock_db = AsyncMock()
        mock_result = AsyncMock()
        # Mock empty result
        mock_row = Mock()
        mock_row.total = 0
        mock_row.sent = 0
        mock_row.delivered = 0
        mock_row.failed = 0
        mock_row.bounced = 0
        mock_row.complained = 0
        mock_row.pending = 0
        mock_result.first.return_value = mock_row
        mock_db.execute = AsyncMock(return_value=mock_result)

        stats = await campaign_service.get_campaign_stats(event_id, mock_db)

        assert stats.total_invitations == 0
        assert stats.delivery_rate == 0.0

    @pytest.mark.asyncio
    async def test_get_campaign_stats_with_deliveries(self, campaign_service):
        """Test getting campaign stats with some deliveries"""
        event_id = uuid4()

        mock_db = AsyncMock()
        mock_result = AsyncMock()
        # Mock result with deliveries
        mock_row = Mock()
        mock_row.total = 10
        mock_row.sent = 9
        mock_row.delivered = 8
        mock_row.failed = 1
        mock_row.bounced = 0
        mock_row.complained = 0
        mock_row.pending = 1
        mock_result.first.return_value = mock_row
        mock_db.execute = AsyncMock(return_value=mock_result)

        stats = await campaign_service.get_campaign_stats(event_id, mock_db)

        assert stats.total_invitations == 10
        assert stats.delivered == 8
        assert stats.failed == 1
        assert stats.delivery_rate == 80.0  # 8/10 * 100


class TestBulkInvitationRequest:
    """Test BulkInvitationRequest schema validation"""

    def test_valid_request_all_filter(self):
        """Test valid request with ALL filter"""
        request = BulkInvitationRequest(
            recipient_filter=RecipientFilter.ALL
        )
        assert request.recipient_filter == RecipientFilter.ALL
        assert request.exclude_already_invited is True  # default
        assert request.test_mode is False  # default

    def test_valid_request_custom_filter_with_ids(self):
        """Test valid request with CUSTOM filter and guest IDs"""
        guest_ids = [uuid4(), uuid4()]
        request = BulkInvitationRequest(
            recipient_filter=RecipientFilter.CUSTOM,
            guest_ids=guest_ids
        )
        assert request.recipient_filter == RecipientFilter.CUSTOM
        assert request.guest_ids == guest_ids

    def test_subject_override(self):
        """Test subject override"""
        custom_subject = "Join us for our wedding!"
        request = BulkInvitationRequest(
            recipient_filter=RecipientFilter.ALL,
            subject_override=custom_subject
        )
        assert request.subject_override == custom_subject

    def test_test_mode(self):
        """Test test mode flag"""
        request = BulkInvitationRequest(
            recipient_filter=RecipientFilter.ALL,
            test_mode=True
        )
        assert request.test_mode is True

    def test_exclude_already_invited_false(self):
        """Test exclude_already_invited can be set to False"""
        request = BulkInvitationRequest(
            recipient_filter=RecipientFilter.ALL,
            exclude_already_invited=False
        )
        assert request.exclude_already_invited is False
