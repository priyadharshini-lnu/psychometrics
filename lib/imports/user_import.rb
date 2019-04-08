# TODO: refactoring this class to use Commands and Form Object
#   Command: Administration::Clients::CreateUser
#   FormObject: Administration::Clients::UserForm
module Imports
  class UserImport < Imports::BaseImport
    USER_ROLES_MAPS = {
      'Client Admin' => Membership::CLIENT_ADMIN_ROLE,
      'Project Admin' => Membership::PROJECT_ADMIN_ROLE,
      'Manager' => Membership::MANAGER_ROLE,
      'User' => Membership::MEMBER_ROLE
    }.freeze

    HEADER_IMPORT_DATA = {
      active: Membership.human_attribute_name('active'),
      first_name: Membership.human_attribute_name('first_name'),
      last_name: Membership.human_attribute_name('last_name'),
      email: Membership.human_attribute_name('email'),
      password: Membership.human_attribute_name('password'),
      created_at: Membership.human_attribute_name('created_at'),
    }.freeze

    HEADER_IMPORT_KEYS = %i(first_name last_name password email).freeze

    # Authorisation flow
    #
    include Pundit
    ## Prepend :administration namespace to policy
    include Administration::Policies
    ## Custom current user helper for Pundit

    attr_accessor :client_id, :importer, :client
    validates :client_id, :importer, presence: true
    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv',
                                                  'application/octet-stream',
                                                  'text/plain'] }

    attr_reader :existing_users_whose_password_not_changed

    def initialize(attributes = {})
      super(attributes)
      @existing_users_whose_password_not_changed = []
    end

    def pundit_user
      importer
    end

    def process!
      # Return error if form not valid
      return false unless valid?
      memberships = load_imported_items.compact
      return false if memberships.size == 0

      ActiveRecord::Base.transaction do
        if memberships.map(&:valid?).all?
          memberships.each(&:save!).each_with_index do |membership, index|
            membership.user.invite!(importer, client_id)
            apply_assigned_assessments(membership)
            apply_reports(membership)
          end
        else
          memberships.each_with_index do |membership, index|
            membership.user.errors.full_messages.each do |message|
              errors.add(:base, I18n.t('administration.imports.errors.error', row: index + 2, error: message))
            end
          end
        end
      end

      errors.blank?
    rescue Errors::LicenseError => e
      errors.add(:base, e.message)
      false
    end

    #
    # Parse file
    # Return array of new Users
    #
    def load_imported_items
      self.client = policy_scope(::Client).find(client_id)
      raise 'Invalid client' unless client

      # Parse header of xls/csv by strict rules
      rows = open_spreadsheet.to_a
      header = rows.shift

      rows.map do |row|
        attributes = HEADER_IMPORT_KEYS.inject({}) { |h, k| h.merge(k => row[header.index(HEADER_IMPORT_DATA[k])]) }

        memberships_attributes = {
          role: Membership::MEMBER_ROLE,
          hris_data: {}
        }

        user = Users::Regular.find_or_initialize_by(email: attributes[:email].downcase, project_id: client.project.id)
        next if user.is?(:superadmin)

        header.zip(row)[HEADER_IMPORT_DATA.size..-1]&.each_with_index do |z, i|
          memberships_attributes[:hris_data][i.to_s] = { 'key' => z.first, 'value' => z.last }
        end

        assign_password(user, attributes, memberships_attributes)

        user.assign_attributes(attributes.merge(role: User::REGULAR_ROLE, create_by_invite: true))
        membership = user.memberships.find_or_initialize_by(client_id: client.id)
        membership.assign_attributes(memberships_attributes)

        membership
      end

    rescue => e
      case e.exception
      when Roo::HeaderRowNotFoundError
        # Pick up error when header has invalid format
        errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
      else
        errors.add(:base, e.message)
      end
      [nil]
    end

    def open_spreadsheet
      case File.extname(file.original_filename)
      when '.csv' then Roo::CSV.new(file.path)
      when '.xlsx' then ::Roo::Excelx.new(file.path)
      else raise t('administration.imports.errors.unknown_type', filename: file.original_filename)
      end
    end

    private

    def assign_password(user, attributes, memberships_attributes)
      password = attributes.delete(:password)
      @existing_users_whose_password_not_changed << user if user.encrypted_password.present? && password.present?

      return if password.blank? || user.encrypted_password.present?

      user.assign_attributes(
        password: password,
        invitation_token: nil,
        invitation_accepted_at: user.invitation_accepted_at || Time.current
      )

      memberships_attributes[:already_invited] = true
    end

    def apply_assigned_assessments(membership)
      client.assessment_ids.each do |assessment_id|
        membership.assigns.find_or_create_by!(assessment_id: assessment_id)
      end
    end

    def apply_reports(membership)
      client.clients_reports.includes(report: :assessments).each do |client_report|
        client_report.report.assessments.each do |assessment|
          assign = membership.assigns.find_or_create_by!(assessment_id: assessment.id)
          assign_report = assign.assigns_reports.find_or_initialize_by(report_id: client_report.report_id)
          assign_report.user_access = client_report.user_access
          assign_report.save!
        end
      end
    end
  end
end
