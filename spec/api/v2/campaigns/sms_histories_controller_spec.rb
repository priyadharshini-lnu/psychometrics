# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::SmsHistoriesController, swagger_doc: 'v2/swagger.json', type: :request do
  let(:sid) { 'sid123' }
  let(:campaign) { create(:campaign) }
  let(:sms_record1) { create(:sms_record, campaign: campaign) }
  let(:sms_record2) { create(:sms_record, campaign: campaign) }

  let!(:sms_history1) { create(:sms_history, twilio_sid: sid, sms_record: sms_record1) }
  let!(:sms_history2) { create(:sms_history, twilio_sid: sid, sms_record: sms_record2) }

  let!(:campaign_admin) { create(:campaign_admin, campaign: campaign) }

  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(campaign_admin) }

  path '/campaigns/{campaign_id}/sms_histories' do
    get 'Get SMS histories' do
      operationId 'GetSMSHistories'
      description 'Fetch SMS histories'
      tags 'SMS History'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :'filters[filterable_fields]', in: :query, required: false

      response '200', 'A list of SMS histories' do
        let!(:campaign_id) { campaign.id }

        run_test! do |response|
          parsed_response = JSON.parse(response.body)

          expect(parsed_response['meta']['record_count']).to eq(2)
          expect(parsed_response['data'].length).to eq(2)
          parsed_response['data'].each_with_index do |data, index|
            sms_history = [sms_history1, sms_history2][index]
            check_sms_history_values(data, sms_history)
          end
        end
      end

      response '200', 'A list of SMS histories filtered by first name' do
        let!(:campaign_id) { campaign.id }
        let!('filters[filterable_fields]') { 'Jan' }

        let!(:sms_history1) { create(:sms_history, first_name: 'Jane', twilio_sid: sid, sms_record: sms_record1) }
        let!(:sms_history2) { create(:sms_history, first_name: 'Dane', twilio_sid: sid, sms_record: sms_record2) }

        run_test! do |response|
          parsed_response = JSON.parse(response.body)

          expect(parsed_response['meta']['record_count']).to eq(1)
          expect(parsed_response['data'].length).to eq(1)
          parsed_response['data'].each do |data|
            check_sms_history_values(data, sms_history1)
          end
        end
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
      'status' => sms_history.status
    }
    expect(data['attributes']).to eq(expected_attributes)
  end
end
