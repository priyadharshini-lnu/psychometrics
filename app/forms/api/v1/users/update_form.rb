module Api
  module V1
    module Users
      class UpdateForm < Rectify::Form
        attribute %i[first_name last_name email], String
        validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
        validate :uniq_email

        def uniq_email
          return if email.nil?
          return if email == context.user.email
          return unless ::Users::Regular.exists?(email: email, project_id: context.project.id)

          errors.add(:email, "Another user with email #{email} is existing")
        end
      end
    end
  end
end
