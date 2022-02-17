# frozen_string_literal: true

module RansackAssocSearchableFields
  extend ActiveSupport::Concern

  class_methods do
    def add_searchable_assoc_scope(assoc_name)
      assoc = reflect_on_all_associations.find { |a| a.name == assoc_name }
      table_alias = assoc.plural_name

      scope :"#{assoc_name}_search", lambda { |search_term|
        scope = joins(
          %(
              LEFT OUTER JOIN "#{assoc.table_name}" "#{table_alias}" ON
              "#{assoc.plural_name}"."#{assoc.active_record_primary_key}" = "#{table_name}"."#{assoc.foreign_key}"
            )
        )

        if (search_term !~ /\D/) && search_term.present?
          scope.where(
            %("#{table_name}"."#{assoc.foreign_key}" = ? OR #{table_alias}.name ILIKE ?),
            search_term,
            "%#{search_term}%"
          )
        else
          scope.where("#{table_alias}.name ILIKE ?", "%#{search_term}%")
        end
      }
    end
  end
end
