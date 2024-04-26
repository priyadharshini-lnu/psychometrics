# frozen_string_literal: true

require 'rails_helper'

describe Users::CreateAnonymCampaignUser do
  describe 'Creating user' do
    let(:campaign_assessment) { create(:campaign_assessment) }

    it 'succeeds' do
      allow_any_instance_of(SecuritySetting).to receive(:enforce_strong_password?).and_return(true)

      user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)
      expect(user.persisted?).to be_truthy
      expect(user.is_anonym?).to be_truthy
    end
  end
end
