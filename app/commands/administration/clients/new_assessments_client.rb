# frozen_string_literal: true

module Administration
  module Clients
    class NewAssessmentsClient < Rectify::Command
      def initialize(form, client)
        @form = form
        @client = client
      end

      def call
        return broadcast(:invalid) if form.invalid?

        transaction do
          update_client
          apply_to_existing_users if form.apply_to_existing_users
        end

        broadcast(:ok)
      end

      private

      attr_reader :form, :client

      # Update the list of assigned assessments
      #
      def update_client
        client.assessment_ids += form.assessment_ids
        client.save
      end

      def apply_to_existing_users
        client.memberships.find_each do |membership|
          form.assessment_ids.each do |assessment_id|
            membership.assigns.find_or_create_by!(assessment_id: assessment_id)
          end
        end
      end
    end
  end
end
