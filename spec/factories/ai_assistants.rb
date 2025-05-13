# frozen_string_literal: true

FactoryBot.define do
  factory :ai_assistant, class: 'AI::Assistant' do
    sequence(:name) { |n| "Assistant #{n}" }
    sequence(:action) { |n| "action_#{n}" }
    description { 'Assistant description' }
    user_prompt { 'User prompt for testing' }
    system_prompt { 'System prompt for testing' }

    transient do
      project_manager { create(:user) }
    end

    association :owner, factory: :tenancy
    association :last_modified_by, factory: :user
  end
end
