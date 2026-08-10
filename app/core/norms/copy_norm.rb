# frozen_string_literal: true

module Norms
  class CopyNorm < BaseCommand
    private_attr_reader :norm, :user, :owner_id, :new_norm_name, :skip_owner_validation

    def initialize(norm:, user:, owner_id: nil, new_norm_name: nil, skip_owner_validation: false)
      @norm = norm
      @user = user
      @owner_id = owner_id
      @new_norm_name = new_norm_name
      @skip_owner_validation = skip_owner_validation
    end

    def call
      new_norm = norm.clone
      new_norm.created_by = user
      new_norm.updated_by = user
      new_norm.name = new_norm_name if new_norm_name.present?
      new_norm.owner_id = owner_id || norm.owner_id
      new_norm.skip_owner_validation = skip_owner_validation
      new_norm.save!

      broadcast :ok, new_norm
    end
  end
end
