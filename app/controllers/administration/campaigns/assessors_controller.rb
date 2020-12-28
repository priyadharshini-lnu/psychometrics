# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update show destroy]

      def index
        assessors = campaign.assessors.ransack(params[:filters]).result

        respond_to do |format|
          format.json do
            serialized_assessors = ActiveModelSerializers::SerializableResource.new(
              assessors.page(params[:page]),
              each_serializer: Administration::Campaigns::AssessorSerializer,
              campaign_id: campaign.id
            )

            render json: {
              list: serialized_assessors,
              total: assessors.count
            }
          end
        end
      end

      def import
        throw 'Not implemented yet'
      end

      def show
        throw 'Not implemented yet'
      end

      def create
        throw 'Not implemented yet'
      end

      def update
        throw 'Not implemented yet'
      end

      def destroy
        throw 'Not implemented yet'
      end

      private

      def pundit_authorize
        authorize(resource || Assessor, nil, policy_class: Campaigns::AssessorPolicy)
      end

      def resource_class
        Assessor
      end
    end
  end
end
