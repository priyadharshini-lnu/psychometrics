# frozen_string_literal: true

class UserReportEvent < ApplicationRecord
  audited

  belongs_to :initiator, class_name: 'User'
  belongs_to :user_report

  include Tenantable

  tenant_source :user_report
end
