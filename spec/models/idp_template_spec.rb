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

      it 'is invalid without skills when any skill setting is selected' do
        idp_template.behavioral_global_skill_settings = 'selected'
        idp_template.skills = []

        expect(idp_template).not_to be_valid
        expect(idp_template.errors[:skills]).to include('must be present if any skill setting is selected')
      end

      it 'is valid with skills when a skill setting is selected' do
        skill = create(:skill)
        idp_template.behavioral_global_skill_settings = 'selected'
        idp_template.skills << skill

        expect(idp_template).to be_valid
      end
    end
  end
end
