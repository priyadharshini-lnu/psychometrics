# frozen_string_literal: true

require 'rails_helper'

describe Pearson::CreateSchedule do
  it 'creates schedule in pearson and updates user_assessment with url and schdule_id' do
    config = Settings.secrets.pearson
    pearson_user_assessment = create(:pearson_user_assessment, schedule_id: nil, url: nil)
    user_assessment = pearson_user_assessment.user_assessment
    allow(Pearson::GetAuthToken).to receive(:call!)
    allow(user_assessment).to receive(:pearson_assessment_language).and_return('en-Gb')
    allow_any_instance_of(Assessment).to receive(:external_assessment_id).and_return('123')
    url = Faker::Internet.url
    schedule_id = Faker::Lorem.characters(number: 5)
    stub_request(:post, "#{config[:base_api_url]}/v1/schedules").
      to_return({ body: { 'data' => { 'scheduleId' => schedule_id, 'urls' => [{ 'url' => url }] } }.to_json })
    described_class.call!(user_assessment)

    expect(pearson_user_assessment.url).to eq(url)
    expect(pearson_user_assessment.schedule_id).to eq(schedule_id)
  end
end
