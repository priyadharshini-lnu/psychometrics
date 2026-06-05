# frozen_string_literal: true

class UserBooking < ApplicationRecord
  audited

  belongs_to :user
  belongs_to :booked_by_resource, polymorphic: true

  include Tenantable

  tenant_source :booked_by_resource, :user
end
