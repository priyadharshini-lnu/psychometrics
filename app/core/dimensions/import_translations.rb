# frozen_string_literal: true

module Dimensions
  class ImportTranslations < BaseCommand
    private_attr_reader :dimension, :rows, :job_record

    def initialize(dimension, rows, job_record)
      @dimension = dimension
      @rows = rows
      @job_record = job_record
    end

    def call
      job_record.update!(total_tasks: rows.length)

      Factor.transaction do
        rows.each_slice(2) do |name_row, description_row|
          name_row.transform_values! { |value| Utility::String.remove_csv_injection_marker(value) }
          description_row.transform_values! { |value| Utility::String.remove_csv_injection_marker(value) }

          id_key = name_row.keys.first
          next unless name_row[id_key]

          id = name_row[id_key].split('#').first.to_i
          factor = dimension.all_factors.find_by(id: id)
          next unless factor

          name_values = translations(name_row)
          description_values = translations(description_row)

          I18n.available_locales.each do |locale|
            Mobility.with_locale(locale) do
              updates = {}
              updates[:name] = name_values[locale] if name_values[locale]
              updates[:description] = description_values[locale] if description_values[locale]

              next if updates.empty?

              factor.update(updates)
            end
          end
        end
      end
      broadcast :ok
    end

    def translations(data)
      data.filter_map do |field, val|
        next unless val

        locale = field.split(' / ').last
        { locale.to_sym => val }
      end.inject({}, :merge)
    end
  end
end
