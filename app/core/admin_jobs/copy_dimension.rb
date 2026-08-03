# frozen_string_literal: true

module AdminJobs
  class CopyDimension < AdminJobs::Base
    def call
      dimension.clone_and_save(
        user_id: record.owner_id,
        skip_owner_validation: record.data.fetch('skip_owner_validation', false)
      )

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

    def dimension
      @dimension ||= Dimension.find_by(id: record.data['dimension_id'])
    end
  end
end
