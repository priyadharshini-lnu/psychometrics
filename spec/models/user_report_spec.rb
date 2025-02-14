# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReport, type: :model do
  it { should belong_to(:user).inverse_of(:user_reports) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, generating: 1, failed: 2, prepared: 3) }

  context 'with :pdf_file attribute' do
    let(:user_report) { create(:user_report, :with_pdf) }

    it { expect(user_report.pdf_file.attached?).to be_truthy }
  end

  describe '#sync_user_report_pdf' do
    let(:user_report) { create(:user_report, :with_pdf) }

    it 'creates a UserReportPdf record with pdf_file attached with same blob_id as user_report pdf file' do
      expect { user_report.sync_user_report_pdf }.to change(UserReportPdf, :count).by(1)

      user_report_pdf = user_report.user_report_pdfs.last

      expect(user_report_pdf.pdf_file.attached?).to be_truthy
      expect(user_report.reload.pdf_file.key).to eq(user_report_pdf.pdf_file.key)
      expect(user_report_pdf.pdf_file.blob_id).to eq(user_report.pdf_file.blob_id)
    end
  end

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
          expect(user_report.pdf_file).to be_attached
          expect(user_report.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_report/#{user_report.id}/pdf_file/\w+_test.pdf}
          )
        end
      end

      context 'when string is not url' do
        let(:data) { Base64.encode64(File.read(Rails.root.join('spec/fixtures/files/reports/test.pdf'))) }
        let(:attachment) { { io: StringIO.new(data), filename: 'test', content_type: 'application/pdf' } }

        before do
          allow(ActiveStorageSupport::Base64Attach).to receive(:attachment_from_data).and_return(attachment)
        end

        it 'attaches the PDF from the base64 string' do
          user_report.attach_pdf!(data, 'test.pdf')
          expect(user_report.pdf_file).to be_attached
          expect(user_report.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_report/#{user_report.id}/pdf_file/\w+_test.pdf}
          )
        end
      end
    end

    context 'when data is a File' do
      let(:data) { File.open(Rails.root.join('spec/fixtures/files/reports/test.pdf')) }

      it 'attaches the PDF from the file' do
        user_report.attach_pdf!(data)
        expect(user_report.pdf_file).to be_attached
        expect(user_report.pdf_file.key).to match(
          %r{private/projects/#{user_report.project.id}/user_report/#{user_report.id}/pdf_file/\w+_test.pdf}
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
