# frozen_string_literal: true

module AdminJobs
  class CopyDimension < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      dimension.clone_and_save(user_id: record.owner_id)

      broadcast :ok
    end

    def generate_title_link
      {
        href: administration_dimension_factors_path(dimension_id: dimension.id),
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
