# frozen_string_literal: true

module Users
  class GetCustomProfileFields < BaseCommand
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      question_ids = user.profile_fields.pluck(:question_id)
      questions = Question.where(id: question_ids).select(:id, :props).index_by(&:id)

      profile_fields = question_ids.each_with_object([]) do |qid, array|
        question = questions[qid]
        array << {
          name: ActionController::Base.helpers.strip_tags(question.props['questionText']),
          value: user.user_profile.custom_fields[qid]
        }
      end

      broadcast :ok, profile_fields
    end
  end
end
