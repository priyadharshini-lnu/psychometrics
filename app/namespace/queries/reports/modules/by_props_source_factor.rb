module Queries
  module Reports
    module Modules
      class ByPropsSourceFactor < ::Queries::Base
        SQL = <<-SQL.squish
          SELECT *
          FROM reports_modules, json_array_elements(reports_modules.props -> 'source' -> 'factors') factors
          WHERE factors ->> 'id' = ?
        SQL

        def initialize(relation = ::Reports::Module.all)
          @relation = relation
        end

        def call(id)
          ::Reports::Module.find_by_sql([SQL, id.to_s])
        end
      end
    end
  end
end
