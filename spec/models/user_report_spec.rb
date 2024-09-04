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
end
