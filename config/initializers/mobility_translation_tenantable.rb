# frozen_string_literal: true

# Automatically injects Tenantable into every Mobility translation class.

module MobilityTranslationTenantableInjector
  def extended(model_class)
    super
    original_translates = model_class.method(:translates)
    model_class.define_singleton_method(:translates) do |*args, **opts|
      original_translates.call(*args, **opts)
      translation_klass = "#{name}::Translation".safe_constantize
      return unless translation_klass
      return if translation_klass.ancestors.include?(Tenantable)

      translation_klass.instance_variable_set(:@tenant_config_options, { has_global_records: true, optional: true })
      translation_klass.include Tenantable
      translation_klass.tenant_source :translated_model

      parent_fks = translation_klass.
                   reflect_on_all_associations(:belongs_to).
                   reject { |a| a.name == :tenant }.
                   to_set { |a| a.foreign_key.to_sym }

      callbacks_to_remove = translation_klass._validate_callbacks.select do |cb|
        cb.filter.respond_to?(:attributes) &&
          cb.filter.attributes.any? { |a| parent_fks.include?(a.to_sym) }
      end

      callbacks_to_remove.each { |cb| translation_klass._validate_callbacks.delete(cb) }
      parent_fks.each { |fk| translation_klass._validators[fk]&.clear }
    end
  end
end

Rails.application.config.to_prepare do
  unless Mobility.singleton_class.ancestors.include?(MobilityTranslationTenantableInjector)
    Mobility.singleton_class.prepend(MobilityTranslationTenantableInjector)
  end
end
