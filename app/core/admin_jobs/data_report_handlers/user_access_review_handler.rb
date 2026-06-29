# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class UserAccessReviewHandler < BaseHandler # rubocop:disable Metrics/ClassLength
      def generate_file
        workbook = FastExcel.open(file_path, constant_memory: true)

        write_sheet(workbook, 'Usage', usage_sql)
        write_sheet(workbook, 'Roles_Permissions', roles_permissions_sql)

        workbook.close
      end

      def self.file_extension
        'xlsx'
      end

      def self.file_name(extension:, **)
        real_env = Settings.real_env.presence || ENV.fetch('REAL_ENV', 'local')
        "#{real_env}-uar-report-#{Time.current.strftime('%Y-%m-%d-%H%M')}.#{extension}"
      end

      private

      def write_sheet(workbook, sheet_name, sql)
        worksheet = workbook.add_worksheet(sheet_name)
        result = ActiveRecord::Base.connection.exec_query(sql)

        worksheet.write_row(0, result.columns)
        result.rows.each_with_index do |row, idx|
          worksheet.write_row(idx + 1, row)
        end
      end

      def usage_sql
        <<-SQL.squish
          WITH admin_role_lookup AS (
              SELECT
                  mar.membership_id,
                  ar.id AS admin_role_id,
                  ar.name AS admin_role_name
              FROM memberships_admin_roles mar
              JOIN admin_roles ar ON ar.id = mar.admin_role_id
          ),
          grants_lookup AS (
              SELECT
                  mg.membership_id,
                  string_agg(
                      kv.key || ': ' || vals.permissions_str,
                      chr(10)
                      ORDER BY kv.key
                  ) AS permissions
              FROM membership_grants mg
              CROSS JOIN LATERAL jsonb_each(mg.data) AS kv(key, value)
              CROSS JOIN LATERAL (
                  SELECT string_agg(v, ', ' ORDER BY v) AS permissions_str
                  FROM jsonb_array_elements_text(kv.value) v
              ) vals
              WHERE mg.membership_id IS NOT NULL
                AND mg.data IS NOT NULL
                AND vals.permissions_str IS NOT NULL
              GROUP BY mg.membership_id
          )

          SELECT
              u.id                                         AS "User ID",
              TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS "Name",
              u.email::text                                AS "Email",
              'SuperAdmin'                                 AS "Role",
              NULL::integer                                AS "Admin Role ID",
              NULL::text                                   AS "Admin Role Name",
              NULL::integer                                AS "Client ID",
              NULL::text                                   AS "Client Name",
              NULL::integer                                AS "Project ID",
              NULL::text                                   AS "Project Name",
              NULL::integer                                AS "Campaign ID",
              NULL::text                                   AS "Campaign Name",
              NULL::text                                   AS "Permissions"
          FROM users u
          WHERE u.role = 'Users::SuperAdmin' AND u.disabled = false

          UNION ALL

          SELECT
              u.id,
              TRIM(CONCAT(u.first_name, ' ', u.last_name)),
              u.email::text,
              'ClientAdmin',
              arl.admin_role_id,
              arl.admin_role_name,
              cl.id,
              cl.name,
              NULL::integer,
              NULL::text,
              NULL::integer,
              NULL::text,
              gl.permissions
          FROM users u
          JOIN memberships            m   ON m.user_id = u.id AND m.role IN (3, 5) AND m.client_id IS NOT NULL
          JOIN clients                cl  ON cl.id = m.client_id AND cl.ancestry_depth = 0
          LEFT JOIN admin_role_lookup arl ON arl.membership_id = m.id
          LEFT JOIN grants_lookup     gl  ON gl.membership_id = m.id
          WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false

          UNION ALL

          SELECT
              u.id,
              TRIM(CONCAT(u.first_name, ' ', u.last_name)),
              u.email::text,
              'ProjectAdmin',
              arl.admin_role_id,
              arl.admin_role_name,
              root_cl.id,
              root_cl.name,
              proj.id,
              proj.name,
              NULL::integer,
              NULL::text,
              gl.permissions
          FROM users u
          JOIN memberships            m       ON m.user_id = u.id AND m.role = 2 AND m.client_id IS NOT NULL
          JOIN clients                proj    ON proj.id = m.client_id AND proj.ancestry_depth = 1
          LEFT JOIN clients           root_cl ON root_cl.id = proj.tte_id
          LEFT JOIN admin_role_lookup arl     ON arl.membership_id = m.id
          LEFT JOIN grants_lookup     gl      ON gl.membership_id = m.id
          WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false

          UNION ALL

          SELECT
              u.id,
              TRIM(CONCAT(u.first_name, ' ', u.last_name)),
              u.email::text,
              'CampaignAdmin',
              arl.admin_role_id,
              arl.admin_role_name,
              root_cl.id,
              root_cl.name,
              proj.id,
              proj.name,
              camp.id,
              camp.name,
              gl.permissions
          FROM users u
          JOIN memberships            m       ON m.user_id = u.id AND m.role = 4 AND m.campaign_id IS NOT NULL
          JOIN campaigns              camp    ON camp.id = m.campaign_id
          JOIN clients                proj    ON proj.id = camp.project_id AND proj.ancestry_depth = 1
          LEFT JOIN clients           root_cl ON root_cl.id = proj.tte_id
          LEFT JOIN admin_role_lookup arl     ON arl.membership_id = m.id
          LEFT JOIN grants_lookup     gl      ON gl.membership_id = m.id
          WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false

          ORDER BY "User ID", "Client Name", "Project Name", "Campaign Name", "Role"
        SQL
      end

      def roles_permissions_sql
        <<-SQL.squish
          WITH relevant_memberships AS (
              SELECT m.id AS membership_id
              FROM users u
              JOIN memberships m   ON m.user_id = u.id AND m.role IN (3, 5) AND m.client_id IS NOT NULL
              JOIN clients    cl   ON cl.id = m.client_id AND cl.ancestry_depth = 0
              WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false

              UNION

              SELECT m.id
              FROM users u
              JOIN memberships m    ON m.user_id = u.id AND m.role = 2 AND m.client_id IS NOT NULL
              JOIN clients     proj ON proj.id = m.client_id AND proj.ancestry_depth = 1
              WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false

              UNION

              SELECT m.id
              FROM users u
              JOIN memberships m    ON m.user_id = u.id AND m.role = 4 AND m.campaign_id IS NOT NULL
              JOIN campaigns   camp ON camp.id = m.campaign_id
              JOIN clients     proj ON proj.id = camp.project_id AND proj.ancestry_depth = 1
                WHERE #{email_filter_sql} AND u.disabled = false AND m.disabled = false
          ),
          relevant_admin_role_ids AS (
              SELECT DISTINCT mar.admin_role_id
              FROM memberships_admin_roles mar
              WHERE mar.membership_id IN (SELECT membership_id FROM relevant_memberships)
          ),
          permissions_formatted AS (
              SELECT
                  ar.id AS admin_role_id,
                  string_agg(
                      kv.key || ': ' || vals.permissions_str,
                      chr(10)
                      ORDER BY kv.key
                  ) AS permissions
              FROM admin_roles ar
              JOIN relevant_admin_role_ids rar ON rar.admin_role_id = ar.id
              CROSS JOIN LATERAL jsonb_each(ar.permissions) AS kv(key, value)
              CROSS JOIN LATERAL (
                  SELECT string_agg(v, ', ' ORDER BY v) AS permissions_str
                  FROM jsonb_array_elements_text(kv.value) v
              ) vals
              WHERE ar.permissions IS NOT NULL
                AND vals.permissions_str IS NOT NULL
              GROUP BY ar.id
          )
          SELECT
              cl.id          AS "Client ID",
              cl.name        AS "Client Name",
              ar.id          AS "Admin Role ID",
              ar.name        AS "Admin Role Name",
              pf.permissions AS "Permissions"
          FROM admin_roles ar
          JOIN relevant_admin_role_ids rar ON rar.admin_role_id = ar.id
          JOIN clients                 cl  ON cl.id = ar.client_id
          LEFT JOIN permissions_formatted pf ON pf.admin_role_id = ar.id
          ORDER BY cl.name, ar.name
        SQL
      end

      def email_filter_sql
        @email_filter_sql ||= begin
          raise ArgumentError, 'No email domains configured for UserAccessReview report' if email_domain_patterns.empty?

          quoted_patterns = email_domain_patterns.map do |domain|
            ActiveRecord::Base.connection.quote("%@#{domain}")
          end.join(', ')

          "u.email::text ILIKE ANY (ARRAY[#{quoted_patterns}]::text[])"
        end
      end

      def email_domain_patterns
        @email_domain_patterns ||= Array(Settings.dig(:data_reports, :user_access_review,
                                                      :email_domains)).map do |domain|
          domain.to_s.strip.downcase
        end.compact_blank.uniq
      end
    end
  end
end
