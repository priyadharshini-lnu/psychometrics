# frozen_string_literal: true

module Idp::DevelopmentAction
  class UserIdpDevelopmentActionForm < Rectify::Form
    attribute :custom_action, String
    attribute :start_date_time, String
    attribute :end_date_time, String
    attribute :private, Boolean
    attribute :progress, Integer

    DATE_TIME_FORMAT = /\A\d{4}-\d{2}-\d{2} \d{2}:\d{2}\z/

    validates :start_date_time, format: { with: DATE_TIME_FORMAT }, allow_blank: true
    validates :end_date_time, format: { with: DATE_TIME_FORMAT }, allow_blank: true
    validates :progress, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 },
allow_blank: true
    validates :private, inclusion: [true, false], allow_blank: true
  end
end
