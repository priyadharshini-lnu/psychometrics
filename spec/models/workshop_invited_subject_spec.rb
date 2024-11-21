# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopInvitedSubject, type: :model do
  describe 'Scope bookings' do
    it 'returns all workshop invited subject except pending' do
      create(:workshop_invited_subject, status: 'pending')
      create(:workshop_invited_subject, status: 'accepted')
      create(:workshop_invited_subject, status: 'cancelled')
      create(:workshop_invited_subject, status: 'requested_cancellation')
      create(:workshop_invited_subject, status: 'requested_rescheduling')
      create(:workshop_invited_subject, status: 'rescheduled')
      create(:workshop_invited_subject, status: 'requested_cancellation_rejected')
      create(:workshop_invited_subject, status: 'requested_rescheduling_rejected')

      expect(WorkshopInvitedSubject.bookings.pluck(:status)).
        to contain_exactly('accepted', 'cancelled', 'requested_cancellation',
                           'requested_rescheduling', 'rescheduled',
                           'requested_cancellation_rejected',
                           'requested_rescheduling_rejected')
    end
  end
end
