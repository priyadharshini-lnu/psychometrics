# frozen_string_literal: true

module UsersResults
  class ExtendResourceParams < BaseCommand
    private_attr_reader :resource_params, :question_ids, :users_result

    def initialize(resource_params, question_ids, users_result)
      @resource_params = resource_params
      @question_ids = question_ids
      @users_result = users_result
    end

    def call
      return broadcast :ok, status: :completed if users_result.expired?

      params = resource_params.merge('last_activity_at' => Time.current)

      return broadcast :ok, params unless params[answers_key.to_s]

      params_answers = params[answers_key.to_s]

      answers = (users_result[answers_key]&.slice(*params_answers.keys) || {}).deep_merge(params_answers)

      answers = add_duration(answers, question_ids, users_result.last_activity_at)

      broadcast :ok, params.merge(answers_key.to_s => answers)
    end

    private

    def answers_key
      @answers_key ||= users_result.respond_to?(:answers) ? :answers : :results
    end

    def add_duration(answers, question_ids, last_activity_at)
      return answers if question_ids.blank?

      duration = (((Time.current - last_activity_at) * 1000) / question_ids.length).round

      question_ids.reduce(answers) do |extended_answers, question_id|
        extended_answers.deep_merge(question_id.to_s => { 'duration' => duration })
      end
    end
  end
end
