# frozen_string_literal: true

module CampaignFactors
  class ProcessedRowForm < Rectify::Form
    mimic :campaign_factor_import

    include ActiveModel::Model

    attribute :code, String
    attribute :name, String
    attribute :description, String
    attribute :assessment_id, Integer
    attribute :assessment_score_type, String
    attribute :ranked, Boolean, default: false
    attribute :factor_id, Integer
    attribute :factor_type, String
    attribute :output_type, String
    attribute :sheet_column_name, String
    attribute :formula, String
    attribute :position, Integer, default: 0
    attribute :public_visibility, Boolean, default: false
    attribute :campaign_factor_group_name, String
    attribute :min_value, Integer
    attribute :max_value, Integer
    attribute :is_na_allowed, Boolean, default: false
    attribute :disallow_lead_assessor_moderation, Boolean, default: false

    validates :code, :name, :output_type, :position, :factor_type, :public_visibility, presence: true
    validates :position, numericality: { only_integer: true }
    validates :public_visibility, inclusion: { in: [true, false] }
    validates :ranked, inclusion: { in: [true, false] }, allow_nil: true
    validates :factor_type, inclusion: { in: ::CampaignFactor.factor_types.keys }
    validates :assessment_score_type, inclusion: { in: ::CampaignFactor.assessment_score_types.keys }, allow_nil: true

    validate :validate_code_uniqueness_and_format
    validate :validate_name_uniqueness_and_length
    validate :validate_assessment_id_presence
    validate :validate_assessment_score_type_presence
    validate :validate_ranked_applicability
    validate :validate_factor_belongs_to_assessment_dimension
    validate :validate_min_and_max_values_presence

    private

    def validate_code_uniqueness_and_format
      return if code.nil?

      if existing_codes.include?(code)
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.code_already_exists', code: code))
      end

      unless code.match?(::RegexConstants::LUA_VARIABLE)
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.invalid_lua_name', code: code))
      end
    end

    def validate_name_uniqueness_and_length
      return if name.nil?

      if name.length > 64
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.name_size_exceded', size: 64))
      end

      if existing_names.include?(name)
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.name_already_exists', name: name))
      end

      unless name.match?(::RegexConstants::SHEET_COLUMN_REGEX)
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.invalid_name_format', name: name))
      end
    end

    def validate_assessment_id_presence
      if factor_type == 'assessment'
        if assessment_id.blank?
          errors.add(:base, I18n.t('administration.campaign_factor_import.errors.missing_assessment_id'))
        elsif !campaign.assessments.exists?(id: assessment_id)
          errors.add(:base,
                     I18n.t('administration.campaign_factor_import.errors.assessment_not_found_in_campaign',
                            assessment_id: assessment_id))
        end
      end
    end

    def validate_assessment_score_type_presence
      if %w[assessment assessor_scoring].include?(factor_type) && assessment_score_type.blank?
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.missing_assessment_score_type'))
      end
    end

    def validate_min_and_max_values_presence
      if %w[assessor_scoring].include?(factor_type) && (min_value.nil? || max_value.nil?)
        errors.add(:base, I18n.t('admin.missing_min_max_values'))
      end
    end

    def validate_ranked_applicability
      if output_type != 'numeric' && ranked.present?
        errors.add(:ranked, :rank_not_allowed)
      end
    end

    def validate_factor_belongs_to_assessment_dimension
      if %w[assessment assessor_scoring].include?(factor_type)
        if factor_id.blank?
          errors.add(:base, I18n.t('administration.campaign_factor_import.errors.missing_factor_id'))
        else
          factor_ids = Campaigns::AssessmentFactorQuery.new(campaign.id).query.map { |row| row['factor_id'].to_s }

          unless factor_ids.include?(factor_id.to_s)
            errors.add(:base,
                       I18n.t('administration.campaign_factor_import.errors.factor_not_in_assessment_dimension',
                              factor_id: factor_id))
          end
        end
      end
    end

    def campaign
      context.campaign
    end

    def existing_codes
      context.existing_codes || context.campaign.campaign_factors.pluck(:code)
    end

    def existing_names
      context.existing_names || context.campaign.campaign_factors.pluck(:name)
    end
  end
end
