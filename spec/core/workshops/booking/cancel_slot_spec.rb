# frozen_string_literal: true

require 'rails_helper'

RSpec::Matchers.define_negated_matcher :not_change, :change

describe Workshops::Booking::CancelSlot do
  let!(:user) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 1, cancellation_lead_time: 3600) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:workshop_invited_subject) do
    create(:workshop_invited_subject, user: user, workshop_invite: workshop_invite, status: 'accepted')
  end
  let!(:workshop_subject) do
    create(:workshop_subject, workshop: workshop, user: user)
  end

  describe '#call' do
    context 'when cancelling a slot' do
      it 'cancels the slot' do
        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id,
              status: 'cancelled',
              reason: 'test'
            },
            user
          )
        end.to change { workshop.reload.booked_seats }.from(1).to(0).
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopSubject.count }.by(0).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('cancelled').
          and change { workshop_invited_subject.reload.status }.from('accepted').to('cancelled').
          and change { workshop_invited_subject.reload.reason }.from(nil).to('test')
      end

      it 'allows request_cancellation after deadline' do
        frozen_time = workshop.start_time - workshop.cancellation_lead_time.hours + 1.hour

        allow(Time).to receive(:now).and_return(frozen_time)

        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id,
              status: 'requested_cancellation',
              reason: 'test'
            },
            user
          )
        end.to not_change { workshop.reload.booked_seats }.
          and change { workshop_invited_subject.reload.status }.from('accepted').to('requested_cancellation').
          and change { workshop_invited_subject.reload.reason }.from(nil).to('test').
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopSubject.count }.by(0).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('requested_cancellation').
          and broadcast(:ok)
      end
    end
  end
end
