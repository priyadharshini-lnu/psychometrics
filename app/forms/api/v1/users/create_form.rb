module Api
  module V1
    module Users
      class CreateForm < Rectify::Form
        attribute %i[first_name last_name email password], String
        attribute :project,  Client
        attribute :accepted_terms,  Boolean
        attribute :campaign_ids,  Array

        validates :email, :password, presence: true
        validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
        validate :uniq_email
        validate :accepted_terms_is_true
        validate :verify_campaign_ids

        def uniq_email
          return unless ::Users::Regular.exists?(email: email, project_id: project.id)

          errors.add(:email, "Another user with email #{email} is existing")
        end

        def accepted_terms_is_true
          return if accepted_terms == true

          errors.add(:accepted_terms, 'Accepted terms should be adopted')
        end

        def verify_campaign_ids
          return if campaign_ids.empty?

          existing_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
          return if existing_campaign_ids & campaign_ids == campaign_ids

          errors.add(:campaign_ids, 'Not all campaign ids are existing')
        end

        def attributes
          super.merge(project_id: project.id).except(:project, :accepted_terms, :campaign_ids)
        end
      end
    end
  end
end
