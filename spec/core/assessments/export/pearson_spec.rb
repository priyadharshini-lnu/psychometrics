# frozen_string_literal: true

require 'rails_helper'

describe Assessments::Export::Pearson do
  let(:external_results) do
    [
      { 'name' => 'APM3_TOT', 'value' => 10 },
      { 'name' => 'APM3_TOT_Correct', 'value' => 2 }
    ]
  end
  let(:user_result) do
    create(:users_result, external_results: external_results, status: :completed, score_calculated: true)
  end
  let!(:user_assessment) { user_result.user_assessment }
  let(:campaign) { user_assessment.campaign }
  let(:assessment) { user_assessment.assessment }
  let(:file_name) { 'assessesment-external-result-export.xlsx' }

  it 'verify headers and data' do
    xlsx = described_class.call!(assessment, campaign)
    xlsx.serialize(file_name)
    xlsx = Roo::Spreadsheet.open(file_name)
    sheet = xlsx.sheet(0)
    header = sheet.row(1)
    data = sheet.row(2)

    expect(xlsx.sheets).to eq(%w[ExternalResults])
    expect(header).to eq(
      [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Status',
        'APM3_TOT', 'APM3_TOT_Correct'
      ]
    )
    subject_name = "#{user_result.subject.first_name}, #{user_result.subject.last_name}"
    subject_email = user_result.subject.email
    expect(data).to eq(
      [
        user_result.encoded_id,
        subject_name,
        subject_email,
        subject_name,
        subject_email,
        'Self',
        user_assessment.started_at.try(:strftime, '%D %r'),
        user_assessment.completed_at.try(:strftime, '%D %r'),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_assessment.status}"),
        10,
        2
      ]
    )
  end
end
