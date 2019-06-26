# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::DashboardFields::Url do
  describe '.call' do
    let(:new_user) { create(:user, project: create(:project)) }
    let(:existing_user) { create(:user, project: create(:project), invitation_accepted_at: Time.now) }

    it 'new user' do
      response = described_class.call!(%w[ThreeSixty Url], {}, recipient: new_user, threesixty_campaign: 'ddd')
      expect(response).to match(%r{/users/invitation/accept})
    end

    it 'existing user' do
      response = described_class.call!(%w[ThreeSixty Url], {}, recipient: existing_user, threesixty_campaign: 'ddd')
      expect(URI.parse(response).path).to eq('/')
    end
  end
end
