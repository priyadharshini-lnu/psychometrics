# frozen_string_literal: true

module PortableData
  module Exports
    module Resources
      class DimensionExportDefinition < ExportFields
        include SchemaConfiguration

        all_attributes
        mappable_attribute :owner_id
        related_resource :all_factors, model: Factor
        related_resource :factors_sub_factors, model: FactorsSubFactor
        related_resource :occupations, model: Occupation
        related_resource :occupations_factors, model: OccupationsFactor
        related_resource :innovation_styles, model: InnovationStyle
        related_resource :innovation_styles_factors, model: InnovationStylesFactor

        import_order %i[
          dimensions
          factors
          factors_sub_factors
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
