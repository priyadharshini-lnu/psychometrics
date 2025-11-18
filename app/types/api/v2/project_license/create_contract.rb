# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class CreateContract < Contract
        schema Api::V2::ProjectLicense::Schema.create_request

        rule(data: { attributes: :license_id }) do
          license_id = value
          next unless license_id
          next unless _context[:project]

          if ::ProjectLicense.exists?(
            project: _context[:project],
            license_id: license_id
          )
            key.failure(
              I18n.t('activemodel.errors.models.project_license.attributes.license_id.already_present')
            )
          end
        end
      end
    end
  end
end
