# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Yoodli::ImportFromS3Service do
  let(:bucket_name) { 'test-yoodli-bucket' }
  let(:current_date) { '2025-01-15' }
  let(:previous_date) { '2025-01-14' }
  let(:campaign) { create(:campaign) }

  let(:s3_client) { instance_double(Aws::S3::Client) }

  before do
    allow(Aws::S3::Client).to receive(:new).and_return(s3_client)
    allow(Settings.secrets).to receive(:s3_compatible_storage).and_return(
      { yoodli_reports_bucket: bucket_name }
    )
    allow(Time).to receive(:current).and_return(Time.zone.parse('2025-01-15 12:00:00 UTC'))
  end

  describe '.call' do
    subject { described_class.call(date: current_date, campaign_id: campaign.id) }

    context 'when no CSV files exist in the bucket' do
      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [])
        )
      end

      it 'returns empty result' do
        expect(subject).to eq(
          success: true,
          processed_users: 0,
          files_processed: 0,
          errors: []
        )
      end
    end

    context 'when CSV files exist for the current date' do
      let(:csv_object) do
        double(key: "reports_#{current_date}.csv", size: 100)
      end
      let(:csv_content) do
        <<~CSV
          orgId,scenarioId,scenarioName,userEmail,userName,userId,signupDate,goalName,numAttemptStarted,firstScore,maxScore,lastScore,avgScore
          org123,scenario456,Test Scenario,test@example.com,Test User,yoodli/user123,2025-01-01,Communication,3,75.0,85.0,80.0,78.5
        CSV
      end

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object])
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: csv_object.key).and_return(
          double(body: double(read: csv_content))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: true, processed_user_emails: ['test@example.com'], errors: [] }
        )
      end

      it 'processes the CSV file' do
        result = subject

        expect(result[:success]).to be true
        expect(result[:processed_users]).to eq 1
        expect(result[:files_processed]).to eq 1
        expect(result[:errors]).to be_empty
      end

      it 'calls ImportExternalResults with correct parameters' do
        expect(Yoodli::ImportExternalResults).to receive(:call).with(
          csv_content: csv_content,
          campaign: campaign,
          user_assessment_id: nil
        )

        subject
      end
    end

    context 'when CSV files exist for the previous date' do
      let(:csv_object) do
        double(key: "reports_#{previous_date}.csv", size: 100)
      end
      let(:csv_content) do
        <<~CSV
          orgId,scenarioId,scenarioName,userEmail,userName,userId,signupDate,goalName,numAttemptStarted,firstScore,maxScore,lastScore,avgScore
          org123,scenario456,Test Scenario,previous@example.com,Previous User,yoodli/user456,2025-01-01,Leadership,2,60.0,70.0,65.0,62.5
        CSV
      end

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object])
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: csv_object.key).and_return(
          double(body: double(read: csv_content))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: true, processed_user_emails: ['previous@example.com'], errors: [] }
        )
      end

      it 'processes CSV files from the previous date' do
        result = subject

        expect(result[:success]).to be true
        expect(result[:processed_users]).to eq 1
        expect(result[:files_processed]).to eq 1
      end
    end

    context 'when CSV files exist for both current and previous dates' do
      let(:current_date_csv) { double(key: "reports_#{current_date}.csv", size: 100) }
      let(:previous_date_csv) { double(key: "reports_#{previous_date}.csv", size: 150) }
      let(:csv_content_current) do
        <<~CSV
          orgId,scenarioId,scenarioName,userEmail,userName,userId,signupDate,goalName,numAttemptStarted,firstScore,maxScore,lastScore,avgScore
          org123,scenario456,Test Scenario,current@example.com,Current User,yoodli/user123,2025-01-01,Communication,3,75.0,85.0,80.0,78.5
        CSV
      end
      let(:csv_content_previous) do
        <<~CSV
          orgId,scenarioId,scenarioName,userEmail,userName,userId,signupDate,goalName,numAttemptStarted,firstScore,maxScore,lastScore,avgScore
          org123,scenario456,Test Scenario,previous@example.com,Previous User,yoodli/user456,2025-01-01,Leadership,2,60.0,70.0,65.0,62.5
        CSV
      end

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [current_date_csv, previous_date_csv])
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: current_date_csv.key).and_return(
          double(body: double(read: csv_content_current))
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: previous_date_csv.key).and_return(
          double(body: double(read: csv_content_previous))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: true, processed_user_emails: ['current@example.com'], errors: [] },
          { success: true, processed_user_emails: ['previous@example.com'], errors: [] }
        )
      end

      it 'processes CSV files from both dates' do
        result = subject

        expect(result[:success]).to be true
        expect(result[:processed_users]).to eq 2
        expect(result[:files_processed]).to eq 2
      end
    end

    context 'when files exist but not matching the date criteria' do
      let(:old_csv_object) { double(key: 'reports_2024-12-01.csv', size: 100) }
      let(:non_csv_object) { double(key: "reports_#{current_date}.txt", size: 100) }
      let(:empty_csv_object) { double(key: "empty_#{current_date}.csv", size: 0) }

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [old_csv_object, non_csv_object, empty_csv_object])
        )
      end

      it 'filters out non-matching files and returns empty result' do
        expect(subject).to eq(
          success: true,
          processed_users: 0,
          files_processed: 0,
          errors: []
        )
      end
    end

    context 'when ImportExternalResults returns errors' do
      let(:csv_object) { double(key: "reports_#{current_date}.csv", size: 100) }
      let(:csv_content) { 'invalid,csv,content' }

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object])
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: csv_object.key).and_return(
          double(body: double(read: csv_content))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: false, processed_user_emails: [], errors: ['Invalid CSV format'] }
        )
      end

      it 'collects errors from ImportExternalResults' do
        result = subject

        expect(result[:success]).to be false
        expect(result[:errors]).to include('Invalid CSV format')
      end
    end

    context 'when an exception occurs during file processing' do
      let(:csv_object) { double(key: "reports_#{current_date}.csv", size: 100) }

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object])
        )
        allow(s3_client).to receive(:get_object).and_raise(StandardError.new('S3 connection failed'))
      end

      it 'captures the error and continues processing' do
        result = subject

        expect(result[:success]).to be false
        expect(result[:errors]).to include("reports_#{current_date}.csv: S3 connection failed")
      end
    end

    context 'when using default date' do
      subject { described_class.call(campaign_id: campaign.id) }

      let(:csv_object) { double(key: 'reports_2025-01-15.csv', size: 100) }
      let(:previous_day_csv) { double(key: 'reports_2025-01-14.csv', size: 100) }

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object, previous_day_csv])
        )
        allow(s3_client).to receive(:get_object).and_return(
          double(body: double(read: 'csv,content'))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: true, processed_user_emails: ['test@example.com'], errors: [] }
        )
      end

      it 'uses current UTC date and previous day' do
        result = subject

        expect(result[:files_processed]).to eq 2
      end
    end

    context 'with user_assessment_id parameter' do
      let(:user_assessment) { create(:user_assessment, campaign: campaign) }
      let(:csv_object) { double(key: "reports_#{current_date}.csv", size: 100) }
      let(:csv_content) { 'csv,content' }

      subject do
        described_class.call(date: current_date, campaign_id: campaign.id, user_assessment_id: user_assessment.id)
      end

      before do
        allow(s3_client).to receive(:list_objects_v2).with(bucket: bucket_name).and_return(
          double(contents: [csv_object])
        )
        allow(s3_client).to receive(:get_object).with(bucket: bucket_name, key: csv_object.key).and_return(
          double(body: double(read: csv_content))
        )
        allow(Yoodli::ImportExternalResults).to receive(:call).and_return(
          { success: true, processed_user_emails: ['test@example.com'], errors: [] }
        )
      end

      it 'passes user_assessment_id to ImportExternalResults' do
        expect(Yoodli::ImportExternalResults).to receive(:call).with(
          csv_content: csv_content,
          campaign: campaign,
          user_assessment_id: user_assessment.id
        )

        subject
      end
    end
  end

  describe '#previous_date' do
    it 'returns the day before the specified date' do
      service = described_class.new(date: '2025-01-15')
      expect(service.send(:previous_date)).to eq('2025-01-14')
    end

    it 'handles month boundaries correctly' do
      service = described_class.new(date: '2025-02-01')
      expect(service.send(:previous_date)).to eq('2025-01-31')
    end

    it 'handles year boundaries correctly' do
      service = described_class.new(date: '2025-01-01')
      expect(service.send(:previous_date)).to eq('2024-12-31')
    end
  end
end
