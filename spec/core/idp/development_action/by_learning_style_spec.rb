# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::ByLearningStyle do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let(:structured_learning) { create(:development_action, learning_style: :structured_learning) }
  let(:learning_from_others) { create(:development_action, learning_style: :learning_from_others) }
  let(:on_the_job) { create(:development_action, learning_style: :on_the_job) }

  let(:user_idp_development_actions) do
    [
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: structured_learning),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: structured_learning),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: learning_from_others),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: learning_from_others),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: learning_from_others),
      create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: on_the_job)
    ]
  end

  subject(:by_learning_style) { described_class.new(user_idp_development_actions).call }

  it 'returns the count of development actions grouped by learning style' do
    expect(by_learning_style).to eq(
      structured_learning: 2,
      learning_from_others: 3,
      on_the_job: 1
    )
  end

  context 'when there are no development actions for a learning style' do
    let(:user_idp_development_actions) do
      [
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: structured_learning),
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: structured_learning),
        create(:user_idp_development_action, user_idp_plan: user_idp_plan, development_action: learning_from_others)
      ]
    end

    it 'includes the learning style with a count of 0' do
      expect(by_learning_style).to eq(
        structured_learning: 2,
        learning_from_others: 1,
        on_the_job: 0
      )
    end
  end
end
