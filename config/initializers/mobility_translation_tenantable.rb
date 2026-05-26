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

      translation_klass.include Tenantable
      translation_klass.tenant_source :translated_model
    end
  end
end

Rails.application.config.to_prepare do
  unless Mobility.singleton_class.ancestors.include?(MobilityTranslationTenantableInjector)
    Mobility.singleton_class.prepend(MobilityTranslationTenantableInjector)
  end
end
