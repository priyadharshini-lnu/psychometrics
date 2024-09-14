# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::ContinueCampaign, type: :model do
  let(:campaign_user) { create(:campaign_user) }
  let(:service) { described_class.new(campaign_user) }
  let(:attributes) { %w[started_at status completed_at expiry_date additional_time] }

  describe '#call' do
    context 'when campaign can continue' do
      before do
        allow(campaign_user).to receive(:interrupted_campaign?).and_return(true)
      end

      it 'updates the campaign_user attributes' do
        expect { service.call }.to(change { campaign_user.reload.attributes.slice(*attributes) })
      end
    end

    context 'when campaign cannot continue' do
      it 'does not update the campaign_user attributes for interrupted_campaign' do
        allow(campaign_user).to receive(:interrupted_campaign?).and_return(false)

        expect { service.call }.not_to(change { campaign_user.reload.attributes.slice(*attributes) })
      end

      it 'does not update the campaign_user attributes for campaign_user has_no_expiry_date_for_fixed_time_campaign' do
        campaign_user.expiry_date = nil

        expect { service.call }.not_to(change { campaign_user.reload.attributes.slice(*attributes) })
      end
    end
  end
end
