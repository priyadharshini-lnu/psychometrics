# frozen_string_literal: true

require 'rails_helper'

describe Hogan::SaveReportsAndScores do
  let(:assessment) { create(:hogan_assessment) }
  let(:report) { create(:report, :hogan, assessments: [assessment]) }
  let(:user) { create(:user, hogan_credential: build(:hogan_credential)) }
  let(:project) { create(:project) }
  let!(:users_result) { create(:users_result, without_user_assessment: true) }
  let(:campaign) { create(:campaign) }
  let!(:user_assessment) do
    create(
      :user_assessment, assessment: assessment, subject: user, campaign: campaign,
      users_result: users_result, status: :completed, score_calculated: true
    )
  end
  let!(:user_report) do
    create(
      :user_report,
      campaign_id: campaign.id,
      report_id: report.id,
      user_id: user.id,
      external_added: true
    )
  end

  it 'calls  Hogan::AddReports with user report that are not externally added' do
    expect(Services::Hogan::Api::Json::ParticipantReport).to receive(:call!)
    not_externally_added_report = create(
      :user_report, external_added: false, report: report, campaign: campaign, user: user
    )
    expect(Hogan::AddReports).to receive(:call!).and_return([not_externally_added_report])

    described_class.call([user_report, not_externally_added_report])
  end

  it "doesn't call Services::Hogan::Api::Json::ParticipantReport when pdf report is present but saves scores" do
    allow(user_report).to receive(:pdf?).and_return(true)
    expect(Services::Hogan::Api::Json::ParticipantReport).to_not receive(:call!)
    allow(Services::Hogan::Api::Json::ParticipantScore).to receive(:call!).and_return({ 'some_score' => 1 })

    described_class.call(user_report)

    expect(users_result.reload.external_results).to eq({ 'some_score' => 1 })
  end

  it 'saves pdf report and scores' do
    expect(Services::Hogan::Api::Json::ParticipantReport).to receive(:call!).and_return(
      file_fixture('base64pdf.txt').read
    )
    allow(Services::Hogan::Api::Json::ParticipantScore).to receive(:call!).and_return({ 'some_score' => 1 })

    described_class.call(user_report)

    expect(users_result.reload.external_results).to eq({ 'some_score' => 1 })
    expect(user_report.reload.status).to eq('prepared')
    expect(user_report.pdf_file.attached?).to eq(true)
  end
end
