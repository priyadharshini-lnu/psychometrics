# frozen_string_literal: true

require 'rails_helper'

RSpec::Matchers.define_negated_matcher :not_change, :change

describe Workshops::Booking::BookSlot do
  let!(:user) { create(:user) }
  let!(:workshop) { create(:workshop, total_seats: 10, booked_seats: 0) }
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }
  let!(:workshop_invited_subject) do
    create(:workshop_invited_subject, user: user, workshop_invite: workshop_invite, status: 'pending')
  end

  describe '#call' do
    context 'when seats are available' do
      it 'books the slot' do
        expect do
          described_class.call(
            {
              workshop_id: workshop.id,
              id: workshop_invite.id.to_s,
              workshop_subject_details: {
                preferred_language: 'en',
                neurodivergent: true,
                neurodivergent_comment: 'test'
              }
            },
            user
          )
        end.to change { workshop_invited_subject.reload.status }.from('pending').to('accepted').
          and change { workshop.reload.booked_seats }.from(0).to(1).
          and change { WorkshopSubject.count }.by(1).
          and change { WorkshopInviteLog.count }.by(1).
          and change { WorkshopInviteLog.last&.action }.from(nil).to('accepted').
          and change { WorkshopSubject.last&.preferred_language }.from(nil).to('en').
          and change { WorkshopSubject.last&.neurodivergent }.from(nil).to(true).
          and change { WorkshopSubject.last&.neurodivergent_comments }.from(nil).to('test')
      end
    end
  end
end
