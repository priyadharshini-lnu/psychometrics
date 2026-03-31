# frozen_string_literal: true

require 'rails_helper'

describe Libraries::Create do
  let(:current_user) { create(:superadmin) }

  let(:file) do
    fixture_file_upload('reports/test.pdf', 'application/pdf')
  end

  describe '#call' do
    context 'when creating file library' do
      let(:params) do
        {
          type: 'other',
          name: 'Sample PDF',
          description: 'A sample PDF file for testing'
        }
      end

      it 'creates a new file library' do
        result = described_class.call(params.merge(files: [file]), current_user)

        expect(result[:ok]).to be_present
        expect(result[:ok].first).to be_a(Library)
        expect(result[:ok].first.name).to eq('Sample PDF')
        expect(result[:ok].first.file.filename.to_s).to eq('test.pdf')
      end

      context 'when multiple files are provided' do
        let(:another_file) do
          fixture_path = Rails.root.join('spec/fixtures/files/profile.png')
          Rack::Test::UploadedFile.new(fixture_path, 'image/png')
        end

        it 'creates multiple file libraries' do
          result = described_class.call(params.merge(files: [file, another_file]), current_user)

          expect(result[:ok].size).to eq(2)
          expect(result[:ok].map(&:name)).to all(eq('Sample PDF'))
          expect(result[:ok].map(&:description)).to all(eq('A sample PDF file for testing'))
          expect(result[:ok].map { |lib| lib.file.filename.to_s }).to contain_exactly('test.pdf', 'profile.png')
        end
      end
    end

    context 'when creating folder library' do
      let(:params) do
        {
          type: 'folder',
          name: 'Sample Folder',
          description: 'A sample folder for testing'
        }
      end

      it 'creates a new folder library' do
        result = described_class.call(params, current_user)

        expect(result[:ok]).to be_present
        expect(result[:ok].first).to be_a(Library)
        expect(result[:ok].first.name).to eq('Sample Folder')
        expect(result[:ok].first.file.attached?).to be_falsey
      end
    end
  end
end
