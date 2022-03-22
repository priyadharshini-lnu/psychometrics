# frozen_string_literal: true

require 'rails_helper'

describe Assessments::Export::Iiht do
  let(:external_results) do
    {
      'status' => 'Passed',
      'duration' => 10,
      'attemptNumber' => 1,
      'scorePercentage' => 50.0,
      'answeredQuestions' => 4
    }
  end
  let(:user_result) { create(:users_result, external_results: external_results) }
  let!(:relationship) { create(:relationship, type: :global, name: 'Self') }
  let!(:user_assessment) { create(:user_assessment, users_result: user_result, relationship: relationship) }
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
        'Result', 'Attempts', 'Duration', 'AnsweredQuestions', 'ScorePercentage'
      ]
    )
    expect(data).to eq(
      [
        user_result.encoded_id,
        "#{user_result.subject.first_name}, #{user_result.subject.last_name}",
        user_result.subject.email,
        "#{user_result.evaluator.first_name}, #{user_result.evaluator.last_name}",
        user_result.evaluator.email,
        relationship.name,
        user_result.started_at.try(:strftime, '%D %r'),
        user_result.completed_at.try(:strftime, '%D %r'),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.status}"),
        external_results['status'],
        external_results['attemptNumber'],
        external_results['duration'],
        external_results['answeredQuestions'],
        external_results['scorePercentage']
      ]
    )
  end
end
