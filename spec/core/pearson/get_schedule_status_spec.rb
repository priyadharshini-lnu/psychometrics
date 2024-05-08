# frozen_string_literal: true

require 'rails_helper'

describe Pearson::GetScheduleStatus do
  it 'gets schedule status' do
    config = Settings.secrets.pearson
    allow(Pearson::GetAuthToken).to receive(:call!)
    pearson_user_assessment = create(:pearson_user_assessment)
    stub_request(:get, "#{config[:base_api_url]}/v1/schedules/#{pearson_user_assessment.schedule_id}").
      to_return({ body: { 'data' => { 'status' => 'Completed' } }.to_json })
    response = described_class.call!(pearson_user_assessment.user_assessment)

    expect(response).to eq('Completed')
  end
end
