# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe Assessments::DataMigration::CopyAssessmentsFromCsv do
  let(:email) { 'user@example.com' }
  let!(:assessment) { create(:assessment, :saville) }

  let!(:source_project) { create(:project, name: 'source_project') }
  let!(:source_user) { create(:user, email: email, project: source_project) }
  let!(:source_campaign) { create(:campaign, project: source_project, name: 'source_campaign') }
  let!(:source_campaign_user) { create(:campaign_user, user: source_user, campaign: source_campaign) }
  let!(:source_user_assessment) do
    create(:user_assessment, subject: source_user, evaluator: source_user, campaign: source_campaign,
                             assessment: assessment)
  end

  let!(:target_project) { create(:project, name: 'target_project') }
  let!(:target_user) { create(:user, email: email, project: target_project) }
  let!(:target_campaign) { create(:campaign, project: target_project, name: 'target_campaign') }
  let!(:target_campaign_user) { create(:campaign_user, user: target_user, campaign: target_campaign) }
  let!(:target_user_assessment) do
    create(:user_assessment, subject: target_user, evaluator: target_user, campaign: target_campaign,
                             assessment: assessment)
  end

  let(:csv_content) do
    CSV.generate do |csv|
      csv << ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID']
      csv << [email, target_campaign.id, source_campaign.id, assessment.id]
    end
  end
  let(:start_row) { 2 }
  let(:instance) { described_class.new('saville', csv_url, start_row) }

  describe '#call' do
    context 'with a local file' do
      let(:csv_url) { 'file:///path/to/local/file.csv' }

      before do
        allow(File).to receive(:read).and_return(csv_content)
      end

      it 'processes the CSV file' do
        expect(instance).to receive(:process_file_content).with(csv_content)
        instance.call
      end
    end

    context 'with a remote file' do
      let(:csv_url) { 'https://example.com/file.csv' }
      let(:response_double) { instance_double(Faraday::Response, success?: true, body: csv_content) }

      before do
        allow(Faraday).to receive(:get).and_return(response_double)
      end

      it 'processes the CSV file' do
        expect(instance).to receive(:process_file_content).with(csv_content)
        instance.call
      end
    end
  end

  describe '#process_file_content' do
    let(:csv_url) { 'file:///path/to/local/file.csv' }

    before do
      allow(Saville::MigrateAssessment).to receive(:call!)
      allow(Rails.logger).to receive(:info)
    end

    it 'processes valid rows' do
      expect(Saville::MigrateAssessment).to receive(:call!).once
      instance.send(:process_file_content, csv_content)
    end

    context 'with invalid headers' do
      let(:csv_content) do
        CSV.generate do |csv|
          csv << ['Invalid Header']
          csv << ['data']
        end
      end

      it 'raises an error' do
        expect { instance.send(:process_file_content, csv_content) }.to raise_error(/Missing headers/)
      end
    end
  end

  describe '#validate_headers' do
    let(:instance) { described_class.new('saville', 'http://example.com/test.csv', 2) }

    it 'raises an error for missing headers' do
      expect { instance.send(:validate_headers, ['Invalid Header']) }.to raise_error(/Missing headers/)
    end

    it 'does not raise an error for valid headers' do
      expect do
        instance.send(:validate_headers,
                      ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'])
      end.not_to raise_error
    end
  end

  describe '#process_row' do
    let(:csv_url) { 'https://example.com/file.csv' }
    let(:row) do
      CSV::Row.new(['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'],
                   [email, target_campaign.id, source_campaign.id, assessment.id])
    end

    before do
      allow(Saville::MigrateAssessment).to receive(:call!)
      allow(Rails.logger).to receive(:info)
    end

    it 'processes a valid row' do
      expect(Rails.logger).to receive(:info)
      instance.send(:process_row, row, 2)
    end

    context 'with invalid form data' do
      let(:form_double) do
        instance_double(Assessments::DataMigration::CopyAssessmentForm, valid?: false,
                       errors: double(full_messages: ['Invalid data']))
      end

      before do
        allow(Assessments::DataMigration::CopyAssessmentForm).to receive(:new).and_return(form_double)
      end

      it 'raises an error' do
        expect { instance.send(:process_row, row, 2) }.to raise_error('Invalid data')
      end
    end
  end
end
