# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  audited

  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User', optional: true

  validates :provider_id, presence: true
end
