# frozen_string_literal: true

require 'zip'

class Compressor
  # Initialize with the directory to zip and the location of the output archive
  # and optionally with the max size limit to created zip files.
  def initialize(input_dir, output_dir, options = {})
    @input_dir = input_dir
    @output_dir = output_dir
    @options = options.reverse_merge(size_limit: 200_000_000, base_file_name: 'archive', timestamp_file: true)
  end

  def process
    zip_file = get_zip_file

    entries = Dir.children(@input_dir)
    add_entries zip_file, '', entries
  end

  private

  def get_zip_file(part = nil)
    parts = [@options[:base_file_name], *(Date.today.strftime('%F') if @options[:timestamp_file]), part]
    path = File.join(@output_dir, parts.reject(&:blank?).join('_') + '.zip')
    file = ::Zip::File.new(path, ::Zip::File::CREATE)
    file.commit

    file
  end

  def add_entries(zip_file, path, entries, part = 0)
    entries.each do |e|
      if path == '' && File.stat(zip_file.name).size >= @options[:size_limit]
        rename(zip_file, part)
        part += 1
        zip_file = get_zip_file("part-#{part}")
      end

      zipfile_path = path == '' ? e : File.join(path, e)
      disk_file_path = File.join(@input_dir, zipfile_path)

      if File.directory? disk_file_path
        recursively_deflate_directory(disk_file_path, zip_file, zipfile_path, part)
      else
        put_into_archive(disk_file_path, zip_file, zipfile_path)
      end
      zip_file.commit
    end
  end

  def recursively_deflate_directory(disk_file_path, zip_file, zipfile_path, part)
    zip_file.mkdir zipfile_path
    subdir = Dir.children(disk_file_path)
    add_entries zip_file, zipfile_path, subdir, part
  end

  def put_into_archive(disk_file_path, zip_file, zipfile_path)
    zip_file.add(zipfile_path, disk_file_path)
  end

  def rename(zip_file, part)
    path = zip_file.to_s
    File.rename(path, File.join(File.dirname(path), File.basename(path, '.zip') + "_part-#{part}.zip"))
  end
end
