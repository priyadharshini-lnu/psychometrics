# frozen_string_literal: true

FactoryBot.define do
  factory :ai_question_scoring_session, class: 'AI::QuestionScoringSession' do
    association :user
    association :question, factory: :question
    association :user_assessment, factory: :user_assessment

    assistable_type { 'Question' }
    assistable { question }
    resource_type { 'UserAssessment' }
    resource { user_assessment }
    status { :completed }
    checkpoint do
      {
        '1' => {
          'score' => 4.0,
          'confidence' => 0.85,
          'citations' => ['Example citation'],
          'rationale' => 'Good performance'
        }
      }
    end
  end
end
