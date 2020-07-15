# frozen_string_literal: true

require 'rails_helper'

describe Hogan::FetchResults do
  let(:assessment) { create(:assessment, hogan_assessment_setting: build(:hogan_assessment_setting)) }
  let(:report) { build(:report, assessments: [assessment], hogan_report_setting: build(:hogan_report_setting)) }
  let(:user) { create(:user, hogan_credential: build(:hogan_credential)) }
  let(:project) { create(:project) }
  let(:users_result) { create(:users_result) }
  let(:users_campaigns_assessment) do
    create(:users_campaigns_assessment, assessment: assessment, users_result: users_result)
  end
  let!(:campaigns_users_report) do
    create(:campaigns_users_report,
           campaign_id: users_campaigns_assessment.campaign_id,
            report_id: report.id,
             user_id: users_result.evaluator_id)
  end

  it 'when credentials are empty we create them' do
    expect(Services::Hogan::API::ParticipantReport).to receive(:call).and_return(double('res', report: 'base64'))
    expect(Services::Hogan::API::ParticipantScore).to receive(:call).and_return(double('res', response: 'results'))
    Hogan::FetchResults.call!(users_campaigns_assessment, report, user.hogan_credential, project)

    expect(users_result.external_results).to eq 'results'
    expect(campaigns_users_report.reload.status).to eq 'prepared'
  end
end
