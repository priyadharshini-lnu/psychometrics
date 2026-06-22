# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  include ActiveStorageSupport::SupportForBase64

  self.abstract_class = true

  # Automatic role switching is not enabled in application
  connects_to database: { writing: :primary, reading: :primary_replica }

  before_save :sync_translated_columns

  def sync_translated_columns
    return unless self.class.respond_to?(:mobility_attributes)

    Mobility.with_locale(I18n.default_locale) do
      self.class.mobility_attributes.each do |attr|
        previous_attr_value = send(:"#{attr}_before_type_cast")
        new_attr_value = send(attr)
        # rubocop:disable Rails/ReadWriteAttribute
        write_attribute(attr, new_attr_value) if previous_attr_value != new_attr_value
        # rubocop:enable Rails/ReadWriteAttribute
      end
    end
  end

  def self.read_from_replica(&)
    connected_to(role: :reading, prevent_writes: true, &)
  end

  def self.tenant_config(**options)
    @tenant_config_options = options
  end

  def psy_debug
    klass = "PsyDebug::#{self.class.name}".safe_constantize || PsyDebug::Base
    klass.new(self)
  end
end
