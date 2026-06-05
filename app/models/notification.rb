# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :membership
  belongs_to :assessment

  include Tenantable

  tenant_source :assessment, :membership

  validates :text, presence: true
end
