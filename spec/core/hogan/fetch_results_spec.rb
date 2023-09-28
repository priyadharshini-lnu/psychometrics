# frozen_string_literal: true

require 'rails_helper'

describe Hogan::FetchResults do
  let(:assessment) { create(:hogan_assessment) }
  let(:report) { create(:report, :hogan, assessments: [assessment]) }
  let(:user) { create(:user, hogan_credential: build(:hogan_credential)) }
  let(:project) { create(:project) }
  let(:users_result) { create(:users_result, without_user_assessment: true) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, users_result: users_result)
  end
  let!(:user_report) do
    create(:user_report,
           campaign_id: user_assessment.campaign_id,
            report_id: report.id,
             user_id: users_result.evaluator_id, external_added: true)
  end

  it 'when credentials are empty we create them' do
    allow(users_result).to receive(:external_user_reports).with(:hogan).and_return([user_report])
    expect(Services::Hogan::Api::Json::ParticipantReport).to receive(:call!).and_return(double('res', report: 'base64'))
    expect(Services::Hogan::Api::Json::ParticipantScore).to receive(:call!).and_return('results')

    Hogan::FetchResults.call!(users_result, user.hogan_credential, project)

    expect(users_result.external_results).to eq 'results'
    expect(user_report.reload.status).to eq 'prepared'
  end

  it 'returns no_hogan_report if there is no hogan report for the user_result' do
    result = Hogan::FetchResults.call(users_result, user.hogan_credential, project)

    expect(result).to eq({ no_hogan_report: [] })
  end

  it 'calls Hogan::AddReports if external_added is false for any report' do
    report2 = create(:report, :hogan, assessments: [assessment])
    user_report2 = create(:user_report, external_added: false, report: report2)
    allow(users_result).to receive(:external_user_reports).with(:hogan).and_return([user_report, user_report2])
    expect(Services::Hogan::Api::Json::ParticipantReport).to receive(:call!).twice.
      and_return(double('res', report: 'base64'))
    expect(Services::Hogan::Api::Json::ParticipantScore).to receive(:call!).and_return('results')
    expect(Hogan::AddReports).to receive(:call!).with(
      group: project.hogan_group_name,
      credentials: user.hogan_credential,
      assessment: assessment,
      reports: [user_report2],
      user_id: user_assessment.evaluator_id
    )
    expect(UserReport).to receive(:exists?).and_return(false)
    Hogan::FetchResults.call(users_result, user.hogan_credential, project)
  end

  it "returns failed_to_add_report_in_hogan if report didn't got added to hogan" do
    report2 = create(:report, :hogan, assessments: [assessment])
    user_report2 = create(:user_report, external_added: false, report: report2)
    allow(users_result).to receive(:external_user_reports).with(:hogan).and_return([user_report, user_report2])
    expect(Hogan::AddReports).to receive(:call!).with(
      group: project.hogan_group_name,
      credentials: user.hogan_credential,
      assessment: assessment,
      reports: [user_report2],
      user_id: user_assessment.evaluator_id
    )
    expect(UserReport).to receive(:exists?).and_return(true)
    result = Hogan::FetchResults.call(users_result, user.hogan_credential, project)
    expect(result).to eq(failed_to_add_report_in_hogan: [])
  end
end
