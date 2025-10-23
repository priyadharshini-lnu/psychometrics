# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdpTemplate, type: :model do
  describe 'associations' do
    it { should belong_to(:project).class_name('Client') }
    it { should belong_to(:report) }
    it { should have_many(:idp_template_skills).dependent(:destroy) }
    it { should have_many(:skills).through(:idp_template_skills).dependent(:destroy) }
    it { should have_many(:idp_template_development_actions).dependent(:destroy) }
    it { should have_many(:development_actions).through(:idp_template_development_actions).dependent(:destroy) }
  end

  describe 'validations' do
    let(:project_manager) { create(:user) }
    let(:project) do
      create(:client,
             number: '12345',
             country: 'USA',
             year: Time.current.year,
             project_manager: project_manager)
    end
    let(:report) { create(:report) }
    let(:idp_template) { build(:idp_template, project: project, report: report) }
    let(:skill) { create(:skill) }

    context 'skill settings inclusion' do
      it 'allows valid skill settings' do
        IdpTemplate::VALID_SKILL_SETTINGS.each do |setting|
          idp_template.behavioral_global_skill_settings = setting
          idp_template.behavioral_client_skill_settings = 'none'
          idp_template.technical_global_skill_settings = 'none'
          idp_template.technical_client_skill_settings = 'none'

          if setting == 'selected'
            idp_template.skills = [skill]
          end

          expect(idp_template).to be_valid
        end
      end

      it 'rejects invalid skill settings' do
        idp_template.behavioral_global_skill_settings = 'invalid_setting'
        expect(idp_template).not_to be_valid
        expect(idp_template.errors[:behavioral_global_skill_settings]).to include('is not included in the list')
      end

      it 'allows blank skill settings' do
        idp_template.behavioral_global_skill_settings = nil
        expect(idp_template).to be_valid
      end
    end

    context 'skills presence validation' do
      it 'is valid without skills when no skill setting is selected' do
        idp_template.behavioral_global_skill_settings = 'none'
        idp_template.behavioral_client_skill_settings = 'none'
        idp_template.technical_global_skill_settings = 'none'
        idp_template.technical_client_skill_settings = 'none'

        expect(idp_template).to be_valid
      end

      it 'is invalid without skills and tags when any skill setting is selected' do
        idp_template.behavioral_global_skill_settings = 'selected'
        idp_template.skills = []
        idp_template.behavioural_global_tags = []

        expect(idp_template).not_to be_valid
        expect(idp_template.errors[:behavioral_global_skill_settings]).to include(
          I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')
        )
      end

      it 'is valid with skills when a skill setting is selected' do
        skill = create(:skill, skill_type: 'behavioral', project: nil)
        idp_template.behavioral_global_skill_settings = 'selected'
        idp_template.behavioural_global_tags = []
        idp_template.skills << skill

        expect(idp_template).to be_valid
      end

      it 'is valid with tags when a skill setting is selected' do
        idp_template.behavioral_global_skill_settings = 'selected'
        idp_template.behavioural_global_tags = %w[tag1 tag2]

        expect(idp_template).to be_valid
      end
    end
  end

  describe '#available_skills' do
    let!(:project) { Project.find(create(:project).id) }
    let!(:idp_template) { create(:idp_template, project: project) }

    before do
      # Enable global skills feature for the project
      project.project_feature&.update(global_skills: true)
    end

    let!(:global_technical_skill) { create(:skill, skill_type: 'technical', project: nil) }
    let!(:global_behavioral_skill) { create(:skill, skill_type: 'behavioral', project: nil) }
    let!(:client_technical_skill) { create(:skill, skill_type: 'technical', project: project) }
    let!(:client_behavioral_skill) { create(:skill, skill_type: 'behavioral', project: project) }

    context 'when all settings are none' do
      before do
        idp_template.update!(
          technical_global_skill_settings: 'none',
          technical_client_skill_settings: 'none',
          behavioral_global_skill_settings: 'none',
          behavioral_client_skill_settings: 'none'
        )
      end

      it 'returns no skills' do
        expect(idp_template.available_skills).to be_empty
      end
    end

    context 'when all settings are all' do
      let!(:project2) { Project.find(create(:project).id) }
      let!(:skill_owned_by_project2) { create(:skill, skill_type: 'technical', project: project2) }

      before do
        idp_template.update!(
          technical_global_skill_settings: 'all',
          technical_client_skill_settings: 'all',
          behavioral_global_skill_settings: 'all',
          behavioral_client_skill_settings: 'all'
        )
      end

      it 'returns all skills' do
        expect(idp_template.available_skills).to match_array([
          global_technical_skill,
          global_behavioral_skill,
          client_technical_skill,
          client_behavioral_skill
        ])
      end

      it 'does not include skills owned by other projects' do
        expect(idp_template.available_skills).not_to include(skill_owned_by_project2)
      end
    end

    context 'when some settings are selected' do
      let!(:selected_global_technical_skill) { create(:skill, skill_type: 'technical', project: nil) }
      let!(:selected_client_behavioral_skill) { create(:skill, skill_type: 'behavioral', project: project) }

      before do
        idp_template.skills << selected_global_technical_skill
        idp_template.skills << selected_client_behavioral_skill

        idp_template.update!(
          technical_global_skill_settings: 'selected',
          technical_client_skill_settings: 'none',
          behavioral_global_skill_settings: 'none',
          behavioral_client_skill_settings: 'selected'
        )
      end

      it 'returns only selected skills for specified settings' do
        expect(idp_template.available_skills).to match_array([
          selected_global_technical_skill,
          selected_client_behavioral_skill
        ])
      end
    end

    context 'when skills have tags' do
      let!(:global_tagged_skill) { create(:skill, skill_type: 'technical', project: nil) }
      let!(:client_tagged_skill) { create(:skill, skill_type: 'technical', project: project) }
      let!(:client_tagged_behavioral_skill) { create(:skill, skill_type: 'technical', project: project) }
      let!(:selected_global_technical_skill) { create(:skill, skill_type: 'technical', project: nil) }

      before do
        idp_template
        global_tagged_skill.tag_list.add('global_tech')
        global_tagged_skill.save!

        client_tagged_skill.tag_list.add('client_tech')
        client_tagged_skill.save!

        idp_template.skills << selected_global_technical_skill

        idp_template.update!(
          technical_global_tags: ['global_tech'],
          technical_client_tags: ['client_tech'],
          technical_global_skill_settings: 'selected',
          technical_client_skill_settings: 'selected',
          behavioral_global_skill_settings: 'none',
          behavioral_client_skill_settings: 'none'
        )
      end

      it 'includes skills matching the tags according to the settings' do
        expect(idp_template.available_skills).to include(global_tagged_skill,
                                                         client_tagged_skill, selected_global_technical_skill)
      end

      it 'does not include skills matching the tags but not part of tag settings' do
        # client_tagged_behavioral_skill is not included because behavioral_*_tags are not set
        expect(idp_template.available_skills).not_to include(client_tagged_behavioral_skill)
      end
    end

    context 'with mixed settings' do
      let!(:selected_client_technical_skill) { create(:skill, skill_type: 'technical', project: project) }

      before do
        idp_template.skills << selected_client_technical_skill

        idp_template.update!(
          technical_global_skill_settings: 'all',
          technical_client_skill_settings: 'selected',
          behavioral_global_skill_settings: 'none',
          behavioral_client_skill_settings: 'all'
        )
      end

      it 'returns correct combination of skills' do
        expect(idp_template.available_skills).to match_array([
          global_technical_skill,
          selected_client_technical_skill,
          client_behavioral_skill
        ])
      end
    end
  end
end
