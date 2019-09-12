# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Licenses::CreateThreesixtySubject do
  let(:campaign) { create(:campaign, name: 'first') }
  let(:user) { create(:user, first_name: 'Vasily', last_name: 'Pupkin', email: 'pup@gmail.com') }

  describe '.use' do
    context 'are not enough licences' do
      it 'builds a license_usage' do
        expect { described_class.use(user: user, campaign: campaign) }.to raise_error(Errors::LicenseError)
      end
    end
    context 'are enough licences' do
      let!(:license) do
        create(:license,
               type: :threesixty,
                     client: campaign.client, start_date: 1.day.ago, end_date: 100.years.since)
      end
      it 'builds a license_usage' do
        described_class.use(user: user, campaign: campaign)
        usage = LicenseUsage.last
        expect(usage.user_id).to eq(user.id)
        expect(usage.license_id).to eq(license.id)
        expect(usage.client_id).to eq(campaign.client.id)
        expect(usage.campaign_id).to eq(campaign.id)
        expect(usage.extras).to eq(
          'subject_name' => 'Vasily Pupkin',
          'subject_email' => 'pup@gmail.com', 'campaign_name' => 'first'
        )
      end
    end
  end
end
