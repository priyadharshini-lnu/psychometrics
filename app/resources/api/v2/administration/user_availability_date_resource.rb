# frozen_string_literal: true

class Api::V2::Administration::UserAvailabilityDateResource < Api::V2::Administration::BaseResource
  attributes :start_date, :end_date, :timezone, :availability_days

  audit_log_for :create, payload: '*', parent_resource: ->(_, _) { { client: Current.client } }
  audit_log_for :update, payload: '*', parent_resource: ->(_, _) { { client: Current.client } }
  audit_log_for :destroy, payload: lambda { |_, record|
    record.try(:log_attribute_for_delete)
  }, parent_resource: lambda { |_, _|
    { client: Current.client }
  }

  has_many :user_availability_days

  before_create -> { @model.user = context[:user] }

  ransack_filters %i[end_date_gteq]

  def self.default_sort
    [{ field: 'start_date', direction: :asc }]
  end

  def fetchable_fields
    super - [:availability_days]
  end

  def availability_days=(data)
    @model.user_availability_day_ids = []
    data.each { |day| @model.user_availability_days.build(day) }
  end
end
