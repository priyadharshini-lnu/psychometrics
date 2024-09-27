# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopInvite, type: :model do
  let(:workshop) do
    create(:workshop, booked_seats: 0, total_seats: 10, start_time: 1.day.from_now, scheduling_lead_time: 1.hour)
  end
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }

  describe '#available_workshops_date_and_id' do
    it 'returns available workshops date and id' do
      expect(workshop_invite.available_workshops_date_and_id).to eq([
        { id: workshop.id, date: workshop.start_time.iso8601 }
      ])
    end

    it 'does not return workshops that are fully booked' do
      workshop.update(booked_seats: 10)
      expect(workshop_invite.available_workshops_date_and_id).to eq([])
    end

    it 'does not return workshops that have passed the scheduling lead time' do
      frozen_time = workshop.start_time + 23.hours
      allow(Time).to receive(:current).and_return(frozen_time)
      workshop.update(scheduling_lead_time: 1.hour)
      expect(workshop_invite.available_workshops_date_and_id).to eq([])
    end
  end
end
