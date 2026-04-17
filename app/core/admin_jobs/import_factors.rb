# frozen_string_literal: true

module AdminJobs
  class ImportFactors < AdminJobs::Base
    def call
      form = ::Factors::ImportForm.new(file: record.file).with_context(dimension: dimension)

      process_factors!(form.processed_data)
      broadcast :ok
    end

    def generate_title_link
      {
        href: dimension_factors_url(dimension.id),
        label: dimension.name
      }
    end

    def valid?
      dimension.present?
    end

    private

    def process_factors!(factor_data)
      ActiveRecord::Base.transaction do
        factor_data.each do |attributes|
          factor = Factor.find_or_initialize_by(
            dimension_id: dimension.id,
            code: attributes[:code],
            name: attributes[:name]
          )

          factor.update!(attributes)
        end
      end
    end

    def dimension
      @dimension ||= Dimension.find_by(id: record.data['dimension_id'])
    end
  end
end
