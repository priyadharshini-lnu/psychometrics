# frozen_string_literal: true

module Administration
  class MhsUserAssessmentSerializer < Panko::Serializer
    attributes :external_assessment_id, :session_id, :data_gatherer_id, :data_gathering_id,
               :confidence_interval, :leadership_bar, :norm_regions, :norm_region, :norm_options, :norm_option

    def external_assessment_id
      object.user_assessment.assessment.external_assessment_id.to_s
    end

    def session_id
      object.session_id.to_s
    end

    def data_gatherer_id
      object.data_gatherer_id.to_s
    end

    def data_gathering_id
      object.data_gathering_id.to_s
    end

    delegate :confidence_interval, to: :object

    delegate :leadership_bar, to: :object

    def norm_regions
      object.user_assessment.assessment.mhs_settings&.norm_regions || []
    end

    def norm_region
      norm_regions.find { |region| region['value'].to_i == object.norm_region.to_i }&.value
    end

    def norm_options
      object.user_assessment.assessment.mhs_settings&.norm_options || []
    end

    def norm_option
      norm_options.find { |option| option['value'].to_i == object.norm_option.to_i }&.value
    end
  end
end
