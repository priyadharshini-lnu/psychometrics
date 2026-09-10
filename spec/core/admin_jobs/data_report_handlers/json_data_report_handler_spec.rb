# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::JsonDataReportHandler do
  let!(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, :with_project_membership, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:configuration) do
    {
      'sections' => [{
        'name' => 'User Details',
        'cell_format' => { 'bg_color' => 'white', 'font_size' => 10, 'bold' => true },
        'columns' => [{
          'name' => 'Email',
          'type' => 'user_detail',
          'field_name' => 'email'
        }]
      }],
      'campaign_ids' => [campaign.id]
    }
  end

  let(:data_report) do
    create(:data_report,
           owner: project.client,
           report_type: :json_data_report,
           configuration: configuration.to_json)
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_json_data_report.xlsx') }

  subject do
    described_class.new(
      data_report: data_report,
      data_report_job: data_report_job,
      file_path: file_path
    )
  end

  after do
    FileUtils.rm_f(file_path)
  end

  describe '.file_extension' do
    it 'returns xlsx' do
      expect(described_class.file_extension).to eq('xlsx')
    end
  end

  describe '#file_extension' do
    it 'delegates to class method' do
      expect(subject.file_extension).to eq('xlsx')
    end
  end

  describe '#generate_file' do
    it 'creates an xlsx file' do
      subject.generate_file

      expect(File.exist?(file_path)).to be true
    end

    it 'includes user data in the spreadsheet' do
      subject.generate_file

      workbook = RubyXL::Parser.parse(file_path)
      worksheet = workbook.worksheets[0]

      # Row 0 is section headers, Row 1 is column headers, Row 2+ is data
      expect(worksheet[1][0].value).to eq('Email')
      expect(worksheet[2][0].value).to eq(user.email)
    end

    context 'with multiple sections' do
      let(:configuration) do
        {
          'sections' => [
            {
              'name' => 'User Details',
              'cell_format' => { 'bg_color' => 'white', 'font_size' => 10 },
              'columns' => [
                { 'name' => 'Email', 'type' => 'user_detail', 'field_name' => 'email' },
                { 'name' => 'First Name', 'type' => 'user_detail', 'field_name' => 'first_name' }
              ]
            },
            {
              'name' => 'Campaign Details',
              'cell_format' => { 'bg_color' => 'blue', 'font_size' => 12 },
              'columns' => [
                { 'name' => 'Campaign Name', 'type' => 'campaign_detail', 'field_name' => 'name' }
              ]
            }
          ],
          'campaign_ids' => [campaign.id]
        }
      end

      it 'creates merged section headers' do
        subject.generate_file

        workbook = RubyXL::Parser.parse(file_path)
        worksheet = workbook.worksheets[0]

        # Section headers should be in row 0 (merged cells only have value in first cell)
        expect(worksheet[0][0].value).to eq('User Details')
        # Campaign Details section starts at column 2 (after 2 columns from User Details)
        expect(worksheet.merged_cells).not_to be_empty
      end

      it 'writes column headers for all sections' do
        subject.generate_file

        workbook = RubyXL::Parser.parse(file_path)
        worksheet = workbook.worksheets[0]

        expect(worksheet[1][0].value).to eq('Email')
        expect(worksheet[1][1].value).to eq('First Name')
        expect(worksheet[1][2].value).to eq('Campaign Name')
      end
    end

    context 'with project_ids instead of campaign_ids' do
      let(:configuration) do
        {
          'sections' => [{
            'name' => 'User Details',
            'cell_format' => { 'bg_color' => 'white' },
            'columns' => [{
              'name' => 'Email',
              'type' => 'user_detail',
              'field_name' => 'email'
            }]
          }],
          'project_ids' => [project.id]
        }
      end

      it 'fetches campaigns from projects' do
        subject.generate_file

        workbook = RubyXL::Parser.parse(file_path)
        worksheet = workbook.worksheets[0]

        expect(worksheet[2][0].value).to eq(user.email)
      end
    end

    context 'with multiple campaign users' do
      let(:user2) { create(:user, :with_project_membership, project: project) }
      let!(:campaign_user2) { create(:campaign_user, campaign: campaign, user: user2) }

      it 'includes all campaign users' do
        subject.generate_file

        workbook = RubyXL::Parser.parse(file_path)
        worksheet = workbook.worksheets[0]

        emails = [worksheet[2][0]&.value, worksheet[3][0]&.value].compact
        expect(emails).to include(user.email, user2.email)
      end

      it 'excludes UAT users' do
        uat_user = create(:user, :with_project_membership, project: project, is_uat: true)
        create(:campaign_user, campaign: campaign, user: uat_user)

        subject.generate_file

        workbook = RubyXL::Parser.parse(file_path)
        worksheet = workbook.worksheets[0]
        emails = (2..4).filter_map { |row| worksheet[row]&.[](0)&.value }

        expect(emails).to include(user.email, user2.email)
        expect(emails).not_to include(uat_user.email)
      end
    end
  end

  describe 'COLUMN_HANDLERS' do
    it 'has handlers for all supported column types' do
      expected_types = %w[
        user_detail
        campaign_detail
        project_detail
        assessment_score
        user_assessment_detail
        datasheet_value
        campaign_score
      ]

      expect(described_class::COLUMN_HANDLERS.keys).to match_array(expected_types)
    end
  end
end
