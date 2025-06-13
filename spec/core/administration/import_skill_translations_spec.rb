# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportSkillTranslations do
  let(:superadmin) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: superadmin)
  end
  let(:project) { Project.find(create(:project, client: client).id) }

  let(:skill) { create(:skill, project: project) }

  let(:valid_csv_content) do
    <<~CSV
      ID,English / en,Spanish / es
      #{skill.id}#Name,Updated Name,Nombre Actualizado
      #{skill.id}#Description,Updated Description,Descripción Actualizada
    CSV
  end

  let(:file_url) { 'https://example.com/translations.csv' }
  let(:file) { double('file', url: file_url) }

  before do
    stub_request(:get, file_url).
      to_return(
        status: 200,
        headers: { 'Content-Type' => 'text/csv' },
        body: valid_csv_content
      )
  end

  describe '#call' do
    it 'updates skill translations' do
      result = described_class.new(file, project.id).call
      expect(result).to eq(true)

      I18n.with_locale(:en) do
        skill.reload
        expect(skill.name).to eq('Updated Name')
        expect(skill.description).to eq('Updated Description')
      end

      I18n.with_locale(:es) do
        skill.reload
        expect(skill.name).to eq('Nombre Actualizado')
        expect(skill.description).to eq('Descripción Actualizada')
      end
    end

    context 'with invalid skill ID' do
      let(:valid_csv_content) do
        <<~CSV
          ID,English / en
          999999#Name,Invalid Skill
          999999#Description,Invalid Description
        CSV
      end

      it 'returns error message' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.skills.translations.import.errors.skill_not_found', id: '999999'
          )
        )
      end
    end

    context 'with skill from different project' do
      let(:superadmin) { create(:superadmin) }
      let(:client) do
        create(:client,
               number: '123',
               country: 'UAE',
               year: '2024',
               project_manager: superadmin)
      end
      let(:other_project) { Project.find(create(:project, client: client).id) }
      let(:other_skill) { create(:skill, project: other_project) }

      let(:valid_csv_content) do
        <<~CSV
          ID,English / en
          #{other_skill.id}#Name,Updated Name
          #{other_skill.id}#Description,Updated Description
        CSV
      end

      it 'returns error message' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.skills.translations.import.errors.skill_not_found',
            id: other_skill.id.to_s
          )
        )
      end
    end

    context 'with missing required fields' do
      let(:valid_csv_content) do
        <<~CSV
          Name,English / en
          Test,Updated Name
        CSV
      end

      it 'returns error message' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.skills.translations.import.errors.missing_columns',
            columns: 'ID'
          )
        )
      end
    end

    context 'with download errors' do
      context 'when URL is invalid' do
        let(:file_with_invalid_url) { double('file', url: 'not-a-url') }

        it 'returns error for invalid URL' do
          expect do
            described_class.new(file_with_invalid_url, project.id).call
          end.to raise_error(Errors::ImportError, 'Invalid URL format')
        end
      end

      context 'when file is not accessible' do
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
    end

    context 'with nil project_id parameter' do
      let(:global_skill) { create(:skill, project: nil) }

      let(:valid_csv_content) do
        <<~CSV
          ID,English / en
          #{global_skill.id}#Name,Updated Global Name
          #{global_skill.id}#Description,Updated Global Description
        CSV
      end

      it 'updates global skill translations' do
        result = described_class.new(file, nil).call
        expect(result).to eq(true)

        I18n.with_locale(:en) do
          global_skill.reload
          expect(global_skill.name).to eq('Updated Global Name')
          expect(global_skill.description).to eq('Updated Global Description')
        end
      end
    end

    context 'with CSV format error' do
      before do
        stub_request(:get, file_url).
          to_return(
            status: 200,
            headers: { 'Content-Type' => 'text/csv' },
            body: "ID,\"Unclosed quote
          "
          )
      end

      it 'returns error for malformed CSV' do
        expect do
          described_class.new(file, project.id).call
        end.to raise_error(
          Errors::ImportError,
          I18n.t(
            'administration.errors.invalid_csv_format',
            message: 'Unclosed quoted field in line 1.'
          )
        )
      end
    end
  end
end
