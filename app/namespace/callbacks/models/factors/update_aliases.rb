# frozen_string_literal: true

module Callbacks
  module Models
    module Factors
      class UpdateAliases
        def after_update(factor)
          factor.aliases.each do |alias_in_report|
            next if !factor.saved_change_to_name? || factor.attribute_before_last_save(:name) != alias_in_report.name

            alias_in_report.update(name: factor.name)
          end
        end
      end
    end
  end
end
