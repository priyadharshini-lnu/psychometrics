# frozen_string_literal: true

require 'rails_helper'

describe Hogan::AddReports do
  let(:assessment) { create(:assessment, hogan_assessment_setting: build(:hogan_assessment_setting)) }
  let(:report) { build(:report, assessments: [assessment], hogan_report_setting: build(:hogan_report_setting)) }
  let(:user) { create(:user) }
  let(:user_report) { create(:user_report, report: report) }
  it 'when credentials are empty we create them' do
    expect(Services::Hogan::API::GroupDetails).to receive(:call).and_return(double('res', success?: true))
    expect(Services::Hogan::API::AddParticipantToGroup).to receive(:call!).and_return(double('res', participant_id: 1))
    expect(Services::Hogan::API::AddParticipantAssessment).to receive(:call!)
    expect(Services::Hogan::API::AddParticipantReport).to receive(:call!)
    Hogan::AddReports.call!(
      group: 'any',
      credentials: nil,
      user_id: user.id,
      assessment: assessment,
      reports: [user_report]
    )

    expect(user.hogan_credential).to be_truthy
  end
end
