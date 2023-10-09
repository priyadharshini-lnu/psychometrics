# frozen_string_literal: true

class Api::V2::Administration::UserAvailabilityDateResource < Api::V2::Administration::BaseResource
  attributes :start_date, :end_date, :timezone, :availability_days

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
