module Callbacks
  module Models
    module Factors
      class UpdateAliases
        def after_update(factor)
          factor.aliases.each do |alias_in_report|
            next if !factor.name_changed? || factor.name_was != alias_in_report.name
            alias_in_report.update(name: factor.name)
          end
        end
      end
    end
  end
end
