# frozen_string_literal: true

require 'rails_helper'
# require_dependency Rails.root.join('lib', 'import_export_const')
# require 'lib/import_export_const.rb'

describe Assessments::Export::RawAndScoring do
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let(:assessment) { project.assessments.take }
  let(:file_name) { 'assessment_export.xlsx' }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  context 'Multiple-choice questions' do
    let!(:questions) { create_list(:question, 2, assessment: assessment) }

    it 'first row in xlsx contains result_details_header along with question ids' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_first_row = xlsx.sheet(0).row(1)

      expected_first_row = [
        'Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason'
      ]
      questions.each { |q| expected_first_row << "QID#{q.id}" }

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx  contains  question names' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [nil] * 8
      questions.each { |q| expected_second_row << q.name }

      expect(actual_second_row).to eq(expected_second_row)
    end

    it 'third row in xlsx contains question text' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_third_row = xlsx.sheet(0).row(3)
      expected_third_row = [nil] * 8
      questions.each { |q| expected_third_row << q.props['questionText'] }

      expect(actual_third_row).to eq(expected_third_row)
    end

    it 'xlsx contains each user result as separate row' do
      create_list(:users_result, 2, assessment: assessment).each do |res|
        create(:user_assessment, users_result: res, campaign: campaign)
      end

      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)

      expect(xlsx.sheet(0).last_row).to eq(6)
    end

    it 'each user result row in xlsx have result details along with answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, answers: {
        questions[0].id.to_s => { 'answers' => [{ 'index' => 1, 'value' => true }] },
        questions[1].id.to_s => { 'answers' => [{ 'index' => 2, 'value' => true }] }
      })

      create(:user_assessment, users_result: res, campaign: campaign)

      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_result_row = xlsx.sheet(0).row(5)
      user_name = "#{res.user.first_name}, #{res.user.last_name}"
      expected_result_row = [
        res.encoded_id,
        user_name,
        res.user.email,
        res.created_at.try(:strftime, '%D %r'),
        res.completed_at.try(:strftime, '%D %r'),
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        2,
        3
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end

  context 'TextEntry Email question assessment' do
    let!(:question) { create(:question, :email_question, assessment: assessment) }

    it 'first row in xlsx contains result_details_header along with question ids' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_first_row = xlsx.sheet(0).row(1)

      expected_first_row = [
        'Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason'
      ]

      ImportExportConst::EMAIL_QUESTION_FIELDS.each do |email_field|
        expected_first_row << "QID#{question.id}_#{email_field}"
      end

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx contains question names' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [nil] * 8

      ImportExportConst::EMAIL_QUESTION_FIELDS.count.times { |_i| expected_second_row << question.name }

      expect(actual_second_row).to eq(expected_second_row)
    end

    it 'third row in xlsx contains question text' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_third_row = xlsx.sheet(0).row(3)
      expected_third_row = [nil] * 8

      ImportExportConst::EMAIL_QUESTION_FIELDS.count.times do |_i|
        expected_third_row << question.props['questionText']
      end

      expect(actual_third_row).to eq(expected_third_row)
    end

    it 'each user_result row in xlsx have result details along with answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, answers: {
        question.id.to_s => {
          'answers' => {
            'cc' => nil, 'to' => 'Rupert Smith', 'bcc' => nil,
            'message' => 'message', 'subject' => 'subject'
          }
        }
      })

      create(:user_assessment, users_result: res, campaign: campaign)

      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_result_row = xlsx.sheet(0).row(5)
      user_name = "#{res.user.first_name}, #{res.user.last_name}"
      expected_result_row = [
        res.encoded_id,
        user_name,
        res.user.email,
        res.created_at.try(:strftime, '%D %r'),
        res.completed_at.try(:strftime, '%D %r'),
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        'Rupert Smith',
        nil,
        nil,
        'subject',
        'message'
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end

  context 'TextEntry chat questions assessment' do
    let!(:question) { create(:question, :chat_question, assessment: assessment) }

    it 'first row in xlsx contains result_details_header along with question ids' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_first_row = xlsx.sheet(0).row(1)

      expected_first_row = [
        'Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason'
      ]
      expected_first_row << "QID#{question.id}"

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx contains question names' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [nil] * 8
      expected_second_row << question.name

      expect(actual_second_row).to eq(expected_second_row)
    end

    it 'third row in xlsx contains question text' do
      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_third_row = xlsx.sheet(0).row(3)
      expected_third_row = [nil] * 8

      expected_third_row << question.props['questionText']

      expect(actual_third_row).to eq(expected_third_row)
    end

    it 'each row have result with each reply on new line into same column as answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, answers: {
        question.id.to_s =>
        { 'answers' =>
          [
            { 'index' => 1, 'value' => 'Hey' },
            { 'index' => 2, 'value' => 'Hello' },
            { 'index' => 3, 'value' => 'Hi' }
          ] }
      })
      create(:user_assessment, users_result: res, campaign: campaign)

      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_result_row = xlsx.sheet(0).row(5)
      user_name = "#{res.user.first_name}, #{res.user.last_name}"
      expected_result_row = [
        res.encoded_id,
        user_name,
        res.user.email,
        res.created_at.try(:strftime, '%D %r'),
        res.completed_at.try(:strftime, '%D %r'),
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        "Hey\nHello\nHi"
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end
end
