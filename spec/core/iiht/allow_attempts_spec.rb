# frozen_string_literal: true

require 'rails_helper'

describe Iiht::AllowAttempts do
  include Rails.application.routes.url_helpers

  let(:iiht_user_assessment) { create(:iiht_user_assessment, schedule_id: '123') }
  let(:user_assessment) { iiht_user_assessment.user_assessment }
  let(:user) { user_assessment.user }
  let(:config) { { 'tenant_id' => '123' } }
  let(:schedule_link) { Faker::Internet.url }
  let(:expected_response) do
    { 'result' => { 'isSuccess' => true, 'scheduleLink' => schedule_link, 'scheduleId' => schedule_id } }
  end

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
  end

  it "doesn't call Iiht::UpdateAttempts if number of allowed attempts is not surpassed" do
    allow(Iiht::GetScores).to receive(:call!).and_return({
      'schedules' => [{
        'scheduleId' => iiht_user_assessment.schedule_id,
        'availedAttempts' => 2,
        'maxAttempts' => 3
      }]
    })
    expect(Iiht::UpdateAttempts).to_not receive(:call!)

    described_class.call!(user_assessment)
  end

  it 'calls Iiht::UpdateAttempts if number of allowed attempts is surpassed' do
    allow(Iiht::GetScores).to receive(:call!).and_return({
      'schedules' => [{
        'scheduleId' => iiht_user_assessment.schedule_id,
        'availedAttempts' => 3,
        'maxAttempts' => 3
      }]
    })
    expect(Iiht::UpdateAttempts).to receive(:call!).with(user_assessment)

    described_class.call!(user_assessment)
  end
end
