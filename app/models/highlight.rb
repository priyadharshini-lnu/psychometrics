# frozen_string_literal: true

class Highlight < ApplicationRecord
  belongs_to :assessment
  belongs_to :user

  include Tenantable

  tenant_source :user
end
