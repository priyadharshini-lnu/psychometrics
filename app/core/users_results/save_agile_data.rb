# frozen_string_literal: true

module UsersResults
  class SaveAgileData < BaseCommand
    private_attr_accessor :user_result, :form

    def initialize(user_result, form)
      @user_result = user_result
      @form = form
    end

    def call
      answers = user_result.answers.presence || []
      answers << form.attributes
      completed_groups = user_result.meta_data['completed_groups'] || []
      completed_groups << form.group_id

      attributes = { meta_data: user_result.meta_data.merge('completed_groups' => completed_groups.uniq) }
      attributes[user_result.answer_key] = answers

      user_result.update!(attributes)

      broadcast :ok, user_result
    end
  end
end
