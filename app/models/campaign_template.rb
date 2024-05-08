# frozen_string_literal: true

class CampaignTemplate < ApplicationRecord
  audited

  belongs_to :assessment
  belongs_to :report
  belongs_to :owner, class_name: 'Client'
end
