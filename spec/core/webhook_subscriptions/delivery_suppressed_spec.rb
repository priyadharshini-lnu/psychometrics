# frozen_string_literal: true

require 'rails_helper'

describe WebhookSubscriptions::DeliverySuppressed do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }

  def event_for(campaign_id: campaign.id, subject_id: user.id, event_name: 'campaign_user_status')
    {
      'event_name' => event_name,
      'event_id' => SecureRandom.uuid,
      'data' => {
        'campaign' => { 'id' => campaign_id },
        'subject' => { 'id' => subject_id }
      }
    }
  end

  describe '.suppressed?' do
    it 'is false for a normal user in a campaign with webhooks enabled' do
      expect(described_class.suppressed?(event_for)).to eq(false)
    end

    it 'is true when the campaign has webhooks disabled, regardless of user type' do
      campaign.campaign_options.update!(disable_webhooks: true)

      expect(described_class.suppressed?(event_for)).to eq(true)
    end

    it 'is true when the subject is a UAT user even if the campaign allows webhooks' do
      uat_user = create(:user, is_uat: true)

      expect(described_class.suppressed?(event_for(subject_id: uat_user.id))).to eq(true)
    end

    it 'is false when the event carries no campaign id and the subject is not UAT' do
      expect(described_class.suppressed?(event_for(campaign_id: nil))).to eq(false)
    end

    it 'fails closed (suppresses) when the campaign id cannot be resolved' do
      expect(described_class.suppressed?(event_for(campaign_id: -1))).to eq(true)
    end

    it 'is false for an empty event' do
      expect(described_class.suppressed?({})).to eq(false)
    end
  end
end
