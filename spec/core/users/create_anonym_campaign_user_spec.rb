# frozen_string_literal: true

require 'rails_helper'

describe Users::CreateAnonymCampaignUser do
  describe 'Creating user' do
    let(:campaign_assessment) { create(:campaign_assessment) }

    it 'succeeds' do
      user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)
      expect(user.persisted?).to be_truthy
      expect(user.is_anonym?).to be_truthy
    end
  end
end
