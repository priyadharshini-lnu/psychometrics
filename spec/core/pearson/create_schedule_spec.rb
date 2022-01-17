# frozen_string_literal: true

require 'rails_helper'

describe Pearson::CreateSchedule do
  it 'creates schedule in pearson and updates user_assessment with url and schdule_id' do
    config = Rails.application.secrets.pearson
    allow(Pearson::GetAuthToken).to receive(:call!)
    pearson_user_assessment = create(:pearson_user_assessment, schedule_id: nil, url: nil)
    url = Faker::Internet.url
    schedule_id = Faker::Lorem.characters(5)
    stub_request(:post, "#{config[:base_api_url]}/v1/schedules").
      to_return({ body: { 'data' => { 'scheduleId' => schedule_id, 'urls' => [{ 'url' => url }] } }.to_json })
    described_class.call!(pearson_user_assessment.user_assessment)

    expect(pearson_user_assessment.url).to eq(url)
    expect(pearson_user_assessment.schedule_id).to eq(schedule_id)
  end
end
