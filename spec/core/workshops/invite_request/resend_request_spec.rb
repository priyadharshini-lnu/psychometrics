# frozen_string_literal: true

require 'rails_helper'

describe Workshops::InviteRequest::ResendRequest do
  let!(:user1) { create(:user) }
  let!(:user2) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 1, cancellation_lead_time: 3600) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:subject1) { create(:workshop_invited_subject, user: user1, workshop_invite: workshop_invite) }
  let!(:subject2) { create(:workshop_invited_subject, user: user2, workshop_invite: workshop_invite) }

  describe '#call' do
    it 'calls WorkshopInvites::SendEmail for each subject and returns results' do
      expect(WorkshopInvites::SendEmail).
        to receive(:call!).
        with(subject1, resent: true).
        and_return(true)

      expect(WorkshopInvites::SendEmail).
        to receive(:call!).
        with(subject2, resent: true).
        and_return(true)

      result = described_class.call!([subject1.id, subject2.id])

      expect(result).to match_array([
        { id: subject1.id, status: 'resent' },
        { id: subject2.id, status: 'resent' }
      ])
    end

    it 'returns error status if sending fails' do
      allow(WorkshopInvites::SendEmail).
        to receive(:call!).
        with(subject1, resent: true).
        and_raise(StandardError, 'fail')

      expect(WorkshopInvites::SendEmail).
        to receive(:call!).
        with(subject2, resent: true).
        and_return(true)

      result = described_class.call!([subject1.id, subject2.id])

      expect(result).to include(
        { id: subject1.id, status: 'error', error: 'fail' },
        { id: subject2.id, status: 'resent' }
      )
    end
  end
end
