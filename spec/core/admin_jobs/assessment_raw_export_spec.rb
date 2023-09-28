# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::AssessmentRawExport do
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let!(:relationship) { create(:relationship, type: :global, name: 'Self') }
  let(:assessment) { project.assessments.take }
  let(:job_record) do
    create(
      :admin_job_record, operation: :assessment_raw_result_export,
      data: { campaign_id: campaign.id, assessment_id: assessment.id }
    )
  end

  context 'Multiple-choice questions' do
    let!(:questions) { create_list(:question, 2, assessment: assessment) }

    it 'first row in csv contains result_details_header along with question ids' do
      described_class.call!(job_record)

      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_first_row = csv.row(1)

      expected_first_row = ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
                            'Relationship', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason']
      questions.each do |q|
        expected_first_row << "QID#{q.id}"
        expected_first_row << "QID#{q.id}_#{ImportExportConst::DURATION}"
      end
      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv  contains  question names' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_second_row = csv.row(2)
      expected_second_row = [''] * 11
      questions.each { |q| expected_second_row << ([q.name] * 2) }

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end

    it 'third row in csv contains question text' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_third_row = csv.row(3)
      expected_third_row = [''] * 11
      questions.each { |q| expected_third_row << ([q.props['questionText']] * 2) }

      expect(actual_third_row).to eq(expected_third_row.flatten)
    end

    it 'csv contains each user result as separate row' do
      create_list(:users_result, 2, assessment: assessment, campaign: campaign, status: :in_progress)
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })

      expect(csv.last_row).to eq(6)
    end

    it 'each user result row in csv have result details along with answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, status: :completed, answers: {
        questions[0].id.to_s => { 'answers' => [{ 'index' => 1, 'value' => true }], 'duration' => 30 },
        questions[1].id.to_s => { 'answers' => [{ 'index' => 2, 'value' => true }], 'duration' => nil }
      })

      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_result_row = csv.row(5)
      expected_result_row = [
        res.encoded_id,
        "#{res.subject.first_name}, #{res.subject.last_name}",
        res.subject.email,
        "#{res.evaluator.first_name}, #{res.evaluator.last_name}",
        res.evaluator.email,
        'Self',
        res.user_assessment.started_at.to_s,
        res.completed_at.to_s,
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        2,
        30,
        3,
        nil
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end

  context 'TextEntry Email question assessment' do
    let!(:question) { create(:question, :email_question, assessment: assessment) }

    it 'first row in csv contains result_details_header along with question ids' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_first_row = csv.first

      expected_first_row = ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
                            'Relationship', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason']

      ImportExportConst::EMAIL_QUESTION_FIELDS.each do |email_field|
        expected_first_row << "QID#{question.id}_#{email_field}"
      end

      expected_first_row << "QID#{question.id}_#{ImportExportConst::DURATION}"

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv contains question names' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_second_row = csv.row(2)
      expected_second_row = [''] * 11

      ImportExportConst::EMAIL_QUESTION_FIELDS.count.times { |_i| expected_second_row << question.name }

      # For QID#{question.id}_#{ImportExportConst::DURATION}" column
      expected_second_row << question.name

      expect(actual_second_row).to eq(expected_second_row)
    end

    it 'third row in csv contains question text' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_third_row = csv.row(3)
      expected_third_row = [''] * 11

      ImportExportConst::EMAIL_QUESTION_FIELDS.count.times do |_i|
        expected_third_row << question.props['questionText']
      end

      # For QID#{question.id}_#{ImportExportConst::DURATION}" column
      expected_third_row << question.props['questionText']

      expect(actual_third_row).to eq(expected_third_row)
    end

    it 'each user_result row in csv have result details along with answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, status: :completed, answers: {
        question.id.to_s => {
          'answers' => {
            'cc' => nil, 'to' => 'Rupert Smith', 'bcc' => nil,
            'message' => 'message', 'subject' => 'subject'
          }, 'duration' => 120
        }
      })

      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_result_row = csv.row(5)
      expected_result_row = [
        res.encoded_id,
        "#{res.subject.first_name}, #{res.subject.last_name}",
        res.subject.email,
        "#{res.evaluator.first_name}, #{res.evaluator.last_name}",
        res.evaluator.email,
        'Self',
        res.user_assessment.started_at.to_s,
        res.completed_at.to_s,
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        'Rupert Smith',
        nil,
        nil,
        'subject',
        'message',
        120
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end

  context 'TextEntry chat questions assessment' do
    let!(:question) { create(:question, :chat_question, assessment: assessment) }

    it 'first row in csv contains result_details_header along with question ids' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_first_row = csv.row(1)

      expected_first_row = ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
                            'Relationship', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason']
      expected_first_row << "QID#{question.id}"
      expected_first_row << "QID#{question.id}_#{ImportExportConst::DURATION}"

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv contains question names' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_second_row = csv.row(2)
      expected_second_row = [''] * 11
      expected_second_row << ([question.name] * 2)

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end

    it 'third row in csv contains question text' do
      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_third_row = csv.row(3)
      expected_third_row = [''] * 11

      expected_third_row << ([question.props['questionText']] * 2)

      expect(actual_third_row).to eq(expected_third_row.flatten)
    end

    it 'each row have result with each reply on new line into same column as answer to the question' do
      res = create(:users_result, assessment: assessment, campaign: campaign, status: :completed, answers: {
        question.id.to_s =>
        { 'answers' =>
          [
            { 'index' => 1, 'value' => 'Hey' },
            { 'index' => 2, 'value' => 'Hello' },
            { 'index' => 3, 'value' => 'Hi' }
          ], 'duration' => 120 }
      })

      described_class.call!(job_record)
      csv = Roo::CSV.new(job_record.file.path, csv_options: { converters: [:numeric] })
      actual_result_row = csv.row(5)
      expected_result_row = [
        res.encoded_id,
        "#{res.subject.first_name}, #{res.subject.last_name}",
        res.subject.email,
        "#{res.evaluator.first_name}, #{res.evaluator.last_name}",
        res.evaluator.email,
        'Self',
        res.user_assessment.started_at.to_s,
        res.completed_at.to_s,
        nil,
        I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
        nil,
        "Hey\r\nHello\r\nHi",
        120
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end
end
