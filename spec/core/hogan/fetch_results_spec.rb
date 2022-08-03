# frozen_string_literal: true

require 'rails_helper'

describe Hogan::FetchResults do
  let(:assessment) { create(:assessment, :hogan, hogan_assessment_setting: build(:hogan_assessment_setting)) }
  let(:report) { create(:report, assessments: [assessment], hogan_report_setting: build(:hogan_report_setting)) }
  let(:user) { create(:user, hogan_credential: build(:hogan_credential)) }
  let(:project) { create(:project) }
  let(:users_result) { create(:users_result) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, users_result: users_result)
  end
  let!(:user_report) do
    create(:user_report,
           campaign_id: user_assessment.campaign_id,
            report_id: report.id,
             user_id: users_result.evaluator_id)
  end

  it 'when credentials are empty we create them' do
    allow(users_result).to receive(:external_user_reports).with(:hogan).and_return([user_report])
    expect(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).
      and_return({ 'reportDetails' => [{ id: 1 }] })
    expect(Services::Hogan::Api::Json::ParticipantReport).to receive(:call!).and_return(double('res', report: 'base64'))
    expect(Services::Hogan::Api::Json::ParticipantScore).to receive(:call!).and_return('results')
    Hogan::FetchResults.call!(users_result, user.hogan_credential, project)

    expect(users_result.external_results).to eq 'results'
    expect(user_report.reload.status).to eq 'prepared'
  end
end
