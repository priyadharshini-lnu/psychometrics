# frozen_string_literal: true

module PortableData
  module Exports
    module Resources
      class DimensionExportDefinition < ExportFields
        include SchemaConfiguration

        all_attributes except: %w[
          created_by_id
          updated_by_id
          tenant_id
          default_occupation_condition_set_id
        ]
        mappable_attribute :owner_id
        deferred_relationship_attribute :default_occupation_condition_set_id, model: OccupationConditionSet
        related_resource :all_factors, model: Factor
        related_resource :factors_sub_factors, model: FactorsSubFactor
        related_resource :occupation_condition_sets, model: OccupationConditionSet
        related_resource :occupations, model: Occupation
        related_resource :occupations_factors, model: OccupationsFactor
        related_resource :innovation_styles, model: InnovationStyle
        related_resource :innovation_styles_factors, model: InnovationStylesFactor

        import_order %i[
          dimensions
          factors
          factors_sub_factors
          occupation_condition_sets
          innovation_styles
          occupations
          innovation_styles_factors
          occupations_factors
        ]

        klass Dimension
      end
    end
  end
end
