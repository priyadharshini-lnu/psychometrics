# frozen_string_literal: true

require 'rails_helper'

describe Iiht::SaveScores do
  let(:iiht_user_assessment) { create(:iiht_user_assessment, url: nil, email: 'some_email@cc.com') }
  let(:user_assessment) { iiht_user_assessment.user_assessment }
  let(:user) { user_assessment.user }
  let(:config) { { 'tenant_id' => '123' } }
  let(:schedule_link) { Faker::Internet.url }
  let(:schedule_id) { 123 }
  let(:scores) do
    {
      'isSuccess' => true,
      'schedules' => [{
        'attempts' => [
          { 'number' => 1, 'score' => 1, 'actualEnd' => '2022-02-09 10:04:24' },
          { 'number' => 2, 'score' => 3, 'actualEnd' => '2022-03-14 12:04:34' }
        ]
      }]
    }
  end

  it 'saves actualEnd from last attempt as completed_at' do
    described_class.call!(user_assessment, scores)
    completed_at = scores.dig('schedules', 0, 'attempts', 1, 'actualEnd').in_time_zone('UTC')

    expect(user_assessment.completed_at).to eq(completed_at)
  end

  it 'saves last attempts from the passed scores' do
    described_class.call!(user_assessment, scores)

    expect(user_assessment.users_result.external_results).to eq(scores.dig('schedules', 0, 'attempts').last)
  end

  it 'get scores from api and saves it if score is not passed' do
    allow_any_instance_of(Iiht::GetScores).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetUserAssessmentResult").
      with(query: {
        assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
        userEmailAddress: iiht_user_assessment.email,
        tenantId: config['tenant_id']
      }).
      to_return({ body: { 'result' => scores }.to_json })
    described_class.call!(user_assessment)

    expect(user_assessment.users_result.external_results).to eq(scores.dig('schedules', 0, 'attempts').last)
  end
end
