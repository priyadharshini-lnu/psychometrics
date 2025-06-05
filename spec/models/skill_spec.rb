# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skill, type: :model do
  # Association tests
  it { should belong_to(:project).optional }
  it { should have_many(:skills_job_roles) }
  it { should have_many(:job_roles).through(:skills_job_roles) }
  it { should have_many(:skills_development_actions).dependent(:destroy) }
  it { should have_many(:development_actions).through(:skills_development_actions) }

  # Enum tests
  it { should define_enum_for(:skill_type).with_values(behavioral: 0, technical: 1, other: 2) }

  # Translation tests
  describe 'translations' do
    it 'translates name and description' do
      I18n.with_locale(:en) do
        skill = create(:skill, name_en: 'Leadership', description_en: 'Leadership skills')

        I18n.with_locale(:es) do
          skill.name = 'Liderazgo'
          skill.description = 'Habilidades de liderazgo'
          skill.save
        end

        # Check English translations
        expect(skill.name).to eq('Leadership')
        expect(skill.description).to eq('Leadership skills')

        I18n.with_locale(:es) do
          expect(skill.name).to eq('Liderazgo')
          expect(skill.description).to eq('Habilidades de liderazgo')
        end
      end
    end
  end

  # Scope tests
  describe 'scopes' do
    let!(:project) { Project.find(create(:project).id) }
    let!(:project_skill) { create(:skill, project: project) }
    let!(:global_skill) { create(:skill, project: nil) }
    let!(:other_project_skill) { create(:skill, project: Project.find(create(:project).id)) }

    describe '.global' do
      it 'returns only global skills (without project)' do
        expect(described_class.global).to include(global_skill)
        expect(described_class.global).not_to include(project_skill)
        expect(described_class.global).not_to include(other_project_skill)
      end
    end

    describe '.project_id_eq' do
      it 'returns skills for the specified project' do
        expect(described_class.project_id_eq(project.id)).to include(project_skill)
        expect(described_class.project_id_eq(project.id)).not_to include(global_skill)
        expect(described_class.project_id_eq(project.id)).not_to include(other_project_skill)
      end
    end

    describe '.all_skills' do
      it 'returns all skills' do
        expect(described_class.all_skills).to include(project_skill, global_skill, other_project_skill)
      end
    end
  end

  # Ransack configuration tests
  describe 'ransackable attributes' do
    it 'returns the allowed ransackable attributes' do
      expect(described_class.ransackable_attributes).to match_array(%w[id name skill_type project_id])
    end
  end

  describe 'ransackable associations' do
    it 'returns the allowed ransackable associations' do
      expect(described_class.ransackable_associations).to match_array(%w[job_roles project])
    end
  end

  describe 'ransackable scopes' do
    it 'returns the allowed ransackable scopes' do
      expect(described_class.ransackable_scopes).
        to match_array(%w[all_skills by_project filter_by_skill_type global filterable_fields by_idp_template_id])
    end
  end

  # Tagging tests
  describe 'tagging' do
    let(:project) { Project.find(create(:project).id) }
    let(:skill) { create(:skill) }

    it 'can be tagged' do
      skill.tag_list.add('important', 'technical')
      skill.save
      expect(skill.tag_list).to match_array(%w[important technical])
    end

    it 'scopes tags by project' do
      skill.project = project
      skill.tag_list.add('project-specific')
      skill.save
      expect(skill.taggings.first.tenant).to eq(project.id.to_s)
    end
  end
end
