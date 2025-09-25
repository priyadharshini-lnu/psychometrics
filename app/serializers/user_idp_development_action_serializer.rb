# frozen_string_literal: true

class UserIdpDevelopmentActionSerializer < Panko::Serializer
  attributes :id, :start_date_time, :end_date_time, :progress,
             :learning_style, :name, :description, :source_type

  delegate :development_action, to: :object
  delegate :name, :description, :learning_style, :source_type, to: :development_action
end
