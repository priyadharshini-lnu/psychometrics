# frozen_string_literal: true

require 'rails_helper'

RSpec::Matchers.define_negated_matcher :not_change, :change

describe Workshops::Booking::RescheduleSlot do
  let!(:user) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 1, reschedule_lead_time: 3600) }
  let!(:new_workshop) { create(:workshop, total_seats: 10, booked_seats: 1) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:workshop_invited_subject) do
    create(:workshop_invited_subject, user: user, workshop_invite: workshop_invite, status: 'accepted')
  end
  let!(:workshop_subject) do
    create(:workshop_subject, workshop: workshop, user: user, scheduling_status: :cancelled)
  end

  describe '#call' do
    context 'when rescheduling a slot' do
      it 'reschedules the slot' do
        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id,
              new_workshop_booking_id: new_workshop.id,
              status: 'rescheduled',
              workshop_subject_details: {
                preferred_language: 'en',
                neurodivergent: true,
                neurodivergent_comments: 'test'
              }
            },
            user
          )
        end.to change { workshop.reload.booked_seats }.from(1).to(0).
          and change { WorkshopSubject.count }.by(1).
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('rescheduled').
          and change { workshop_invited_subject.reload.status }.from('accepted').to('rescheduled')
      end

      it 'reschedules for the same workshop again if user wishes to' do
        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id,
              new_workshop_booking_id: workshop.id,
              status: 'rescheduled',
              workshop_subject_details: {
                preferred_language: 'en',
                neurodivergent: true,
                neurodivergent_comments: 'test'
              }
            },
            user
          )
        end.to not_change { workshop.reload.booked_seats }.
          and change { WorkshopSubject.count }.by(0).
          and change { WorkshopInviteLog.count }.by(1).
          and broadcast(:ok)
        expect(workshop_invited_subject.reload.status).to eq('rescheduled')
        expect(workshop_subject.reload.workshop_id).to eq(workshop.id)
        expect(workshop_subject.reload.preferred_language).to eq('en')
        expect(workshop_subject.reload.neurodivergent).to eq(true)
        expect(workshop_subject.reload.neurodivergent_comments).to eq('test')
        expect(workshop_subject.reload.scheduling_status).to eq('scheduled')
      end

      it 'allows requseted_reschedule even if reschedule_lead_time passed' do
        frozen_time = workshop.start_time - workshop.reschedule_lead_time.hours + 1.hour

        allow(Time).to receive(:now).and_return(frozen_time)

        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id,
              new_workshop_booking_id: new_workshop.id,
              status: 'requested_rescheduling',
              reason: 'test'
            },
            user
          )
        end.to not_change { workshop.reload.booked_seats }.
          and change { workshop_invited_subject.reload.status }.from('accepted').to('requested_rescheduling').
          and change { workshop_invited_subject.reload.reason }.from(nil).to('test').
          and not_change { workshop_subject.reload.workshop_id }.
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('requested_rescheduling')
      end
    end
  end
end
