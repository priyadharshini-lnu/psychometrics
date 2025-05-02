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
      ID,Locale,Name,Description
      #{skill.id},en,Updated Name,Updated Description
      #{skill.id},es,Nombre Actualizado,Descripción Actualizada
    CSV
  end

  let(:file_url) { 'https://example.com/translations.csv' }

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
      result = described_class.new(file_url, project.id).call
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
          ID,Locale,Name,Description
          999999,en,Invalid Skill,Invalid Description
        CSV
      end

      it 'returns error message' do
        result = described_class.new(file_url, project.id).call
        expect(result).to include(I18n.t('administration.skills.translations.import.errors.skill_not_found',
                                         id: 999_999))
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
          ID,Locale,Name,Description
          #{other_skill.id},en,Updated Name,Updated Description
        CSV
      end

      it 'returns error message' do
        result = described_class.new(file_url, project.id).call
        expect(result).to include(I18n.t('administration.skills.translations.import.errors.skill_not_found',
                                         id: other_skill.id))
      end
    end

    context 'with missing required fields' do
      let(:valid_csv_content) do
        <<~CSV
          ID,Locale,Name
          #{skill.id},en,Updated Name
        CSV
      end

      it 'returns error message' do
        result = described_class.new(file_url, project.id).call
        expect(result).to include(I18n.t('administration.skills.translations.import.errors.missing_columns',
                                         fields: 'Description'))
      end
    end

    context 'with download errors' do
      context 'when URL is invalid' do
        let(:file_url) { 'not-a-valid-url' }

        it 'returns error for invalid URL' do
          result = described_class.new(file_url, project.id).call
          expect(result.first).to include('Invalid URL')
        end
      end

      context 'when file is not accessible' do
        before do
          stub_request(:get, file_url).to_return(status: 404)
        end

        it 'returns error for failed download' do
          result = described_class.new(file_url, project.id).call
          expect(result.first).to include('Failed to download file')
        end
      end
    end

    context 'with nil project_id parameter' do
      let(:global_skill) { create(:skill, project: nil) }

      let(:valid_csv_content) do
        <<~CSV
          ID,Locale,Name,Description
          #{global_skill.id},en,Updated Global Name,Updated Global Description
        CSV
      end

      it 'updates global skill translations' do
        result = described_class.new(file_url, nil).call
        expect(result).to eq(true)

        I18n.with_locale(:en) do
          global_skill.reload
          expect(global_skill.name).to eq('Updated Global Name')
          expect(global_skill.description).to eq('Updated Global Description')
        end
      end
    end
  end
end
