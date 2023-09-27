# frozen_string_literal: true

module UsersResults
  class ExtendResourceParams < BaseCommand
    private_attr_reader :resource_params, :question_ids, :users_result, :user_assessment

    def initialize(resource_params, question_ids, user_assessment)
      @resource_params = resource_params
      @question_ids = question_ids
      @user_assessment = user_assessment
      @users_result = user_assessment.users_result
    end

    def call
      if user_assessment.extra_time_buffer_expired?
        return broadcast :ok, status: 'completed', completion_reason: :time_out_online
      end

      params = resource_params.merge('last_activity_at' => Time.current)
      params[:status] = user_assessment.expired? ? 'completed' : params[:status]

      # if status is completed we have to fill in completion reason
      if params[:status] == 'completed'
        params[:completion_reason] = user_assessment.expired? ? :time_out_online : :user_completed
      end

      return broadcast :ok, params unless params[answer_key.to_s]

      params_answers = params[answer_key.to_s]

      answers = (users_result[answer_key]&.slice(*params_answers.keys) || {}).deep_merge(params_answers)

      answers = add_duration(answers, question_ids, user_assessment.last_activity_at)
      answers = merge_with_existing(users_result, answers)

      broadcast :ok, params.merge(answer_key.to_s => answers)
    end

    private

    def answer_key
      @answer_key ||= users_result.answer_key
    end

    def add_duration(answers, question_ids, last_activity_at)
      return answers if question_ids.blank?

      duration = (((Time.current - last_activity_at) * 1000) / question_ids.length).round

      question_ids.reduce(answers) do |extended_answers, question_id|
        extended_answers.deep_merge(question_id.to_s => { 'duration' => duration, 'dirty' => false })
      end
    end

    def merge_with_existing(users_result, answers)
      (users_result.public_send(answer_key) || {}).merge(answers)
    end
  end
end
