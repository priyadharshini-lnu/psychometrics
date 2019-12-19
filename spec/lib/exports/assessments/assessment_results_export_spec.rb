# frozen_string_literal: true

require 'rails_helper'

describe Exports::Assessments::AssessmentResultsExport do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project) }
  let(:assessment) { project.assessments.take }
  let(:file_name) { 'assessment_export.xlsx' }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  context 'external assessment' do
    it 'calls Exports::External::BaseExternalExport when external option is passed as true' do
      external_export_obj = double(to_xlsx: nil)
      expect(Exports::External::BaseExternalExport).to receive(:build).and_return(external_export_obj)
      expect(external_export_obj).to receive(:to_xlsx)

      described_class.call!(assessment, client.id, external: true)
    end
  end

  context 'internal assessment' do
    let!(:questions) { create_list(:question, 2, assessment: assessment) }

    it 'first row in xlsx contains result_details_header along with question ids' do
      xlsx = described_class.call!(assessment, project.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_first_row = xlsx.sheet(0).row(1)

      expected_first_row = ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm Data', 'Status']
      questions.each { |q| expected_first_row << "QID#{q.id}" }

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx  contains  question names' do
      xlsx = described_class.call!(assessment, project.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [nil] * 7
      questions.each { |q| expected_second_row << q.name }

      expect(actual_second_row).to eq(expected_second_row)
    end

    it 'third row in xlsx contains question text' do
      xlsx = described_class.call!(assessment, project.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_third_row = xlsx.sheet(0).row(3)
      expected_third_row = [nil] * 7
      questions.each { |q| expected_third_row << q.props['questionText'] }

      expect(actual_third_row).to eq(expected_third_row)
    end

    it 'xlsx contains each assign as seprate row' do
      create_list(:membership, 2, client: project).each do |membership|
        create(:assign, assessment: assessment, membership: membership)
      end

      xlsx = described_class.call!(assessment, project.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)

      expect(xlsx.sheet(0).last_row).to eq(5)
    end

    it 'each assign row in xlsx have result details along with answer to the question' do
      membership = create(:membership, client: project)
      assign = create(:assign, assessment: assessment, membership: membership, results: {
        questions[0].id.to_s => { 'answers' => [{ 'index' => 1, 'value' => true }] },
        questions[1].id.to_s => { 'answers' => [{ 'index' => 2, 'value' => true }] }
      })

      xlsx = described_class.call!(assessment, project.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_result_row = xlsx.sheet(0).row(4)
      user_name = "#{assign.membership.user.first_name}, #{assign.membership.user.last_name}"
      expected_result_row = [
        assign.encode_id,
        user_name,
        assign.membership.user.email,
        assign.started_at.try(:strftime, '%D %r'),
        assign.completed_at.try(:strftime, '%D %r'),
        nil,
        I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
        2,
        3
      ]

      expect(actual_result_row).to eq(expected_result_row)
    end
  end
end
