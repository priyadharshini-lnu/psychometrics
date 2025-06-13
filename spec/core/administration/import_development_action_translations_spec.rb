# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe Administration::ImportDevelopmentActionTranslations do
  let(:file_url) { 'https://example.com/development_action_translations.csv' }
  let!(:project) { create(:project) }
  let!(:development_action) { create(:development_action, project_id: project.id) }
  let!(:other_project_development_action) { create(:development_action, project_id: create(:project).id) }
  let(:file) { double('file', url: file_url) }

  describe 'Form Validation' do
    let(:csv_file) { fixture_file_upload('development_action_translations.csv', 'text/csv') }
    let(:form) { Api::V2::Administration::DevelopmentActionTranslationImportForm.new(file: csv_file) }

    context 'with valid CSV data' do
      it 'validates successfully' do
        expect(form).to be_valid
      end
    end

    context 'with missing required fields' do
      before do
        allow(CSVSafe).to receive(:read).with(csv_file.path, encoding: 'bom|utf-8', headers: true).and_return(
          CSV.parse(<<~CSV, headers: true)
            ID
            #{development_action.id}#Name
          CSV
        )
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('administration.development_action_translations.import.errors.missing_columns',
                 fields: 'language columns')
        )
      end
    end
  end

  describe 'Import Service' do
    context 'with invalid URL' do
      let(:file_with_invalid_url) { double('file', url: 'invalid_url') }

      it 'returns error for invalid URL' do
        expect do
          described_class.new(file_with_invalid_url, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t('administration.errors.invalid_url_format')
        )
      end
    end

    context 'with unreachable URL' do
      before do
        stub_request(:get, file_url).to_raise(OpenURI::HTTPError.new('404 Not Found', nil))
      end

      it 'returns error for failed download' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.errors.download_failed',
            message: '404 Not Found'
          )
        )
      end
    end

    context 'with valid data' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,French / fr,German / de
              #{development_action.id}#Name,French Name,German Name
              #{development_action.id}#Description,French Description,German Description
            CSV
          )
      end

      it 'imports translations successfully' do
        result = described_class.new(file, project.id).call
        expect(result).to eq(true)

        # Check French translation
        I18n.with_locale(:fr) do
          expect(development_action.reload.name).to eq('French Name')
          expect(development_action.description).to eq('French Description')
        end

        # Check German translation
        I18n.with_locale(:de) do
          expect(development_action.name).to eq('German Name')
          expect(development_action.description).to eq('German Description')
        end
      end
    end

    context 'with development action from different project' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,French / fr
              #{other_project_development_action.id}#Name,French Name
              #{other_project_development_action.id}#Description,French Description
            CSV
          )
      end

      it 'returns error for development action not in project' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.development_action_translations.import.errors.development_action_not_found',
            id: other_project_development_action.id.to_s,
            project_id: project.id
          )
        )
      end
    end

    context 'with non-existent development action ID' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,French / fr
              999999#Name,French Name
              999999#Description,French Description
            CSV
          )
      end

      it 'returns error for non-existent development action' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.development_action_translations.import.errors.development_action_not_found',
            id: '999999',
            project_id: project.id
          )
        )
      end
    end
  end
end
