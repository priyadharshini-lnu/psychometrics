# frozen_string_literal: true

module Integrations
  class BaseForm < Rectify::Form
    attribute :name, String
    attribute :active, Boolean
    attribute :config, Hash

    validates :name, presence: true
    validate :unique_integration_name

    def unique_integration_name
      scope = context.project.integrations.where(name: name)
      scope = scope.where.not(id: context.integration.id) if context.integration
      errors.add(:name, :not_unique) if scope.exists?(name: name)
    end

    def attributes
      attrs = super
      common_integration_attributes = ::Integrations::BaseForm.attribute_set.map(&:name)
      config = attrs.except(*common_integration_attributes)
      attrs.slice(*common_integration_attributes).merge(config: config)
    end
  end
end
