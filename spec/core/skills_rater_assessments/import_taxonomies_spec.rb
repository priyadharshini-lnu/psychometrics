# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SkillsRaterAssessments::ImportTaxonomies do
  let(:file_path) do
    Rails.root.join('spec/fixtures/files/skills_rater_assessments/valid_file.xlsx')
  end

  describe 'project specific import' do
    let(:project) { create(:project) }
    let(:service) { described_class.new(file_path: file_path, project: project) }

    it 'imports taxonomy data successfully from the Excel file' do
      expect { service.call }.to change { project.job_groups.count }.by(3).
        and change { project.job_roles.count }.by(1).
        and change { project.skill_groups.count }.by(4).
        and change { project.skills.count }.by(2).
        and change { project.taxonomy_levels.count }.by(5).
        and change { SkillsJobRole.count }.by(1)

      job_levels = project.taxonomy_levels.where(hierarchy_type: 'job_group').order(:depth)
      expect(job_levels.pluck(:label)).to eq(['Job Family', 'Job Sub-Family', 'Job Specialization'])

      skill_levels = project.taxonomy_levels.where(hierarchy_type: 'skill_group').order(:depth)
      expect(skill_levels.pluck(:label)).to eq(['Skill Category', 'Skill Sub-Category'])

      job_family = project.job_groups.find_by(ancestry: nil)
      expect(job_family.name).to eq('Software Development')
      expect(job_family.level_label).to eq('Job Family')

      job_subfamily = job_family.children.find_by(name: 'Programming')
      expect(job_subfamily).to be_present
      expect(job_subfamily.level_label).to eq('Job Sub-Family')

      job = job_subfamily.children.find_by(name: 'Backend Development')
      expect(job).to be_present
      expect(job.level_label).to eq('Job Specialization')

      job_role = project.job_roles.find_by(code: 'RAILS')
      expect(job_role).to be_present
      expect(job_role.name).to eq('Rails developer - Mid level')
      expect(job_role.description).to include('Mid Rails dev')
      expect(job_role.job_group).to eq(job)

      skill_category = project.skill_groups.find_by(name: 'Technical Skill', ancestry: nil)
      expect(skill_category).to be_present
      expect(skill_category.level_label).to eq('Skill Category')

      skill_subcategory = skill_category.children.find_by(name: 'Backend Technology')
      expect(skill_subcategory).to be_present
      expect(skill_subcategory.level_label).to eq('Skill Sub-Category')

      skill = project.skills.find_by(name: 'Rails framework')
      expect(skill).to be_present
      expect(skill.skill_group).to eq(skill_subcategory)
      expect(skill.skill_type).to eq('technical')
      expect(skill.description).to include('HRCI')

      skill_job_role = SkillsJobRole.find_by(job_role: job_role, skill: skill)
      expect(skill_job_role).to be_present
      expect(skill_job_role.expected_proficiency_level).to eq(2)
    end

    context 'when importing the same file twice' do
      before { service.call }

      it 'does not create duplicate records' do
        expect { service.call }.not_to(change { project.reload.taxonomy_levels.count })
        expect { service.call }.not_to(change { project.job_groups.count })
      end
    end
  end

  describe 'global import' do
    let(:service) { described_class.new(file_path: file_path, project: nil) }

    it 'imports taxonomy data successfully' do
      expect { service.call }.to change { JobGroup.where(project_id: nil).count }.by(3).
        and change { JobRole.where(project_id: nil).count }.by(1).
        and change { SkillGroup.where(project_id: nil).count }.by(4).
        and change { Skill.where(project_id: nil).count }.by(2).
        and change { TaxonomyLevel.where(project_id: nil).count }.by(5).
        and change { SkillsJobRole.count }.by(1)

      job_levels = TaxonomyLevel.where(hierarchy_type: 'job_group', project_id: nil).order(:depth)
      expect(job_levels.pluck(:label)).to eq(['Job Family', 'Job Sub-Family', 'Job Specialization'])

      job_family = JobGroup.find_by(project_id: nil, ancestry: nil)
      expect(job_family.name).to eq('Software Development')

      job_role = JobRole.find_by(project_id: nil, code: 'RAILS')
      expect(job_role.name).to eq('Rails developer - Mid level')
    end

    context 'when importing the same file twice' do
      before { service.call }

      it 'does not create duplicate records' do
        expect { service.call }.not_to(change { TaxonomyLevel.where(project_id: nil).count })
        expect { service.call }.not_to(change { JobGroup.where(project_id: nil).count })
      end
    end

    describe '#import_global_proficiency_levels' do
      let(:project) { create(:project) }
      let(:service) { described_class.new(file_path: file_path, project: project) }

      context 'when no global proficiency levels exist' do
        it 'does nothing' do
          expect(ProficiencyLevel.global).to be_empty
          expect { service.send(:import_global_proficiency_levels) }.not_to change(ProficiencyLevel, :count)
        end
      end

      context 'when global proficiency levels exist' do
        let!(:global_default) { create(:proficiency_level, project_id: nil, proficiency_type: 'default') }
        let!(:global_category1) do
          create(:proficiency_level, project_id: nil, proficiency_type: 'by_type', skill_type: 'technical')
        end
        let!(:global_category2) do
          create(:proficiency_level, project_id: nil, proficiency_type: 'by_type', skill_type: 'behavioral')
        end

        context 'when project has no proficiency levels' do
          it 'imports all global levels' do
            expect { service.send(:import_global_proficiency_levels) }.
              to change(ProficiencyLevel, :count).by(3)

            expect(ProficiencyLevel.where(project_id: project.id).default).to exist
            expect(ProficiencyLevel.where(project_id: project.id).by_type.pluck(:skill_type)).to match_array(
              %w[technical behavioral]
            )
          end
        end

        context 'when project already has default level' do
          before do
            create(:proficiency_level, project: project, proficiency_type: 'default')
          end

          it 'only imports category levels' do
            expect { service.send(:import_global_proficiency_levels) }.
              to change(ProficiencyLevel, :count).by(2)

            expect(ProficiencyLevel.where(project_id: project.id).by_type.pluck(:skill_type)).to match_array(
              %w[technical behavioral]
            )
          end
        end
      end
    end
  end
end
