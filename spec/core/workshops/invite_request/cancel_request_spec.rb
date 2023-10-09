# frozen_string_literal: true

require 'rails_helper'

describe Workshops::InviteRequest::CancelRequest do
  let!(:user) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 1, cancellation_lead_time: 3600) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:workshop_invited_subject) do
    create(
      :workshop_invited_subject,
      user: user,
      workshop_invite: workshop_invite,
      workshop_subject: workshop_subject,
      status: 'requested_cancellation',
      reason: 'test'
    )
  end
  let!(:workshop_subject) do
    create(:workshop_subject, workshop: workshop, user: user)
  end

  describe '#call' do
    context 'when cancelling an invited request' do
      it 'removes the invite subject' do
        expect do
          described_class.call(
            { id: workshop_invited_subject.id },
            user
          )
        end.to change { workshop.reload.booked_seats }.from(1).to(0).
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopSubject.count }.by(0).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('cancelled').
          and change { workshop_invited_subject.reload.status }.from('requested_cancellation').to('cancelled')
      end
    end
  end
end
