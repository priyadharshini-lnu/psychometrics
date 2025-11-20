# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class CreateContract < Contract
        schema Api::V2::ProjectLicense::Schema.create_request

        rule(data: { attributes: :license_id }) do
          next unless _context[:project]

          if ::ProjectLicense.exists?(
            project: _context[:project],
            license_id: value
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
