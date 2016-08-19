module Imports
  class UserImport < Imports::BaseImport
    # Authorisation flow
    #
    include Pundit
    ## Prepend :administration namespace to policy
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      importer
    end

    USER_ROLES_MAPS = {
      'Super Admin' => :superadmin,
      'Client Admin' => :admin,
      'Manager' => :manager,
      'User' => :user
    }.freeze

    USER_IMPORT_RULES = {
      email: /Email Address|Email|E-mail/i,
      first_name: 'First Name',
      last_name: 'Last Name',
      clients: /Company|Memberships|Clients|Client/i,
      role: 'Role',
      evaluator_name: /Evaluator name/i,
      evaluators_email_address: /Evaluators email address/i,
      relationship: /Relationship/i,
      business_unit: /Business unit/i,
      department: /Department/i,
      job_title: /Job title/i,
      nationality: /Nationality/i,
      gender: /Gender/i
    }.freeze

    validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/vnd.ms-excel',
                                                  'text/csv'] }

    def process!
      # Return error if form not valid
      return false unless valid?

      imported_items = load_imported_items.compact

      if imported_items.map(&:valid?).all?
        imported_items.each(&:save!).each { |i| i.invite!(importer) }
      else
        imported_items.each_with_index do |user, index|
          user.errors.full_messages.each do |message|
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
      # Parse header of xls/csv by strict rules
      datas = open_spreadsheet.parse(USER_IMPORT_RULES)

      datas[1..-1].map do |data|
        # Parse name of user role to sym
        data[:role] = USER_ROLES_MAPS[data[:role]]

        # Parse name of clients
        # Example: "Client 1, Client 2" return array ["Client 1", "Client 2"]
        #
        client_names = (data.delete(:clients) || '').split(',').map(&:strip)
        data[:client_ids] = policy_scope(Client).where(name: client_names).pluck(:id)

        user = User.new(user_params(data))
        user.operator = importer
        user
      end

    # Pick up error when header has invalid format
    rescue Roo::HeaderRowNotFoundError
      errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
      [nil]
    end

    def open_spreadsheet
      case File.extname(file.original_filename)
      when '.csv' then Roo::CSV.new(file.path)
      when '.xlsx' then ::Roo::Excelx.new(file.path)
      else raise t('administration.imports.errors.unknown_type', filename: file.original_filename)
      end
    end

    protected

    def user_params(data)
      ActionController::Parameters.new(data).permit(:first_name, :last_name, :email,
                                                    :role, :evaluator_name, :evaluators_email_address,
                                                    :relationship, :business_unit, :department,
                                                    :job_title, :nationality, :gender, client_ids: [])
    end
  end
end
