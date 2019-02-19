# frozen_string_literal: true

module Administration
  module Clients
    class UserForm < Rectify::Form
      USER_FIELDS = %i[email first_name last_name].freeze

      # Membership Fields
      attribute :parent_id, Integer
      attribute :role, String
      attribute :hris_data, Hash[Symbol => String]

      # User fields
      attribute :user_id, Integer
      attribute :email, String
      attribute :first_name, String
      attribute :last_name, String

      #   VALIDATIONS
      #
      validates :role, inclusion: { in: Membership::MEMBERSHIP_ROLES }, presence: true
      validates :email, presence: true
      validate :user_uniqueness

      def map_model(model)
        self.user_id = model.user_id
        self.email = model.user.email
        self.first_name = model.user.first_name
        self.last_name = model.user.last_name
      end

      # Returns attributes for user model
      #
      def user_attributes
        { id: user_id, **attributes.slice(*USER_FIELDS) }
      end

      # Returns attributes for membership model
      #
      def membership_attributes
        attributes.except(*USER_FIELDS, :user_id)
      end

      def full_name
        "#{first_name} #{last_name}"
      end

      protected

      # Try to find existing user by email
      #
      def user_id
        @user_id ||= User.find_by(email: email)&.id
      end

      #   VALIDATIONS
      #

      # Returns error if already exists user with role
      #
      def user_uniqueness
        errors.add(:email, :taken) if context.client.memberships.exists?(user_id: user_id, role: role)
      end

      # Returns error if membership is relevant to client
      #
      def relevant_role
        valid = case role
        when Membership::CLIENT_ADMIN_ROLE
          context.client.tenancy?
        when Membership::PROJECT_ADMIN_ROLE
          context.client.project?
        when Membership::MANAGER_ROLE, Membership::MEMBER_ROLE
          context.client.end_level?
        else
          false
        end
        errors.add(:role, :invalid) unless valid
      end

    end
  end
end
