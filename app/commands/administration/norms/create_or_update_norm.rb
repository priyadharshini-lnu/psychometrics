# frozen_string_literal: true

module Administration
  module Norms
    class CreateOrUpdateNorm < BaseCommand
      private_attr_reader :form

      def initialize(form)
        @form = form
      end

      def call
        norm = create_or_update_norm
        broadcast(:ok, norm)
      end

      private

      def create_or_update_norm
        factors_norm = FactorsNorm.find_or_create_by(norm_id: form[:norm_id], factor_id: form[:factor_id])
        if factors_norm.props.empty?
          factors_norm.props << {
            form[:field_name] => form[:field_value]
          }
        else
          factors_norm.props.first[form[:field_name]] = form[:field_value]
        end

        factors_norm.save
        factors_norm
      end
    end
  end
end
