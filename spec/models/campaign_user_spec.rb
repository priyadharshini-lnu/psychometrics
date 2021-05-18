# frozen_string_literal: true

require 'rails_helper'

describe CampaignUser, type: :model do
  describe 'real_expiry_date' do
    context 'fixed_time campaign with campaign end date' do
      it 'returns smallest expiry time between campaign end_time and campaign_user expiry_date' do
        smallest_time = 30.minutes.from_now
        largest_time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: smallest_time,
          campaign: build(
            :campaign, end_date: largest_time, campaign_options: build(:campaign_option, fixed_time: true)
          )
        )
        expect(campaign_user.real_expiry_date).to eq(smallest_time)

        campaign_user = build(
          :campaign_user,
          expiry_date: largest_time,
          campaign: build(
            :campaign, end_date: smallest_time, campaign_options: build(:campaign_option, fixed_time: true)
          )
        )
        expect(campaign_user.real_expiry_date).to eq(smallest_time)
      end
    end

    context 'fixed_time without campaign end_date' do
      it 'returns campaign_user expiry_date' do
        time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: time,
          campaign: build(:campaign, end_date: nil, campaign_options: build(:campaign_option, fixed_time: true))
        )

        expect(campaign_user.real_expiry_date).to eq(time)
      end
    end

    context 'campaign end_time and not a fixed_time campaign' do
      it 'returns campaign end_time' do
        time = 60.minutes.from_now
        campaign_user = build(
          :campaign_user,
          campaign: build(:campaign, end_date: time, campaign_options: build(:campaign_option, fixed_time: false))
        )

        expect(campaign_user.real_expiry_date).to eq(time)
      end

      it 'returns campaign end_date even if campaign_users expiry_date is set' do
        end_date = 60.minutes.from_now
        expiry_date = 30.minutes.from_now
        campaign_user = build(
          :campaign_user,
          expiry_date: expiry_date,
          campaign: build(:campaign, end_date: end_date, campaign_options: build(:campaign_option, fixed_time: false))
        )

        expect(campaign_user.real_expiry_date).to eq(end_date)
      end
    end
  end
end
