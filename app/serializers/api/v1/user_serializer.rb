# frozen_string_literal: true

module Api
  module V1
    class UserSerializer < Panko::Serializer
      attributes :id, :first_name, :last_name, :email, :gender, :created_at, :updated_at, :campaigns, :campaign_ids,
                 :project_datasheet, :user_external_id

      def user_external_id
        object.external_id
      end

      def campaigns
        options = {
          each_serializer: UserCampaignSerializer,
          context: {
            user: object
          }
        }
        options[:except] = %i[datasheet] unless context[:include_datasheet]
        Panko::ArraySerializer.new(
          object.campaigns,
          **options
        ).to_a
      end

      def campaign_ids
        object.campaigns.map(&:id)
      end

      def project_datasheet
        datasheet = context&.dig(:project)&.datasheet
        return unless datasheet

        sheet_row = datasheet&.rows&.find_by(email: object.email)
        return unless sheet_row

        Api::SheetRows::GetData.call!(sheet_row)
      end
    end
  end
end
