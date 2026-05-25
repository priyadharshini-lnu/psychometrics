# frozen_string_literal: true

class CampaignTemplate < ApplicationRecord
  audited

  include RansackSearchableFields

  belongs_to :assessment
  belongs_to :report
  belongs_to :owner, class_name: 'Client'
  belongs_to :campaign, optional: true

  include Tenantable

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
