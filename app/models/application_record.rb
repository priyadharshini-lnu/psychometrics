# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  before_save :sync_translated_columns

  # Ransack now is more secure by default, so we need to explicitly specify which attributes to allow.
  # Below code is taken from previous version of Ransack, which allowed all attributes and associations by default.
  # We will remove this in separate PR
  def self.ransackable_attributes(_auth_object = nil)
    @ransackable_attributes ||= if Ransack::SUPPORTS_ATTRIBUTE_ALIAS
                                  column_names + _ransackers.keys + _ransack_aliases.keys +
                                    attribute_aliases.keys
                                else
                                  column_names + _ransackers.keys + _ransack_aliases.keys
                                end
  end

  def self.ransackable_associations(_auth_object = nil)
    @ransackable_associations ||= reflect_on_all_associations.map { |a| a.name.to_s }
  end

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
