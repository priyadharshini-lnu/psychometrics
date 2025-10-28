# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpPlanSerializer do
  let(:client) { create(:project) }
  let(:campaign) { create(:campaign, project_id: client.id) }
  let(:idp_template) { create(:idp_template, project_id: client.id) }
  let(:user) { create(:user) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }

  let!(:public_skill) { create(:skill, project_id: client.id, name: 'Public Skill') }
  let!(:private_skill) { create(:skill, project_id: client.id, name: 'Private Skill') }

  let!(:public_user_idp_skill) do
    create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: public_skill, private: false)
  end

  let!(:private_user_idp_skill) do
    create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: private_skill, private: true)
  end

  let!(:public_development_action) do
    create(:user_idp_development_action,
           user_idp_plan: user_idp_plan,
           user_idp_skill: public_user_idp_skill,
           private: false)
  end

  let!(:private_development_action) do
    create(:user_idp_development_action,
           user_idp_plan: user_idp_plan,
           user_idp_skill: private_user_idp_skill,
           private: true)
  end

  let!(:private_action_on_public_skill) do
    create(:user_idp_development_action,
           user_idp_plan: user_idp_plan,
           user_idp_skill: public_user_idp_skill,
           private: true)
  end

  describe 'PDF generation serialization' do
    let(:serializer) { described_class.new }

    it 'excludes private skills from serialization' do
      result = serializer.serialize(user_idp_plan)
      expect(result['user_idp_skills'].count).to eq(1)
      skill_names = result['user_idp_skills'].pluck('name')
      expect(skill_names).to include('Public Skill')
      expect(skill_names).not_to include('Private Skill')
    end

    it 'excludes private development actions from public skills' do
      result = serializer.serialize(user_idp_plan)

      public_skill_data = result['user_idp_skills'].first
      development_action_ids = public_skill_data['user_idp_development_actions'].pluck('id')

      expect(development_action_ids).to include(public_development_action.id)
      expect(development_action_ids).not_to include(private_action_on_public_skill.id)
    end

    it 'ensures private skills and their development actions are completely excluded' do
      result = serializer.serialize(user_idp_plan)

      all_development_action_ids = result['user_idp_skills'].
                                   flat_map { |s| s['user_idp_development_actions'] }.
                                   pluck('id')

      expect(all_development_action_ids).to include(public_development_action.id)
      expect(all_development_action_ids).not_to include(private_development_action.id)
      expect(all_development_action_ids).not_to include(private_action_on_public_skill.id)
    end
  end
end
