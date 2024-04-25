# frozen_string_literal: true

require 'rails_helper'

describe Iiht::AddAssessment do
  include Rails.application.routes.url_helpers

  let(:iiht_user_assessment) { create(:iiht_user_assessment, url: nil, email: 'some_email@cc.com') }
  let(:user_assessment) { iiht_user_assessment.user_assessment }
  let(:user) { user_assessment.subject }
  let(:config) { { 'tenant_id' => '123' } }
  let(:schedule_link) { Faker::Internet.url }
  let(:schedule_id) { 123 }
  let(:expected_response) do
    { 'result' => { 'isSuccess' => true, 'scheduleLink' => schedule_link, 'scheduleId' => schedule_id } }
  end

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    allow(Iiht::AllowAttempts).to receive(:call!)
  end

  it 'adds iiht assement and updates iiht_user_assessment with url' do
    stub_request(:post, "#{Settings.iiht.base_api_url}/GetAssessmentURLAsync").
      with(body: {
        tenantId: config['tenant_id'],
        assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
        userEmailAddress: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        resultShareMode: [3],
        scheduleConfig: base_schedule_config(user_assessment)
      }).
      to_return({ body: expected_response.to_json })

    described_class.call!(user_assessment)
    expect(iiht_user_assessment.url).to eq(schedule_link)
    expect(iiht_user_assessment.schedule_id).to eq(schedule_id)
  end

  it 'uses assessment schedule_config' do
    iiht_schedule_config = { 'duration' => 40, 'passPercentage' => 40 }
    allow(user_assessment.assessment).to receive(:external_settings).and_return(
      { schedule_config: iiht_schedule_config }
    )
    stub = stub_request(:post, "#{Settings.iiht.base_api_url}/GetAssessmentURLAsync").
           with(body: {
             tenantId: config['tenant_id'],
             assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
             userEmailAddress: user.email,
             firstName: user.first_name,
             lastName: user.last_name,
             resultShareMode: [3],
             scheduleConfig: base_schedule_config(user_assessment).merge(iiht_schedule_config)
           }).
           to_return({ body: expected_response.to_json })

    described_class.call!(user_assessment)
    expect(stub).to have_been_requested
  end

  it 'uses campaign_assessment exxternal_config' do
    external_config = { 'duration' => 40, 'passPercentage' => 40 }
    allow(user_assessment).to receive_message_chain(:campaign_assessment, :external_config).and_return(external_config)
    stub = stub_request(:post, "#{Settings.iiht.base_api_url}/GetAssessmentURLAsync").
           with(body: {
             tenantId: config['tenant_id'],
             assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
             userEmailAddress: user.email,
             firstName: user.first_name,
             lastName: user.last_name,
             resultShareMode: [3],
             scheduleConfig: base_schedule_config(user_assessment).merge(external_config)
           }).
           to_return({ body: expected_response.to_json })

    described_class.call!(user_assessment)
    expect(stub).to have_been_requested
  end

  it 'merges assessment schedule_config and campaign_assessment exxternal_config' do
    iiht_schedule_config = { 'duration' => 50, 'passPercentage' => 40 }
    allow(user_assessment.assessment).to receive(:external_settings).and_return(
      { schedule_config: iiht_schedule_config }
    )
    external_config = { 'duration' => 60, 'totalAttempts' => 3 }
    allow(user_assessment).to receive_message_chain(:campaign_assessment, :external_config).and_return(external_config)
    schedule_config = base_schedule_config(user_assessment).merge(
      'duration' => 60, 'passPercentage' => 40, 'totalAttempts' => 3
    )

    stub = stub_request(:post, "#{Settings.iiht.base_api_url}/GetAssessmentURLAsync").
           with(body: {
             tenantId: config['tenant_id'],
             assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
             userEmailAddress: user.email,
             firstName: user.first_name,
             lastName: user.last_name,
             resultShareMode: [3],
             scheduleConfig: schedule_config
           }).
           to_return({ body: expected_response.to_json })

    described_class.call!(user_assessment)
    expect(stub).to have_been_requested
  end

  private

  def base_schedule_config(user_assessment)
    described_class::DEFAULT_SCHEDULE_CONFIG.merge(
      externalScheduleConfigArgs: {
        campaign_id: user_assessment.campaign_id,
        assessment_id: user_assessment.assessment_id
      }.to_json,
      assessmentConfig: {
        enableShuffling: true,
        resultType: 4,
        redirectURL: iiht_assessment_redirect_url(
          host: Settings.domain,
          subdomain: user_assessment.project.subdomain,
          protocol: Settings.protocol,
          port: Settings.port,
          campaign_id: user_assessment.campaign_id,
          assessment_id: user_assessment.assessment_id
        )
      }
    )
  end
end
