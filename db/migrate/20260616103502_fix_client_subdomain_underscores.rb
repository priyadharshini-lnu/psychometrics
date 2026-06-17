# frozen_string_literal: true

class FixClientSubdomainUnderscores < ActiveRecord::Migration[8.0]
  def up
    # Replace underscores with hyphens in existing client subdomains
    connection.select_all("SELECT id, subdomain FROM clients WHERE subdomain LIKE '%\\_%'").each do |row|
      client_id = row['id']
      fixed_subdomain = row['subdomain'].tr('_', '-')
      fixed_subdomain = ensure_unique_subdomain(fixed_subdomain, client_id)

      connection.execute("UPDATE clients SET subdomain = #{connection.quote(fixed_subdomain)} WHERE id = #{client_id}")
    end
  end

  def down
    # No-op: we don't want to revert subdomain data changes
  end

  private

  def ensure_unique_subdomain(subdomain, client_id)
    return subdomain unless subdomain_taken?(subdomain, client_id)

    counter = 2
    loop do
      numbered = "#{subdomain}-#{counter}"
      return numbered unless subdomain_taken?(numbered, client_id)

      counter += 1
      break if counter > 100
    end

    "#{subdomain}-#{client_id}"
  end

  def subdomain_taken?(subdomain, client_id)
    query = <<-SQL.squish
      SELECT 1 FROM clients
      WHERE subdomain = #{connection.quote(subdomain)}
        AND id != #{client_id}
    SQL
    connection.select_one(query).present?
  end
end
