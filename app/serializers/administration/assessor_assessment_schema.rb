# frozen_string_literal: true

module Administration
  class AssessorAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        AssessorAssessmentSchema.define_permissions_field(self)
        required(:linked_assessment_name).maybe(:str?)
        AssessorAssessmentSchema.define_owner_field(self)
        AssessorAssessmentSchema.define_tenant_field(self)
        required(:dimension_id).maybe(:int?)
        required(:tenant_id).maybe(:int?)
      end
    end

    def self.define_permissions_field(schema)
      schema.required(:permissions).hash do
        required(:import_results).filled(:bool?)
        required(:export_raw_results).filled(:bool?)
        required(:export_scoring_results).filled(:bool?)
        required(:export_raw_factor_scores).filled(:bool?)
        required(:export_normed_results).filled(:bool?)
        required(:export_external_results).filled(:bool?)
        required(:rescore_responses).filled(:bool?)
      end
    end

    def self.define_owner_field(schema)
      schema.required(:owner).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
        end
      end
    end

    def self.define_tenant_field(schema)
      schema.required(:tenant).maybe do
        hash do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
        end
      end
    end
  end
end
