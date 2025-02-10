# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class Contract < Api::Base::Contract
        schema Api::V2::DataReport::Schema.create_request

        rule(data: { attributes: :configuration }) do
          client_id = values.dig(:data, :relationships, :owner, :data, :id)
          form = ::Api::V2::DataReport::ConfigurationForm.new(configuration: value).
                 with_context(current_user: _context[:current_user], client_id: client_id.to_i)

          form.validate
          form.errors.each do |error|
            key.failure(error.message)
          end
        end
      end
    end
  end
end
