# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::SmsHistoriesController, type: :request do
  let(:sid) { 'sid123' }
  let(:campaign) { create(:campaign) }
  let(:sms_record1) { create(:sms_record, campaign: campaign) }
  let(:sms_record2) { create(:sms_record, campaign: campaign) }

  let!(:sms_history1) { create(:sms_history, twilio_sid: sid, sms_record: sms_record1) }
  let!(:sms_history2) { create(:sms_history, twilio_sid: sid, sms_record: sms_record2) }

  let!(:superadmin) { create(:superadmin) }
  let!(:campaign_admin) { create(:campaign_admin, campaign: campaign) }

  before { sign_in(campaign_admin) }

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/sms_histories' do
    it 'returns a list of SMS histories' do
      get "/api/v2/administration/campaigns/#{campaign.id}/sms_histories"

      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['meta']['record_count']).to eq(2)
      expect(parsed_response['data'].length).to eq(2)
      parsed_response['data'].each_with_index do |data, index|
        sms_history = [sms_history1, sms_history2][index]
        check_sms_history_values(data, sms_history)
      end
    end

    it 'returns SMS histories filtered by first name' do
      sms_history1.update!(first_name: 'Jane')
      sms_history2.update!(first_name: 'Dane')

      get "/api/v2/administration/campaigns/#{campaign.id}/sms_histories",
          params: { 'filters[filterable_fields]' => 'Jan' }

      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['meta']['record_count']).to eq(1)
      expect(parsed_response['data'].length).to eq(1)
      parsed_response['data'].each do |data|
        check_sms_history_values(data, sms_history1)
      end
    end
  end

  private

  def check_sms_history_values(data, sms_history)
    expected_attributes = {
      'mobile_no' => sms_history.mobile_no,
      'first_name' => sms_history.first_name,
      'last_name' => sms_history.last_name,
      'segment_length' => sms_history.segment_length,
      'price' => sms_history.price,
      'created_at' => I18n.l(sms_history.created_at, format: :short),
      'status' => sms_history.status,
      'tenant_id' => sms_history.tenant_id
    }
    expect(data['attributes']).to eq(expected_attributes)
  end
end
