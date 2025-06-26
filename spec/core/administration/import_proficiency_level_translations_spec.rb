# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportProficiencyLevelTranslations do
  let(:project) { Project.find(create(:project).id) }
  let!(:proficiency_level) do
    create(:proficiency_level,
           project_id: project.id,
           level_definition: [
             {
               'level' => 1,
               'name' => 'Level 1',
               'description' => 'Description 1'
             },
             {
               'level' => 2,
               'name' => 'Level 2',
               'description' => 'Description 2'
             },
             {
               'level' => 3,
               'name' => 'Level 3',
               'description' => 'Description 3'
             }
           ])
  end

  let(:csv_data) do
    [
      ['ID', 'English / en', 'French / fr', 'German / de'],
      ["#{proficiency_level.id}#LevelDefinition.$[1].name", 'Level 1 EN', 'Level 1 FR', 'Level 1 DE'],
      ["#{proficiency_level.id}#LevelDefinition.$[1].description", 'Description 1 EN', 'Description 1 FR',
       'Description 1 DE'],
      ["#{proficiency_level.id}#LevelDefinition.$[2].name", 'Level 2 EN', 'Level 2 FR', 'Level 2 DE'],
      ["#{proficiency_level.id}#LevelDefinition.$[2].description", 'Description 2 EN', 'Description 2 FR',
       'Description 2 DE'],
      ["#{proficiency_level.id}#LevelDefinition.$[3].name", 'Level 3 EN', 'Level 3 FR', 'Level 3 DE'],
      ["#{proficiency_level.id}#LevelDefinition.$[3].description", 'Description 3 EN', 'Description 3 FR',
       'Description 3 DE']
    ]
  end
  let(:file) { double('file', url: 'https://example.com/translations.csv') }

  before do
    allow(CsvFileParser).to receive(:call!).with(file).and_return(csv_data)
    allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
  end

  describe '#call' do
    context 'with valid CSV data' do
      it 'imports translations successfully' do
        result = described_class.new(file, project.id).call
        expect(result).to eq true

        # Verify translations
        level = proficiency_level.reload

        # Verify each translation separately
        [1, 2, 3].each do |level_num|
          Mobility.with_locale(:en) do
            level_def = level.level_definition.find { |d| d['level'] == level_num }
            expect(level_def['name']).to eq("Level #{level_num} EN")
            expect(level_def['description']).to eq("Description #{level_num} EN")
          end

          Mobility.with_locale(:fr) do
            level_def = level.level_definition.find { |d| d['level'] == level_num }
            expect(level_def['name']).to eq("Level #{level_num} FR")
            expect(level_def['description']).to eq("Description #{level_num} FR")
          end

          Mobility.with_locale(:de) do
            level_def = level.level_definition.find { |d| d['level'] == level_num }
            expect(level_def['name']).to eq("Level #{level_num} DE")
            expect(level_def['description']).to eq("Description #{level_num} DE")
          end
        end
      end
    end

    context 'with invalid proficiency level ID' do
      let(:csv_data) do
        [
          ['ID', 'English / en', 'French / fr', 'German / de'],
          ['99999#LevelDefinition.$[1].name', 'Invalid Level', 'Niveau invalide', 'Ungültiges Level']
        ]
      end

      it 'returns error message' do
        result = described_class.new(file, project.id).call
        expect(result).to include(I18n.t('administration.proficiency_levels.translations.import.errors.level_not_found',
                                         level_id: '99999'))
      end
    end

    context 'with missing required columns' do
      let(:csv_data) do
        [
          ['Name', 'French / fr', 'German / de'],
          ['Test', 'Test FR', 'Test DE']
        ]
      end

      it 'returns error message' do
        result = described_class.new(file, project.id).call
        expect(result).to include(I18n.t('administration.proficiency_levels.translations.import.errors.missing_columns',
                                         fields: 'ID'))
      end
    end
  end
end
