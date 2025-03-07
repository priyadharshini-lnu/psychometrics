# frozen_string_literal: true

module OwnerValidations
  extend ActiveSupport::Concern

  included do
    attr_accessor :skip_owner_validation

    validates :owner_id, owner_permission: true,
      on: %i[create update], if: -> { (owner_id_changed? || owner_id.nil?) && !skip_owner_validation }
  end
end
