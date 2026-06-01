# frozen_string_literal: true

class BackfillClientSubdomains < ActiveRecord::Migration[8.0]
  def up
    connection.select_all("SELECT id, name FROM clients WHERE subdomain IS NULL OR subdomain = ''").each do |row|
      client_id = row['id']
      name = row['name'].to_s.strip

      candidate = generate_valid_candidate(client_id, name)

      sql = "UPDATE clients SET subdomain = #{connection.quote(candidate)} WHERE id = #{client_id}"
      connection.execute(sql)
    end
  end

  def down
    # No-op: we don't want to clear data on rollback as it's a backfill
  end

  private

  def generate_valid_candidate(client_id, name)
    candidate = name.parameterize
    candidate = 'client' if candidate.blank?

    return candidate if valid?(candidate, client_id)

    prefix = truncate_at_word_boundary(candidate, 24)
    with_suffix = "#{prefix}-client"
    return with_suffix if valid?(with_suffix, client_id)

    counter = 2
    loop do
      numbered = "#{prefix}-client-#{counter}"
      return numbered if valid?(numbered, client_id)

      counter += 1
      break if counter > 100
    end

    "#{prefix}-#{client_id}"
  end

  def truncate_at_word_boundary(text, max_length)
    return text if text.length <= max_length

    truncated = text.first(max_length)
    last_hyphen = truncated.rindex('-')
    last_hyphen ? truncated.first(last_hyphen) : truncated
  end

  def valid?(subdomain, client_id)
    return false if subdomain.length < 3 || subdomain.length > 32
    return false if reserved?(subdomain)
    return false if subdomain_taken?(subdomain, client_id)

    true
  end

  def subdomain_taken?(subdomain, client_id)
    query = <<-SQL.squish
      SELECT 1 FROM clients
      WHERE subdomain = #{connection.quote(subdomain)}
        AND id != #{client_id}
    SQL
    connection.select_one(query).present?
  end

  def reserved?(subdomain)
    reserved_words = %w[
      api assessment assessments report reports tte talent idp
      survey surveys user users campaign campaigns project projects
    ]

    reserved_words.include?(subdomain) ||
      Client::RESERVED_ADMIN_SUBDOMAIN_PATTERNS.any? { |pattern| pattern.match?(subdomain) }
  end
end
