# frozen_string_literal: true

require 'rails_helper'

describe WorkshopInvites::ImportSubjects do
  let!(:campaign) { create(:campaign) }
  let!(:workshop_invite) { create(:workshop_invite) }

  describe '.call' do
    file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/subjects.csv'), 'text/csv')

    it 'import subjects from csv' do
      users, errors = described_class.call!(campaign.id, file)

      expect(users).to eq([])
      expect(errors).to eq([{ index: 0, email: 'user1@test.test' }, { index: 1, email: 'user2@test.test' }])
    end

    it 'with exists users' do
      user1 = create(:user, email: 'user1@test.test')
      user2 = create(:user, email: 'user2@test.test')
      create(:campaign_user, campaign: campaign, user: user1)
      create(:campaign_user, campaign: campaign, user: user2)

      users, errors = described_class.call!(campaign.id, file)
      expect(users.map(&:id)).to eq([user1.id, user2.id])
      expect(errors).to eq([])
    end

    it 'with unexists users' do
      user1 = create(:user, email: 'user1@test.test')
      create(:campaign_user, campaign: campaign, user: user1)

      users, errors = described_class.call!(campaign.id, file)

      expect(users.map(&:id)).to eq([user1.id])
      expect(errors).to eq([{ index: 1, email: 'user2@test.test' }])
    end
  end
end
