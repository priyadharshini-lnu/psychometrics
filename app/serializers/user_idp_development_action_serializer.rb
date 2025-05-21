# frozen_string_literal: true

class UserIdpDevelopmentActionSerializer < Panko::Serializer
  attributes :custom_action_learning_style, :custom_action, :start_date_time, :end_date_time, :progress,
             :learning_style, :type

  def type
    return 'custom_action' if object.custom_action?
    return 'library' if object.development_action

    'ai_generated'
  end
end
