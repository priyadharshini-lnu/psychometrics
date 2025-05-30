# frozen_string_literal: true

require 'rails_helper'

describe DevelopmentPlanSummarySerializer do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:behavioral_skill) { create(:skill, skill_type: :behavioral) }
  let(:technical_skill) { create(:skill, skill_type: :technical) }
  let(:other_skill) { create(:skill, skill_type: :other) }
  let(:structured_learning) { create(:development_action, learning_style: :structured_learning) }
  let(:learning_from_others) { create(:development_action, learning_style: :learning_from_others) }
  let(:on_the_job) { create(:development_action, learning_style: :on_the_job) }

  let!(:development_actions) do
    [
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: behavioral_skill,
development_action: structured_learning, progress: 30),

      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
development_action: learning_from_others, progress: 70),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: technical_skill,
development_action: on_the_job, progress: 0),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, skill: other_skill,
development_action: on_the_job, progress: 90)
    ]
  end

  subject(:serializer) { described_class.new(context: {}).serialize(user) }

  describe '#skills_by_skill_type_count' do
    it 'returns the count of development actions grouped by skills skill_type' do
      skills_by_skill_type_count = serializer.deep_symbolize_keys[:skills_by_skill_type_count]

      expect(skills_by_skill_type_count).to eq(
        behavioral: 1,
        technical: 2,
        other: 1
      )
    end
  end

  describe '#development_actions_by_learning_style_count' do
    it 'returns the count of development actions grouped by learning style' do
      by_learning_style_count = serializer.deep_symbolize_keys[:development_actions_by_learning_style_count]

      expect(by_learning_style_count).to eq(
        structured_learning: 1,
        learning_from_others: 1,
        on_the_job: 2
      )
    end
  end

  describe '#skill_progress_by_skill_type' do
    it 'returns the avarage progress of development actions grouped by skills skill_type' do
      skill_progress_by_skill_type = serializer.deep_symbolize_keys[:skill_progress_by_skill_type]

      expect(skill_progress_by_skill_type).to eq(
        behavioral: 30.0,
        technical: 35.0,
        other: 90.0
      )
    end
  end
end
