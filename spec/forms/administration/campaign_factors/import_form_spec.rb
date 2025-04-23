# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::CampaignFactors::ImportForm do
  let(:report) { create(:report) }
  let(:report_id) { report.id }
  let(:assessment) { create(:assessment) }
  let(:assessment_id) { assessment.id }

  describe 'Common validations and logic' do
    it 'validates presence of resource_id and file' do
      form = described_class.new(resource_class: 'Report')
      expect(form.valid?).to be false
      expect(form.errors[:resource_id]).to include("can't be blank")
      expect(form.errors[:file]).to include("can't be blank")
    end

    it 'validates file content type' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/test.csv'),
        'text/plain'
      )
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be false
      expect(form.errors[:file]).to include('Please upload xlsx file')
    end

    it 'validates required headers' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/campaign_factors/missing_header.xlsx'),
        'application/xlsx'
      )
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be false
      expect(form.errors[:base]).to include(/Missing required headers:/)
    end

    it 'validates output type values' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/campaign_factors/invalid_output_type.xlsx'),
        'application/xlsx'
      )
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be false
      expect(form.errors[:base]).to include(/Invalid output_type/)
    end

    it 'validates when output_type differs for existing code' do
      create(:report_campaign_factor, report: report, code: 'fc1', output_type: 'string')

      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be false
      expect(form.errors[:base]).to include(/Output type mismatch for code/)
    end

    it 'allows matching codes when output_type is consistent' do
      create(:report_campaign_factor, report: report, code: 'fc1', name: 'Updated Name')

      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Assessment', resource_id: assessment_id)
      expect(form.valid?).to be true
    end
  end

  describe '#Report' do
    it 'validates that report exists' do
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Report', resource_id: -1)
      expect(form.valid?).to be false
      expect(form.errors[:resource]).to include('Report must exist')
    end

    it 'validates campaign factors count' do
      create_list(:report_campaign_factor, (described_class::MAX_CAMPAIGN_FACTORS - 1), report: report)
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be false # 299 existing campaign factors + 2 new campaign factor
      expect(form.errors[:base]).to include(/Total campaign factors exceed the maximum limit/)
    end

    it 'returns sanitized data from the file' do
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Report', resource_id: report_id)
      expect(form.valid?).to be true

      processed_data = form.processed_data
      expect(processed_data).to be_an(Array)
      expect(processed_data.first).to include(
        name: an_instance_of(String),
        code: an_instance_of(String),
        output_type: an_instance_of(String)
      )
    end
  end

  describe '#Assessment' do
    it 'validates that report exists' do
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Assessment', resource_id: -1)
      expect(form.valid?).to be false
      expect(form.errors[:resource]).to include('Assessment must exist')
    end

    it 'validates campaign factors count for assessment' do
      assessment = create(:assessment, campaign_factors_list: Array.new(299) do |i|
        { 'code' => "existing#{i}", 'name' => "name#{i}", 'outputType' => 'numeric' }
      end)
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Assessment', resource_id: assessment.id)
      expect(form.valid?).to be false
      expect(form.errors[:base]).to include(/Total campaign factors exceed the maximum limit/)
    end

    it 'returns sanitized data from the file' do
      file = valid_excel_file
      form = described_class.new(file: file, resource_class: 'Assessment', resource_id: assessment_id)
      expect(form.valid?).to be true

      processed_data = form.processed_data
      expect(processed_data).to be_an(Array)
      expect(processed_data.first).to include(
        name: an_instance_of(String),
        code: an_instance_of(String),
        output_type: an_instance_of(String)
      )
    end
  end

  private

  def valid_excel_file
    Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/campaign_factors/valid_file.xlsx'),
      'application/xlsx'
    )
  end
end
