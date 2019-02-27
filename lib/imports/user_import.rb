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
      role: Membership.human_attribute_name('role'),
      created_at: Membership.human_attribute_name('created_at'),
      report_ids: Membership.human_attribute_name('report_ids'),
      user_access: Membership.human_attribute_name('user_access')
    }.freeze

    HEADER_IMPORT_KEYS = %i(first_name last_name password email role report_ids user_access).freeze

    # Authorisation flow
    #
    include Pundit
    ## Prepend :administration namespace to policy
    include Administration::Policies
    ## Custom current user helper for Pundit

    attr_accessor :client_id, :importer
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
      imported_items = load_imported_items.compact
      return false if imported_items.compact.size == 0
      memberships = imported_items.map(&:first)
      membership_user_access_ids = imported_items.map { |i| i.at(1)}
      if memberships.map(&:valid?).all?
        memberships.each(&:save!).each_with_index do |membership, index|
          membership.user.invite!(importer, client_id)
          set_user_access(membership_user_access_ids[index], membership)
        end

      else
        memberships.each_with_index do |membership, index|
          membership.user.errors.full_messages.each do |message|
            errors.add(:base, I18n.t('administration.imports.errors.error', row: index + 2, error: message))
          end
        end
      end

      errors.blank?
    end

    #
    # Parse file
    # Return array of new Users
    #
    def load_imported_items
      client = policy_scope(::Client).find(client_id)
      raise 'Invalid client' unless client

      # Parse header of xls/csv by strict rules
      rows = open_spreadsheet.parse
      header = rows.shift

      rows.map do |row|
        attributes = HEADER_IMPORT_KEYS.inject({}) { |h, k| h.merge(k => row[header.index(HEADER_IMPORT_DATA[k])]) }
        report_ids = attributes.delete(:report_ids).to_s.split(',').map(&:to_i)
        user_access_ids = attributes.delete(:user_access).to_s.split(',').map(&:to_i)

        memberships_attributes = {
          role: USER_ROLES_MAPS[attributes.delete(:role)],
          hris_data: {}
        }

        user = User.find_or_initialize_by(email: attributes[:email].downcase)
        next if user.is?(:superadmin)

        header.zip(row)[HEADER_IMPORT_DATA.size..-1]&.each_with_index do |z, i|
          memberships_attributes[:hris_data][i.to_s] = { 'key' => z.first, 'value' => z.last }
        end

        assign_password(user, attributes, memberships_attributes)

        user.assign_attributes(attributes.merge(role: User::REGULAR_ROLE, create_by_invite: true))
        membership = user.memberships.find_or_initialize_by(client_id: client.id)
        membership.assign_attributes(memberships_attributes)

        if report_ids
          report_ids = client.report_ids & report_ids
          reports_hash = Report.select(:id).where(id: report_ids).includes(:assessments).group_by(&:assessment_ids)
          reports_hash.each do |assessment_ids, report_arr|
            assessment_ids.each do |assessment_id|
              assign = membership.assigns.find_or_initialize_by(assessment_id: assessment_id)
              assign.report_ids = report_arr.map(&:id)
            end
          end
        end
        [membership, user_access_ids]
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

    def set_user_access(user_access_ids, membership)
      report_ids = membership.reports.ids
      assigns_reports = AssignsReport.joins(assign: :membership).where('memberships.id = ?', membership.id)

      add_access_ids = report_ids & user_access_ids
      update_assigns_reports(assigns_reports, add_access_ids, true)

      remove_access_ids = report_ids - user_access_ids
      update_assigns_reports(assigns_reports, remove_access_ids, false)
    end

    def update_assigns_reports(assigns_reports, report_ids, access)
      assigns_reports.where(report_id: report_ids).each do |assigns_report|
        assigns_report.update(user_access: access)
      end
    end

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
  end
end
