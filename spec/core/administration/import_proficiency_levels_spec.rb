# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ImportProficiencyLevels do
  let(:project) { create(:project) }
  let(:file) { double('file', url: 'https://example.com/skills.csv') }

  let(:csv_content) do
    [
      ['ID', 'Project', 'ProficiencyType', 'SkillCategory', 'SkillName', 'TotalLevels', 'Level1', 'Name1',
       'Description1', 'Level2', 'Name2', 'Description2', 'Level3', 'Name3', 'Description3'],
      ['', project.id, 'all_skills', '', '', 3, 1, 'Basic', 'Basic level description', 2, 'Intermediate',
       'Intermediate level description', 3, 'Advanced', 'Advanced level description']
    ]
  end

  describe '#call' do
    before do
      allow(CsvFileParser).to receive(:call!).with(file).and_return(csv_content)
    end

    subject(:import) { described_class.new(file, project_id: project.id).call }

    context 'with valid data' do
      it 'creates a new proficiency level' do
        expect { import }.to change(ProficiencyLevel, :count).by(1)
      end

      it 'sets the correct attributes' do
        import
        proficiency_level = ProficiencyLevel.last

        expect(proficiency_level).to have_attributes(
          project_id: project.id,
          proficiency_type: 'all_skills',
          level: 3
        )

        expect(proficiency_level.level_definition).to match_array([
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
    end

    context 'without id and project columns' do
      let(:csv_content) do
        [
          ['ProficiencyType', 'SkillCategory', 'SkillName', 'TotalLevels', 'Level1', 'Name1',
           'Description1', 'Level2', 'Name2', 'Description2', 'Level3', 'Name3', 'Description3'],
          ['all_skills', '', '', 3, 1, 'Basic', 'Basic level description', 2, 'Intermediate',
           'Intermediate level description', 3, 'Advanced', 'Advanced level description']
        ]
      end

      it 'creates a new proficiency level' do
        expect { import }.to change(ProficiencyLevel, :count).by(1)
      end

      it 'sets the correct attributes' do
        import
        proficiency_level = ProficiencyLevel.last

        expect(proficiency_level).to have_attributes(
          project_id: project.id,
          proficiency_type: 'all_skills',
          level: 3
        )

        expect(proficiency_level.level_definition).to match_array([
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
    end

    context 'with existing record ID' do
      let!(:existing_level) { create(:proficiency_level, project_id: project.id) }
      let(:csv_content) do
        [
          ['ID', 'Project', 'ProficiencyType', 'SkillCategory', 'SkillName', 'TotalLevels', 'Level1', 'Name1',
           'Description1', 'Level2', 'Name2', 'Description2', 'Level3', 'Name3', 'Description3'],
          [existing_level.id, project.id, 'all_skills', '', '', 3, 1, 'Basic', 'Basic level description', 2,
           'Intermediate',
           'Intermediate level description', 3, 'Advanced', 'Advanced level description']
        ]
      end

      it 'updates the existing record' do
        expect { import }.not_to change(ProficiencyLevel, :count)

        existing_level.reload
        expect(existing_level).to have_attributes(
          project_id: project.id,
          proficiency_type: 'all_skills',
          level: 3
        )
      end
    end

    context 'with by_skill proficiency type' do
      let(:skill_name) { 'Test Skill' }
      let!(:existing_skill) { create(:skill, name: skill_name) }
      let(:csv_content) do
        [
          ['ID', 'Project', 'ProficiencyType', 'SkillCategory', 'SkillName', 'TotalLevels', 'Level1', 'Name1',
           'Description1', 'Level2', 'Name2', 'Description2', 'Level3', 'Name3', 'Description3'],
          ['', project.id, 'all_skills', '', skill_name, 3, 1, 'Basic', 'Basic level description', 2, 'Intermediate',
           'Intermediate level description', 3, 'Advanced', 'Advanced level description']
        ]
      end
      it 'saves the skill id' do
        expect { import }.not_to change(Skill, :count)
        expect(ProficiencyLevel.last.skill).to eq(existing_skill)
      end
    end
  end
end
