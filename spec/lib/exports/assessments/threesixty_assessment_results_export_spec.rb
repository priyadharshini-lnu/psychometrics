# frozen_string_literal: true

require 'rails_helper'

describe Exports::Assessments::ThreesixtyAssessmentResultsExport do
  let(:client) { create(:tenancy) }
  let(:assessment) { create(:assessment) }
  let!(:questions) { create_list(:question, 2, assessment: assessment) }
  let!(:threesixty_campaign) { create(:threesixty_campaign, assessment: assessment) }
  let(:file_name) { 'assessment_export.xlsx' }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  it 'first row in xlsx contains result_details_header along with question ids' do
    xlsx = described_class.call!(assessment)
    xlsx.serialize(file_name)

    xlsx = Roo::Spreadsheet.open(file_name)
    actual_first_row = xlsx.sheet(0).row(1)

    expected_first_row = ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
                          'Relationship', 'Started At', 'Completed At', 'Status']
    questions.each { |q| expected_first_row << "QID#{q.id}" }

    expect(actual_first_row).to eq(expected_first_row)
  end

  it 'second row in xlsx  contains  question names' do
    xlsx = described_class.call!(assessment)
    xlsx.serialize(file_name)

    xlsx = Roo::Spreadsheet.open(file_name)
    actual_second_row = xlsx.sheet(0).row(2)
    expected_second_row = [nil] * 9
    questions.each { |q| expected_second_row << q.name }

    expect(actual_second_row).to eq(expected_second_row)
  end

  it 'third row in xlsx contains question text' do
    xlsx = described_class.call!(assessment)
    xlsx.serialize(file_name)

    xlsx = Roo::Spreadsheet.open(file_name)
    actual_third_row = xlsx.sheet(0).row(3)
    expected_third_row = [nil] * 9
    questions.each { |q| expected_third_row << q.props['questionText'] }

    expect(actual_third_row).to eq(expected_third_row)
  end

  it 'xlsx contains each users_result as seprate row' do
    users_result = create_list(:users_result, 2, assessment: assessment)
    users_result.each do |ur|
      create(:threesixty_participant, subject: ur.subject, evaluator: ur.evaluator, campaign: ur.campaign)
    end
    xlsx = described_class.call!(assessment)
    xlsx.serialize(file_name)

    xlsx = Roo::Spreadsheet.open(file_name)

    expect(xlsx.sheet(0).last_row).to eq(6)
  end

  it 'each assign row in xlsx have result details along with answer to the question' do
    users_result = create(:users_result, assessment: assessment, answers: {
      questions[0].id.to_s => { 'answers' => [{ 'index' => 1, 'value' => true }] },
      questions[1].id.to_s => { 'answers' => [{ 'index' => 2, 'value' => true }] }
    })
    manager_relationship = create(:relationship, name: 'Manager', type: :global)
    create(:threesixty_participant,
           subject: users_result.subject, evaluator: users_result.evaluator, campaign: users_result.campaign,
           relationship: manager_relationship)

    xlsx = described_class.call!(assessment)
    xlsx.serialize(file_name)

    xlsx = Roo::Spreadsheet.open(file_name)
    actual_result_row = xlsx.sheet(0).row(5)
    subject_name = "#{users_result.subject.first_name}, #{users_result.subject.last_name}"
    evaluator_name = "#{users_result.evaluator.first_name}, #{users_result.evaluator.last_name}"
    expected_result_row = [
      UsersResult.encode_id(users_result.id),
      subject_name,
      users_result.subject.email,
      evaluator_name,
      users_result.evaluator.email,
      'Manager',
      users_result.created_at.try(:strftime, '%D %r'),
      users_result.completed_at.try(:strftime, '%D %r'),
      I18n.t("activerecord.attributes.threesixty.users_result.statuses.#{users_result.status}"),
      2,
      3
    ]

    expect(actual_result_row).to eq(expected_result_row)
  end
end
