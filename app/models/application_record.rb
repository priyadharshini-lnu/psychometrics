# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  include ActiveStorageSupport::SupportForBase64

  self.abstract_class = true

  before_save :sync_translated_columns

  def sync_translated_columns
    return unless self.class.respond_to?(:mobility_attributes)

    Mobility.with_locale(I18n.default_locale) do
      self.class.mobility_attributes.each do |attr|
        previous_attr_value = send("#{attr}_before_type_cast")
        new_attr_value = send(attr)
        # rubocop:disable Rails/ReadWriteAttribute
        write_attribute(attr, new_attr_value) if previous_attr_value != new_attr_value
        # rubocop:enable Rails/ReadWriteAttribute
      end
    end
  end
end
