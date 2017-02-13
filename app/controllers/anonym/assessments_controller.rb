module Anonym
  class AssessmentsController < ActionController::Base
    include SetLocale
    layout 'anonym'
    protect_from_forgery with: :exception

    HASHIDS = Hashids.new(ENV['HASHIDS_SALT'], Settings.hashids_length.anonym)

    prepend_before_action :set_client
    before_action :set_assessment
    before_action :create_anonym_user, unless: :user_signed_in?
    append_before_action :authenticate_user!

    def pass
      @translations = ::Translation.to_hash_for_assessment(@resource.id, user_locale)
      @available_translations = ::Translation.available_translation_for_assessment(@resource.id)
      # Find or create assign
      @assign = Assign.find_or_create_by(assessment_id: @resource.id, membership_id: @current_membership.id)
    end

    private

    def set_client
      @client = Client.enabled.find HASHIDS.decode(params[:client_id]).try(:first)
    end

    def set_assessment
      @resource = @client.assessments.enabled.find HASHIDS.decode(params[:assessment_id]).try(:first)
    end

    def create_anonym_user
      # Generate uniq anonym user email
      uniq_anonym_email = loop do
        email = "anonym_#{Time.now.to_i}#{rand(10_000)}@example.com"
        break email unless User.exists?(email: email)
      end
      # Create anonym user with membership
      user = Users::Member.new({
        first_name: 'Anonymous',
        last_name: 'User',
        email: uniq_anonym_email,
        is_anonym: true,
        password: uniq_anonym_email,
        password_confirmation: uniq_anonym_email,
        memberships_attributes: [{
          client_id: @client.id
        }]
      })
      bypass_sign_in(user) if user.save
    end

    def authenticate_user!
      super
      @current_membership = @current_user.memberships.first
    end
  end
end
