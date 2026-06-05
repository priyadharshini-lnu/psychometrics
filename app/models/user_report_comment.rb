# frozen_string_literal: true

class UserReportComment < ApplicationRecord
  audited

  include SoftDelete

  belongs_to :parent, class_name: 'UserReportComment'
  belongs_to :user_report
  belongs_to :reports_module, class_name: '::Reports::Module'
  belongs_to :creator, class_name: 'User'
  has_one :campaign, through: :user_report
  has_many :replies, foreign_key: :parent_id, class_name: 'UserReportComment'

  include Tenantable

  tenant_source :user_report

  def self.ransackable_attributes(_auth_object = nil)
    %w[id parent_id]
  end
end
