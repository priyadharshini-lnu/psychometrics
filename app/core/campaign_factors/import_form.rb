# frozen_string_literal: true

module CampaignFactors
  class ImportForm < Rectify::Form
    mimic :campaign_factor_import_form

    attribute :file, Object
    attribute :roo_excel, Object

    validates :file, presence: true, if: -> { roo_excel.nil? }
    validates :file,
              file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                           'application/xlsx'], message: :invalid_format },
                                  if: -> { file.present? }

    validate :validate_headers
    validate :validate_rows
    validate :validate_campaign_factors_count

    def validate_headers
      return if errors.present?

      unknown_headers = headers - CampaignFactors::Export::ALLOWED_HEADERS
      if unknown_headers.present?
        errors.add(
          :base,
          I18n.t(
            'administration.campaign_factors_import.errors.invalid_headers',
            headers: Utility::String.join_into_sentence(unknown_headers.uniq)
          )
        )
      end
    end

    def validate_rows
      return if errors.present?

      processed_rows.each_with_index do |row, index|
        row.transform_values! { |value| Utility::String.remove_csv_injection_marker(value) }
        form = ::CampaignFactors::ProcessedRowForm.new(row).with_context(campaign: context.campaign)
        next if form.valid?

        form.errors.full_messages.each do |message|
          errors.add(:base, "Row #{index + 1}: #{message}") unless form.valid?
        end
      end
    end

    def validate_campaign_factors_count
      return if errors.present?

      if campaign.campaign_factors.count + processed_rows.count > ::CampaignFactor::MAX_CAMPAIGN_FACTORS
        errors.add(:base, I18n.t('administration.campaign_factor_import.errors.max_limit_reached',
                                 count: ::CampaignFactor::MAX_CAMPAIGN_FACTORS))
      end
    end

    def processed_rows
      @processed_rows ||= Imports::ProcessRows.call!(rows)
    end

    private

    def campaign
      context.campaign
    end

    def headers
      @headers ||= rows[0]
    end

    def rows
      @rows ||= roo_excel&.to_a || Roo::Excelx.new(file.path).to_a
    end
  end
end
