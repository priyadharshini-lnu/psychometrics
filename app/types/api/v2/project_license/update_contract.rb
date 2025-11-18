module Api
  module V2
    module ProjectLicense
      class UpdateContract < Contract
        # Stop everything if project_license is missing
        rule(:base) do
          id = _context[:params][:id]
          project_license = ::ProjectLicense.find_by(id: id)

          if project_license.nil?
            key.failure('project_license.not_found')
            next
          end

          # expose it to base-contract rules
          _context[:project_license] = project_license
        end

        # Additional update-only rules
        rule(data: { attributes: :usage_limit }) do
          next unless _context[:project_license]

          usage_limit    = values[:data][:attributes][:usage_limit]
          used_number    = _context[:project_license].used_number

          if usage_limit < used_number
            key.failure(I18n.t(
                          'activemodel.errors.models.project_license.attributes.usage_limit.cant_be_less_than_used', used_count: used_number
                        ))
          end
        end
      end
    end
  end
end
