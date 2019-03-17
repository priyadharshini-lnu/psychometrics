module Api
  module V1
    module Users
      class CreateForm < Rectify::Form
        attribute %i[first_name last_name email], String
        attribute :campaign_ids,  Array

        validates :email, presence: true
        validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
        validate :uniq_email, if: -> { email.present? }
        validate :verify_campaign_ids

        def uniq_email
          return unless ::Users::Regular.exists?(email: email, project_id: context.project.id)

          errors.add(:email, "Another user with email #{email} is existing")
        end

        def verify_campaign_ids
          return errors.add(:campaign_ids, 'Campaign ids should be filled') if campaign_ids.empty?

          existing_campaign_ids = Client.campaigns_and_sub_campaigns_of(context.project.id).ids
          return if existing_campaign_ids & campaign_ids == campaign_ids

          errors.add(:campaign_ids, 'Not all campaign ids are existing')
        end

        def user_attributes
          attributes.except(:campaign_ids)
        end

        def membership_attributes
          {}
        end
      end
    end
  end
end
