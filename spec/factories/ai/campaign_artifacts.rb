# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_ai_artifact, class: 'AI::CampaignArtifact' do
    association :campaign
    association :ai_assistant, factory: :assistant

    sequence(:name) { |n| "Test Artifact #{n}" }
    sequence(:code) { |n| "test_artifact_#{n}" }

    # Default values for parser dependencies
    instructions { 'Generate a comprehensive report based on user data' }
    include_all_datasheet_columns { false }

    # Using after_create callbacks to set up dependencies through the new relationship structure
    transient do
      datasheet_columns { [] }
      campaign_factors { [] }
      questions { [] }
    end

    after(:create) do |artifact, evaluator|
      if evaluator.datasheet_columns.present?
        campaign = artifact.campaign
        datasheet = campaign.datasheet
        if datasheet
          evaluator.datasheet_columns.each do |column_name|
            sheet_column = datasheet.sheet_columns.find_by(name: column_name)
            if sheet_column
              artifact.dependencies.create!(dependency: sheet_column)
            else
              temp_column = datasheet.sheet_columns.create!(
                name: column_name,
                column_type: 'string'
              )
              artifact.dependencies.create!(dependency: temp_column)
            end
          end
        end
      end

      if evaluator.campaign_factors.present?
        campaign = artifact.campaign
        evaluator.campaign_factors.each do |factor_code|
          factor = campaign.campaign_factors.find_by(code: factor_code)
          if factor
            artifact.dependencies.create!(dependency: factor)
          else
            temp_factor = campaign.campaign_factors.create!(
              name: "Test #{factor_code}",
              code: factor_code,
              description: 'Temporary factor for testing',
              output_type: 'string',
              factor_type: 'campaign_factor' # Add the required factor_type field
            )
            artifact.dependencies.create!(dependency: temp_factor)
          end
        end
      end

      if evaluator.questions.present?
        evaluator.questions.each do |question_id|
          question = Question.find_by(id: question_id)
          if question
            artifact.dependencies.create!(dependency: question)
          end
        end
      end
    end

    trait :with_datasheet_dependency do
      datasheet_columns { %w[name department position] }
    end

    trait :with_campaign_factors_dependency do
      campaign_factors { %w[leadership_score communication_rating] }
    end

    trait :include_all_datasheet do
      include_all_datasheet_columns { true }
      datasheet_columns { [] }
    end
  end
end
