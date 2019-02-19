# frozen_string_literal: true

module Administration
  module Clients
    class EditAssessmentsClient < Rectify::Command
      def initialize(form, client)
        @form = form
        @client = client
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          reorder_assessments_clients
          remove_assessments_clients
        end

        broadcast(:ok)
      end

      private

      attr_reader :form, :client

      # Sets new order position
      #
      def reorder_assessments_clients
        form.assessments_client_ids.each.with_index do |assessments_client_id, position|
          assessments_client = client.assessments_clients.find(assessments_client_id)
          assessments_client.update_column(:position, position)
        end
      end

      # Removes assigned Assessments
      #
      def remove_assessments_clients
        client.assessments_clients.where(assessment_id: form.remove_assessment_ids).destroy_all
      end

    end
  end
end
