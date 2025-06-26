# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportProficiencyLevelTranslationsJob, type: :job do
  let(:project) { Project.find(create(:project).id) }
  let!(:proficiency_level) do
    create(:proficiency_level,
           project_id: project.id,
           level_definition: [
             {
               'level' => 1,
               'name' => 'Basic',
               'description' => 'Basic level description'
             },
             {
               'level' => 2,
               'name' => 'Intermediate',
               'description' => 'Intermediate level description'
             },
             {
               'level' => 3,
               'name' => 'Advanced',
               'description' => 'Advanced level description'
             }
           ])
  end

  # Create translations for the proficiency levels
  before do
    Mobility.with_locale(:fr) do
      proficiency_level.update!(
        level_definition: [
          {
            'level' => 1,
            'name' => 'Basique',
            'description' => 'Description niveau basique'
          },
          {
            'level' => 2,
            'name' => 'Intermédiaire',
            'description' => 'Description niveau intermédiaire'
          },
          {
            'level' => 3,
            'name' => 'Avancé',
            'description' => 'Description niveau avancé'
          }
        ]
      )
    end

    Mobility.with_locale(:de) do
      proficiency_level.update!(
        level_definition: [
          {
            'level' => 1,
            'name' => 'Grundlegend',
            'description' => 'Grundlegende Stufe Beschreibung'
          },
          {
            'level' => 2,
            'name' => 'Mittelstufe',
            'description' => 'Mittelstufe Beschreibung'
          },
          {
            'level' => 3,
            'name' => 'Fortgeschritten',
            'description' => 'Fortgeschrittene Stufe Beschreibung'
          }
        ]
      )
    end
  end

  let(:record) { create(:admin_job_record, data: { 'project_id' => project.id }) }
  let(:job) { described_class.new(record) }

  describe '#headers' do
    before do
      allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
      allow(I18n).to receive(:t).with('languages.en').and_return('English')
      allow(I18n).to receive(:t).with('languages.fr').and_return('French')
      allow(I18n).to receive(:t).with('languages.de').and_return('German')
    end

    it 'returns the correct headers for the CSV' do
      expect(job.headers).to eq([
        'ID',
        'English / en',
        'French / fr',
        'German / de'
      ])
    end
  end

  describe '#data_row' do
    before do
      allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
    end

    it 'returns the correct data rows for each level' do
      rows = job.data_row(proficiency_level)

      # Test level 1 translations
      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[1].name",
          'Basic',
          'Basique',
          'Grundlegend'
        ]
      )

      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[1].description",
          'Basic level description',
          'Description niveau basique',
          'Grundlegende Stufe Beschreibung'
        ]
      )

      # Test level 2 translations
      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[2].name",
          'Intermediate',
          'Intermédiaire',
          'Mittelstufe'
        ]
      )

      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[2].description",
          'Intermediate level description',
          'Description niveau intermédiaire',
          'Mittelstufe Beschreibung'
        ]
      )

      # Test level 3 translations
      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[3].name",
          'Advanced',
          'Avancé',
          'Fortgeschritten'
        ]
      )

      expect(rows).to include(
        [
          "#{proficiency_level.id}#LevelDefinition.$[3].description",
          'Advanced level description',
          'Description niveau avancé',
          'Fortgeschrittene Stufe Beschreibung'
        ]
      )
    end
  end

  describe '#file_name' do
    context 'with project' do
      it 'includes project name in the file name' do
        expect(job.file_name).to eq("#{project.name}-proficiency-level-translations.csv")
      end
    end

    context 'without project' do
      let(:record) { create(:admin_job_record, data: {}) }

      it 'returns generic file name' do
        expect(job.file_name).to eq('proficiency-level-translations.csv')
      end
    end
  end
end
