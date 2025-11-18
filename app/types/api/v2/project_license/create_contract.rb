module Api
  module V2
    module ProjectLicense
      class CreateContract < Contract
        rule(:license_id) do
          attrs = values[:data][:attributes]
          license_id = attrs[:license_id]
          next unless license_id
          next unless _context[:project]

          if ::ProjectLicense.exists?(
            project: _context[:project],
            license_id: license_id
          )
            key.failure('license_id.already_present')
            key.failure(
              I18n.t('activemodel.errors.models.project_license.attributes.license_id.already_present')
            )
          end
        end
      end
    end
  end
end
