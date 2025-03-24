# frozen_string_literal: true

require 'rails_helper'
require 'webmock/rspec'

RSpec.describe Administration::ImportDevelopmentActionTranslations do
  let(:file_url) { 'https://example.com/development_action_translations.csv' }
  let!(:project) { create(:project) }
  let!(:development_action) { create(:development_action, project_id: project.id) }
  let!(:other_project_development_action) { create(:development_action, project_id: create(:project).id) }

  describe 'Form Validation' do
    let(:csv_file) { fixture_file_upload('development_action_translations.csv', 'text/csv') }
    let(:form) { Api::V2::Administration::DevelopmentActionTranslationImportForm.new(file: csv_file) }

    context 'with valid CSV data' do
      before do
        allow(csv_file).to receive(:read).and_return(<<~CSV
          ID,Locale,Name,Description
          #{development_action.id},fr,French Name,French Description
        CSV
                                                    )
      end

      it 'validates successfully' do
        expect(form).to be_valid
      end
    end

    context 'with missing required fields' do
      before do
        allow(csv_file).to receive(:read).and_return(<<~CSV
          ID,Name
          #{development_action.id},French Name
        CSV
                                                    )
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('administration.development_action_translations.import.errors.missing_columns',
                 fields: 'Locale, Description')
        )
      end
    end
  end

  describe 'Import Service' do
    context 'with invalid URL' do
      let(:invalid_url) { 'not-a-url' }

      it 'returns error for invalid URL' do
        result = described_class.new(invalid_url, project.id).call
        expect(result).to be_an(Array)
        expect(result).to include(
          I18n.t('administration.development_action_translations.import.errors.invalid_url',
                 message: I18n.t('administration.development_action_translations.import.errors.invalid_url_format'))
        )
      end
    end

    context 'with unreachable URL' do
      before do
        stub_request(:get, file_url).to_return(status: 404, body: 'Not Found')
      end

      it 'returns error for failed download' do
        result = described_class.new(file_url, project.id).call
        expect(result).to be_an(Array)
        expect(result.first).to include('Failed to download file')
      end
    end

    context 'with valid data' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: <<~CSV
              ID,Locale,Name,Description
              #{development_action.id},fr,French Name,French Description
              #{development_action.id},de,German Name,German Description
            CSV
          )
      end

      it 'imports translations successfully' do
        result = described_class.new(file_url, project.id).call
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
              ID,Locale,Name,Description
              #{other_project_development_action.id},fr,French Name,French Description
            CSV
          )
      end

      it 'returns error for development action not in project' do
        result = described_class.new(file_url, project.id).call
        expect(result).to be_an(Array)
        expect(result).to include(
          I18n.t('administration.development_action_translations.import.errors.development_action_not_found',
                 id: other_project_development_action.id.to_s,
                 project_id: project.id)
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
              ID,Locale,Name,Description
              999999,fr,French Name,French Description
            CSV
          )
      end

      it 'returns error for non-existent development action' do
        result = described_class.new(file_url, project.id).call
        expect(result).to be_an(Array)
        expect(result).to include(
          I18n.t('administration.development_action_translations.import.errors.development_action_not_found',
                 id: '999999',
                 project_id: project.id)
        )
      end
    end

    context 'with malformed CSV' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: "malformed,csv\ndata"
          )
      end

      it 'returns error for malformed CSV' do
        result = described_class.new(file_url, project.id).call
        expect(result).to be_an(Array)
        expect(result).to include(
          I18n.t('administration.development_action_translations.import.errors.missing_columns',
                 fields: 'ID, Locale, Name, Description')
        )
      end
    end

    context 'with invalid CSV format' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: 'This is not a CSV file'
          )
      end

      it 'returns error for invalid CSV format' do
        result = described_class.new(file_url, project.id).call
        expect(result).to be_an(Array)
        expect(result).to include(
          I18n.t('administration.development_action_translations.import.errors.missing_columns',
                 fields: 'ID, Locale, Name, Description')
        )
      end
    end
  end
end
