# frozen_string_literal: true

module SoftDelete
  extend ActiveSupport::Concern

  included do
    belongs_to :deleted_by, class_name: 'User'

    scope :deleted, -> { where.not(deleted_at: nil) }
    scope :not_deleted, -> { where(deleted_at: nil) }

    scope :with_resource_state, lambda { |state|
      return archived.not_deleted if state == 'archived'
      return unarchived.not_deleted if state == 'active'

      deleted if state == 'deleted'
    }
  end

  class_methods do
    def ransackable_scopes(_auth_object = nil)
      super.push(:with_resource_state)
    end
  end

  def soft_delete!(deleted_by)
    all_delete_restricted_associations.each do |assoc|
      assoc_name = assoc.name
      assoc_present = assoc.macro == :has_many ? public_send(assoc_name).exists? : !public_send(assoc_name)
      next unless assoc_present

      record_name = self.class.human_attribute_name(assoc_name).downcase
      errors.add(:base, :'restrict_dependent_destroy.has_many', record: record_name)
      break
    end
    update!(deleted_at: Time.zone.now, deleted_by: deleted_by) if errors.empty?
  end

  def deleted?
    deleted_at.present?
  end

  def restore!
    update!(deleted_at: nil, deleted_by: nil)
  end

  private

  def all_delete_restricted_associations
    self.class.reflect_on_all_associations.select do |a|
      %i[restrict_with_error restrict_with_exception].include?(a.options[:dependent])
    end
  end
end
