# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportProficiencyLevelsJob, type: :job do
  let(:project) { Project.find(create(:project, name: 'Test Project').id) }
  let(:skill) { create(:skill, name: 'Test Skill') }
  let!(:proficiency_level) do
    create(:proficiency_level,
           project_id: project.id,
           skill: skill,
           proficiency_type: 'by_skill',
           skill_type: 'technical',
           level: 3,
           level_definition: [
             {
               'level' => '1',
               'name' => 'Beginner',
               'description' => 'Basic knowledge'
             },
             {
               'level' => '2',
               'name' => 'Intermediate',
               'description' => 'Working knowledge'
             },
             {
               'level' => '3',
               'name' => 'Advanced',
               'description' => 'Expert knowledge'
             }
           ])
  end

  let(:record) { create(:admin_job_record, data: { 'project_id' => project.id }) }
  let(:job) { described_class.new(record) }

  describe '#headers' do
    it 'returns correct headers with repeated level columns' do
      expected_headers = %w[
        ID Project ProficiencyType SkillType SkillName TotalLevels
        Level1 Name1 Description1
        Level2 Name2 Description2
        Level3 Name3 Description3
      ]

      expect(job.headers).to eq(expected_headers)
    end

    context 'when no proficiency levels exist' do
      before do
        proficiency_level.destroy
      end

      it 'returns only base headers' do
        expected_headers = %w[
          ID Project ProficiencyType SkillType SkillName TotalLevels
        ]

        expect(job.headers).to eq(expected_headers)
      end
    end
  end

  describe '#data_row' do
    it 'returns flattened data with all levels in single row' do
      expected_row = [
        proficiency_level.id,
        project.id,
        'by_skill',
        'technical',
        'Test Skill',
        3,
        '1', 'Beginner', 'Basic knowledge',
        '2', 'Intermediate', 'Working knowledge',
        '3', 'Advanced', 'Expert knowledge'
      ]

      expect(job.data_row(proficiency_level)).to eq(expected_row)
    end

    context 'when level_definition is missing some levels' do
      let(:proficiency_level_with_gaps) do
        create(:proficiency_level,
               project: project,
               skill: skill,
               proficiency_type: 'by_skill',
               skill_type: 'technical',
               level: 3,
               level_definition: [
                 { 'level' => '1', 'name' => 'Beginner', 'description' => 'Basic knowledge' },
                 { 'level' => '3', 'name' => 'Advanced', 'description' => 'Expert knowledge' }
               ])
      end

      it 'skips missing levels' do
        expected_row = [
          proficiency_level_with_gaps.id,
          project.id,
          'by_skill',
          'technical',
          'Test Skill',
          3,
          '1', 'Beginner', 'Basic knowledge',
          '3', 'Advanced', 'Expert knowledge'
        ]

        expect(job.data_row(proficiency_level_with_gaps)).to eq(expected_row)
      end
    end
  end

  describe '#file_name' do
    context 'with project' do
      it 'includes project name in filename' do
        expect(job.file_name).to eq('Test Project-proficiency_levels.csv')
      end
    end

    context 'without project' do
      let(:record) { create(:admin_job_record, data: {}) }

      it 'returns generic filename' do
        expect(job.file_name).to eq('proficiency_levels.csv')
      end
    end
  end

  describe '#generate_title_link' do
    context 'with project' do
      it 'returns project-specific export path' do
        expect(job.generate_title_link).to eq({
          href: "/admin/projects/#{project.id}/proficiency_levels/export",
          label: 'Test Project'
        })
      end
    end

    context 'without project' do
      let(:record) { create(:admin_job_record, data: {}) }

      it 'returns general export path' do
        expect(job.generate_title_link).to eq({
          href: '/admin/proficiency_levels/export',
          label: 'Proficiency Levels Export'
        })
      end
    end
  end
end
