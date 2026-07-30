# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::WorkshopAssessorsCount do
  let(:user1) { create(:user) }
  let(:user2) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:other_campaign) { create(:campaign) }

  it 'returns workshop assessor counts for the specified campaign and users' do
    workshop1 = create(:workshop, campaign: campaign)
    workshop2 = create(:workshop, campaign: campaign)

    other_workshop = create(:workshop, campaign: other_campaign)

    create(:workshop_assessor, user: user1, workshop: workshop1)
    create(:workshop_assessor, user: user1, workshop: workshop2)

    create(:workshop_assessor, user: user2, workshop: workshop1)
    create(:workshop_assessor, user: user2, workshop: other_workshop)

    result = described_class.call!([user1.id, user2.id], campaign)

    expect(result).to eq(
      user1.id => 2,
      user2.id => 1
    )
  end
end
