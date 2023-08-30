# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Workshops::Update do
  let!(:workshop) { create(:workshop) }
  let!(:user1) { create(:user) }
  let!(:user2) { create(:user) }

  let(:valid_data) do
    {
      total_seats: 10,
      name: 'name',
      video_call_type: 'custom',
      meeting_link: 'https://www.abc.com',
      workshop_managers_ids: [
        user1.id.to_s
      ],
      workshop_assessors_ids: [
        user1.id.to_s
      ]
    }
  end

  describe '#call' do
    context 'with valid data' do
      it 'updates workshop with their resources' do
        expect { described_class.call!(workshop, valid_data) }.to change { workshop.workshop_managers.count }.by(1)
        expect(workshop.name).to eq('name')
        expect(workshop.meeting_link).to eq('https://www.abc.com')
      end
    end

    context 'with valid data to remove' do
      it 'updates workshop with their resources' do
        ua1 = workshop.workshop_assessors.create(user_id: user1.id)
        ua2 = workshop.workshop_assessors.create(user_id: user2.id)

        described_class.call!(workshop, valid_data)

        expect(workshop.workshop_assessors).to include(ua1)
        expect(workshop.workshop_assessors).not_to include(ua2)
        expect(workshop.name).to eq('name')
        expect(workshop.meeting_link).to eq('https://www.abc.com')
      end
    end
  end
end
