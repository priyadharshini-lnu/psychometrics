# frozen_string_literal: true

class UserIdpDevelopmentActionSerializer < Panko::Serializer
  attributes :start_date_time, :end_date_time, :progress,
             :learning_style, :name, :description, :source_type

  delegate :name, :description, :learning_style, :source_type, to: :development_action
end
