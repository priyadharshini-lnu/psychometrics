# frozen_string_literal: true

require 'rails_helper'

describe Workshops::InviteRequest::RescheduleRequest do
  let!(:user) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 1, cancellation_lead_time: 3600) }
  let!(:reschedule_workshop) { create(:workshop, total_seats: 10, booked_seats: 0) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:workshop_invited_subject) do
    create(
      :workshop_invited_subject,
      user: user,
      workshop_invite: workshop_invite,
      workshop_subject: workshop_subject,
      status: 'requested_rescheduling',
      reason: 'test',
      reschedule_workshop_id: reschedule_workshop.id
    )
  end
  let!(:workshop_subject) do
    create(:workshop_subject, workshop: workshop, user: user)
  end

  describe '#call' do
    context 'when rescheduling an invited request' do
      it 'moves invited subject to rescheduled workshop' do
        expect do
          described_class.call(
            { id: workshop_invited_subject.id },
            user
          )
        end.to change { workshop.reload.booked_seats }.from(1).to(0).
          and change { WorkshopSubject.count }.by(1).
          and change { reschedule_workshop.reload.booked_seats }.from(0).to(1).
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('rescheduled').
          and change { workshop_invited_subject.reload.status }.from('requested_rescheduling').to('rescheduled')
      end

      it 'updates existing workshop subject if exists' do
        workshop_subject = create(:workshop_subject, workshop: reschedule_workshop, user: user,
          scheduling_status: 'cancelled')

        expect do
          described_class.call(
            { id: workshop_invited_subject.id },
            user
          )
        end.to change { WorkshopSubject.count }.by(0).
          and change { workshop_subject.reload.scheduling_status }.from('cancelled').to('scheduled')
      end
    end
  end
end
