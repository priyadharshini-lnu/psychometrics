# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReport, type: :model do
  it { should belong_to(:user).inverse_of(:user_reports) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, generating: 1, failed: 2, prepared: 3) }

  describe '#attach_pdf!' do
    let(:user_report) { create(:user_report) }

    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
    end

    context 'when data is String' do
      context 'when string is a URL' do
        let(:data) { 'http://example.com/test.pdf' }
        let(:file) do
          Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf')
        end
        let(:user_report) { create(:user_report) }

        before do
          allow(OpenURI).to receive(:open_uri).with(URI.parse(data)).and_return(file)
        end

        it 'attaches the PDF from the URL' do
          user_report.attach_pdf!(data)
          expect(user_report.user_report_pdf.pdf_file).to be_attached
          expect(user_report.user_report_pdf.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
          )
        end
      end

      context 'when string is not url' do
        let(:data) { Base64.encode64(Rails.root.join('spec/fixtures/files/reports/test.pdf').read) }
        let(:attachment) { { io: StringIO.new(data), filename: 'test', content_type: 'application/pdf' } }

        before do
          allow(ActiveStorageSupport::Base64Attach).to receive(:attachment_from_data).and_return(attachment)
        end

        it 'attaches the PDF from the base64 string' do
          user_report.attach_pdf!(data, 'test.pdf')
          expect(user_report.user_report_pdf.pdf_file).to be_attached
          expect(user_report.user_report_pdf.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
          )
        end
      end
    end

    context 'when data is a File' do
      let(:data) { Rails.root.join('spec/fixtures/files/reports/test.pdf').open }

      it 'attaches the PDF from the file' do
        user_report.attach_pdf!(data)
        expect(user_report.user_report_pdf.pdf_file).to be_attached
        expect(user_report.user_report_pdf.pdf_file.key).to match(
          %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
        )
      end
    end
  end

  require 'rails_helper'

  describe 'schedule_report_available_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_report) do
      create(:user_report, user: user, campaign_id: campaign_user.campaign_id, user_access: true)
    end
    let(:communication) { create(:communication, kind: :report_available, campaign_id: user_report.campaign_id) }

    context 'when status changes to prepared and communication exists' do
      it 'creates communication emails with the same resource' do
        communication

        user_report.update!(status: 'prepared')

        expect(CommunicationEmail.count).to eq(1)
        communication_email = CommunicationEmail.last

        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_report)
      end

      context 'when user_access is set to true' do
        before { user_report.update!(user_access: false, status: 'prepared') }

        it 'creates communication emails' do
          communication
          expect(user_report).to receive(:schedule_report_available_notification).and_call_original
          user_report.update!(user_access: true)

          expect(CommunicationEmail.count).to eq(1)
        end
      end
    end

    context 'when status changes to prepared but no communication exists' do
      it 'does not create any communication emails' do
        user_report.update!(status: 'prepared')

        expect(CommunicationEmail.count).to eq(0)
      end
    end

    context 'when status is not prepared' do
      it 'does not trigger email creation' do
        user_report.update!(status: 'not_prepared')

        expect(CommunicationEmail.count).to eq(0)
      end
    end
  end
end
