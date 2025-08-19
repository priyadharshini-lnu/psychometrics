# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Licenses::AIAssistantUse do
  let(:campaign) { create(:campaign) }
  let(:client) { campaign.client }
  let(:user) { create(:user) }

  let(:assistant) { create(:assistant, owner: client) }
  let(:assistant_chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }

  context 'when enough ai_assistant licenses are available' do
    it 'creates a license usage and returns it' do
      license = create(:ai_assistant_license, client: client,
                                             start_date: 2.days.ago,
                                             end_date: 2.days.since,
                                             number: 2)

      result = described_class.call!(campaign, user, assistant_chat)

      expect(result.license_id).to eq(license.id)
      expect(result.consumer).to eq(assistant_chat)
      expect(result.user).to eq(user)
    end
  end

  context 'when no licenses are available' do
    it 'raises Licenses::NotEnoughError' do
      expect do
        described_class.call(campaign, user, assistant_chat)
      end.to raise_error(Licenses::NotEnoughError)
    end
  end
end
