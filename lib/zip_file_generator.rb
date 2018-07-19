require 'zip'

class ZipFileGenerator
  def initialize(input_dir, output_file)
    @input_dir = input_dir
    @output_file = output_file
  end

  def write
    entries = Dir.children(@input_dir)
    Zip::File.open(@output_file, Zip::File::CREATE) do |io|
      write_entries(entries, '', io)
    end
  end

  private

  def write_entries(entries, path, io)
    entries.each do |entry|
      zip_file_path = (path == '' ? entry : File.join(path, entry))
      disk_file_path = File.join(@input_dir, zip_file_path)

      if File.directory?(disk_file_path)
        io.mkdir(zip_file_path)
        subdir = Dir.children(disk_file_path)
        write_entries(subdir, zip_file_path, io)
      else
        io.get_output_stream(zip_file_path) do |f|
          f.write(File.binread(disk_file_path))
        end
      end
    end
  end
end
